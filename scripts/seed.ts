import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'
import { CELLS_DATA } from '../config/cells-data'

async function main() {
  for (const cell of CELLS_DATA) {
    await prisma.cell.upsert({ where: { number: cell.number }, update: {}, create: cell })
  }
  console.log('Исходные клетки добавлены; существующие описания сохранены.')
  const email = (process.env.OWNER_EMAIL || 'admin@mail.ru').trim().toLowerCase()
  const password = process.env.OWNER_PASSWORD
  if (process.env.PROMOTE_GAME_OWNER === 'true') {
    await prisma.user.update({ where: { email }, data: { role: 'owner', approved: true, blocked: false, accessExpiresAt: null, maxPlayers: 4 } })
    console.log('Существующему аккаунту выданы права владельца. Пароль не изменён.')
  } else if (password) {
    if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) throw new Error('Пароль владельца: минимум 12 символов, максимум 72 байта UTF-8.')
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
    if (existing) { console.log('Аккаунт уже существует; пароль и права сохранены.'); return }
    await prisma.user.create({ data: { email, name: process.env.OWNER_NAME || 'Владелец', passwordHash: await bcrypt.hash(password, 12), role: 'owner', approved: true, blocked: false, maxPlayers: 4 } })
    console.log('Создан владелец с указанными вами реквизитами. Удалите OWNER_PASSWORD из окружения.')
  } else {
    console.log('Аккаунты не создавались: OWNER_PASSWORD не задан.')
  }
}
main().catch((e) => { console.error(e); process.exitCode = 1 }).finally(() => prisma.$disconnect())
