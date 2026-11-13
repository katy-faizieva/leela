'use client'

import { useState } from 'react'
import { DiaryNote } from './diary-note'
import type { CellData, PlayerState, GameLog } from '@/lib/game-types'
import { X, Download, ArrowUp, ArrowDown } from 'lucide-react'

interface Props {
  logs: GameLog[]
  cells: CellData[]
  players: PlayerState[]
  onClose: () => void
  onExport: () => void
  onAddNote: (logId: string, note: string, expectedNote: string) => Promise<void>
  onCellClick?: (cell: number) => void
}

export function GameHistory({ logs, cells, players, onClose, onExport, onAddNote, onCellClick }: Props) {
  const [playerFilter, setPlayerFilter] = useState('')
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: '#4A0E17' }}>История ходов</h3>
        <div className="flex items-center gap-2">
          <button onClick={onExport} className="p-1.5 rounded hover:bg-secondary transition-colors" title="PDF пути участника">
            <Download className="w-4 h-4" style={{ color: '#4A0E17' }} />
          </button>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-secondary transition-colors">
            <X className="w-4 h-4" style={{ color: '#4A0E17' }} />
          </button>
        </div>
      </div>

      {/* Player intentions */}
      {players?.map((p, i) => (
        <div key={i} className="p-3 rounded-lg" style={{ background: 'rgba(74,14,23,0.04)' }}>
          <p className="text-xs font-medium" style={{ color: '#4A0E17' }}>{p?.name ?? `Путник ${i + 1}`}</p>
          {p?.intention && <p className="text-xs opacity-50 italic mt-1">«{p.intention}»</p>}
        </div>
      ))}

      <label className="block text-sm">Дневник игрока
        <select aria-label="Дневник игрока" value={playerFilter} onChange={e => setPlayerFilter(e.target.value)} className="w-full p-2 mt-1 rounded border bg-background"><option value="">Общая история</option>{players.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}</select>
      </label>
      {/* Logs */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {(logs?.length ?? 0) === 0 ? (
          <p className="text-center py-4 opacity-40 text-sm">Ходов пока нет</p>
        ) : (
          [...(logs ?? [])].filter(log => !playerFilter || log.playerName === playerFilter).reverse().map((log, i) => {
            const cellFrom = cells?.find(c => c?.number === log?.fromCell)
            const cellTo = cells?.find(c => c?.number === log?.toCell)
            const isSnake = log?.transitionType?.includes?.('Змея')
            const isArrow = log?.transitionType?.includes?.('Стрела')
            return (
              <div key={log?.id ?? i} className="p-3 rounded-lg text-xs animate-fade-in-up" style={{ background: 'rgba(255,255,255,0.5)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium" style={{ color: '#4A0E17' }}>{log?.playerName ?? ''}</span>
                  <span className="opacity-60">{log.roll === 0 ? 'Коррекция' : `🎲 ${log.roll}`}</span>
                </div>
                <p className="opacity-60">
                  {cellFrom?.name ?? `Кл. ${log?.fromCell ?? 0}`} → {cellTo?.name ?? `Кл. ${log?.toCell ?? 0}`}
                </p>
                {log?.transitionType && (
                  <p className="mt-1 flex items-center gap-1" style={{ color: isSnake ? '#c0392b' : '#d4a017' }}>
                    {isSnake ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                    {log.transitionType}
                  </p>
                )}
                {onCellClick && log.toCell > 0 && <button onClick={() => onCellClick(log.toCell)} className="underline mt-2">Описание клетки {log.toCell}</button>}
                <DiaryNote initial={log.note ?? ''} onSave={(note, expectedNote) => onAddNote(log.id, note, expectedNote)} />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
