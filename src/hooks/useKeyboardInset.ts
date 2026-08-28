import { useEffect } from 'react'

const CSS_KEYBOARD_INSET = '--keyboard-inset'
const CSS_SHEET_VIEWPORT_H = '--sheet-viewport-h'
/** Ignore URL-bar / chrome jitter; matches vaul’s 60px keyboard heuristic. */
const KEYBOARD_MIN_INSET = 60

let subscriberCount = 0

function clearCssVars() {
  const style = document.documentElement.style
  style.removeProperty(CSS_KEYBOARD_INSET)
  style.removeProperty(CSS_SHEET_VIEWPORT_H)
}

function measureAndApply(): number {
  const vv = window.visualViewport
  if (!vv) return 0
  const raw = Math.round(window.innerHeight - (vv.height + vv.offsetTop))
  const inset = raw > KEYBOARD_MIN_INSET ? raw : 0
  const style = document.documentElement.style
  style.setProperty(CSS_KEYBOARD_INSET, `${inset}px`)
  style.setProperty(CSS_SHEET_VIEWPORT_H, `${Math.round(vv.height)}px`)
  return inset
}

function scrollFocusedDrawerInputIntoView() {
  const el = document.activeElement
  if (!(el instanceof HTMLElement)) return
  if (!el.closest('[data-vaul-drawer]')) return
  el.scrollIntoView({ block: 'center', inline: 'nearest' })
}

/**
 * Tracks the virtual-keyboard inset via VisualViewport and writes
 * `--keyboard-inset` / `--sheet-viewport-h` on `<html>` while enabled.
 * Nested callers share the vars through a module-level refcount so closing
 * one drawer cannot leave a leftover gap.
 */
export function useKeyboardInset(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return
    const vv = window.visualViewport
    if (!vv) return

    subscriberCount += 1
    let lastInset = 0
    let rafId = 0
    let scrollRaf1 = 0
    let scrollRaf2 = 0

    function scheduleScrollIntoView() {
      cancelAnimationFrame(scrollRaf1)
      cancelAnimationFrame(scrollRaf2)
      scrollRaf1 = requestAnimationFrame(() => {
        scrollRaf2 = requestAnimationFrame(() => {
          scrollFocusedDrawerInputIntoView()
        })
      })
    }

    function onViewportChange() {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = 0
        const prev = lastInset
        lastInset = measureAndApply()
        if (prev === 0 && lastInset > 0) {
          scheduleScrollIntoView()
        }
      })
    }

    function onFocusIn(event: FocusEvent) {
      if (lastInset <= 0) return
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      if (!target.closest('[data-vaul-drawer]')) return
      scheduleScrollIntoView()
    }

    lastInset = measureAndApply()
    if (lastInset > 0) scheduleScrollIntoView()

    vv.addEventListener('resize', onViewportChange)
    vv.addEventListener('scroll', onViewportChange)
    document.addEventListener('focusin', onFocusIn)

    return () => {
      vv.removeEventListener('resize', onViewportChange)
      vv.removeEventListener('scroll', onViewportChange)
      document.removeEventListener('focusin', onFocusIn)
      cancelAnimationFrame(rafId)
      cancelAnimationFrame(scrollRaf1)
      cancelAnimationFrame(scrollRaf2)
      subscriberCount -= 1
      if (subscriberCount === 0) {
        clearCssVars()
      }
    }
  }, [enabled])
}
