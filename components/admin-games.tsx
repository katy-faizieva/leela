'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CellData, GameLog, GameState } from '@/lib/game-types'
import { CellModal } from './cell-modal'
import { SavedPaths } from './saved-paths'

type GameItem = { id: string; state: string; user: { email: string }; logs?: GameLog[] }
export function AdminGames({ cells }: { cells: CellData[] }) {
  const [games, setGames] = useState<GameItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [selected, setSelected] = useState<GameItem | null>(null)
  const [cell, setCell] = useState<number | null>(null)
  const [error, setError] = useState('')
  const loadList = useCallback(async (next?: string) => {
    try {
      const res = await fetch(`/api/admin/games${next ? `?cursor=${encodeURIComponent(next)}` : ''}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Нет доступа к списку игр')
      const data = await res.json()
      setGames(prev => next ? [...prev, ...data.games] : data.games)
      setCursor(data.nextCursor)
      setError('')
    } catch (e) { console.error(e); setError('Не удалось загрузить игры') }
  }, [])
  useEffect(() => { void loadList() }, [loadList])
  const id = selected?.id
  useEffect(() => {
    if (!id) return
    let active = true
    let timer: ReturnType<typeof setTimeout>
    const refresh = async () => {
      try {
        const res = await fetch(`/api/admin/games?id=${encodeURIComponent(id)}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Доступ к игре изменён')
        const data = await res.json()
        if (active) { setSelected(data); setError('') }
      } catch (e) { console.error(e); if (active) { setSelected(null); setCell(null); setError('Не удалось обновить игру. Проверьте доступ.') } }
      if (active) timer = setTimeout(refresh, 5000)
    }
    void refresh()
    return () => { active = false; clearTimeout(timer) }
  }, [id])
  const state: GameState | null = selected ? JSON.parse(selected.state) : null
  return <div className="space-y-4">
    <SavedPaths admin onOpen={g => window.location.assign(`/?game=${encodeURIComponent(g.id)}`)} />
    <hr className="my-6" />
    <h3 className="text-lg">Быстрый просмотр истории</h3>
    <p className="text-sm text-muted-foreground">Для живого наблюдения и управления используйте «Открыть на поле». Здесь можно посмотреть историю и описания клеток.</p>
    {error && <p role="alert">{error}</p>}
    <button className="rounded border px-3 py-2 text-sm" onClick={() => loadList()}>Обновить список</button>
    <label className="block text-sm">Игра участника<select aria-label="Игра участника" className="block w-full mt-2 rounded border p-3 bg-background" value={id ?? ''} onChange={e => { setSelected(games.find(g => g.id === e.target.value) ?? null); setCell(null) }}><option value="">Выберите игру</option>{games.map(g => <option key={g.id} value={g.id}>{g.user.email} — {(JSON.parse(g.state) as GameState).players.map(p => p.name).join(', ')} · {g.id.slice(-6)}</option>)}</select></label>
    {cursor && <button onClick={() => loadList(cursor)} className="rounded border p-2">Загрузить ещё игры</button>}
    {state && <div className="space-y-3">{state.players.map((p, i) => <div key={i} className="rounded-lg bg-white/60 p-3"><p>{p.name} · клетка {p.position}</p><p className="text-sm text-muted-foreground">Запрос: {p.intention}</p></div>)}
      <h3 className="font-semibold">Ходы — последние сверху</h3>
      {selected?.logs?.length === 0 && <p>Ходов пока нет.</p>}
      {[...(selected?.logs ?? [])].reverse().map(log => <button key={log.id} onClick={() => setCell(log.toCell)} className="block w-full rounded-lg bg-white/70 p-4 text-left shadow-sm"><span className="font-semibold">{log.playerName}</span> · {log.roll === 0 ? 'Коррекция' : `кубик ${log.roll}`} · {log.fromCell} → {log.toCell}{log.transitionType && <p className="text-sm">{log.transitionType}</p>}<p className="text-sm mt-1">{cells.find(c => c.number === log.toCell)?.name} — открыть описание</p></button>)}
    </div>}
    {cell !== null && <CellModal cellNumber={cell} cells={cells} onClose={() => setCell(null)} />}
  </div>
}
