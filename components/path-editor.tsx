'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { GameState, SavedGame } from '@/lib/game-types'
import { gameResponse } from '@/lib/game-client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'

export function PathEditor({ game, admin, onSaved, onClose }: { game: SavedGame; admin: boolean; onSaved: (g: SavedGame) => void; onClose: () => void }) {
  const [source, setSource] = useState(game)
  const [state, setState] = useState<GameState>(() => JSON.parse(game.state))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [conflict, setConflict] = useState(false)
  const dirty = JSON.stringify(state) !== JSON.stringify(JSON.parse(source.state))
  const close = () => { if (!busy && (!dirty || window.confirm('Закрыть редактор без сохранения изменений?'))) onClose() }
  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true); setError(''); setConflict(false)
    try {
      const res = await fetch(`/api/games/${source.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state, expectedUpdatedAt: source.updatedAt }) })
      if (res.status === 409) setConflict(true)
      const data = await gameResponse(res)
      onSaved(data); toast.success('Изменения сохранены'); onClose()
    } catch (e) { console.error(e); setError(e instanceof Error ? e.message : 'Не удалось сохранить изменения') }
    finally { setBusy(false) }
  }
  const reload = async () => {
    if (!window.confirm('Загрузить актуальный путь? Несохранённые изменения в форме будут сброшены.')) return
    setBusy(true)
    try { const g = await fetch(`/api/games/${source.id}`, { cache: 'no-store' }).then(gameResponse); setSource(g); setState(JSON.parse(g.state)); setConflict(false); setError('') }
    catch (e) { console.error(e); setError('Не удалось загрузить путь') } finally { setBusy(false) }
  }
  const field = 'w-full mt-1 p-2.5 rounded-lg border bg-background text-foreground'
  return <Dialog open onOpenChange={open => { if (!open) close() }}><DialogContent className="max-w-xl max-h-[90svh] overflow-y-auto">
    <DialogHeader><DialogTitle>{admin ? 'Управление путём' : 'Редактирование пути'}</DialogTitle><DialogDescription>{admin ? 'Имена меняются вместе с личной историей. Коррекция позиции записывается в дневник. Состав путников остаётся прежним.' : 'Измените название, личные запросы и настройки кубика.'}</DialogDescription></DialogHeader>
    <form onSubmit={save} className="space-y-4">
      <fieldset disabled={busy} className="space-y-4">
        <label className="block text-sm">Название пути<input className={field} value={state.title ?? ''} maxLength={120} onChange={e => setState({ ...state, title: e.target.value })} placeholder="Например, встреча в субботу" /></label>
        {state.players.map((p, i) => <section key={i} className="p-3 rounded-xl bg-secondary/30 space-y-3">
          <label className="block text-sm">Путник {i + 1}<input aria-label={`Имя путника ${i + 1}`} className={field} required maxLength={80} readOnly={!admin} value={p.name} onChange={e => setState({ ...state, players: state.players.map((v, j) => j === i ? { ...v, name: e.target.value } : v) })} /></label>
          <label className="block text-sm">Личный запрос<textarea className={field} rows={3} maxLength={5000} value={p.intention} onChange={e => setState({ ...state, players: state.players.map((v, j) => j === i ? { ...v, intention: e.target.value } : v) })} /></label>
          {admin && <label className="block text-sm">Позиция (0 — перед входом на поле)<input aria-label={`Позиция путника ${i + 1}`} className={field} type="number" required min={0} max={72} value={p.position} onChange={e => setState({ ...state, players: state.players.map((v, j) => j === i ? { ...v, position: Number(e.target.value) } : v) })} /></label>}
        </section>)}
        {admin && <><label className="block text-sm">Сейчас ходит<select className={field} value={state.currentPlayerIndex} onChange={e => setState({ ...state, currentPlayerIndex: Number(e.target.value) })}>{state.players.map((p, i) => <option key={i} value={i}>{p.name}</option>)}</select></label><label className="flex gap-2 items-center"><input type="checkbox" checked={Boolean(state.paused)} onChange={e => setState({ ...state, paused: e.target.checked })} />Поставить путь на паузу</label></>}
        <label className="block text-sm">Кубик<select className={field} value={state.diceMode} onChange={e => setState({ ...state, diceMode: e.target.value as 'auto' | 'manual' })}><option value="auto">Автоматический</option><option value="manual">Свой кубик</option></select></label>
        <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={state.settings.extraRollOnSix} onChange={e => setState({ ...state, settings: { ...state.settings, extraRollOnSix: e.target.checked } })} />Дополнительный бросок при 6</label>
        <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={state.settings.bounceOnOvershoot} onChange={e => setState({ ...state, settings: { ...state.settings, bounceOnOvershoot: e.target.checked } })} />Отскок при превышении 72</label>
      </fieldset>
      {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
      {conflict && <button type="button" disabled={busy} onClick={reload} className="underline text-sm">Загрузить актуальную версию</button>}
      <div className="flex gap-3 sticky bottom-0 bg-background py-3"><button type="button" disabled={busy} onClick={close} className="flex-1 rounded-lg border p-3">Отмена</button><button disabled={busy || conflict} className="flex-1 rounded-lg bg-primary text-primary-foreground p-3 disabled:opacity-50">{busy ? 'Сохранение…' : 'Сохранить'}</button></div>
    </form>
  </DialogContent></Dialog>
}
