'use client'

import { useState } from 'react'
import { AppNavigation } from './app-navigation'
import { LoginChakras } from './login-chakras'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (res?.error) {
        setError('Неверный email или пароль')
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
    <div className="min-h-svh flex items-center justify-center px-5 pt-20 pb-10 sm:px-8" style={{ background: 'linear-gradient(135deg, #FAF6F0 0%, #F0E6D6 100%)' }}>
      <header className="absolute left-4 top-4"><AppNavigation /></header>
      <div className="w-full max-w-[588px] grid grid-cols-[minmax(0,1fr)_48px] sm:grid-cols-[minmax(0,440px)_68px] justify-center items-stretch gap-5 sm:gap-16 min-h-[520px] sm:min-h-[clamp(560px,76svh,680px)]">
        <div className="min-w-0 self-center">
        <div className="text-center mb-7 sm:mb-9">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight" style={{ color: '#4A0E17' }}>Leela</h1>
          <p className="mt-2 text-lg opacity-70" style={{ color: '#4A0E17' }}>Познай себя</p>
        </div>
        <form onSubmit={handleSubmit} className="min-w-0 rounded-2xl px-5 py-7 sm:p-9 space-y-5" style={{ background: 'rgba(255,255,255,0.6)', boxShadow: '0 8px 32px rgba(74,14,23,0.08)' }}>
          <h2 className="text-xl font-medium text-center" style={{ color: '#4A0E17' }}>Вход</h2>
          {error && <div className="text-sm text-center py-2 px-3 rounded-lg bg-red-50 text-red-700">{error}</div>}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg font-medium text-primary-foreground flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: '#4A0E17' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            Войти
          </button>
          <p className="text-center text-sm opacity-80">
            Нет аккаунта?{' '}
            <Link href="/signup" className="underline hover:opacity-80" style={{ color: '#4A0E17' }}>Регистрация</Link>
          </p>
        </form>
        </div>
        <LoginChakras />
      </div>
    </div>
  )
}
