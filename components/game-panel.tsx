'use client'

import { useState, type CSSProperties } from 'react'
import { PLAYER_COLORS } from '@/config/game-config'
import type { GameState, CellData } from '@/lib/game-types'
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Download, RotateCcw, Trophy } from 'lucide-react'

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]

interface Props {
  gameState: GameState | null
  isRolling: boolean
  lastRoll: number | null
  onRoll: (manualValue?: number) => void
  onNewGame: () => void
  onExport: () => void
  cells: CellData[]
}

export function GamePanel({ gameState, isRolling, lastRoll, onRoll, onNewGame, onExport, cells }: Props) {
  const [manualInput, setManualInput] = useState('')

  if (!gameState) return null

  const currentPlayer = gameState.players?.[gameState.currentPlayerIndex]
  const currentCell = cells?.find(c => c?.number === currentPlayer?.position)

  const DiceIcon = lastRoll ? DICE_ICONS[(lastRoll ?? 1) - 1] ?? Dice1 : Dice1

  return (
    <div className="p-4 space-y-4">
      {/* Players */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider opacity-40" style={{ color: '#4A0E17' }}>Путники</h3>
        {gameState.players?.map((player, idx) => {
          const cell = cells?.find(c => c?.number === player?.position)
          return (
            <div key={idx}
              className={`p-3 rounded-lg transition-all ${idx === gameState.currentPlayerIndex ? 'shadow-md' : 'opacity-60'} ${player?.finished ? 'opacity-40' : ''}`}
              style={{
                background: idx === gameState.currentPlayerIndex ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
                borderLeft: `3px solid ${PLAYER_COLORS[idx]}`, 
              }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: '#4A0E17' }}>
                  <span aria-hidden="true" className="player-orb relative inline-block w-3 h-3 mr-2" style={{ '--orb-color': PLAYER_COLORS[idx] } as CSSProperties} />
                  {player?.name ?? `Путник ${idx + 1}`}
                  {player?.finished && <Trophy className="inline w-3 h-3 ml-1" />}
                </span>
                <span className="text-xs opacity-50">кл. {player?.position ?? 0}</span>
              </div>
              {cell && <p className="text-xs opacity-40 mt-1 truncate">{cell.name}</p>}
              {player?.intention && <p className="text-xs opacity-30 mt-1 italic truncate">«{player.intention}»</p>}
            </div>
          )
        })}
      </div>

      {/* Current cell info */}
      {currentCell && currentPlayer && !currentPlayer.finished && (
        <div className="p-3 rounded-lg" style={{ background: 'rgba(74,14,23,0.04)' }}>
          <p className="text-xs font-medium" style={{ color: '#4A0E17' }}>Клетка {currentCell.number}: {currentCell.name}</p>
          <p className="text-xs opacity-50 mt-1">{currentCell.essence}</p>
        </div>
      )}

      {gameState.paused && <p role="status" className="rounded-lg bg-secondary p-3 text-sm">Путь на паузе. Администратор может возобновить его в управлении.</p>}
      {/* Dice */}
      {!gameState.finished && !gameState.paused && (
        <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'rgba(74,14,23,0.1)' }}>
          <p className="text-xs text-center font-medium" style={{ color: '#4A0E17' }}>
            Ход: {currentPlayer?.name ?? ''}
          </p>

          {/* Dice display */}
          <div className="flex justify-center">
            <div className={`p-3 ${isRolling ? 'dice-rolling' : ''}`}>
              <DiceIcon className="w-12 h-12" style={{ color: '#4A0E17' }} />
            </div>
          </div>

          {gameState.diceMode === 'auto' ? (
            <button
              onClick={() => onRoll()}
              disabled={isRolling}
              className="w-full py-3 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: '#4A0E17', color: '#FAF6F0' }}>
              {isRolling ? 'Бросок...' : '🎲 Бросить кубик'}
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="6"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                placeholder="1-6"
                className="flex-1 px-3 py-2 rounded-lg border text-center text-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{ borderColor: 'rgba(74,14,23,0.15)' }}
              />
              <button
                onClick={() => {
                  const val = parseInt(manualInput, 10)
                  if (val >= 1 && val <= 6) {
                    onRoll(val)
                    setManualInput('')
                  }
                }}
                disabled={isRolling}
                className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: '#4A0E17', color: '#FAF6F0' }}>
                OK
              </button>
            </div>
          )}
        </div>
      )}

      {/* Game finished */}
      {gameState.finished && (
        <div className="text-center py-4 space-y-3">
          <p className="text-lg font-medium" style={{ color: '#4A0E17' }}>🌟 Игра завершена!</p>
          <p className="text-sm opacity-60">Все путники достигли цели</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button onClick={onExport} className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all hover:opacity-80"
          style={{ background: 'rgba(74,14,23,0.08)', color: '#4A0E17' }}>
          <Download className="w-3 h-3" /> PDF пути
        </button>
        <button onClick={onNewGame} className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all hover:opacity-80"
          style={{ background: 'rgba(74,14,23,0.08)', color: '#4A0E17' }}>
          <RotateCcw className="w-3 h-3" /> Новая
        </button>
      </div>
    </div>
  )
}
