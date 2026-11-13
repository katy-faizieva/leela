export const dynamic = 'force-dynamic'

import { gameSession, isAdministrator } from '@/lib/access'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const updateSchema = z.object({
  approved: z.boolean().optional(), blocked: z.boolean().optional(),
  role: z.enum(['user', 'admin']).optional(),
  maxPlayers: z.number().int().min(1).max(4).optional(),
  accessExpiresAt: z.string().datetime().nullable().optional(),
}).strict()

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await gameSession()
  if (!session?.user) return NextResponse.json({ error: 'Нет доступа' }, { status: 401 })
  if (!isAdministrator(session.user.role)) return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
  const { id } = await params
  try {
    const parsed = updateSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: 'Проверьте параметры доступа' }, { status: 400 })
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } })
    if (!target) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    if (id === session.user.id || target.role === 'owner') return NextResponse.json({ error: 'Нельзя менять собственные права или права владельца' }, { status: 403 })
    if (session.user.role !== 'owner' && (isAdministrator(target.role) || parsed.data.role !== undefined)) return NextResponse.json({ error: 'Только владелец управляет администраторами' }, { status: 403 })
    const updated = await prisma.user.update({
      where: { id }, data: parsed.data,
      select: { id: true, email: true, name: true, role: true, blocked: true, approved: true, maxPlayers: true, accessExpiresAt: true, createdAt: true },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('Access update error', e)
    return NextResponse.json({ error: 'Не удалось изменить доступ' }, { status: 500 })
  }
}

const passwordSchema = z.object({
  newPassword: z.string().min(8).max(72).refine(value => Buffer.byteLength(value, 'utf8') <= 72),
  confirmPassword: z.string().min(8).max(72),
}).strict().refine(value => value.newPassword === value.confirmPassword)

// Отдельная операция: пароль не смешивается с изменением прав доступа.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await gameSession()
  if (!session?.user) return NextResponse.json({ error: 'Нет доступа' }, { status: 401 })
  if (!isAdministrator(session.user.role)) return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
  const { id } = await params
  const parsed = passwordSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Пароли должны совпадать: не менее 8 символов и не более 72 байт.' }, { status: 400 })
  try {
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } })
    if (!target) return NextResponse.json({ error: 'Путник не найден' }, { status: 404 })
    if (target.role !== 'user' || id === session.user.id) return NextResponse.json({ error: 'Здесь можно менять пароли только путников' }, { status: 403 })
    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12)
    // Проверка роли также при записи защищает от одновременного назначения администратора.
    await prisma.user.update({ where: { id, role: 'user' }, data: { passwordHash }, select: { id: true } })
    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    console.error('Administrator password reset failed')
    return NextResponse.json({ error: 'Не удалось изменить пароль. Обновите страницу и повторите.' }, { status: 500 })
  }
}
