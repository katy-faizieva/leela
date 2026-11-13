'use client'

import { useState } from 'react'
import { UserPasswordReset } from './user-password-reset'

export interface UserData {
  id: string; email: string; name: string | null; role: string;
  blocked: boolean; approved: boolean; maxPlayers: number;
  accessExpiresAt: string | null; createdAt: string
}

export function UserAccessRow({ user, currentUserId, currentRole, onSaved }: { user: UserData; currentUserId: string; currentRole: string; onSaved: (user: UserData) => void }) {
  const [draft, setDraft] = useState(user)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const locked = user.id === currentUserId || user.role === 'owner' || (currentRole !== 'owner' && user.role === 'admin')

  async function save() {
    if (!window.confirm(`Сохранить права доступа для ${user.name || user.email}? Изменения действуют и для открытых сессий.`)) return
    setBusy(true); setMessage('')
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: draft.approved, blocked: draft.blocked, maxPlayers: draft.maxPlayers, accessExpiresAt: draft.accessExpiresAt, ...(currentRole === 'owner' ? { role: draft.role } : {}) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Не удалось сохранить')
      setDraft(data); onSaved(data); setMessage('Доступ обновлён')
    } catch (e) { console.error(e); setMessage(e instanceof Error ? e.message : 'Ошибка сохранения') }
    finally { setBusy(false) }
  }

  return <section className="p-4 rounded-xl bg-card shadow-sm space-y-3">
    <div><h3 className="text-base font-medium">{user.name || 'Участник'}</h3><p className="text-sm text-muted-foreground break-all" suppressHydrationWarning>{user.email}</p>
      <p className="text-sm mt-1">{user.role === 'owner' ? 'Владелец' : user.role === 'admin' ? 'Администратор' : 'Участник'} · {user.blocked ? 'Заблокирован' : user.approved ? 'Заявка одобрена' : 'Ожидает одобрения'}</p>
      {user.accessExpiresAt && <p className="text-xs">Доступ до {new Date(user.accessExpiresAt).toLocaleDateString('ru-RU', { timeZone: 'UTC' })} включительно (UTC)</p>}
    </div>
    {locked ? <p className="text-xs text-muted-foreground">{user.id === currentUserId ? 'Собственные права здесь не изменяются.' : 'Этот аккаунт защищён от изменения ваших прав доступа.'}</p> : <fieldset disabled={busy} className="space-y-3">
      <div className="flex flex-wrap gap-4">
        <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={draft.approved} onChange={e => setDraft({ ...draft, approved: e.target.checked })} />Одобрить доступ</label>
        <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={draft.blocked} onChange={e => setDraft({ ...draft, blocked: e.target.checked })} />Заблокировать</label>
      </div>
      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <label className="space-y-1">Игроков на устройстве<select aria-label="Лимит игроков" className="w-full p-2 rounded border bg-background" value={draft.maxPlayers} onChange={e => setDraft({ ...draft, maxPlayers: Number(e.target.value) })}>{[1, 2, 3, 4].map(n => <option key={n} value={n}>{n === 1 ? '1 — индивидуально' : n === 2 ? '2 — пара' : `${n} — группа`}</option>)}</select></label>
        <label className="space-y-1">Доступ до (включительно)<input aria-label="Дата окончания доступа" type="date" className="w-full p-2 rounded border bg-background" value={draft.accessExpiresAt?.slice(0, 10) ?? ''} onChange={e => setDraft({ ...draft, accessExpiresAt: e.target.value ? `${e.target.value}T23:59:59.999Z` : null })} /><span className="text-xs text-muted-foreground">Пусто — без срока. Время UTC.</span></label>
        {currentRole === 'owner' && <label className="space-y-1">Роль<select aria-label="Роль пользователя" className="w-full p-2 rounded border bg-background" value={draft.role} onChange={e => setDraft({ ...draft, role: e.target.value })}><option value="user">Участник</option><option value="admin">Администратор</option></select></label>}
      </div>
      <button disabled={busy} onClick={save} className="px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50">{busy ? 'Сохранение…' : 'Сохранить доступ'}</button>
    </fieldset>}
    {message && <p role="status" className="text-sm">{message}</p>}
    {!locked && user.role === 'user' && <UserPasswordReset userId={user.id} userName={user.name || user.email} />}
  </section>
}
