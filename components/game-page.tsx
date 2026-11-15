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
import { SNAKES, ARROWS, BOARD_SIZE, FINAL_CELL, DEFAULT_SETTINGS, resolveMove } from '@/config/game-config'
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

    // Анимация броска кубика
    await new Promise(r => setTimeout(r, 600))

    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    if (!currentPlayer || currentPlayer.finished) {
      turnLock.current = false
      setIsRolling(false)
      return
    }

    const fromCell = currentPlayer.position
    const { landedCell, finalCell: newPosition, transitionType } = resolveMove(
      fromCell,
      roll,
      gameState.settings.bounceOnOvershoot
    )

    // 1. Сначала фишка проходит все шаги кубика до клетки остановки (landedCell)
    // Промежуточные клетки (тела змей, древко стрел) полностью игнорируются
    if (landedCell !== fromCell) {
      const stepDirection = landedCell > fromCell ? 1 : -1
      for (let step = fromCell + stepDirection; ; step += stepDirection) {
        setGameState(prev => {
          if (!prev) return prev
          const updatedPlayers = [...prev.players]
          updatedPlayers[prev.currentPlayerIndex] = {
            ...updatedPlayers[prev.currentPlayerIndex],
            position: step,
          }
          return { ...prev, players: updatedPlayers }
        })
        await new Promise(r => setTimeout(r, 220))
        if (step === landedCell) break
      }
    }

    // 2. Фишка полностью остановилась. Если сработала змея или стрела — делаем переход
    if (newPosition !== landedCell) {
      await new Promise(r => setTimeout(r, 350))
      setGameState(prev => {
        if (!prev) return prev
        const updatedPlayers = [...prev.players]
        updatedPlayers[prev.currentPlayerIndex] = {
          ...updatedPlayers[prev.currentPlayerIndex],
          position: newPosition,
        }
        return { ...prev, players: updatedPlayers }
      })
      await new Promise(r => setTimeout(r, 650))
    }

    const finished = newPosition === FINAL_CELL

    const newPlayers = [...gameState.players]
    newPlayers[gameState.currentPlayerIndex] = {
      ...currentPlayer,
      position: newPosition,
      finished,
    }

    let nextIndex = gameState.currentPlayerIndex
    const shouldExtraRoll = roll === 6 && gameState.settings.extraRollOnSix && !finished
    if (!shouldExtraRoll) {
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
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Не удалось сохранить ход. Обновите страницу перед продолжением.')
      setGameState(gameState)