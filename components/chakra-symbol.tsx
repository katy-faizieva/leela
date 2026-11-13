import type { SVGProps } from 'react'

export const CHAKRA_SIGNS = [
  { cell: 59, name: 'Сахасрара', petals: 20, symbol: 'ॐ' },
  { cell: 50, name: 'Аджна', petals: 2, symbol: 'ॐ' },
  { cell: 41, name: 'Вишуддха', petals: 16, symbol: 'हं' },
  { cell: 32, name: 'Анахата', petals: 12, symbol: 'यं' },
  { cell: 23, name: 'Манипура', petals: 10, symbol: 'रं' },
  { cell: 14, name: 'Свадхистхана', petals: 6, symbol: 'वं' },
  { cell: 5, name: 'Муладхара', petals: 4, symbol: 'लं' },
]

type Sign = typeof CHAKRA_SIGNS[number]

export function ChakraSymbol({ sign, fillColor = 'currentColor', ...props }: SVGProps<SVGSVGElement> & { sign: Sign; fillColor?: string }) {
  return <svg viewBox="0 0 100 100" {...props}>
    <title>{sign.name}</title>
    <g fill={fillColor} fillOpacity=".18" stroke="currentColor" strokeWidth="1.4">
      {Array.from({ length: sign.petals }, (_, i) => <path key={i} d="M43 31 Q30 13 50 4 Q70 13 57 31" transform={`rotate(${i * 360 / sign.petals} 50 50)`} />)}
      <circle cx="50" cy="50" r="27" fillOpacity=".22" />
      {sign.cell === 5 ? <rect x="33" y="33" width="34" height="34" fill="none" /> : <path d="M50 69 L31 37 L69 37 Z" fill="none" />}
      {sign.cell === 32 && <path d="M50 31 L31 63 L69 63 Z" fill="none" />}
    </g>
    <text x="50" y="57" textAnchor="middle" fill="currentColor" fontSize="21" fontFamily="serif">{sign.symbol}</text>
  </svg>
}

export function RegistrationChakras() {
  return <div data-registration-chakras aria-hidden="true" className="flex flex-col justify-around items-center w-10 sm:w-16 shrink-0 py-2" style={{ color: '#4A0E17' }}>
    {CHAKRA_SIGNS.map(sign => <ChakraSymbol key={sign.cell} sign={sign} data-chakra-sign={sign.cell} className="w-10 h-10 sm:w-16 sm:h-16" />)}
  </div>
}
