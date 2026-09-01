import { useEffect, useRef } from 'react'

const PIN_IDLE_MS = 5 * 60 * 1000
const IDLE_EVENTS = ['keydown', 'pointerdown', 'scroll', 'touchstart'] as const

/** Locks after 5 minutes idle, immediately on tab hide, and on bfcache restore. */
export function usePinIdleAndVisibilityLock(enabled: boolean, onLock: () => void) {
  const onLockRef = useRef(onLock)
  onLockRef.current = onLock

  useEffect(() => {
    if (!enabled) return

    let timer = 0
    const bump = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => onLockRef.current(), PIN_IDLE_MS)
    }
    bump()

    const opts: AddEventListenerOptions = { passive: true }
    for (const event of IDLE_EVENTS) {
      window.addEventListener(event, bump, opts)
    }

    const onVisibility = () => {
      if (document.hidden) onLockRef.current()
    }
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) onLockRef.current()
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pageshow', onPageShow)

    return () => {
      window.clearTimeout(timer)
      for (const event of IDLE_EVENTS) {
        window.removeEventListener(event, bump)
      }
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [enabled])
}
