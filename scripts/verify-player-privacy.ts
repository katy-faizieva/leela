import assert from 'node:assert/strict'
import { randomBytes, createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { encode } from 'next-auth/jwt'
import { prisma } from '../lib/db'

const base = 'http://localhost:3000'
const out = '.verification'
async function cookie(id: string) {
  const token = await encode({ token: { id }, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET!, salt: 'authjs.session-token' })
  return `authjs.session-token=${token}`
}
async function request(path: string, jar = '', body?: unknown, method = body ? 'POST' : 'GET') {
  const r = await fetch(base + path, { method, headers: { cookie: jar, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) })
  return { status: r.status, data: await r.json() }
}
async function main() {
  await mkdir(out, { recursive: true })
  const owner = await prisma.user.findUniqueOrThrow({ where: { email: 'admin@mail.ru' } })
  assert.equal(owner.role, 'owner'); assert.equal(owner.approved, true); assert.equal(owner.blocked, false); assert.equal(owner.accessExpiresAt, null)
  const ownerCookie = await cookie(owner.id)
  const email = `privacy-${randomBytes(8).toString('hex')}@example.com`
  assert.equal((await request('/api/signup', '', { email, password: randomBytes(24).toString('hex'), name: 'Проверка приватности' })).status, 201)
  const participant = await prisma.user.findUniqueOrThrow({ where: { email } })
  const userCookie = await cookie(participant.id)
  assert.equal((await request('/api/cells', userCookie)).status, 401)
  assert.equal((await request(`/api/admin/users/${participant.id}`, ownerCookie, { approved: true }, 'PUT')).status, 200)
  for (const path of ['/api/cells', '/api/cells/11', '/api/admin/games']) {
    assert.equal((await request(path, userCookie)).status, 403)
    assert.equal((await request(path, ownerCookie)).status, 200)
  }
  assert.equal((await request('/api/cells')).status, 401)
  console.log('PASS: права владельца; закрытые описания и наблюдение доступны только администраторам')
  const state = { players: [{ name: 'Анна Тест', intention: 'Запрос Анны — доверие', position: 11, finished: false, color: 0 }, { name: 'Борис Тест', intention: 'Запрос Бориса — спокойствие', position: 4, finished: false, color: 1 }], currentPlayerIndex: 0, settings: { extraRollOnSix: true, bounceOnOvershoot: false }, diceMode: 'manual', started: true, finished: false }
  const created = await request('/api/games', userCookie, { state }); assert.equal(created.status, 200)
  const id = created.data.id
  const duplicate = structuredClone(state); duplicate.players[1].name = duplicate.players[0].name
  assert.equal((await request('/api/games', userCookie, { state: duplicate })).status, 400)
  const renamed = structuredClone(state); renamed.players[0].name = 'Чужое имя'
  assert.equal((await request(`/api/games/${id}`, userCookie, { state: renamed }, 'PUT')).status, 400)
  for (const [index, player] of state.players.entries()) {
    const log = { gameId: id, playerName: player.name, roll: index + 1, fromCell: index === 0 ? 10 : 2, toCell: player.position, note: index === 0 ? 'Только Анна: <личное открытие> & доверие' : 'Только Борис: спокойствие', transitionType: null }
    assert.equal((await request('/api/game-logs', userCookie, log)).status, 200)
  }
  assert.equal((await request('/api/game-logs', userCookie, { gameId: id, playerName: 'Чужой', roll: 1, fromCell: 0, toCell: 1 })).status, 400)
  const monitor = await request(`/api/admin/games?id=${id}`, ownerCookie)
  assert.equal(monitor.status, 200); assert.equal(monitor.data.logs.length, 2)
  assert.equal((await request(`/api/games/${id}`, ownerCookie)).status, 404)
  assert.equal((await request(`/api/games/${id}/pdf`, ownerCookie, { playerIndex: 0 })).status, 404)
  assert.equal((await request(`/api/games/${id}/pdf`, userCookie, { playerIndex: 4 })).status, 400)
  console.log('PASS: состав участников неизменяемый; чужие записи отклоняются; администратор видит ходы, но не получает чужой PDF')
  for (let i = 0; i < 2; i++) {
    const createdPdf = await request(`/api/games/${id}/pdf`, userCookie, { playerIndex: i })
    assert.equal(createdPdf.status, 200, JSON.stringify(createdPdf.data))
    const token = createdPdf.data.token
    assert.equal((await request(`/api/games/${id}/pdf/status`, ownerCookie, { token })).status, 403)
    assert.equal((await request(`/api/games/${id}/pdf/status`, userCookie, { token: token + 'x' })).status, 403)
    const deadline = Date.now() + 300000
    let done = false
    while (Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const status = await request(`/api/games/${id}/pdf/status`, userCookie, { token })
      assert.equal(status.status, 200)
      assert.notEqual(status.data.status, 'FAILED')
      if (status.data.status === 'SUCCESS') {
        const pdf = Buffer.from(status.data.pdf_base64, 'base64')
        assert.equal(pdf.subarray(0, 5).toString(), '%PDF-')
        await writeFile(`${out}/player-${i + 1}.pdf`, pdf)
        done = true
        break
      }
    }
    assert.ok(done, 'Истекло время ожидания PDF')
  }
  console.log('PASS: два PDF сформированы через реальные маршруты; подпись запроса и изоляция владельца проверены')
  const original = await readFile('data/board.png')
  assert.equal(createHash('sha256').update(original).digest('hex'), '2d17554347da8a2ba60f660b9ce32e0556221843a3720a7c7afd5ce91caf9c76')
  console.log('PASS: исходное изображение поля неизменно')
  // Remove only the synthetic game created by this test; retain the blocked fixture account.
  assert.equal((await request(`/api/games/${id}`, userCookie, undefined, 'DELETE')).status, 200)
  assert.equal((await request(`/api/admin/users/${participant.id}`, ownerCookie, { approved: false, blocked: true }, 'PUT')).status, 200)
  console.log('ALL PRIVACY AND PDF CHECKS PASSED')
}
main().catch(e => { console.error(e); process.exitCode = 1 }).finally(() => prisma.$disconnect())
