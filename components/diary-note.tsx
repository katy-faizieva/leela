'use client'
import { useEffect, useState } from 'react'

export function DiaryNote({ initial, onSave }: { initial: string; onSave: (note: string, expectedNote: string) => Promise<void> }) {
  const [note, setNote] = useState(initial)
  const [baseline, setBaseline] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  useEffect(() => {
    if (note === baseline && initial !== baseline) { setNote(initial); setBaseline(initial) }
  }, [initial, note, baseline])
  return <div className="space-y-2 mt-3">
    <label className="block">Запись в дневнике<textarea disabled={busy} aria-label="Запись в дневнике" value={note} maxLength={10000} onChange={e => { setNote(e.target.value); setStatus('') }} className="w-full mt-1 p-2 rounded border bg-background text-sm min-h-20" placeholder="Что вы заметили после этого хода?" /></label>
    {initial !== baseline && <p className="text-red-800">Заметка изменена на другом устройстве. Ваш черновик оставлен в поле. <button className="underline" onClick={() => { if (window.confirm('Заменить черновик актуальной заметкой?')) { setNote(initial); setBaseline(initial); setStatus('') } }}>Загрузить актуальную</button></p>}
    <button disabled={busy || note === baseline || initial !== baseline} className="underline disabled:opacity-50" onClick={async () => { setBusy(true); try { await onSave(note, baseline); setBaseline(note); setStatus('Заметка сохранена') } catch (e) { console.error(e); setStatus(e instanceof Error ? e.message : 'Не удалось сохранить. Текст остался в поле.') } finally { setBusy(false) } }}>{busy ? 'Сохранение…' : 'Сохранить заметку'}</button>
    {status && <p role="status">{status}</p>}
  </div>
}
