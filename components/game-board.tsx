'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import Image from 'next/image'
import { BOARD_IMAGE, BOARD_SIZE, getCellBounds, getCellCenter, PLAYER_COLORS } from '@/config/game-config'
import { ChakraOverlay } from './chakra-overlay'
import type { GameState } from '@/lib/game-types'

interface Props {
  gameState: GameState | null
  onCellClick?: (cell: number) => void
  userEmail: string
  hideWatermark?: boolean
}

export function GameBoard({ gameState, onCellClick, userEmail, hideWatermark = false }: Props) {
  const [boardUrl, setBoardUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const controller = new AbortController()
    let objectUrl: string | null = null
    fetch('/api/board', { cache: 'no-store', signal: controller.signal })
      .then(async r => {
        if (!r.ok) throw new Error('Поле недоступно. Проверьте разрешение на игру.')
        const blob = await r.blob()
        if (controller.signal.aborted) return
        objectUrl = URL.createObjectURL(blob)
        setBoardUrl(objectUrl)
      })
      .catch(e => {
        if (e.name !== 'AbortError') { console.error(e); setError(e.message) }
      })
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [])

  return (
    <div className="w-full min-w-0 max-w-[1000px] mx-auto">
      <div className="flex justify-end items-center gap-3 px-2 py-1 text-sm">
        <span>Масштаб поля</span>
        <button aria-label="Уменьшить поле" disabled={zoom === 1} onClick={() => setZoom(z => Math.max(1, z - 0.5))} className="px-3 py-1 rounded border disabled:opacity-40">−</button>
        <button aria-label="Сбросить масштаб" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
        <button aria-label="Увеличить поле" disabled={zoom === 3} onClick={() => setZoom(z => Math.min(3, z + 0.5))} className="px-3 py-1 rounded border disabled:opacity-40">+</button>
      </div>
      {error ? <p role="alert" className="p-6 text-center">{error}</p> : (
        <div className="overflow-auto w-full" style={{ maxHeight: '75svh', touchAction: 'pan-x pan-y pinch-zoom' }}>
          <div
            data-board
            className="board-protected relative shrink-0"
            style={{ width: `${zoom * 100}%`, aspectRatio: `${BOARD_IMAGE.width}/${BOARD_IMAGE.height}` }}
            onContextMenu={e => e.preventDefault()}
            onDragStart={e => e.preventDefault()}
            onCopy={e => e.preventDefault()}
            onCut={e => e.preventDefault()}
          >
            {boardUrl ? <Image src={boardUrl} alt="Оригинальное поле игры Лила, 72 клетки" fill unoptimized draggable={false} priority sizes="100vw" className="object-contain pointer-events-none" style={{ clipPath: 'inset(7.8% 0 0 0)' }} onError={() => setError('Не удалось показать поле. Обновите страницу.')} /> : <p className="absolute inset-0 flex items-center justify-center">Загрузка поля…</p>}
            {boardUrl && <>
              <ChakraOverlay />
              {!hideWatermark && <div className="absolute inset-0 pointer-events-none z-40 grid grid-cols-2 grid-rows-3 overflow-hidden" aria-hidden="true">
                {Array.from({ length: 6 }, (_, i) => <div key={i} className="flex items-center justify-center"><span suppressHydrationWarning className="rotate-[-25deg] text-[clamp(9px,1.5vw,18px)] opacity-[0.14] break-all px-3 text-center" style={{ color: '#4A0E17' }}>{userEmail}</span></div>)}
              </div>}
              {Array.from({ length: BOARD_SIZE }, (_, i) => i + 1).map(cell => {
                const bounds = getCellBounds(cell)
                const current = gameState?.players?.[gameState.currentPlayerIndex]
                const selected = current?.position === cell && !current.finished
                return <button key={cell} data-cell={cell} aria-label={`Клетка ${cell}`} title={`Клетка ${cell}`} onClick={() => onCellClick?.(cell)} aria-disabled={!onCellClick} className="absolute z-20 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" style={{ left: `${bounds.left}%`, top: `${bounds.top}%`, width: `${bounds.width}%`, height: `${bounds.height}%`, border: selected ? '2px solid rgba(74,14,23,0.5)' : 'none', background: selected ? 'rgba(74,14,23,0.08)' : undefined }} />
              })}
              {gameState?.players?.map((player, idx) => {
                if (!player || player.position < 1 || player.position > BOARD_SIZE) return null
                const { x, y } = getCellCenter(player.position)
                const bounds = getCellBounds(player.position)
                const occupants = gameState.players.map((p, i) => ({ p, i })).filter(({ p }) => p.position === player.position)
                const slot = occupants.findIndex(({ i }) => i === idx)
                const offsetX = occupants.length > 1 ? (slot % 2 ? 1 : -1) * bounds.width * 0.2 : 0
                const offsetY = occupants.length > 2 ? (slot < 2 ? -1 : 1) * bounds.height * 0.2 : 0
                return <div key={idx} data-player-token={idx} data-position={player.position} aria-label={`${player.name}: клетка ${player.position}`} className="player-orb absolute z-30 pointer-events-none transition-[left,top] duration-700 ease-out" style={{ width: 'clamp(13px, 2.5vw, 26px)', height: 'clamp(13px, 2.5vw, 26px)', left: `${x + offsetX}%`, top: `${y + offsetY}%`, transform: 'translate(-50%, -50%)', '--orb-color': PLAYER_COLORS[idx] } as CSSProperties} />
              })}
            </>}
          </div>
        </div>
      )}
      {!hideWatermark && <p className="text-xs text-muted-foreground px-2 py-2">Поле персонализировано. Полностью запретить снимки экрана средствами браузера невозможно.</p>}
    </div>
  )
}
