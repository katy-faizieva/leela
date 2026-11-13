'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export function ContentProtection({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession() || {}
  const [hidden, setHidden] = useState(false)
  const protectedView = Boolean(session?.user?.accessAllowed)
  const showWatermark = protectedView && !['owner', 'admin'].includes(session?.user?.role ?? '')
  useEffect(() => {
    if (!protectedView) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const visibility = () => setHidden(document.hidden)
    const keydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'p', 's', 'с', 'ч', 'з', 'ы'].includes(e.key.toLowerCase())) e.preventDefault()
      if (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key))) {
        e.preventDefault()
        setHidden(true)
        clearTimeout(timer)
        timer = setTimeout(() => setHidden(document.hidden), 1800)
      }
    }
    document.addEventListener('visibilitychange', visibility)
    document.addEventListener('keydown', keydown, true)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', visibility)
      document.removeEventListener('keydown', keydown, true)
    }
  }, [protectedView])
  const prevent = (e: React.SyntheticEvent) => { if (protectedView) e.preventDefault() }
  return <div className={protectedView ? 'content-protected' : undefined} onCopyCapture={prevent} onCutCapture={prevent} onContextMenuCapture={prevent} onDragStartCapture={prevent}>
    <div style={protectedView && hidden ? { visibility: 'hidden' } : undefined}>{children}</div>
    {protectedView && hidden && <div className="fixed inset-0 z-[100] bg-background text-foreground flex items-center justify-center p-8 text-center">Содержимое скрыто. Вернитесь в игру, чтобы продолжить.</div>}
    {showWatermark && <div data-interface-watermark aria-hidden="true" className="pointer-events-none fixed bottom-1 right-3 z-[60] text-xs text-primary/30"><span suppressHydrationWarning>{session?.user?.email}</span> · Leela</div>}
  </div>
}
