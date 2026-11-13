import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { encode } from 'next-auth/jwt'
import { spawnSync } from 'node:child_process'
import { prisma } from '../lib/db'

const base = 'http://localhost:3000'
const created: string[] = []
let gameId: string | undefined
async function cookie(id: string) {
  return `authjs.session-token=${await encode({ token: { id }, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET!, salt: 'authjs.session-token' })}`
}
async function req(path: string, jar = '', body?: unknown, method = 'POST') {
  const res = await fetch(base + path, { method, headers: { cookie: jar, 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
  return { status: res.status, data: await res.json() }
}
async function main() {
  const owner = await prisma.user.findFirstOrThrow({ where: { role: 'owner', approved: true, blocked: false }, select: { id: true } })
  const ownerCookie = await cookie(owner.id)
  async function fixture() {
    const email = `reset-check-${randomBytes(12).toString('hex')}@example.com`
    const password = randomBytes(20).toString('hex')
    const result = await req('/api/signup', '', { name: 'Проверка пароля', email, password })
    assert.equal(result.status, 201); created.push(result.data.userId)
    const id = result.data.userId
    assert.equal((await req(`/api/admin/users/${id}`, ownerCookie, { approved: true }, 'PUT')).status, 200)
    return { id, email, password, jar: await cookie(id) }
  }
  const user = await fixture(), admin = await fixture()
  assert.equal((await req(`/api/admin/users/${admin.id}`, ownerCookie, { role: 'admin' }, 'PUT')).status, 200)
  const path = `/api/admin/users/${user.id}`
  const newPassword = randomBytes(20).toString('hex')
  const body = { newPassword, confirmPassword: newPassword }
  assert.equal((await req(path, '', body, 'PATCH')).status, 401)
  assert.equal((await req(path, user.jar, body, 'PATCH')).status, 403)
  assert.equal((await req(`/api/admin/users/${owner.id}`, admin.jar, body, 'PATCH')).status, 403)
  assert.equal((await req(`/api/admin/users/${admin.id}`, ownerCookie, body, 'PATCH')).status, 403)
  for (const invalid of [{ ...body, confirmPassword: 'mismatch' }, { newPassword: 'short', confirmPassword: 'short' }, { newPassword: 'я'.repeat(40), confirmPassword: 'я'.repeat(40) }, { ...body, role: 'owner' }]) {
    assert.equal((await req(path, admin.jar, invalid, 'PATCH')).status, 400)
  }
  assert.equal((await req('/api/auth/login', '', { email: user.email, password: user.password })).status, 200)
  const changed = await req(path, admin.jar, body, 'PATCH')
  assert.equal(changed.status, 200); assert.deepEqual(changed.data, { success: true })
  assert.equal((await req('/api/auth/login', '', { email: user.email, password: user.password })).status, 401)
  assert.equal((await req('/api/auth/login', '', { email: user.email, password: newPassword })).status, 200)
  assert.equal((await req(path, ownerCookie, { newPassword: user.password, confirmPassword: user.password }, 'PATCH')).status, 200)
  assert.equal((await req('/api/auth/login', '', { email: user.email, password: user.password })).status, 200)
  console.log('PASS: администратор и владелец меняют пароль путника; старый пароль отклонён, новый принят; ограничения и валидация соблюдены')
  const state = { players: [{ name: 'Проверка', intention: 'Проверка размещения чакр', position: 1, finished: false, color: 0 }], currentPlayerIndex: 0, settings: { extraRollOnSix: true, bounceOnOvershoot: false }, diceMode: 'manual', started: true, finished: false }
  const game = await req('/api/games', user.jar, { state })
  assert.equal(game.status, 200); gameId = game.data.id
  const result = spawnSync('python3', ['scripts/verify-chakra-placement.py'], { input: JSON.stringify({ token: ownerCookie.split('=')[1], gameId }), encoding: 'utf8', timeout: 90000 })
  process.stdout.write(result.stdout || '')
  if (result.status !== 0) throw new Error('Проверка размещения чакр не пройдена: ' + result.stderr)
}
main().catch(e => { console.error(e); process.exitCode = 1 }).finally(async () => {
  if (gameId) await prisma.game.delete({ where: { id: gameId } })
  for (const id of created.reverse()) await prisma.user.delete({ where: { id } })
  await prisma.$disconnect()
})
