export interface CellData {
  number: number
  name: string
  sanskrit: string
  essence: string
  description: string
  path: string
  questions: string
}

export interface PlayerState {
  name: string
  intention: string
  position: number
  finished: boolean
  color: number
}

export interface GameState {
  title?: string
  paused?: boolean
  players: PlayerState[]
  currentPlayerIndex: number
  settings: {
    extraRollOnSix: boolean
    bounceOnOvershoot: boolean
  }
  diceMode: 'auto' | 'manual'
  started: boolean
  finished: boolean
}

export interface SavedGame {
  id: string
  state: string
  updatedAt: string
  createdAt: string
  userId?: string
  user?: { email: string; name?: string | null }
  logs?: GameLog[]
}

export interface GameLog {
  id: string
  gameId: string
  playerName: string
  roll: number
  fromCell: number
  toCell: number
  transitionType: string | null
  note: string | null
  createdAt?: string
}
