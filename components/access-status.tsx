'use client'

import { signOut } from 'next-auth/react'
import { AppNavigation } from './app-navigation'

export function AccessStatus({ blocked, approved, email }: { blocked: boolean; approved: boolean; email: string }) {
  return <main className="min-h-screen flex items-center justify-center px-5 bg-background text-foreground">
    <header className="absolute top-4 left-4"><AppNavigation /></header>
    <section className="max-w-md w-full space-y-5 rounded-xl bg-card p-8 shadow-md">
      <h1 className="text-2xl">Leela</h1>
      <h2 className="text-xl">{blocked ? 'Доступ приостановлен' : !approved ? 'Заявка отправлена' : 'Срок доступа закончился'}</h2>
      <p>{blocked ? 'Обратитесь к администратору, чтобы уточнить условия возобновления доступа.' : !approved ? 'Администратор рассмотрит вашу заявку. После одобрения здесь появится игра.' : 'Для продолжения игры администратор должен продлить доступ. Сохранённые игры не удалены.'}</p>
      <p className="text-sm break-all" suppressHydrationWarning>{email}</p>
      <button onClick={() => window.location.reload()} className="w-full rounded-lg bg-primary text-primary-foreground p-3">Проверить доступ</button>
      <button onClick={() => signOut({ redirectTo: '/login' })} className="w-full p-2 underline">Выйти</button>
    </section>
  </main>
}
