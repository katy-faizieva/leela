export const dynamic = 'force-dynamic'

import { gameSession as auth, isAdministrator } from '@/lib/access'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isAdministrator(session.user.role)) return NextResponse.json({ error: 'Описания доступны только администратору' }, { status: 403, headers: { 'Cache-Control': 'private, no-store' } })
  try {
    const cells = await prisma.cell.findMany({ orderBy: { number: 'asc' } })
    return NextResponse.json(cells, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
