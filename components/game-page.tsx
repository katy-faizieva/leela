'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { GameBoard } from './game-board'
import { GameSetup } from './game-setup'
import { GamePanel } from './game-panel'
import { GameHistory } from './game-history'
import { CellModal } from './cell-modal'
import { PlayerPdfExport } from './player-pdf-export'
import { AppNavigation } from './app-navigation'
import { PathEditor } from './path-editor'
import { SNAKES, ARROWS, BOARD_SIZE, FINAL_CELL, DEFAULT_SETTINGS } from '@/config/game-config'
import { LogOut, Settings, Shield, Menu, X, BookOpen } from 'lucide-react'
import type { CellData, GameState, PlayerState, GameLog, SavedGame } from '@/lib/game-types'

interface Props {
  user: { id: string; email: string; name?: string | null; role?: string; maxPlayers?: number }
}

async function requireResponse(res: Response) {
  if (res.status === 401) { window.location.assign('/access'); throw new Error('Доступ к игре изменён') }
  if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Не удалось сохранить данные') }
  return res.json()
}

export function GamePage({ user }: Props) {
  const { data: session, status } = useSession() || {}
  const turnLock = useRef(false)
  const [isStarting, setIsStarting] = useState(false)
  const isAdmin = ['owner', 'admin'].includes(session?.user?.role ?? user.role ?? '')
  useEffect(() => {
    if (status === 'unauthenticated') window.location.assign('/login')
    else if (status === 'authenticated' && !session?.user?.accessAllowed) window.location.assign('/access')
  }, [status, session])
  const [cells, setCells] = useState<CellData[]>([])
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [gameId, setGameId] = useState<string | null>(null)
  const [logs, setLogs] = useState<GameLog[]>([])
  const [selectedCell, setSelectedCell] = useState<number | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [lastRoll, setLastRoll] = useState<number | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showPdf, setShowPdf] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showSetup, setShowSetup] = useState(true)
  const [setupTab, setSetupTab] = useState<'new' | 'continue'>('new')
  const [activeGame, setActiveGame] = useState<SavedGame | null>(null)
  const [editing, setEditing] = useState(false)
  const [syncError, setSyncError] = useState('')
  const [synced, setSynced] = useState(false)
  const version = useRef('')
  const generation = useRef(0)
  const applyGame = useCallback((game: SavedGame) => {
    version.current = game.updatedAt
    setActiveGame(game)
    setGameState(JSON.parse(game.state))
    setLogs(game.logs ?? [])
    setSynced(true)
    setSyncError('')
  }, [])

  // Load cells
  useEffect(() => {
    setCells([])
    setSelectedCell(null)
    if (!isAdmin) return
    let active = true
    fetch('/api/cells', { cache: 'no-store' }).then(requireResponse).then(d => {
      if (active && Array.isArray(d)) setCells(d)
    }).catch(e => console.error(e))
    return () => { active = false }
  }, [isAdmin])


  const startNewGame = useCallback(async (players: { name: string; intention: string }[], settings: typeof DEFAULT_SETTINGS, diceMode: 'auto' | 'manual') => {
    const playerStates: PlayerState[] = players.map((p, i) => ({
      name: p.name,
      intention: p.intention,
      position: 0, // not yet on board
      finished: false,
      color: i,
    }))
    const state: GameState = {
      players: playerStates,
      currentPlayerIndex: 0,
      settings: { ...DEFAULT_SETTINGS, ...settings },
      diceMode,
      started: true,
      finished: false,
    }
    if (turnLock.current) return
    turnLock.current = true
    setIsStarting(true)
    try {
      const data = await fetch('/api/games', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state }) }).then(requireResponse)
      generation.current++
      setGameId(data.id)
      applyGame(data)
      window.history.replaceState(null, '', `/?game=${encodeURIComponent(data.id)}`)
      setLastRoll(null)
      setShowSetup(false)
    } catch (e) { console.error(e); toast.error(e instanceof Error ? e.message : 'Не удалось начать игру') }
    finally { turnLock.current = false; setIsStarting(false) }
  }, [applyGame])

  const loadGame = useCallback((game: SavedGame) => {
    if (turnLock.current) return
    generation.current++
    applyGame(game)
    setGameId(game.id)
    setShowSetup(false)
    setSelectedCell(null)
    setLastRoll(null)
    setShowHistory(false)
    setShowMenu(false)
    window.history.replaceState(null, '', `/?game=${encodeURIComponent(game.id)}`)
  }, [applyGame])

  useEffect(() => {
    let active = true
    const params = new URLSearchParams(window.location.search)
    if (params.get('view') === 'saved') setSetupTab('continue')
    const id = params.get('game')
    if (id) {
      setIsStarting(true)
      fetch(`/api/games/${encodeURIComponent(id)}`, { cache: 'no-store' }).then(requireResponse).then(g => { if (active) loadGame(g) }).catch(e => { console.error(e); if (active) toast.error(e.message) }).finally(() => { if (active) setIsStarting(false) })
    }
    return () => { active = false }
  }, [loadGame])

  useEffect(() => {
    if (!gameId || showSetup) return
    let active = true
    let timer: ReturnType<typeof setTimeout>
    const refresh = async () => {
      if (!turnLock.current && !editing && !document.hidden) {
        const currentGeneration = generation.current
        try {
          const response = await fetch(`/api/games/${gameId}`, { cache: 'no-store' })
          if (response.status === 404) {
            if (active && currentGeneration === generation.current) { setShowSetup(true); setSetupTab('continue'); setGameId(null); window.history.replaceState(null, '', '/?view=saved'); toast.error('Этот путь удалён или недоступен') }
            return
          }
          const data = await requireResponse(response)
          if (active && currentGeneration === generation.current && !turnLock.current) applyGame(data)
        } catch (e) { console.error(e); if (active) { setSynced(false); setSyncError('Нет связи. Ходы недоступны до восстановления синхронизации.') } }
      }
      if (active) timer = setTimeout(refresh, 2000)
    }
    void refresh()
    return () => { active = false; clearTimeout(timer) }
  }, [gameId, showSetup, editing, applyGame])

  const saveGameState = useCallback(async (state: GameState, log: Omit<GameLog, 'id' | 'createdAt'>) => {
    if (!gameId) return
    try {
      const data = await fetch(`/api/games/${gameId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, log, expectedUpdatedAt: version.current }),
      }).then(requireResponse)
      applyGame(data)
    } catch (e) { console.error(e); throw e }
  }, [gameId, applyGame])

  const rollDice = useCallback(async (manualValue?: number) => {
    if (!gameState || !gameId || turnLock.current || isRolling || gameState.finished || gameState.paused || editing || !synced) return
    if (manualValue !== undefined && (!Number.isInteger(manualValue) || manualValue < 1 || manualValue > 6)) return
    turnLock.current = true
    generation.current++
    setIsRolling(true)
    const roll = manualValue ?? (Math.floor(Math.random() * 6) + 1)
    setLastRoll(roll)

    // Wait for animation
    await new Promise(r => setTimeout(r, 800))

    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    if (!currentPlayer || currentPlayer.finished) {
      turnLock.current = false
      setIsRolling(false)
      return
    }

    const fromCell = currentPlayer.position
    let newPosition = fromCell + roll
    let transitionType: string | null = null

    // Player needs 1 to enter the board
    if (fromCell === 0) {
      if (roll === 6) {
        newPosition = 6
      } else {
        newPosition = roll
      }
    }

    // Check overshoot
    if (newPosition > FINAL_CELL) {
      if (gameState.settings.bounceOnOvershoot) {
        newPosition = FINAL_CELL - (newPosition - FINAL_CELL)
      } else {
        // Stay in place
        newPosition = fromCell
      }
    }

    // Check for snakes/arrows
    if (SNAKES[newPosition] !== undefined) {
      transitionType = `Змея: ${newPosition} → ${SNAKES[newPosition]}`
      newPosition = SNAKES[newPosition]
    } else if (ARROWS[newPosition] !== undefined) {
      transitionType = `Стрела: ${newPosition} → ${ARROWS[newPosition]}`
      newPosition = ARROWS[newPosition]
    }

    // Check win
    const finished = newPosition === FINAL_CELL

    // Update state
    const newPlayers = [...gameState.players]
    newPlayers[gameState.currentPlayerIndex] = {
      ...currentPlayer,
      position: newPosition,
      finished,
    }

    // Next player
    let nextIndex = gameState.currentPlayerIndex
    const shouldExtraRoll = roll === 6 && gameState.settings.extraRollOnSix && !finished
    if (!shouldExtraRoll) {
      // Find next unfinished player
      for (let i = 1; i <= newPlayers.length; i++) {
        const idx = (gameState.currentPlayerIndex + i) % newPlayers.length
        if (!newPlayers[idx]?.finished) {
          nextIndex = idx
          break
        }
      }
    }

    const allFinished = newPlayers.every(p => p?.finished)

    const newState: GameState = {
      ...gameState,
      players: newPlayers,
      currentPlayerIndex: nextIndex,
      finished: allFinished,
    }

    setGameState(newState)
    try {
    await saveGameState(newState, {
      gameId: gameId || '',
      playerName: currentPlayer.name,
      roll,
      fromCell,
      toCell: newPosition,
      transitionType,
      note: null,
    })

    // Keep the lock through the token's CSS movement, not just the dice animation.
    await new Promise(resolve => setTimeout(resolve, 750))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Не удалось сохранить ход. Обновите страницу перед продолжением.')
      setGameState(gameState)
      setSynced(false)
      try { applyGame(await fetch(`/api/games/${gameId}`, { cache: 'no-store' }).then(requireResponse)) } catch (refreshError) { console.error(refreshError); setSyncError('Не удалось обновить путь. Дождитесь восстановления связи.') }
      return
    } finally { turnLock.current = false; setIsRolling(false) }

    // Auto-open cell card
    if (isAdmin && newPosition > 0 && newPosition !== fromCell) {
      setSelectedCell(newPosition)
    }
  }, [gameState, isRolling, gameId, saveGameState, isAdmin, editing, synced, applyGame])

  const exportHistory = useCallback(() => setShowPdf(true), [])

  const addNote = useCallback(async (logId: string, note: string, expectedNote: string) => {
    generation.current++
    const updated = await fetch(`/api/game-logs/${logId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note, expectedNote }) }).then(requireResponse)
    generation.current++
    setLogs(prev => prev.map(l => l?.id === logId ? updated : l))
  }, [])

  const leaveBoard = useCallback((tab: 'new' | 'continue' = 'continue') => {
    if (turnLock.current) return
    generation.current++
    setSetupTab(tab)
    setShowSetup(true)
    setGameState(null)
    setGameId(null)
    setActiveGame(null)
    setLogs([])
    setLastRoll(null)
    setSelectedCell(null)
    setShowHistory(false)
    setShowMenu(false)
    setShowPdf(false)
    window.history.replaceState(null, '', tab === 'continue' ? '/?view=saved' : '/')
  }, [])

  const confirmNewGame = useCallback(() => {
    if (turnLock.current) return
    if (gameState && !gameState.finished) {
      if (!window.confirm('Начать новую игру? Текущий прогресс сохранён.')) return
    }
    leaveBoard('new')
  }, [gameState, leaveBoard])

  if (showSetup) {
    return (
      <div className="min-h-screen" style={{ background: '#FAF6F0' }}>
        <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(250,246,240,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(74,14,23,0.1)' }}>
          <AppNavigation disabled={isStarting} onBack={setupTab === 'continue' ? () => setSetupTab('new') : undefined} onNew={() => setSetupTab('new')} onSaved={() => setSetupTab('continue')} />
          <div className="flex items-center gap-3">
            {isAdmin && (
              <a href="/admin" className="text-sm flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity" style={{ color: '#4A0E17' }}>
                <Shield className="w-4 h-4" /> Панель
              </a>
            )}
            <button onClick={() => signOut({ redirectTo: '/login' })} className="text-sm flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity" style={{ color: '#4A0E17' }}>
              <LogOut className="w-4 h-4" /> Выход
            </button>
          </div>
        </header>
        <GameSetup
          onStart={startNewGame}
          isAdmin={isAdmin}
          initialTab={setupTab}
          onTabChange={setSetupTab}
          onLoadGame={loadGame}
          userName={user?.name ?? user?.email ?? ''}
          maxPlayers={session?.user?.maxPlayers ?? user.maxPlayers ?? 4}
          busy={isStarting}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAF6F0' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-2 flex items-center justify-between" style={{ background: 'rgba(250,246,240,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(74,14,23,0.1)' }}>
        <AppNavigation disabled={isRolling} onBack={() => { if (showHistory) setShowHistory(false); else leaveBoard() }} onNew={confirmNewGame} onSaved={() => leaveBoard()} onHistory={() => setShowHistory(true)} onPdf={exportHistory} />
        <div className="flex items-center gap-2">
          <button onClick={() => setShowHistory(!showHistory)} className="p-2 rounded-lg hover:bg-secondary transition-colors" title="История">
            <BookOpen className="w-4 h-4" style={{ color: '#4A0E17' }} />
          </button>
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-lg hover:bg-secondary transition-colors md:hidden">
            {showMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div className="hidden md:flex items-center gap-3">
            {isAdmin && (
              <a href="/admin" className="text-xs flex items-center gap-1 opacity-60 hover:opacity-100" style={{ color: '#4A0E17' }}>
                <Shield className="w-3 h-3" /> Панель
              </a>
            )}
            <button onClick={confirmNewGame} className="text-xs opacity-60 hover:opacity-100" style={{ color: '#4A0E17' }}>Новая игра</button>
            <button onClick={() => signOut({ redirectTo: '/login' })} className="text-xs flex items-center gap-1 opacity-60 hover:opacity-100" style={{ color: '#4A0E17' }}>
              <LogOut className="w-3 h-3" /> Выход
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {showMenu && (
        <div className="md:hidden px-4 py-3 flex flex-col gap-2 border-b" style={{ background: 'rgba(250,246,240,0.95)', borderColor: 'rgba(74,14,23,0.1)' }}>
          {isAdmin && (
            <a href="/admin" className="text-sm py-2" style={{ color: '#4A0E17' }}>Панель владельца</a>
          )}
          <button onClick={confirmNewGame} className="text-sm py-2 text-left" style={{ color: '#4A0E17' }}>Новая игра</button>
          <button onClick={exportHistory} className="text-sm py-2 text-left" style={{ color: '#4A0E17' }}>PDF участника</button>
          <button onClick={() => signOut({ redirectTo: '/login' })} className="text-sm py-2 text-left" style={{ color: '#4A0E17' }}>Выход</button>
        </div>
      )}

      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-2 bg-white/50 text-sm">
        <div><p className="font-semibold">{gameState?.title || gameState?.players.map(p => p.name).join(', ')}</p>{isAdmin && activeGame?.user && <p className="text-xs text-muted-foreground">Аккаунт: <span suppressHydrationWarning>{activeGame.user.email}</span></p>}<p role="status" className={syncError ? 'text-red-800' : 'text-muted-foreground'}>{syncError || (synced ? 'Синхронизация включена · обновление каждые 2 секунды' : 'Подключение…')}</p></div>
        {isAdmin && <button disabled={isRolling || !synced} onClick={() => { generation.current++; setEditing(true) }} className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 disabled:opacity-50"><Settings className="w-4 h-4" />Управлять путём</button>}
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* Board */}
        <div className="flex-1 flex items-center justify-center p-2 lg:p-4 overflow-auto">
          <GameBoard
            gameState={gameState}
            onCellClick={isAdmin ? setSelectedCell : undefined}
            userEmail={user?.email ?? ''}
            hideWatermark={isAdmin}
          />
        </div>

        {/* Side panel */}
        <div className="lg:w-80 w-full lg:border-l border-t lg:border-t-0 flex-shrink-0 overflow-y-auto" style={{ borderColor: 'rgba(74,14,23,0.1)', maxHeight: 'calc(100vh - 48px)' }}>
          {showHistory ? (
            <GameHistory
              logs={logs}
              cells={cells}
              players={gameState?.players ?? []}
              onClose={() => setShowHistory(false)}
              onExport={exportHistory}
              onAddNote={addNote}
              onCellClick={isAdmin ? setSelectedCell : undefined}
            />
          ) : (
            <GamePanel
              gameState={gameState}
              isRolling={isRolling || !synced}
              lastRoll={lastRoll}
              onRoll={rollDice}
              onNewGame={confirmNewGame}
              onExport={exportHistory}
              cells={cells}
            />
          )}
        </div>
      </div>

      {showPdf && gameId && gameState && <div role="dialog" aria-modal="true" aria-label="Личный путь в PDF" className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4"><div className="w-full max-w-md rounded-xl bg-background p-4 shadow-lg"><button onClick={() => setShowPdf(false)} className="block ml-auto mb-2 px-3 py-1">Закрыть</button><PlayerPdfExport key={gameId} gameId={gameId} players={gameState.players} disabled={isRolling} /></div></div>}
      {editing && activeGame && <PathEditor game={activeGame} admin={isAdmin} onClose={() => setEditing(false)} onSaved={g => { generation.current++; applyGame(g); setSelectedCell(null) }} />}
      {/* Cell modal */}
      {isAdmin && selectedCell !== null && (
        <CellModal
          cellNumber={selectedCell}
          cells={cells}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </div>
  )
}
