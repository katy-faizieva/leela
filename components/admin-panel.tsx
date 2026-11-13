'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Save, Users, Grid3X3, Loader2, Ban, CheckCircle } from 'lucide-react'
import type { CellData } from '@/lib/game-types'

import { UserAccessRow, type UserData } from './user-access-row'
import { AdminGames } from './admin-games'
import { AppNavigation } from './app-navigation'

export function AdminPanel({ currentUserId, currentRole }: { currentUserId: string; currentRole: string }) {
  const [tab, setTab] = useState<'cells' | 'users' | 'games'>('cells')
  const [cells, setCells] = useState<CellData[]>([])
  const [users, setUsers] = useState<UserData[]>([])
  const [editingCell, setEditingCell] = useState<CellData | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [pendingOnly, setPendingOnly] = useState(false)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tab') === 'games') setTab('games')
    fetch('/api/cells').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setCells(d)
    }).catch(() => {})
    fetch('/api/admin/users').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setUsers(d)
    }).catch(() => {})
  }, [])

  const saveCell = useCallback(async () => {
    if (!editingCell) return
    setSaving(true)
    try {
      const res = await fetch(`/api/cells/${editingCell.number}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCell),
      })
      if (res.ok) {
        const updated = await res.json()
        setCells(prev => prev.map(c => c?.number === updated?.number ? updated : c))
        setMessage('Сохранено!')
        setTimeout(() => setMessage(''), 2000)
      }
    } catch { /* ignore */ }
    setSaving(false)
  }, [editingCell])


  return (
    <div className="min-h-screen" style={{ background: '#FAF6F0' }}>
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(250,246,240,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(74,14,23,0.1)' }}>
        <div className="flex items-center gap-3">
          <AppNavigation onBack={() => { if (editingCell) setEditingCell(null); else window.location.assign('/') }} />
          <h1 className="text-sm sm:text-xl font-semibold" style={{ color: '#4A0E17' }}>Панель администратора</h1>
        </div>
        {message && <span className="text-sm text-green-700">{message}</span>}
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden mb-6" style={{ background: 'rgba(74,14,23,0.05)' }}>
          <button onClick={() => setTab('cells')}
            className={`flex-1 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2`}
            style={tab === 'cells' ? { background: '#4A0E17', color: '#FAF6F0' } : { color: '#4A0E17', opacity: 0.5 }}>
            <Grid3X3 className="w-4 h-4" /> Клетки (72)
          </button>
          <button onClick={() => setTab('users')}
            className={`flex-1 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2`}
            style={tab === 'users' ? { background: '#4A0E17', color: '#FAF6F0' } : { color: '#4A0E17', opacity: 0.5 }}>
            <Users className="w-4 h-4" /> Пользователи
          </button>
          <button onClick={() => setTab('games')} className="flex-1 py-3 text-sm font-medium" style={tab === 'games' ? { background: '#4A0E17', color: '#FAF6F0' } : { color: '#4A0E17' }}>Ходы игроков</button>
        </div>

        {tab === 'games' && <AdminGames cells={cells} />}
        {tab === 'cells' && (
          <div className="space-y-3">
            {editingCell ? (
              <div className="space-y-4 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium" style={{ color: '#4A0E17' }}>
                    Клетка {editingCell.number}: {editingCell.name}
                  </h3>
                  <button onClick={() => setEditingCell(null)} className="text-sm opacity-50 hover:opacity-100"><ArrowLeft className="w-4 h-4 inline mr-1" />Назад</button>
                </div>
                {(['name', 'sanskrit', 'essence'] as const).map(field => (
                  <div key={field}>
                    <label className="text-xs font-medium opacity-40 block mb-1">{field === 'name' ? 'Название' : field === 'sanskrit' ? 'Санскрит' : 'Суть'}</label>
                    <input type="text" value={(editingCell as any)?.[field] ?? ''}
                      onChange={e => setEditingCell({ ...editingCell, [field]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border text-sm bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      style={{ borderColor: 'rgba(74,14,23,0.15)' }} />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium opacity-40 block mb-1">Описание</label>
                  <textarea value={editingCell?.description ?? ''}
                    onChange={e => setEditingCell({ ...editingCell, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 h-32 resize-y"
                    style={{ borderColor: 'rgba(74,14,23,0.15)' }} />
                </div>
                <div>
                  <label className="text-xs font-medium opacity-40 block mb-1">Путь</label>
                  <textarea value={editingCell?.path ?? ''}
                    onChange={e => setEditingCell({ ...editingCell, path: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 h-20 resize-y"
                    style={{ borderColor: 'rgba(74,14,23,0.15)' }} />
                </div>
                <div>
                  <label className="text-xs font-medium opacity-40 block mb-1">Вопросы (JSON массив)</label>
                  <textarea value={editingCell?.questions ?? '[]'}
                    onChange={e => setEditingCell({ ...editingCell, questions: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 h-20 resize-y font-mono text-xs"
                    style={{ borderColor: 'rgba(74,14,23,0.15)' }} />
                </div>
                <button onClick={saveCell} disabled={saving}
                  className="py-2.5 px-6 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                  style={{ background: '#4A0E17', color: '#FAF6F0' }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Сохранить
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cells?.map(cell => (
                  <button key={cell?.number} onClick={() => setEditingCell({ ...cell })}
                    className="p-3 rounded-lg text-left transition-all hover:shadow-md"
                    style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(74,14,23,0.08)' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono opacity-30 w-6">{cell?.number}</span>
                      <span className="text-sm font-medium truncate" style={{ color: '#4A0E17' }}>{cell?.name ?? '—'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Новые заявки ждут одобрения. Участники видят только свою игру; управление описаниями и доступами — у администраторов. Только владелец назначает администраторов. Доступ к редактору сайта эти роли не предоставляют.</p>
            <input aria-label="Найти пользователя" value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по имени или email" className="w-full p-3 rounded-lg border bg-background" />
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={pendingOnly} onChange={e => setPendingOnly(e.target.checked)} />Только ожидающие одобрения ({users.filter(u => !u.approved && !u.blocked).length})</label>
            {users.filter(u => (!pendingOnly || (!u.approved && !u.blocked)) && `${u.name ?? ''} ${u.email}`.toLowerCase().includes(query.toLowerCase())).map(u => (
              <UserAccessRow key={u.id} user={u} currentUserId={currentUserId} currentRole={currentRole} onSaved={updated => setUsers(prev => prev.map(item => item.id === updated.id ? updated : item))} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
