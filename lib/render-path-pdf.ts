import PDFDocument from 'pdfkit'
import path from 'node:path'
import type { GameLog, PlayerState } from './game-types'

// Только локальные шрифты и JavaScript: без внешнего PDF API или браузерного движка.
export async function renderPathPdf(player: PlayerState, logs: GameLog[], startedAt: Date): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 48, bottom: 48, left: 48, right: 48 }, autoFirstPage: true, info: { Title: 'Лила — История личного пути', Author: 'Leela' } })
  const chunks: Buffer[] = []
  const result = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })
  try {
    doc.font(path.join(process.cwd(), 'data', 'fonts', 'CormorantGaramond-Regular.ttf'))
    // Управляющие символы не должны попадать в PDF; переводы строк сохраняются.
    const clean = (value: string) => Array.from(value).filter(c => c === '\n' || c === '\t' || c.codePointAt(0)! >= 32).join('')
    const text = (value: string, size = 14) => { doc.fillColor('#4A0E17').fontSize(size).text(clean(value), { lineGap: 4 }); doc.moveDown(.5) }
    text('ЛИЛА', 18)
    text('История личного пути', 29)
    text(player.name, 24)
    text(`Начало игры: ${startedAt.toLocaleDateString('ru-RU', { timeZone: 'Asia/Bangkok', year: 'numeric', month: 'long', day: 'numeric' })} · время Бангкока`, 12)
    text('Мой запрос', 18)
    text(player.intention || 'Запрос не указан')
    const ownLogs = logs.filter(log => log.playerName === player.name)
    text(`Ходов: ${ownLogs.length} · Текущая клетка: ${player.position}`)
    text(player.finished ? 'Путь завершён' : 'Путешествие продолжается')
    text('Шаги и открытия', 23)
    if (!ownLogs.length) text('Ходов пока нет. Здесь появится ваш путь после первого броска.')
    for (const [i, log] of ownLogs.entries()) {
      if (doc.y > doc.page.height - 150) doc.addPage()
      text(`Шаг ${i + 1} · ${log.roll === 0 ? 'коррекция позиции' : `кубик ${log.roll}`}`, 13)
      text(`${log.fromCell === 0 ? 'Старт' : `Клетка ${log.fromCell}`} → Клетка ${log.toCell}`, 20)
      if (log.transitionType) text(log.transitionType)
      text(log.note ? `Мои заметки\n${log.note}` : 'Заметка не добавлена')
      doc.moveDown(.5)
    }
    text(`Личный дневник участника: ${player.name}. Только его запрос, ходы и заметки. Закрытые описания клеток и игровое поле в документ не включены.`, 11)
    doc.end()
  } catch (error) { doc.emit('error', error instanceof Error ? error : new Error(String(error))); doc.end() }
  return result
}
