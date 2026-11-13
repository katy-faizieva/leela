export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  name: z.string().trim().min(1).max(80),
  password: z.string().min(8).max(72),
  maxPlayers: z.number().int().min(1).max(4).default(2),
})

export async function POST(req: Request) {
  try {
    const parsed = signupSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: 'Укажите имя, корректный email и пароль от 8 до 72 символов.' }, { status: 400 })
    const { email, name, password, maxPlayers } = parsed.data
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
    if (existing) return NextResponse.json({ error: 'Такой email уже зарегистрирован. Перейдите ко входу.' }, { status: 409 })
    const passwordHash = await bcrypt.hash(password, 12)
    // Public signup can never assign administrative privileges or approve access.
    const user = await prisma.user.create({ data: { email, name, passwordHash, maxPlayers, role: 'user', approved: false } })
    return NextResponse.json({ success: true, userId: user.id, pending: true }, { status: 201 })
  } catch (e) {
    console.error('Signup error', e)
    return NextResponse.json({ error: 'Не удалось отправить заявку. Попробуйте позднее.' }, { status: 500 })
  }
}
