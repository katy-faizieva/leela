export const dynamic = 'force-dynamic'

import { gameSession as auth } from '@/lib/access'
import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const filePath = path.join(process.cwd(), 'data', 'board-screen-v1.webp')
    const buffer = await readFile(filePath)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'private, no-store, max-age=0',
        'Vary': 'Cookie',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Board not found' }, { status: 404 })
  }
}
