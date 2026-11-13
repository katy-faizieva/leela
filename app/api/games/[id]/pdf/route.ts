export const dynamic = 'force-dynamic'

import { gameSession, isAdministrator } from '@/lib/access'
import { prisma } from '@/lib/db'
import { gameStateSchema } from '@/lib/game-validation'
import { signJob } from '@/lib/path-pdf'
import { NextResponse } from 'next/server'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await gameSession()
  if (!session?.user) return NextResponse.json({ error: 'Нет доступа' }, { status: 401 })
  try {
    const { id } = await params
    const body = await req.json()
    if (!Number.isInteger(body.playerIndex) || body.playerIndex < 0 || body.playerIndex > 3) return NextResponse.json({ error: 'Выберите одного участника' }, { status: 400 })
    const game = await prisma.game.findFirst({ where: { id, ...(isAdministrator(session.user.role) ? {} : { userId: session.user.id }) } })
    if (!game) return NextResponse.json({ error: 'Игра не найдена' }, { status: 404 })
    const state = gameStateSchema.safeParse(JSON.parse(game.state))
    if (!state.success) return NextResponse.json({ error: 'Нельзя однозначно разделить участников этой игры. Обратитесь к администратору.' }, { status: 400 })
    const player = state.data.players[body.playerIndex]
    if (!player) return NextResponse.json({ error: 'Участник не найден' }, { status: 404 })
    return NextResponse.json({ token: signJob({ requestId: crypto.randomUUID(), userId: session.user.id, gameId: id, playerIndex: body.playerIndex, expires: Date.now() + 10 * 60 * 1000 }) }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (e) { console.error('PDF create:', e); return NextResponse.json({ error: 'Не удалось подготовить PDF. Попробуйте позже.' }, { status: 500 }) }
}
