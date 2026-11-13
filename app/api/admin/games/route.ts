export const dynamic = 'force-dynamic'

import { gameSession, isAdministrator } from '@/lib/access'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const session = await gameSession()
  if (!session?.user) return NextResponse.json({ error: 'Нет доступа' }, { status: 401 })
  if (!isAdministrator(session.user.role)) return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
  const id = new URL(req.url).searchParams.get('id')
  const headers = { 'Cache-Control': 'private, no-store' }
  if (id) {
    const game = await prisma.game.findUnique({ where: { id }, select: { id: true, state: true, user: { select: { email: true } }, logs: { orderBy: { createdAt: 'asc' } } } })
    if (!game) return NextResponse.json({ error: 'Игра не найдена' }, { status: 404 })
    return NextResponse.json(game, { headers })
  }
  const cursor = new URL(req.url).searchParams.get('cursor')
  const games = await prisma.game.findMany({ orderBy: { id: 'desc' }, take: 31, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}), select: { id: true, state: true, user: { select: { email: true } } } })
  return NextResponse.json({ games: games.slice(0, 30), nextCursor: games.length > 30 ? games[29].id : null }, { headers })
}
