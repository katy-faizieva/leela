import assert from 'node:assert/strict'
import { randomBytes, createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { encode } from 'next-auth/jwt'
import { spawnSync } from 'node:child_process'
import { prisma } from '../lib/db'
import type { GameState } from '../lib/game-types'

const base = 'http://localhost:3000'
const fixtureIds: string[] = []
async function cookie(id: string) {
  return `authjs.session-token=${await encode({ token: { id }, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET!, salt: 'authjs.session-token' })}`
}
async function request(path: string, jar = '', body?: unknown, method = body ? 'POST' : 'GET') {
  const res = await fetch(base + path, { method, headers: { cookie: jar, 'Content-Type': 'application/json' }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) })
  return { status: res.status, data: await res.json() }
}
async function main() {
  const owner = await prisma.user.findUniqueOrThrow({ where: { email: 'admin@mail.ru' }, select: { id: true, role: true } })
  assert.equal(owner.role, 'owner')
  const admin = await cookie(owner.id)
  async function participant() {
    const email = `path-check-${randomBytes(10).toString('hex')}@example.com`
    assert.equal((await request('/api/signup', '', { email, password: randomBytes(24).toString('hex'), name: 'Тест управления путями', maxPlayers: 4 })).status, 201)
    const user = await prisma.user.findUniqueOrThrow({ where: { email }, select: { id: true } })
    fixtureIds.push(user.id)
    assert.equal((await request(`/api/admin/users/${user.id}`, admin, { approved: true }, 'PUT')).status, 200)
    return cookie(user.id)
  }
  const user = await participant(), other = await participant()
  const state: GameState = { title: 'Проверка сохранённого пути', players: [{ name: 'Анна Проверка', intention: 'Личный запрос А', position: 0, finished: false, color: 0 }, { name: 'Борис Проверка', intention: 'Личный запрос Б', position: 0, finished: false, color: 1 }], currentPlayerIndex: 0, settings: { extraRollOnSix: true, bounceOnOvershoot: false }, diceMode: 'manual', started: true, finished: false }
  let res = await request('/api/games', user, { state }); assert.equal(res.status, 200)
  let game = res.data
  const url = `/api/games/${game.id}`
  assert.equal((await request(url)).status, 401)
  assert.equal((await request(url, other)).status, 404)
  assert.equal((await request('/api/cells', user)).status, 403)
  assert.equal((await request('/api/cells', admin)).status, 200)
  assert.equal((await request(url, admin)).status, 200)
  assert.equal((await request('/api/games?view=manage&scope=all', other)).data.games.some((g: any) => g.id === game.id), false)
  console.log('PASS: доступ администратора и изоляция обычных участников')
  const moved = structuredClone(state); moved.players[0].position = 1; moved.currentPlayerIndex = 1
  const body = { state: moved, expectedUpdatedAt: game.updatedAt, log: { playerName: state.players[0].name, roll: 1, fromCell: 0, toCell: 1, transitionType: null, note: 'Личная заметка А' } }
  const concurrent = await Promise.all([request(url, user, body, 'PUT'), request(url, admin, body, 'PUT')])
  assert.deepEqual(concurrent.map(r => r.status).sort(), [200, 409])
  game = (await request(url, user)).data
  assert.equal(game.logs.length, 1); assert.equal(JSON.parse(game.state).players[0].position, 1)
  assert.equal((await request(url, admin)).data.updatedAt, game.updatedAt)
  console.log('PASS: одновременные ходы — один сохранён, второй отклонён; поле и история согласованы')
  let next = JSON.parse(game.state); next.players[1].position = 2; next.currentPlayerIndex = 0
  res = await request(url, admin, { state: next, expectedUpdatedAt: game.updatedAt, log: { playerName: state.players[1].name, roll: 2, fromCell: 0, toCell: 2, transitionType: null, note: 'Личная заметка Б' } }, 'PUT')
  assert.equal(res.status, 200); game = res.data
  const stale = game.updatedAt
  next = JSON.parse(game.state); next.title = 'Обновлённое название'; next.players[0].intention = 'Обновлённый личный запрос'
  res = await request(url, user, { state: next, expectedUpdatedAt: game.updatedAt }, 'PATCH'); assert.equal(res.status, 200); game = res.data
  next = JSON.parse(game.state); next.players[0].position = 30
  assert.equal((await request(url, user, { state: next, expectedUpdatedAt: game.updatedAt }, 'PATCH')).status, 403)
  next = JSON.parse(game.state); [next.players[0].name, next.players[1].name] = [next.players[1].name, next.players[0].name]; next.players[0].position = 32; next.paused = true
  assert.equal((await request(url, other, { state: next, expectedUpdatedAt: game.updatedAt }, 'PATCH')).status, 404)
  res = await request(url, admin, { state: next, expectedUpdatedAt: game.updatedAt }, 'PATCH'); assert.equal(res.status, 200); game = res.data
  assert.equal(game.logs.find((l: any) => l.note === 'Личная заметка А').playerName, state.players[1].name)
  assert.equal(game.logs.find((l: any) => l.note === 'Личная заметка Б').playerName, state.players[0].name)
  assert.equal(game.logs.filter((l: any) => l.roll === 0).length, 1)
  assert.equal(game.logs.find((l: any) => l.roll === 0).toCell, 32)
  assert.equal((await request(url, user, { ...body, state: next, expectedUpdatedAt: game.updatedAt }, 'PUT')).status, 409)
  assert.equal(JSON.parse((await request(url, user)).data.state).paused, true)
  console.log('PASS: редактирование, пауза, коррекция на карте, обмен именами без смешивания дневников')
  const noteId = game.logs[0].id, noteValue = game.logs[0].note
  assert.equal((await request(`/api/game-logs/${noteId}`, other, { note: 'Чужая правка', expectedNote: noteValue }, 'PATCH')).status, 404)
  assert.equal((await request(`/api/game-logs/${noteId}`, admin, { note: 'Заметка администратора', expectedNote: noteValue }, 'PATCH')).status, 200)
  assert.equal((await request(`/api/game-logs/${noteId}`, user, { note: 'Устаревшая правка', expectedNote: noteValue }, 'PATCH')).status, 409)
  assert.equal((await request(url, user)).data.logs.find((l: any) => l.id === noteId).note, 'Заметка администратора')
  console.log('PASS: обновление заметок и защита от перезаписи чужого текста')
  res = await request(`/api/games?view=manage&scope=all&q=${encodeURIComponent('Обновлённое название')}`, admin)
  assert.equal(res.status, 200); assert.ok(res.data.games.some((g: any) => g.id === game.id))
  assert.equal((await request(`${url}?version=${encodeURIComponent(stale)}`, admin, undefined, 'DELETE')).status, 409)
  assert.equal((await request(`${url}?version=${encodeURIComponent(game.updatedAt)}`, other, undefined, 'DELETE')).status, 409)
  assert.equal((await request(`${url}?version=${encodeURIComponent(game.updatedAt)}`, admin, undefined, 'DELETE')).status, 200)
  assert.equal((await request(url, user)).status, 404)
  assert.equal(await prisma.gameLog.count({ where: { gameId: game.id } }), 0)
  console.log('PASS: поиск, защита устаревшего удаления, удаление тестового пути вместе с его историей')
  const signup = await (await fetch(`${base}/signup`)).text()
  assert.ok(signup.includes('by Ekaterina Faizieva')); assert.ok(signup.includes('Встреча с собой')); assert.ok(signup.includes('Leela'))
  const login = await (await fetch(`${base}/login`)).text()
  assert.ok(!login.includes('by Ekaterina Faizieva'))
  assert.equal(createHash('sha256').update(await readFile('data/board.png')).digest('hex'), '2d17554347da8a2ba60f660b9ce32e0556221843a3720a7c7afd5ce91caf9c76')
  console.log('PASS: надписи регистрации; оригинал поля не изменён')
  if (process.env.VERIFY_BROWSER === 'true') {
    const uiState = { ...state, title: 'Проверка интерфейса Leela', players: Array.from({ length: 4 }, (_, i) => ({ name: `Проверка ${i + 1}`, intention: `Личный запрос ${i + 1}`, position: 0, finished: false, color: i })) }
    const fixture = await request('/api/games', user, { state: uiState })
    assert.equal(fixture.status, 200)
    const result = spawnSync('python', ['scripts/verify-path-ui.py'], {
      input: JSON.stringify({ admin: admin.slice(admin.indexOf('=') + 1), user: user.slice(user.indexOf('=') + 1), gameId: fixture.data.id }),
      encoding: 'utf8', timeout: 180000,
    })
    process.stdout.write(result.stdout || '')
    process.stderr.write(result.stderr || '')
    assert.equal(result.status, 0, 'Проверка интерфейса не завершилась успешно')
    assert.equal((await request(`/api/games/${fixture.data.id}`, user)).status, 404)
  }
}
main().catch(e => { console.error(e); process.exitCode = 1 }).finally(async () => {
  // Only disposable accounts created by this run; no existing user/game is changed.
  for (const id of fixtureIds) await prisma.user.delete({ where: { id } })
  await prisma.$disconnect()
})
