import type { ReactNode } from 'react'

import { useRouterState } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'
import { m, useTransform } from 'motion/react'

import { PULL_THRESHOLD_PX, usePageGestures } from '@/hooks/usePageGestures'
import { PageSwipeContext } from '@/hooks/usePageSwipe'
import { PAGE_FADE } from '@/lib/motion'
import { pageSkeletonPropsForPath } from '@/lib/pageSkeleton'
import { t } from '@/lib/strings'

import { PageLoadingSkeleton } from './patterns/PageLoadingSkeleton'

/** Resting position of the pull indicator, tucked up behind the sticky header. */
const INDICATOR_HIDDEN_PX = -40
const INDICATOR_TRAVEL = 0.7
/** Height of the mobile top header, which the peeking page sits below. */
const HEADER_OFFSET = 'calc(3.25rem + env(safe-area-inset-top))'

/**
 * Mobile pull-to-refresh and drag-tracked swipe between nav tabs.
 *
 * The gesture host is never transformed, so the `fixed` pull indicator and the
 * peeking page stay anchored to the viewport. Only the current page and the peek
 * layer move, both driven by `MotionValue`s straight from the touch handlers.
 */
export function MobilePageGestures({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { handlers, isRefreshing, pageX, peek, peekOpacity, peekX, pullY } = usePageGestures()

  const indicatorY = useTransform(pullY, (v) => INDICATOR_HIDDEN_PX + v * INDICATOR_TRAVEL)
  const indicatorOpacity = useTransform(pullY, [0, 8], [0, 1])
  const indicatorColor = useTransform(pullY, (v) =>
    v >= PULL_THRESHOLD_PX ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
  )
  const iconRotate = useTransform(pullY, (v) => v * 3)

  return (
    <div {...handlers}>
      <m.div
        aria-hidden={!isRefreshing}
        className="pointer-events-none fixed inset-x-0 z-20 flex justify-center"
        style={{ opacity: indicatorOpacity, top: HEADER_OFFSET, y: indicatorY }}
      >
        <m.span
          role="status"
          aria-label={isRefreshing ? t.common.refreshing : t.common.pullToRefresh}
          className="flex size-9 items-center justify-center rounded-full border border-border bg-card shadow-md transition-colors"
          style={{ color: indicatorColor }}
        >
          {isRefreshing ? (
            <RefreshCw aria-hidden className="size-4 animate-spin" />
          ) : (
            <m.span aria-hidden className="flex" style={{ rotate: iconRotate }}>
              <RefreshCw className="size-4" />
            </m.span>
          )}
        </m.span>
      </m.div>

      {/*
       * Anchored to the viewport rather than the document so it lands in view no
       * matter how far the current page is scrolled, and painted below the
       * header (z-30) and bottom nav (z-40) so the app chrome stays put.
       */}
      {peek ? (
        <div
          inert
          aria-hidden
          className="pointer-events-none fixed inset-x-0 bottom-0 z-10 overflow-hidden"
          style={{ top: HEADER_OFFSET }}
        >
          <m.div
            className="h-full w-full overflow-hidden bg-slate-100 p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] dark:bg-slate-900"
            style={{ opacity: peekOpacity, x: peekX }}
          >
            <PageLoadingSkeleton {...pageSkeletonPropsForPath(peek.to)} />
          </m.div>
        </div>
      ) : null}

      {/*
       * `clip` rather than `hidden`: it keeps the drag from widening the
       * document without turning this into a scroll container, which would
       * break the document-level scrolling the sticky header depends on.
       */}
      <div className="overflow-x-clip">
        <m.div
          key={pathname}
          // A swipe commit hands over via the peek layer's crossfade, so the
          // page must not also fade in underneath it. Taps on the nav still do.
          initial={peek ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={PAGE_FADE}
          style={{ x: pageX }}
        >
          <PageSwipeContext.Provider value={peek !== null}>{children}</PageSwipeContext.Provider>
        </m.div>
      </div>
    </div>
  )
}
