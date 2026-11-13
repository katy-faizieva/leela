'use client'

import { useState, type FormEvent } from 'react'

export function UserPasswordReset({ userId, userName }: { userId: string; userName: string }) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  function close() { setOpen(false); setPassword(''); setConfirmation('') }

  async function reset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    if (password !== confirmation) { setMessage('Пароли не совпадают'); return }
    if (password.length < 8 || new TextEncoder().encode(password).length > 72) {
      setMessage('Не менее 8 символов и не более 72 байт. Для кириллицы допустимая длина меньше.'); return
    }
    if (!window.confirm(`Изменить пароль путника ${userName}? Старый пароль больше не подойдёт для входа.`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password, confirmPassword: confirmation }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Не удалось изменить пароль')
      close(); setMessage('Пароль изменён. Передайте новый пароль путнику безопасным способом.')
    } catch (e) {
      console.error('Password reset failed')
      setMessage(e instanceof Error ? e.message : 'Не удалось изменить пароль')
    } finally { setBusy(false) }
  }

  return <div className="space-y-3">
    {!open ? <button type="button" onClick={() => { setMessage(''); setOpen(true) }} className="px-4 py-2 rounded border border-primary/30 text-primary">Сменить пароль</button> : <form onSubmit={reset} className="space-y-3">
      <fieldset disabled={busy} className="space-y-3">
        <legend className="text-sm font-medium mb-2">Новый пароль путника</legend>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm space-y-1 block"><span>Новый пароль</span><input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 rounded border bg-background text-foreground" /></label>
          <label className="text-sm space-y-1 block"><span>Повторите пароль</span><input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={confirmation} onChange={e => setConfirmation(e.target.value)} className="w-full p-2 rounded border bg-background text-foreground" /></label>
        </div>
        <p className="text-xs text-muted-foreground">Не менее 8 символов. Старый пароль знать не нужно.</p>
        <div className="flex flex-wrap gap-2"><button type="submit" className="px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50">{busy ? 'Сохранение…' : 'Сохранить новый пароль'}</button><button type="button" onClick={close} className="px-4 py-2 rounded border">Отмена</button></div>
      </fieldset>
    </form>}
    {message && <p role="status" className="text-sm">{message}</p>}
  </div>
}
