const signs = [
  { id: 'sahasrara', name: 'Сахасрара', petals: 24 },
  { id: 'ajna', name: 'Аджна', petals: 2 },
  { id: 'vishuddha', name: 'Вишудха', petals: 16 },
  { id: 'anahata', name: 'Анахата', petals: 12 },
  { id: 'manipura', name: 'Манипура', petals: 10 },
  { id: 'svadhisthana', name: 'Свадхистана', petals: 6 },
  { id: 'muladhara', name: 'Муладхара', petals: 4 },
]

function Petals({ count, radius = 36, tip = 50, offset = 0 }: { count: number; radius?: number; tip?: number; offset?: number }) {
  const angle = Math.PI / count
  const x = Number((Math.sin(angle) * radius).toFixed(4))
  const y = Number((Math.cos(angle) * radius).toFixed(4))
  return <>{Array.from({ length: count }, (_, i) => <path key={i}
    transform={`rotate(${i * 360 / count + offset} 60 60)`}
    d={`M ${60 - x} ${60 - y} Q ${60 - x * .65} ${60 - tip + 7} 60 ${60 - tip} Q ${60 + x * .65} ${60 - tip + 7} ${60 + x} ${60 - y}`} />)}</>
}

export function LoginChakras() {
  return <aside aria-label="Семь чакр" data-login-chakras className="flex flex-col items-center justify-between gap-3 w-12 sm:w-[68px] py-2" style={{ color: '#4A0E17' }}>
    {signs.map(({ id, name, petals }) => <svg key={id} role="img" aria-label={name} data-chakra-sign={id}
      viewBox="0 0 120 120" className="block w-full aspect-square shrink-0 overflow-visible" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
      {id === 'ajna' ? <>
        <path d="M 35 35 C 21 38 24 51 10 60 C 24 69 21 82 35 85 M 85 35 C 99 38 96 51 110 60 C 96 69 99 82 85 85" />
        <circle cx="60" cy="60" r="35" />
      </> : <><Petals count={petals} offset={petals === 4 ? 45 : 0} /><circle cx="60" cy="60" r="36" /></>}
      {id === 'sahasrara' ? <>
        <Petals count={16} radius={24} tip={35} offset={11.25} />
        <Petals count={8} radius={12} tip={23} />
        <circle cx="60" cy="60" r="8" /><circle cx="60" cy="60" r="3" />
      </> : id === 'svadhisthana' ? <>
        <circle cx="60" cy="60" r="28" />
        <path d="M 35 49 A 27 27 0 1 0 85 49 A 25 25 0 0 1 35 49 Z" />
      </> : <>
        {id === 'muladhara' && <rect x="35" y="35" width="50" height="50" />}
        <path d={id === 'muladhara' ? 'M 42 47 H 78 L 60 79 Z' : 'M 30 42 H 90 L 60 94 Z'} />
        {id === 'anahata' && <path d="M 30 78 H 90 L 60 26 Z" />}
        {id === 'vishuddha' && <circle cx="60" cy="60" r="17" />}
      </>}
    </svg>)}
  </aside>
}
