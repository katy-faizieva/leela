export const dynamic = 'force-dynamic'

import { gameSession as auth, isAdministrator } from '@/lib/access'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Нет доступа' }, { status: 401 })
  if (!isAdministrator(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, blocked: true, approved: true, maxPlayers: true, accessExpiresAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(users)
}
