export const dynamic = 'force-dynamic'

import { gameSession as auth } from '@/lib/access'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { gameStateSchema } from '@/lib/game-validation'
import { z } from 'zod'

const logSchema = z.object({ gameId: z.string(), playerName: z.string().min(1).max(80), roll: z.number().int().min(1).max(6), fromCell: z.number().int().min(0).max(72), toCell: z.number().int().min(0).max(72), transitionType: z.string().max(150).nullable().optional(), note: z.string().max(10000).nullable().optional() })

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = logSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Некорректная запись хода' }, { status: 400 })
  const body = parsed.data
  const game = await prisma.game.findFirst({ where: { id: body.gameId, userId: session.user.id }, select: { id: true, state: true } })
  if (!game) return NextResponse.json({ error: 'Игра не найдена' }, { status: 404 })
  const state = gameStateSchema.safeParse(JSON.parse(game.state))
  if (!state.success || !state.data.players.some(p => p.name === body.playerName)) return NextResponse.json({ error: 'Участник не принадлежит этой игре' }, { status: 400 })
  const log = await prisma.gameLog.create({
    data: {
      gameId: body.gameId,
      playerName: body.playerName,
      roll: body.roll,
      fromCell: body.fromCell,
      toCell: body.toCell,
      transitionType: body.transitionType ?? null,
      note: body.note ?? null,
    },
  })
  return NextResponse.json(log)
}
