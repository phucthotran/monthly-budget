import { useLayoutEffect } from 'react'

/** Keep as string literals so Tailwind JIT sees `overflow-hidden` / `scrollbar-none`. */
const LOCK_CLASSES = ['overflow-hidden', 'overscroll-none', 'pin-lock-open', 'scrollbar-none'] as const

/**
 * Locks document scroll while `enabled` is true (unlock / setup / reset, not hydrating).
 * Call from `PinGateScreen` so the effect is tied to the gate UI, not the always-mounted provider.
 */
export function useLockBodyScroll(enabled: boolean): void {
  useLayoutEffect(() => {
    if (!enabled) return

    const html = document.documentElement
    const { body } = document
    const root = document.getElementById('root')
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const targets = [html, body, root].filter((el): el is HTMLElement => el != null)

    for (const el of targets) {
      el.classList.add(...LOCK_CLASSES)
    }

    return () => {
      for (const el of targets) {
        el.classList.remove(...LOCK_CLASSES)
      }
      window.scrollTo(scrollX, scrollY)
    }
  }, [enabled])
}
