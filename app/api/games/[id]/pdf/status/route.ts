export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

import { gameSession, isAdministrator } from '@/lib/access'
import { prisma } from '@/lib/db'
import { readJob } from '@/lib/path-pdf'
import { renderPathPdf } from '@/lib/render-path-pdf'
import { gameStateSchema } from '@/lib/game-validation'
import { NextResponse } from 'next/server'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await gameSession()
  if (!session?.user) return NextResponse.json({ error: 'Нет доступа' }, { status: 401 })
  try {
    const { id } = await params
    const { token } = await req.json()
    const job = typeof token === 'string' ? readJob(token, session.user.id) : null
    if (!job || job.gameId !== id) return NextResponse.json({ error: 'Запрос PDF недействителен или истёк' }, { status: 403 })
    const game = await prisma.game.findFirst({ where: { id, ...(isAdministrator(session.user.role) ? {} : { userId: session.user.id }) } })
    if (!game) return NextResponse.json({ error: 'Игра не найдена' }, { status: 404 })
    const state = gameStateSchema.safeParse(JSON.parse(game.state))
    if (!state.success) return NextResponse.json({ error: 'Нельзя однозначно разделить участников игры' }, { status: 400 })
    const player = state.data.players[job.playerIndex]
    if (!player) return NextResponse.json({ error: 'Участник не найден' }, { status: 404 })
    const logs = await prisma.gameLog.findMany({ where: { gameId: id, playerName: player.name }, orderBy: { createdAt: 'asc' } })
    const pdf = await renderPathPdf(player, logs.map(log => ({ ...log, createdAt: log.createdAt.toISOString() })), game.createdAt)
    return NextResponse.json({ status: 'SUCCESS', pdf_base64: pdf.toString('base64') }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (e) { console.error('PDF status:', e); return NextResponse.json({ error: 'Не удалось проверить готовность PDF' }, { status: 500 }) }
}
