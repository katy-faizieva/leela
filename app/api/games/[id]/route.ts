export const dynamic = 'force-dynamic'

import { gameSession, isAdministrator } from '@/lib/access'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { gameStateSchema } from '@/lib/game-validation'
import { z } from 'zod'

const headers = { 'Cache-Control': 'private, no-store' }
const include = { logs: { orderBy: { createdAt: 'asc' as const } }, user: { select: { email: true, name: true } } }
const versionSchema = z.string().datetime()
const logSchema = z.object({ playerName: z.string(), roll: z.number().int().min(1).max(6), fromCell: z.number().int().min(0).max(72), toCell: z.number().int().min(0).max(72), transitionType: z.string().max(150).nullable(), note: z.string().max(10000).nullable() })
class Conflict extends Error {}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await gameSession()
  if (!session?.user) return NextResponse.json({ error: 'Нет доступа' }, { status: 401 })
  const { id } = await params
  const game = await prisma.game.findFirst({ where: { id, ...(isAdministrator(session.user.role) ? {} : { userId: session.user.id }) }, include })
  if (!game) return NextResponse.json({ error: 'Путь не найден' }, { status: 404 })
  return NextResponse.json(game, { headers })
}

async function change(req: Request, params: Promise<{ id: string }>, edit: boolean) {
  const session = await gameSession()
  if (!session?.user) return NextResponse.json({ error: 'Нет доступа' }, { status: 401 })
  const admin = isAdministrator(session.user.role)
  const { id } = await params
  try {
    const body = await req.json()
    const parsed = gameStateSchema.safeParse(body.state)
    if (!parsed.success || !versionSchema.safeParse(body.expectedUpdatedAt).success) return NextResponse.json({ error: 'Некорректные данные. Откройте путь заново.' }, { status: 400 })
    const game = await prisma.game.findFirst({ where: { id, ...(admin ? {} : { userId: session.user.id }) } })
    if (!game) return NextResponse.json({ error: 'Путь не найден' }, { status: 404 })
    if (game.updatedAt.toISOString() !== body.expectedUpdatedAt) throw new Conflict()
    const old = gameStateSchema.parse(JSON.parse(game.state))
    const next = parsed.data
    if (old.players.length !== next.players.length || old.players.some((p, i) => p.color !== next.players[i].color)) return NextResponse.json({ error: 'Нельзя менять состав сохранённого пути. Создайте новый путь для другого состава.' }, { status: 400 })
    if (!admin && old.players.some((p, i) => p.name !== next.players[i].name)) return NextResponse.json({ error: 'Имя участника может изменить только администратор' }, { status: 403 })
    let log: z.infer<typeof logSchema> | null = null
    if (edit) {
      if (!admin && (old.currentPlayerIndex !== next.currentPlayerIndex || old.finished !== next.finished || old.started !== next.started || Boolean(old.paused) !== Boolean(next.paused) || old.players.some((p, i) => p.position !== next.players[i].position || p.finished !== next.players[i].finished))) return NextResponse.json({ error: 'Позициями, очередью и паузой управляет администратор' }, { status: 403 })
      if (admin) {
        next.players.forEach(p => { p.finished = p.position === 72 })
        next.finished = next.players.every(p => p.finished)
        if (!next.finished && next.players[next.currentPlayerIndex].finished) next.currentPlayerIndex = next.players.findIndex(p => !p.finished)
      }
    } else {
      if (old.paused || old.finished) return NextResponse.json({ error: old.paused ? 'Путь на паузе. Дождитесь администратора.' : 'Путь завершён' }, { status: 409 })
      const result = logSchema.safeParse(body.log)
      if (!result.success) return NextResponse.json({ error: 'Ход должен сохраняться вместе с записью истории' }, { status: 400 })
      log = result.data
      const i = old.currentPlayerIndex
      if (old.players.some((p, j) => p.name !== next.players[j].name || p.intention !== next.players[j].intention || (j !== i && (p.position !== next.players[j].position || p.finished !== next.players[j].finished))) || log.playerName !== old.players[i].name || log.fromCell !== old.players[i].position || log.toCell !== next.players[i].position || Boolean(old.paused) !== Boolean(next.paused) || old.title !== next.title || JSON.stringify(old.settings) !== JSON.stringify(next.settings) || old.diceMode !== next.diceMode) return NextResponse.json({ error: 'Данные хода не соответствуют текущему пути' }, { status: 400 })
    }
    const updated = await prisma.$transaction(async tx => {
      // Compare-and-swap serializes simultaneous moves/edits before changing any logs.
      const result = await tx.game.updateMany({ where: { id, updatedAt: game.updatedAt }, data: { state: JSON.stringify(next), updatedAt: new Date(Math.max(Date.now(), game.updatedAt.getTime() + 1)) } })
      if (result.count !== 1) throw new Conflict()
      if (edit && admin) {
        // Snapshot log IDs before renaming so swapping names cannot mix personal histories.
        const renamed = old.players.filter((p, i) => p.name !== next.players[i].name)
        const originalLogs = renamed.length ? await tx.gameLog.findMany({ where: { gameId: id }, select: { id: true, playerName: true } }) : []
        for (let i = 0; i < old.players.length; i++) {
          const before = old.players[i], after = next.players[i]
          if (before.name !== after.name) {
            const ids = originalLogs.filter(l => l.playerName === before.name).map(l => l.id)
            if (ids.length) await tx.gameLog.updateMany({ where: { id: { in: ids }, gameId: id }, data: { playerName: after.name } })
          }
          if (before.position !== after.position) await tx.gameLog.create({ data: { gameId: id, playerName: after.name, roll: 0, fromCell: before.position, toCell: after.position, transitionType: 'Коррекция администратора', note: null } })
        }
      }
      if (log) await tx.gameLog.create({ data: { ...log, gameId: id } })
      return tx.game.findUniqueOrThrow({ where: { id }, include })
    })
    return NextResponse.json(updated, { headers })
  } catch (e) {
    if (e instanceof Conflict) return NextResponse.json({ error: 'Путь изменён на другом устройстве. Загрузите актуальную версию и повторите действие.' }, { status: 409 })
    console.error('Game update:', e)
    return NextResponse.json({ error: 'Не удалось сохранить путь' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) { return change(req, params, false) }
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) { return change(req, params, true) }

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await gameSession()
  if (!session?.user) return NextResponse.json({ error: 'Нет доступа' }, { status: 401 })
  const { id } = await params
  const version = new URL(req.url).searchParams.get('version')
  if (!versionSchema.safeParse(version).success) return NextResponse.json({ error: 'Обновите список перед удалением' }, { status: 400 })
  const result = await prisma.game.deleteMany({ where: { id, updatedAt: new Date(version!), ...(isAdministrator(session.user.role) ? {} : { userId: session.user.id }) } })
  if (!result.count) return NextResponse.json({ error: 'Путь изменён или недоступен. Обновите список.' }, { status: 409 })
  return NextResponse.json({ success: true })
}
