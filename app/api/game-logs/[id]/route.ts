export const dynamic = 'force-dynamic'
import { gameSession, isAdministrator } from '@/lib/access'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await gameSession()
  if (!session?.user) return NextResponse.json({ error: 'Нет доступа' }, { status: 401 })
  const { id } = await params
  const parsed = z.object({ note: z.string().max(10000), expectedNote: z.string().max(10000).optional() }).safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Заметка должна содержать не более 10000 символов' }, { status: 400 })
  const log = await prisma.gameLog.findFirst({ where: { id, ...(isAdministrator(session.user.role) ? {} : { game: { userId: session.user.id } }) }, select: { id: true, gameId: true } })
  if (!log) return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 })
  const expected = parsed.data.expectedNote
  const updated = await prisma.gameLog.updateMany({ where: { id, ...(expected === undefined ? {} : expected === '' ? { OR: [{ note: null }, { note: '' }] } : { note: expected }) }, data: { note: parsed.data.note } })
  if (!updated.count) return NextResponse.json({ error: 'Заметка уже изменена. Загрузите актуальный текст перед сохранением.' }, { status: 409 })
  return NextResponse.json(await prisma.gameLog.findUnique({ where: { id } }), { headers: { 'Cache-Control': 'private, no-store' } })
}
