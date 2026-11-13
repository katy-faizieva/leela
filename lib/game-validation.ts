import { z } from 'zod'

export const gameStateSchema = z.object({
  title: z.string().trim().max(120).optional(),
  paused: z.boolean().optional(),
  players: z.array(z.object({ name: z.string().trim().min(1).max(80), intention: z.string().max(5000), position: z.number().int().min(0).max(72), finished: z.boolean(), color: z.number().int().min(0).max(3) })).min(1).max(4),
  currentPlayerIndex: z.number().int().min(0).max(3),
  settings: z.object({ extraRollOnSix: z.boolean(), bounceOnOvershoot: z.boolean() }),
  diceMode: z.enum(['auto', 'manual']), started: z.boolean(), finished: z.boolean(),
}).refine(s => s.currentPlayerIndex < s.players.length)
  .refine(s => new Set(s.players.map(p => p.name.toLocaleLowerCase('ru-RU'))).size === s.players.length, 'Имена участников должны различаться')
