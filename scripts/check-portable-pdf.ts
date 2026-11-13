import { renderPathPdf } from '../lib/render-path-pdf'
import { writeFile } from 'node:fs/promises'
import type { GameLog } from '../lib/game-types'

async function main() {
  const player = { name: 'Тестовый путник', intention: 'Проверка кириллицы и личного пути', position: 23, finished: false, color: 0 }
  const log: GameLog = { id: 'sample', gameId: 'sample', playerName: player.name, roll: 0, fromCell: 5, toCell: 23, transitionType: null, note: 'Осознанный шаг — важное открытие. '.repeat(160) }
  const foreign = { ...log, id: 'foreign', playerName: 'Другой участник', note: 'ЧУЖАЯ_ЗАПИСЬ_НЕ_ДЛЯ_ЭКСПОРТА' }
  const buffer = await renderPathPdf(player, [log, foreign], new Date('2026-01-01T00:00:00Z'))
  if (!buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error('Неверный формат PDF')
  if (process.env.PDF_CHECK_OUTPUT) await writeFile(process.env.PDF_CHECK_OUTPUT, buffer)
  console.log('PDF сформирован локально:', buffer.length, 'байт.')
}
main().catch((e) => { console.error(e); process.exitCode = 1 })
