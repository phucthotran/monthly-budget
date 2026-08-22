import type { MotionValue } from 'motion/react'
import type { TouchEvent as ReactTouchEvent } from 'react'

import { useNavigate, useRouterState } from '@tanstack/react-router'
import { animate, useMotionValue, useReducedMotion } from 'motion/react'
import { useCallback, useRef, useState } from 'react'

import { triggerFirestoreRefresh } from '@/lib/firestore/refreshSignal'
import { haptic } from '@/lib/haptics'
import { type NavPath, resolveSwipeTarget, type SwipeDirection } from '@/lib/nav'

/** Movement on one axis must beat the other by this factor before the axis locks. */
const AXIS_LOCK_RATIO = 1.5
/** Ignore jitter below this before deciding which axis the gesture is on. */
const AXIS_LOCK_MIN_PX = 10
/** Fraction of the page width a slow drag must cover to change page. */
const COMMIT_DISTANCE_RATIO = 0.3
/** Fling speed that changes page regardless of how far the drag got. */
const COMMIT_VELOCITY_PX_S = 500
/** Resistance applied when there is no page to swipe to, so the edge feels closed. */
const EDGE_RESISTANCE = 0.25
/** Distance between the outgoing page and the peeking one, so they read as separate surfaces. */
export const PAGE_GAP_PX = 24
/** Damped travel required to trigger a refresh. */
export const PULL_THRESHOLD_PX = 56
/** Pull is damped and clamped so the content never detaches too far. */
const PULL_MAX_PX = 96
const PULL_RESISTANCE = 0.5
/** Travel required to change page when drag tracking is off (reduced motion). */
const SWIPE_THRESHOLD_PX = 64

/*
 * The commit runs after the thumb has lifted, so it can afford to be unhurried;
 * the cancel stays quicker, because a drag the user pulled back from should get
 * out of the way rather than be dwelt on.
 */
const COMMIT_TRANSITION = { bounce: 0, duration: 0.42, type: 'spring' } as const
const CANCEL_TRANSITION = { bounce: 0, duration: 0.28, type: 'spring' } as const
/** Crossfade that hands the viewport from the peeked skeleton to the real page. */
const SETTLE_FADE = { duration: 0.2, ease: 'easeOut' } as const
const PULL_RETURN = { duration: 0.2, ease: 'easeOut' } as const

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

/** The nav destination currently tracking in from the edge. */
export type PagePeek = {
  dir: SwipeDirection
  to: NavPath
}

export type PageGestures = {
  handlers: {
    onTouchCancel: () => void
    onTouchEnd: () => void
    onTouchMove: (e: ReactTouchEvent) => void
    onTouchStart: (e: ReactTouchEvent) => void
  }
  isRefreshing: boolean
  /** Horizontal offset of the current page. */
  pageX: MotionValue<number>
  peek: null | PagePeek
  peekOpacity: MotionValue<number>
  /** Horizontal offset of the peeked page. */
  peekX: MotionValue<number>
  /** Damped pull-to-refresh distance. */
  pullY: MotionValue<number>
}

/**
 * Mobile pull-to-refresh and drag-tracked swipe between nav tabs.
 *
 * Drag offsets are `MotionValue`s rather than state: they write straight to the
 * DOM, so following the thumb costs no React renders. `peek` is the only state
 * here, and it changes at most once per gesture.
 */
export function usePageGestures(): PageGestures {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const reduceMotion = useReducedMotion()

  const pageX = useMotionValue(0)
  const peekX = useMotionValue(0)
  const peekOpacity = useMotionValue(1)
  const pullY = useMotionValue(0)

  const [peek, setPeek] = useState<null | PagePeek>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const start = useRef({ x: 0, y: 0 })
  const last = useRef({ x: 0, y: 0 })
  const axis = useRef<Axis>('none')
  const canPull = useRef(false)
  /** Viewport width, not the padded content box: pages travel a full screen. */
  const pageWidth = useRef(0)
  /** Mirrors `peek` for the touch handlers, which run between renders. */
  const peekTarget = useRef<null | PagePeek>(null)
  /** True from the moment a swipe commits until the new page has faded in. */
  const isSettling = useRef(false)

  const restingPeekX = useCallback((dir: SwipeDirection) => dir * (pageWidth.current + PAGE_GAP_PX), [])

  /**
   * Points the peek at whichever page the current drag direction implies,
   * re-resolving when the thumb crosses back over the start point.
   */
  const syncPeek = useCallback(
    (dx: number): null | PagePeek => {
      const dir: SwipeDirection = dx < 0 ? 1 : -1
      const current = peekTarget.current
      if (current?.dir === dir) return current

      const to = resolveSwipeTarget(pathname, dir)
      const next = to ? { dir, to } : null
      peekTarget.current = next
      if (next) {
        peekX.set(restingPeekX(dir))
        peekOpacity.set(1)
      }
      setPeek(next)
      return next
    },
    [pathname, peekOpacity, peekX, restingPeekX],
  )

  const clearPeek = useCallback(
    (target: PagePeek) => {
      // A new gesture may have re-pointed the peek while this animation ran.
      if (peekTarget.current !== target) return
      peekTarget.current = null
      setPeek(null)
    },
    [setPeek],
  )

  const cancelSwipe = useCallback(() => {
    void animate(pageX, 0, CANCEL_TRANSITION)
    const target = peekTarget.current
    if (!target) return
    void animate(peekX, restingPeekX(target.dir), CANCEL_TRANSITION).then(() => {
      clearPeek(target)
    })
  }, [clearPeek, pageX, peekX, restingPeekX])

  const commitSwipe = useCallback(
    (target: PagePeek) => {
      haptic('light')
      isSettling.current = true
      void animate(peekX, 0, COMMIT_TRANSITION)
      void animate(pageX, -restingPeekX(target.dir), COMMIT_TRANSITION).then(async () => {
        // The skeleton now covers the viewport, so the outgoing page can snap
        // back and be replaced underneath it without either being seen.
        pageX.set(0)
        try {
          await navigate({ to: target.to })
          await animate(peekOpacity, 0, SETTLE_FADE)
        } finally {
          isSettling.current = false
          peekOpacity.set(1)
          clearPeek(target)
        }
      })
    },
    [clearPeek, navigate, pageX, peekOpacity, peekX, restingPeekX],
  )

  const onTouchStart = useCallback(
    (e: ReactTouchEvent) => {
      axis.current = 'none'
      // Sit out until an in-flight refresh or page change has finished.
      if (isRefreshing || isSettling.current) return

      const touch = e.touches[0]
      if (!touch || e.touches.length > 1) return
      if (isBlockedContext(e.target)) return

      start.current = { x: touch.clientX, y: touch.clientY }
      last.current = { x: touch.clientX, y: touch.clientY }
      axis.current = 'pending'
      pageWidth.current = document.documentElement.clientWidth
      // Sampled before any scrolling happens during this gesture.
      canPull.current = window.scrollY <= 0 && !hasScrollableAncestor(e.target, 'y')
    },
    [isRefreshing],
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

      if (axis.current === 'horizontal') {
        // Tracking the thumb *is* the animation, so reduced motion opts out of
        // it entirely and falls back to a threshold jump on release.
        if (reduceMotion) return
        const target = syncPeek(dx)
        pageX.set(target ? dx : dx * EDGE_RESISTANCE)
        if (target) peekX.set(dx + restingPeekX(target.dir))
        return
      }

      // A mid-gesture scroll means the page moved under us; abandon the pull.
      if (window.scrollY > 0) {
        axis.current = 'none'
        pullY.set(0)
        return
      }
      pullY.set(Math.min(Math.max(dy, 0) * PULL_RESISTANCE, PULL_MAX_PX))
    },
    [pageX, peekX, pullY, reduceMotion, restingPeekX, syncPeek],
  )

  const onTouchEnd = useCallback(() => {
    const endedAxis = axis.current
    axis.current = 'none'
    canPull.current = false

    if (endedAxis === 'vertical') {
      if (pullY.get() < PULL_THRESHOLD_PX) {
        void animate(pullY, 0, PULL_RETURN)
        return
      }
      haptic('light')
      setIsRefreshing(true)
      void animate(pullY, PULL_THRESHOLD_PX, PULL_RETURN)
      void triggerFirestoreRefresh().finally(() => {
        setIsRefreshing(false)
        void animate(pullY, 0, PULL_RETURN)
      })
      return
    }

    if (endedAxis !== 'horizontal') return

    const dx = last.current.x - start.current.x

    if (reduceMotion) {
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return
      const to = resolveSwipeTarget(pathname, dx < 0 ? 1 : -1)
      if (!to) return
      haptic('light')
      void navigate({ to })
      return
    }

    const target = peekTarget.current
    if (!target) {
      void animate(pageX, 0, CANCEL_TRANSITION)
      return
    }

    const velocity = pageX.getVelocity()
    const flung = Math.abs(velocity) > COMMIT_VELOCITY_PX_S && Math.sign(velocity) === Math.sign(dx)
    if (Math.abs(dx) > pageWidth.current * COMMIT_DISTANCE_RATIO || flung) {
      commitSwipe(target)
      return
    }
    cancelSwipe()
  }, [cancelSwipe, commitSwipe, navigate, pageX, pathname, pullY, reduceMotion])

  const onTouchCancel = useCallback(() => {
    const endedAxis = axis.current
    axis.current = 'none'
    canPull.current = false
    if (endedAxis === 'vertical') {
      void animate(pullY, 0, PULL_RETURN)
      return
    }
    if (endedAxis === 'horizontal' && !reduceMotion) cancelSwipe()
  }, [cancelSwipe, pullY, reduceMotion])

  return {
    handlers: {
      onTouchCancel,
      onTouchEnd,
      onTouchMove,
      onTouchStart,
    },
    isRefreshing,
    pageX,
    peek,
    peekOpacity,
    peekX,
    pullY,
  }
}
