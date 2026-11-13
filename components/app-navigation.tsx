'use client'

import { ArrowLeft, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu'

type Props = { onBack?: () => void; onNew?: () => void; onSaved?: () => void; onHistory?: () => void; onPdf?: () => void; registration?: boolean; disabled?: boolean }
export function AppNavigation({ onBack, onNew, onSaved, onHistory, onPdf, registration, disabled }: Props) {
  const router = useRouter()
  const { data: session } = useSession() || {}
  const admin = ['owner', 'admin'].includes(session?.user?.role ?? '')
  return <div className="flex items-center gap-3 text-primary">
    <button type="button" aria-label="Назад" title="Назад" disabled={disabled} onClick={onBack ?? (() => { if (window.history.length > 1) router.back(); else router.push(session ? '/' : '/login') })} className="p-2 rounded-full hover:bg-secondary disabled:opacity-40"><ArrowLeft className="w-5 h-5" /></button>
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger disabled={disabled} className="flex items-center gap-2 rounded-lg py-1 focus-visible:outline focus-visible:outline-2" aria-label="Leela — быстрое меню"><span className="text-2xl font-semibold" style={{ fontFamily: 'Cinzel, Georgia, serif' }}>Leela</span><ChevronDown className="w-4 h-4" /></DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          {session?.user?.accessAllowed ? <>
            <DropdownMenuItem onSelect={onNew ?? (() => router.push('/'))}>Начало пути</DropdownMenuItem>
            <DropdownMenuItem onSelect={onSaved ?? (() => router.push('/?view=saved'))}>Сохранённые пути</DropdownMenuItem>
            {onHistory && <DropdownMenuItem onSelect={onHistory}>История ходов</DropdownMenuItem>}
            {onPdf && <DropdownMenuItem onSelect={onPdf}>PDF участника</DropdownMenuItem>}
            {admin && <DropdownMenuItem onSelect={() => window.location.assign('/admin?tab=games')}>Игры участников</DropdownMenuItem>}
            {admin && <DropdownMenuItem onSelect={() => window.location.assign('/admin')}>Панель администратора</DropdownMenuItem>}
          </> : <><DropdownMenuItem onSelect={() => router.push('/login')}>Вход</DropdownMenuItem><DropdownMenuItem onSelect={() => router.push('/signup')}>Регистрация</DropdownMenuItem></>}
          {session && <><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => signOut({ redirectTo: '/login' })}>Выйти из аккаунта</DropdownMenuItem></>}
        </DropdownMenuContent>
      </DropdownMenu>
      {registration && <p className="text-xs tracking-wide text-muted-foreground">by Ekaterina Faizieva</p>}
    </div>
  </div>
}
