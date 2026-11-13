'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { PlayerState } from '@/lib/game-types'

export function PlayerPdfExport({ gameId, players, disabled }: { gameId: string; players: PlayerState[]; disabled: boolean }) {
  const [playerIndex, setPlayerIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const [download, setDownload] = useState<{ url: string; name: string } | null>(null)
  const controller = useRef<AbortController | null>(null)
  const lock = useRef(false)
  useEffect(() => () => controller.current?.abort(), [])
  useEffect(() => () => { if (download) URL.revokeObjectURL(download.url) }, [download])
  async function generate() {
    if (lock.current || disabled) return
    lock.current = true
    setBusy(true)
    setDownload(null)
    const abort = new AbortController()
    controller.current = abort
    const call = async (path: string, body: object) => {
      const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: abort.signal })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка подготовки PDF')
      return data
    }
    try {
      const base = `/api/games/${gameId}/pdf`
      const { token } = await call(base, { playerIndex })
      const deadline = Date.now() + 5 * 60 * 1000
      while (!abort.signal.aborted && Date.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        const data = await call(`${base}/status`, { token })
        if (data.status === 'FAILED') throw new Error(data.error)
        if (data.status === 'SUCCESS') {
          const bytes = Uint8Array.from(atob(data.pdf_base64), c => c.charCodeAt(0))
          const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
          const name = `Лила — ${players[playerIndex].name.replace(/[\\/:*?"<>|]/g, '-')}.pdf`
          setDownload({ url, name })
          const link = document.createElement('a')
          link.href = url
          link.download = name
          document.body.appendChild(link)
          link.click()
          link.remove()
          toast.success('PDF пути выбранного участника готов')
          return
        }
      }
      throw new Error('Подготовка заняла слишком много времени. Попробуйте ещё раз.')
    } catch (e) { if (!abort.signal.aborted) { console.error(e); toast.error(e instanceof Error ? e.message : 'Не удалось создать PDF') } }
    finally { lock.current = false; if (!abort.signal.aborted) setBusy(false) }
  }
  return <section className="rounded-xl bg-white/60 shadow-sm p-4 space-y-3">
    <h3 className="text-sm font-semibold">Личный путь в PDF</h3>
    <p className="text-xs text-muted-foreground">Один файл — один участник. Только его запрос, ходы и заметки, без закрытых описаний клеток.</p>
    <label className="block text-sm">Участник<select aria-label="Участник для PDF" className="block w-full rounded border p-2 mt-1 bg-background" value={playerIndex} disabled={busy} onChange={e => { setPlayerIndex(Number(e.target.value)); setDownload(null) }}>{players.map((p, i) => <option key={i} value={i}>{p.name}</option>)}</select></label>
    <button disabled={busy || disabled} onClick={generate} className="w-full rounded-lg bg-primary text-primary-foreground py-2 disabled:opacity-50">{busy ? 'Готовим PDF…' : 'Скачать PDF участника'}</button>
    {download && <a href={download.url} download={download.name} className="block text-sm underline">Скачать готовый PDF повторно</a>}
    <p className="text-xs text-muted-foreground">Ходы и сохранённые заметки хранятся в игре. PDF можно скачать снова после её открытия.</p>
  </section>
}
