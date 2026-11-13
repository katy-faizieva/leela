import { getCellBounds } from '@/config/game-config'
import { CHAKRA_SIGNS, ChakraSymbol } from './chakra-symbol'

const CHAKRAS = [
  { cell: 68, color: '#b8adb6', fill: '#fffdf5', name: 'Белый свет', petals: 24, symbol: 'ॐ' },
  ...CHAKRA_SIGNS.map(sign => ({ ...sign, color: '#4A0E17', fill: '#4A0E17' })),
]

export function ChakraOverlay() {
  return <div className="absolute inset-0 pointer-events-none z-10" aria-hidden="true">{CHAKRAS.map(c => {
    const b = getCellBounds(c.cell)
    return <ChakraSymbol key={c.cell} sign={c} fillColor={c.fill} data-chakra={c.cell} className="absolute" style={{ left: `${b.left + b.width * .22}%`, top: `${b.top + b.height * .14}%`, width: `${b.width * .56}%`, height: `${b.height * .72}%`, color: c.color, opacity: .48 }} />
  })}</div>
}
