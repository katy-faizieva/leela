export const dynamic = 'force-dynamic'

import { gameSession as auth, isAdministrator } from '@/lib/access'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ number: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isAdministrator(session.user.role)) return NextResponse.json({ error: 'Описания доступны только администратору' }, { status: 403, headers: { 'Cache-Control': 'private, no-store' } })
  const { number } = await params
  const num = parseInt(number, 10)
  if (isNaN(num) || num < 1 || num > 72) {
    return NextResponse.json({ error: 'Invalid cell number' }, { status: 400 })
  }
  const cell = await prisma.cell.findUnique({ where: { number: num } })
  if (!cell) {
    return NextResponse.json({ error: 'Cell not found' }, { status: 404 })
  }
  return NextResponse.json(cell, { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function PUT(req: Request, { params }: { params: Promise<{ number: string }> }) {
  const session = await auth()
  if (!session?.user || !isAdministrator(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { number } = await params
  const num = parseInt(number, 10)
  const body = await req.json()
  try {
    const updated = await prisma.cell.update({
      where: { number: num },
      data: {
        name: body.name,
        sanskrit: body.sanskrit,
        essence: body.essence,
        description: body.description,
        path: body.path,
        questions: body.questions,
      },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
