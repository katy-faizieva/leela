import 'server-only'
import { createHmac, timingSafeEqual } from 'crypto'
import type { GameLog, PlayerState } from './game-types'

const escape = (value: string | number) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
export function pathHtml(player: PlayerState, logs: GameLog[], startedAt: Date) {
  const date = startedAt.toLocaleDateString('ru-RU', { timeZone: 'Asia/Bangkok', year: 'numeric', month: 'long', day: 'numeric' })
  const ownLogs = logs.filter(log => log.playerName === player.name)
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><style>
  @page { size: A4; } * { box-sizing: border-box; } body { font-family: Georgia, 'Times New Roman', serif; color: #4A0E17; margin: 0; font-size: 12pt; line-height: 1.55; } h1 { font-size: 32pt; margin: 12px 0 0; font-weight: normal; } h2 { font-size: 21pt; font-weight: normal; margin: 8px 0 20px; } .brand { letter-spacing: 7px; font-size: 13pt; } .cover { background: #FAF6F0; border-top: 4px solid #4A0E17; padding: 32px; margin-bottom: 26px; } .meta { font-family: Arial, sans-serif; font-size: 9pt; color: #785760; } .label { font-size: 9pt; text-transform: uppercase; letter-spacing: 2px; color: #785760; } .intention { white-space: pre-wrap; overflow-wrap: anywhere; border-left: 2px solid #B89864; padding: 0 0 0 16px; } .stats { display: flex; gap: 24px; border-top: 1px solid #D6C4BB; margin-top: 22px; padding-top: 16px; font-size: 10pt; } .step { break-inside: avoid; padding: 18px 22px; margin-bottom: 14px; border-left: 3px solid #B89864; background: #FAF6F0; } .route { font-size: 18pt; margin: 3px 0; } .note { white-space: pre-wrap; overflow-wrap: anywhere; color: #543D42; margin-top: 12px; } .note.long { break-inside: auto; } .step:has(.long) { break-inside: auto; } .foot { margin-top: 28px; border-top: 1px solid #D6C4BB; padding-top: 12px; font-size: 9pt; color: #785760; } h1,h2 { overflow-wrap: anywhere; }
  </style></head><body><section class="cover"><div class="brand">ЛИЛА</div><h1>История личного пути</h1><h2>${escape(player.name)}</h2><div class="meta">Начало игры: ${escape(date)} · время Бангкока</div><p class="label">Мой запрос</p><div class="intention">${escape(player.intention || 'Запрос не указан')}</div><div class="stats"><span>Ходов: ${ownLogs.length}</span><span>Текущая клетка: ${player.position}</span><span>${player.finished ? 'Путь завершён' : 'Путешествие продолжается'}</span></div></section><h2>Шаги и открытия</h2>${ownLogs.length ? ownLogs.map((log, i) => `<article class="step"><div class="label">Шаг ${i + 1} · ${log.roll === 0 ? 'коррекция позиции' : `кубик ${log.roll}`}</div><div class="route">${log.fromCell === 0 ? 'Старт' : `Клетка ${log.fromCell}`} → Клетка ${log.toCell}</div>${log.transitionType ? `<div>${escape(log.transitionType)}</div>` : ''}${log.note ? `<div class="note ${log.note.length > 1500 ? 'long' : ''}"><div class="label">Мои заметки</div>${escape(log.note)}</div>` : '<div class="meta">Заметка не добавлена</div>'}</article>`).join('') : '<p>Ходов пока нет. Здесь появится ваш путь после первого броска.</p>'}<div class="foot">Личный дневник участника: ${escape(player.name)}. Только его запрос, ходы и заметки. Закрытые описания клеток и игровое поле в документ не включены.</div></body></html>`
}

type Job = { requestId: string; userId: string; gameId: string; playerIndex: number; expires: number }
const secret = () => { const value = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET; if (!value) throw new Error('Сервис PDF не настроен'); return value }
export function signJob(job: Job) {
  const payload = Buffer.from(JSON.stringify(job)).toString('base64url')
  return `${payload}.${createHmac('sha256', secret()).update(payload).digest('base64url')}`
}
export function readJob(token: string, userId: string): Job | null {
  try {
    const [payload, signature, extra] = token.split('.')
    if (!payload || !signature || extra) return null
    const expected = createHmac('sha256', secret()).update(payload).digest()
    const actual = Buffer.from(signature, 'base64url')
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
    const job: Job = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return job.userId === userId && job.expires > Date.now() ? job : null
  } catch { return null }
}
