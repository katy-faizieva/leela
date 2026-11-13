'use client'

import { useState, useEffect } from 'react'
import { SavedPaths } from './saved-paths'
import { DEFAULT_SETTINGS } from '@/config/game-config'
import { Play, Clock, Users, Sparkles, Dice1, Settings } from 'lucide-react'

interface Props {
  onStart: (players: { name: string; intention: string }[], settings: typeof DEFAULT_SETTINGS, diceMode: 'auto' | 'manual') => void
  isAdmin?: boolean
  initialTab?: 'new' | 'continue'
  onTabChange?: (tab: 'new' | 'continue') => void
  onLoadGame: (game: any) => void
  userName: string
  maxPlayers?: number
  busy?: boolean
}

export function GameSetup({ onStart, onLoadGame, userName, maxPlayers = 4, busy = false, isAdmin = false, initialTab = 'new', onTabChange }: Props) {
  const [playerCount, setPlayerCount] = useState(1)
  const [players, setPlayers] = useState<{ name: string; intention: string }[]>(
    [{ name: userName ?? '', intention: '' }]
  )
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [diceMode, setDiceMode] = useState<'auto' | 'manual'>('auto')
  const [tab, setLocalTab] = useState<'new' | 'continue'>(initialTab)
  useEffect(() => setLocalTab(initialTab), [initialTab])
  const setTab = (value: 'new' | 'continue') => { setLocalTab(value); onTabChange?.(value) }
  const [error, setError] = useState('')

  const updatePlayerCount = (count: number) => {
    setPlayerCount(count)
    const newPlayers = Array.from({ length: count }, (_, i) => ({
      name: players?.[i]?.name ?? `Путник ${i + 1}`,
      intention: players?.[i]?.intention ?? '',
    }))
    setPlayers(prev => [...newPlayers, ...prev.slice(count)])
    setError('')
  }

  const handleStart = () => {
    if (busy) return
    const active = players.slice(0, playerCount).map(p => ({ name: p.name.trim(), intention: p.intention.trim() }))
    if (active.some(p => !p.name || !p.intention)) { setError('Заполните имя и личный запрос каждого игрока.'); return }
    if (new Set(active.map(p => p.name.toLowerCase())).size !== active.length) { setError('Укажите разные имена, чтобы различать игроков в дневнике.'); return }
    setError('')
    onStart(active, settings, diceMode)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8 animate-fade-in-up">
        <div className="text-6xl mb-4" style={{ color: '#4A0E17' }}>ॐ</div>
        <h2 className="text-3xl font-semibold mb-2" style={{ color: '#4A0E17' }}>Начало Пути</h2>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden mb-6" style={{ background: 'rgba(74,14,23,0.05)' }}>
        <button onClick={() => setTab('new')} className={`flex-1 py-3 text-sm font-medium transition-all ${tab === 'new' ? 'text-primary-foreground' : 'opacity-50'}`}
          style={tab === 'new' ? { background: '#4A0E17', color: '#FAF6F0' } : { color: '#4A0E17' }}>
          Новая игра
        </button>
        <button onClick={() => setTab('continue')} className={`flex-1 py-3 text-sm font-medium transition-all ${tab === 'continue' ? 'text-primary-foreground' : 'opacity-50'}`}
          style={tab === 'continue' ? { background: '#4A0E17', color: '#FAF6F0' } : { color: '#4A0E17' }}>
          Сохранённые пути
        </button>
      </div>

      {tab === 'continue' && <SavedPaths admin={isAdmin} onOpen={onLoadGame} />}

      {tab === 'new' && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Player count */}
          <div className="text-center">
            <p className="text-sm mb-3 opacity-60 flex items-center justify-center gap-1" style={{ color: '#4A0E17' }}>
              <Users className="w-4 h-4" /> Количество путников:
            </p>
            <div className="flex gap-3 justify-center">
              {[1, 2, 3, 4].filter(n => n <= maxPlayers).map(n => (
                <button key={n} onClick={() => updatePlayerCount(n)}
                  className={`w-12 h-12 rounded-full text-lg font-medium transition-all ${playerCount === n ? 'text-primary-foreground shadow-md scale-110' : 'opacity-50 hover:opacity-80'}`}
                  style={playerCount === n ? { background: '#4A0E17', color: '#FAF6F0' } : { background: 'rgba(74,14,23,0.1)', color: '#4A0E17' }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {playerCount === 2 && <p className="text-sm text-muted-foreground">Один аккаунт, одно устройство, два отдельных пути. Ходите по очереди; имя и запрос каждого сохраняются отдельно. Дневники видны обоим участникам.</p>}

          {/* Player forms */}
          <div className="space-y-4">
            {players.slice(0, playerCount).map((player, i) => (
              <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(74,14,23,0.08)' }}>
                <p className="text-xs font-medium mb-3 opacity-50" style={{ color: '#4A0E17' }}>Путник {i + 1}</p>
                <input aria-label={`Имя игрока ${i + 1}`} maxLength={80} type="text" placeholder="Имя" value={player?.name ?? ''}
                  onChange={e => {
                    const np = [...players]
                    np[i] = { ...np[i], name: e.target.value }
                    setPlayers(np)
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border mb-3 text-sm bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  style={{ borderColor: 'rgba(74,14,23,0.15)' }} />
                <textarea aria-label={`Запрос игрока ${i + 1}`} maxLength={5000} placeholder="Ваш запрос / намерение..." value={player?.intention ?? ''}
                  onChange={e => {
                    const np = [...players]
                    np[i] = { ...np[i], intention: e.target.value }
                    setPlayers(np)
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border text-sm bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-20"
                  style={{ borderColor: 'rgba(74,14,23,0.15)' }} />
              </div>
            ))}
          </div>

          {/* Dice mode */}
          <div className="flex gap-4 justify-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.4)' }}>
            <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: '#4A0E17' }}>
              <input type="radio" name="dice" checked={diceMode === 'auto'} onChange={() => setDiceMode('auto')} className="accent-primary" />
              <Sparkles className="w-4 h-4" /> Авто-кубик
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: '#4A0E17' }}>
              <input type="radio" name="dice" checked={diceMode === 'manual'} onChange={() => setDiceMode('manual')} className="accent-primary" />
              <Dice1 className="w-4 h-4" /> Свой кубик
            </label>
          </div>

          {/* Settings */}
          <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(255,255,255,0.4)' }}>
            <p className="text-xs font-medium flex items-center gap-1 opacity-50" style={{ color: '#4A0E17' }}>
              <Settings className="w-3 h-3" /> Правила
            </p>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm" style={{ color: '#4A0E17' }}>Дополнительный бросок при выпадении 6</span>
              <input type="checkbox" checked={settings.extraRollOnSix}
                onChange={e => setSettings({ ...settings, extraRollOnSix: e.target.checked })}
                className="accent-primary w-4 h-4" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm" style={{ color: '#4A0E17' }}>Отскок при превышении 72</span>
              <input type="checkbox" checked={settings.bounceOnOvershoot}
                onChange={e => setSettings({ ...settings, bounceOnOvershoot: e.target.checked })}
                className="accent-primary w-4 h-4" />
            </label>
          </div>

          {/* Start button */}
          {error && <p role="alert" className="text-sm">{error}</p>}
          <button onClick={handleStart} disabled={busy}
            className="w-full py-4 rounded-xl text-lg font-medium transition-all hover:opacity-90 hover:shadow-lg flex items-center justify-center gap-2"
            style={{ background: '#4A0E17', color: '#FAF6F0' }}>
            <Play className="w-5 h-5" /> {busy ? 'Сохранение игры…' : 'Начать Путешествие'}
          </button>
        </div>
      )}
    </div>
  )
}
