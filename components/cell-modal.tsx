'use client'

import { useMemo } from 'react'
import { SNAKES, ARROWS } from '@/config/game-config'
import type { CellData } from '@/lib/game-types'
import { X, ArrowUp, ArrowDown, HelpCircle } from 'lucide-react'

interface Props {
  cellNumber: number
  cells: CellData[]
  onClose: () => void
}

export function CellModal({ cellNumber, cells, onClose }: Props) {
  const cell = useMemo(() => cells?.find(c => c?.number === cellNumber), [cells, cellNumber])
  const questions = useMemo(() => {
    try {
      return JSON.parse(cell?.questions ?? '[]')
    } catch {
      return []
    }
  }, [cell])

  const isSnakeHead = SNAKES[cellNumber] !== undefined
  const isArrowStart = ARROWS[cellNumber] !== undefined

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(250,246,240,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl p-6 animate-fade-in-up"
        style={{ background: '#FAF6F0', boxShadow: '0 20px 60px rgba(74,14,23,0.15)', border: '1px solid rgba(74,14,23,0.1)' }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-xs font-medium opacity-40">Клетка {cellNumber}</span>
            {cell?.sanskrit && <span className="text-xs opacity-30 ml-2">{cell.sanskrit}</span>}
            <h2 className="text-xl font-semibold mt-1" style={{ color: '#4A0E17' }}>{cell?.name ?? `Клетка ${cellNumber}`}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5" style={{ color: '#4A0E17' }} />
          </button>
        </div>

        {/* Essence */}
        {cell?.essence && (
          <p className="text-sm italic mb-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(74,14,23,0.04)', color: '#4A0E17' }}>
            {cell.essence}
          </p>
        )}

        {/* Transition info */}
        {isSnakeHead && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(192,57,43,0.08)', color: '#c0392b' }}>
            <ArrowDown className="w-4 h-4" />
            <span className="text-sm">Змея: падение на клетку {SNAKES[cellNumber]}</span>
          </div>
        )}
        {isArrowStart && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(212,160,23,0.08)', color: '#8B6914' }}>
            <ArrowUp className="w-4 h-4" />
            <span className="text-sm">Стрела: подъём на клетку {ARROWS[cellNumber]}</span>
          </div>
        )}

        {/* Description */}
        {cell?.description && (
          <div className="mb-4">
            <p className="text-sm leading-relaxed" style={{ color: '#4A0E17' }}>{cell.description}</p>
          </div>
        )}

        {/* Path */}
        {cell?.path && (
          <div className="mb-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(74,14,23,0.03)' }}>
            <p className="text-xs font-medium opacity-40 mb-1">Путь</p>
            <p className="text-sm" style={{ color: '#4A0E17' }}>{cell.path}</p>
          </div>
        )}

        {/* Questions */}
        {Array.isArray(questions) && questions.length > 0 && (
          <div>
            <p className="text-xs font-medium opacity-40 mb-2 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Вопросы для размышления
            </p>
            <ul className="space-y-1.5">
              {questions.map((q: string, i: number) => (
                <li key={i} className="text-sm pl-3 py-1.5 rounded" style={{ borderLeft: '2px solid rgba(74,14,23,0.15)', color: '#4A0E17' }}>
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
