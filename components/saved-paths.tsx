'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Pencil, Trash2, Map, Download, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'
import type { GameState, SavedGame } from '@/lib/game-types'
import { gameResponse } from '@/lib/game-client'
import { PathEditor } from './path-editor'
import { PlayerPdfExport } from './player-pdf-export'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'

export function SavedPaths({ admin = false, onOpen }: { admin?: boolean; onOpen: (g: SavedGame) => void }) {
  const [games, setGames] = useState<SavedGame[]>([])
  const [scope, setScope] = useState(admin ? 'all' : 'mine')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<SavedGame | null>(null)
  const [removing, setRemoving] = useState<SavedGame | null>(null)
  const [pdf, setPdf] = useState<SavedGame | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const sequence = useRef(0)
  const load = useCallback(async (next?: string) => {
    const seq = ++sequence.current
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({ view: 'manage', scope, q: query })
      if (next) params.set('cursor', next)
      const data = await fetch(`/api/games?${params}`, { cache: 'no-store' }).then(gameResponse)
      if (seq !== sequence.current) return
      setGames(prev => next ? [...prev, ...data.games.filter((g: SavedGame) => !prev.some(p => p.id === g.id))] : data.games)
      setCursor(data.nextCursor)
    } catch (e) { console.error(e); if (seq === sequence.current) setError(e instanceof Error ? e.message : 'Не удалось загрузить пути') }
    finally { if (seq === sequence.current) setLoading(false) }
  }, [scope, query])
  useEffect(() => { setGames([]); setCursor(null); const timer = setTimeout(() => void load(), 300); return () => { clearTimeout(timer); sequence.current++ } }, [load])
  const fresh = async (g: SavedGame, action: (g: SavedGame) => void) => {
    setBusy(true)
    try { action(await fetch(`/api/games/${g.id}`, { cache: 'no-store' }).then(gameResponse)) }
    catch (e) { console.error(e); toast.error(e instanceof Error ? e.message : 'Путь недоступен') }
    finally { setBusy(false) }
  }
  const remove = async () => {
    if (!removing || confirmation !== 'Удалить' || busy) return
    setBusy(true)
    try {
      await fetch(`/api/games/${removing.id}?version=${encodeURIComponent(removing.updatedAt)}`, { method: 'DELETE' }).then(gameResponse)
      setGames(prev => prev.filter(g => g.id !== removing.id)); setRemoving(null); toast.success('Путь удалён')
    } catch (e) { console.error(e); toast.error(e instanceof Error ? e.message : 'Не удалось удалить путь'); setRemoving(null); void load() }
    finally { setBusy(false) }
  }
  const items = games.flatMap(g => { try { return [{ game: g, state: JSON.parse(g.state) as GameState }] } catch { return [] } })
  const visible = items.filter(({ state: s }) => filter === 'all' || (filter === 'finished' ? s.finished : filter === 'paused' ? s.paused && !s.finished : !s.finished && !s.paused))
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-2 items-center justify-between"><h3 className="text-lg">Сохранённые пути</h3><button aria-label="Обновить список путей" disabled={loading || busy} onClick={() => load()} className="p-2 rounded-lg hover:bg-secondary"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button></div>
    <div className="relative"><Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" /><input aria-label="Поиск сохранённых путей" value={query} maxLength={120} onChange={e => setQuery(e.target.value)} className="w-full pl-9 p-3 rounded-lg border bg-background" placeholder="Имя, запрос, название или email" /></div>
    <div className="flex flex-wrap gap-2">
      {admin && <select aria-label="Чьи пути" className="rounded-lg border p-2 bg-background" value={scope} onChange={e => setScope(e.target.value)}><option value="all">Все участники</option><option value="mine">Мои пути</option></select>}
      <select aria-label="Статус пути" className="rounded-lg border p-2 bg-background" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Все статусы</option><option value="active">В процессе</option><option value="paused">На паузе</option><option value="finished">Завершённые</option></select>
    </div>
    {error && <p role="alert" className="text-red-800">{error}</p>}
    {loading && <p role="status" className="text-sm text-muted-foreground">Загрузка путей…</p>}
    {!loading && !error && !visible.length && <p className="py-5 text-center text-muted-foreground">Подходящих путей нет{cursor ? ' среди загруженных. Загрузите ещё.' : '.'}</p>}
    {visible.map(({ game: g, state: s }) => <article key={g.id} className="rounded-xl bg-white/70 p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap gap-2 justify-between"><h4 className="font-semibold break-words">{s.title || s.players.map(p => p.name).join(', ')}</h4><span className="rounded-full bg-secondary px-2 py-1 text-xs">{s.finished ? 'Завершён' : s.paused ? 'На паузе' : 'В процессе'}</span></div>
      {admin && g.user && <p className="text-sm text-muted-foreground break-all"><span suppressHydrationWarning>{g.user.email}</span></p>}
      <p className="text-xs text-muted-foreground">Изменён: {new Date(g.updatedAt).toLocaleString('ru-RU', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' })} UTC</p>
      {s.players.map((p, i) => <div key={i} className="text-sm"><p className="font-semibold">{p.name} · {p.position ? `клетка ${p.position}` : 'перед входом'}</p><p className="text-muted-foreground line-clamp-2">{p.intention}</p></div>)}
      <div className="flex flex-wrap gap-2 pt-2">
        <button disabled={busy} onClick={() => fresh(g, onOpen)} className="flex items-center gap-1.5 rounded-lg px-3 py-2 bg-primary text-primary-foreground text-sm"><Map className="w-4 h-4" />{admin ? 'Открыть на поле' : 'Продолжить'}</button>
        <button disabled={busy} onClick={() => fresh(g, setEditing)} className="flex items-center gap-1.5 rounded-lg px-3 py-2 bg-secondary text-sm"><Pencil className="w-4 h-4" />Изменить</button>
        <button disabled={busy} onClick={() => fresh(g, setPdf)} className="flex items-center gap-1.5 rounded-lg px-3 py-2 bg-secondary text-sm"><Download className="w-4 h-4" />PDF</button>
        <button disabled={busy} onClick={() => { setConfirmation(''); setRemoving(g) }} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-red-800 hover:bg-red-50 text-sm"><Trash2 className="w-4 h-4" />Удалить</button>
      </div>
    </article>)}
    {cursor && <><p className="text-xs text-muted-foreground">Статус фильтруется среди загруженных путей.</p><button disabled={loading} onClick={() => load(cursor)} className="w-full p-3 rounded-lg border">Загрузить ещё</button></>}
    {editing && <PathEditor game={editing} admin={admin} onClose={() => setEditing(null)} onSaved={g => setGames(prev => prev.map(v => v.id === g.id ? g : v))} />}
    <Dialog open={Boolean(removing)} onOpenChange={open => { if (!open && !busy) setRemoving(null) }}><DialogContent><DialogHeader><DialogTitle>Удалить сохранённый путь?</DialogTitle><DialogDescription>Будут удалены все путники этой игры, их ходы и заметки. Это действие нельзя отменить. Перед удалением можно скачать личные PDF.</DialogDescription></DialogHeader><p className="font-semibold">{removing && (JSON.parse(removing.state) as GameState).players.map(p => p.name).join(', ')}</p><label className="text-sm">Введите «Удалить» для подтверждения<input className="w-full mt-2 rounded-lg border p-3 bg-background" value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label><div className="flex gap-3"><button disabled={busy} onClick={() => setRemoving(null)} className="flex-1 p-3 border rounded-lg">Отмена</button><button disabled={busy || confirmation !== 'Удалить'} onClick={remove} className="flex-1 p-3 bg-red-800 text-white rounded-lg disabled:opacity-40">Удалить путь</button></div></DialogContent></Dialog>
    <Dialog open={Boolean(pdf)} onOpenChange={open => { if (!open) setPdf(null) }}><DialogContent><DialogHeader><DialogTitle>Личный PDF участника</DialogTitle><DialogDescription>Выберите одного путника. Его документ не содержит данных других участников.</DialogDescription></DialogHeader>{pdf && <PlayerPdfExport key={pdf.id} gameId={pdf.id} players={JSON.parse(pdf.state).players} disabled={false} />}</DialogContent></Dialog>
  </div>
}
