import type { TouchEvent as ReactTouchEvent } from 'react'

import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useCallback, useRef, useState } from 'react'

import { triggerFirestoreRefresh } from '@/lib/firestore/refreshSignal'
import { haptic } from '@/lib/haptics'
import { navItems } from '@/lib/nav'

/** Movement on one axis must beat the other by this factor before the axis locks. */
const AXIS_LOCK_RATIO = 1.5
/** Ignore jitter below this before deciding which axis the gesture is on. */
const AXIS_LOCK_MIN_PX = 10
/** Horizontal travel required to change page. */
const SWIPE_THRESHOLD_PX = 64
/** Damped travel required to trigger a refresh. */
const PULL_THRESHOLD_PX = 56
/** Pull is damped and clamped so the content never detaches too far. */
const PULL_MAX_PX = 96
const PULL_RESISTANCE = 0.5

type Axis = 'horizontal' | 'none' | 'pending' | 'vertical'

/**
 * Elements that own the horizontal axis themselves. Recharts consumes touch
 * drags to move the tooltip, and Vaul binds its own pointer handlers.
 */
const BLOCKED_ANCESTORS = '[data-chart],.recharts-wrapper,[data-vaul-drawer],[data-vaul-overlay],[role="tablist"]'

function isBlockedContext(target: EventTarget | null): boolean {
  // Vaul locks body scroll and marks the open drawer while a sheet is up.
  if (document.body.hasAttribute('data-scroll-locked')) return true
  if (document.querySelector('[data-vaul-drawer-visible="true"]')) return true
  if (!(target instanceof Element)) return false
  return target.closest(BLOCKED_ANCESTORS) != null
}

/**
 * Walks up looking for a scroller that would consume the gesture.
 *
 * Measures real overflow rather than trusting the CSS property: `Panel` applies
 * `overflow-x-auto` to every card body, so a style-only test would disable
 * swiping across most of the app.
 */
function hasScrollableAncestor(target: EventTarget | null, axis: 'x' | 'y'): boolean {
  if (!(target instanceof Element)) return false
  let el: Element | null = target
  while (el && el !== document.body && el !== document.documentElement) {
    const style = window.getComputedStyle(el)
    if (axis === 'x') {
      const { overflowX } = style
      if ((overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth) return true
    } else {
      const { overflowY } = style
      if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollTop > 0) return true
    }
    el = el.parentElement
  }
  return false
}

export type PageGestures = {
  handlers: {
    onTouchCancel: () => void
    onTouchEnd: () => void
    onTouchMove: (e: ReactTouchEvent) => void
    onTouchStart: (e: ReactTouchEvent) => void
  }
  isRefreshing: boolean
  pullDistance: number
}

export function usePageGestures(enabled: boolean): PageGestures {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const start = useRef({ x: 0, y: 0 })
  const last = useRef({ x: 0, y: 0 })
  const axis = useRef<Axis>('none')
  const canPull = useRef(false)

  const reset = useCallback(() => {
    axis.current = 'none'
    canPull.current = false
    setPullDistance(0)
  }, [])

  const onTouchStart = useCallback(
    (e: ReactTouchEvent) => {
      axis.current = 'none'
      if (!enabled || isRefreshing) return

      const touch = e.touches[0]
      if (!touch || e.touches.length > 1) return
      if (isBlockedContext(e.target)) return

      start.current = { x: touch.clientX, y: touch.clientY }
      last.current = { x: touch.clientX, y: touch.clientY }
      axis.current = 'pending'
      // Sampled before any scrolling happens during this gesture.
      canPull.current = window.scrollY <= 0 && !hasScrollableAncestor(e.target, 'y')
    },
    [enabled, isRefreshing],
  )

  const onTouchMove = useCallback(
    (e: ReactTouchEvent) => {
      if (axis.current === 'none') return

      const touch = e.touches[0]
      if (!touch) return
      last.current = { x: touch.clientX, y: touch.clientY }

      const dx = touch.clientX - start.current.x
      const dy = touch.clientY - start.current.y

      if (axis.current === 'pending') {
        const absX = Math.abs(dx)
        const absY = Math.abs(dy)
        if (Math.max(absX, absY) < AXIS_LOCK_MIN_PX) return

        if (absX > absY * AXIS_LOCK_RATIO) {
          axis.current = hasScrollableAncestor(e.target, 'x') ? 'none' : 'horizontal'
        } else if (absY > absX * AXIS_LOCK_RATIO && dy > 0 && canPull.current) {
          axis.current = 'vertical'
        } else {
          // Plain scrolling — stay out of the way for the rest of this gesture.
          axis.current = 'none'
        }
        return
      }

      if (axis.current === 'vertical') {
        // A mid-gesture scroll means the page moved under us; abandon the pull.
        if (window.scrollY > 0) {
          reset()
          return
        }
        setPullDistance(Math.min(Math.max(dy, 0) * PULL_RESISTANCE, PULL_MAX_PX))
      }
    },
    [reset],
  )

  const onTouchEnd = useCallback(() => {
    const endedAxis = axis.current
    const dx = last.current.x - start.current.x
    const pulled = pullDistance
    reset()

    if (endedAxis === 'vertical') {
      if (pulled < PULL_THRESHOLD_PX) return
      haptic('light')
      setIsRefreshing(true)
      void triggerFirestoreRefresh().finally(() => {
        setIsRefreshing(false)
      })
      return
    }

    if (endedAxis !== 'horizontal' || Math.abs(dx) < SWIPE_THRESHOLD_PX) return

    const index = navItems.findIndex((item) => item.to === pathname)
    if (index < 0) return
    const next = navItems[dx < 0 ? index + 1 : index - 1]
    if (!next) return

    haptic('light')
    void navigate({ to: next.to })
  }, [navigate, pathname, pullDistance, reset])

  return {
    handlers: {
      onTouchCancel: reset,
      onTouchEnd,
      onTouchMove,
      onTouchStart,
    },
    isRefreshing,
    pullDistance,
  }
}
