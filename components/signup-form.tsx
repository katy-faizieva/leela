'use client'

import { useState } from 'react'
import { AppNavigation } from './app-navigation'
import { RegistrationChakras } from './chakra-symbol'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react'

export function SignupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [maxPlayers, setMaxPlayers] = useState(2)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Пароли не совпадают'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, name: name.trim(), maxPlayers }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Ошибка регистрации')
        return
      }
      // Auto-login after signup
      const loginRes = await signIn('credentials', { email, password, redirect: false })
      if (loginRes?.error) {
        setError('Регистрация успешна, но войти не удалось')
      } else {
        router.replace('/')
      }
    } catch {
      setError('Ошибка подключения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-28 pb-8" style={{ background: 'linear-gradient(135deg, #FAF6F0 0%, #F0E6D6 100%)' }}>
      <header className="absolute left-4 top-4"><AppNavigation registration /></header>
      <div className="w-full max-w-[544px]">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold tracking-tight" style={{ color: '#4A0E17' }}>Leela</h1>
          <p className="mt-2 text-lg opacity-70" style={{ color: '#4A0E17' }}>Познай себя</p>
        </div>
        <div className="flex items-stretch gap-3 sm:gap-8">
        <form onSubmit={handleSubmit} className="min-w-0 flex-1 rounded-xl p-4 sm:p-8 space-y-5" style={{ background: 'rgba(255,255,255,0.6)', boxShadow: '0 8px 32px rgba(74,14,23,0.08)' }}>
          <h2 className="text-xl font-medium text-center" style={{ color: '#4A0E17' }}>Заявка на участие</h2>
          <p className="text-sm text-muted-foreground">Игра откроется после одобрения администратором. Для пары достаточно одного аккаунта: у каждого будут своё имя, намерение и дневник. На общем устройстве записи видны обоим.</p>
          {error && <div className="text-sm text-center py-2 px-3 rounded-lg bg-red-50 text-red-700">{error}</div>}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input aria-label="Имя" autoComplete="name" maxLength={80} type="text" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input aria-label="Электронная почта" autoComplete="email" maxLength={254} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input aria-label="Пароль" autoComplete="new-password" type={showPassword ? 'text' : 'password'} placeholder="Пароль (8–72 символа)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={72}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <input aria-label="Повторите пароль" autoComplete="new-password" type={showPassword ? 'text' : 'password'} placeholder="Повторите пароль" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required maxLength={72} className="w-full px-4 py-3 rounded-lg border bg-background/50" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} />Показать пароли</label>
          <label className="block text-sm">Как планируете играть?
            <select value={maxPlayers} onChange={e => setMaxPlayers(Number(e.target.value))} className="w-full mt-2 p-3 rounded-lg border bg-background"><option value={1}>Индивидуально</option><option value={2}>Парой — два игрока</option><option value={3}>Группа — три игрока</option><option value={4}>Группа — четыре игрока</option></select>
          </label>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg font-medium text-primary-foreground flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: '#4A0E17' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Отправить заявку
          </button>
          <p className="text-center text-sm opacity-60">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="underline hover:opacity-80" style={{ color: '#4A0E17' }}>Войти</Link>
          </p>
        </form>
        <RegistrationChakras />
        </div>
      </div>
    </div>
  )
}
