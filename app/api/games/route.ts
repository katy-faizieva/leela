export const dynamic = 'force-dynamic'

import { gameSession as auth, isAdministrator } from '@/lib/access'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { gameStateSchema } from '@/lib/game-validation'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = (session.user as any).id
  const params = new URL(req.url).searchParams
  const manage = params.get('view') === 'manage'
  const all = manage && params.get('scope') === 'all' && isAdministrator(session.user.role)
  const query = (params.get('q') ?? '').trim().slice(0, 120)
  const cursor = params.get('cursor')
  const games = await prisma.game.findMany({
    where: { ...(all ? {} : { userId }), ...(query ? { OR: [{ state: { contains: query, mode: 'insensitive' as const } }, { user: { email: { contains: query.toLowerCase() } } }, { user: { name: { contains: query, mode: 'insensitive' as const } } }] } : {}) },
    orderBy: manage ? { id: 'desc' } : { updatedAt: 'desc' },
    take: manage ? 31 : 10,
    ...(manage && cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    ...(manage ? { include: { user: { select: { email: true, name: true } } } } : {}),
  })
  return NextResponse.json(manage ? { games: games.slice(0, 30), nextCursor: games.length > 30 ? games[29].id : null } : games, { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = (session.user as any).id
  const body = await req.json()
  const parsed = gameStateSchema.safeParse(body.state)
  if (!parsed.success) return NextResponse.json({ error: 'Некорректные параметры игры' }, { status: 400 })
  if (parsed.data.players.length > session.user.maxPlayers) return NextResponse.json({ error: 'Количество игроков превышает разрешённый лимит. Обратитесь к администратору.' }, { status: 403 })
  const game = await prisma.game.create({
    data: {
      userId,
      state: JSON.stringify(parsed.data),
    },
  })
  return NextResponse.json(game)
}
