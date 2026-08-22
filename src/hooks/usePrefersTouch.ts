import { useEffect, useState } from 'react'

const TOUCH_MEDIA_QUERY = '(hover: none) and (pointer: coarse)'

function getPrefersTouch(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(TOUCH_MEDIA_QUERY).matches
}

export function usePrefersTouch(): boolean {
  const [prefersTouch, setPrefersTouch] = useState(getPrefersTouch)

  useEffect(() => {
    const mq = window.matchMedia(TOUCH_MEDIA_QUERY)
    const handler = (e: MediaQueryListEvent) => setPrefersTouch(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return prefersTouch
}
