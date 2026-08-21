import type { ReactNode } from 'react'

import { useRouterState } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'

import { useIsMobile } from '@/hooks/useIsMobile'
import { usePageGestures } from '@/hooks/usePageGestures'
import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'

/** Damped pull distance at which the gesture will fire on release. */
const READY_PX = 56
/** Resting position of the indicator, tucked up behind the sticky header. */
const INDICATOR_HIDDEN_PX = -40
const INDICATOR_TRAVEL = 0.7

/**
 * Mobile-only pull-to-refresh and swipe-between-tabs.
 *
 * The indicator is the only thing that moves: a `transform` on a wrapper around
 * `children` would become the containing block for the pages' `position: fixed`
 * FABs and yank them out of place mid-gesture.
 */
export function MobilePageGestures({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { handlers, isRefreshing, pullDistance } = usePageGestures(isMobile)

  if (!isMobile) return <>{children}</>

  const ready = pullDistance >= READY_PX
  const travel = isRefreshing ? READY_PX : pullDistance * INDICATOR_TRAVEL
  const visible = isRefreshing || pullDistance > 0

  return (
    <div {...handlers}>
      <div
        aria-hidden={!visible}
        className="pointer-events-none fixed inset-x-0 top-[calc(3.25rem+env(safe-area-inset-top))] z-20 flex justify-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: `translateY(${String(INDICATOR_HIDDEN_PX + travel)}px)`,
        }}
      >
        <span
          role="status"
          aria-label={isRefreshing ? t.common.refreshing : t.common.pullToRefresh}
          className={cn(
            'flex size-9 items-center justify-center rounded-full border border-border bg-card shadow-md transition-colors',
            ready || isRefreshing ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <RefreshCw
            aria-hidden
            className={cn('size-4', isRefreshing && 'animate-spin')}
            style={isRefreshing ? undefined : { transform: `rotate(${String(Math.round(pullDistance * 3))}deg)` }}
          />
        </span>
      </div>

      <div className="page-enter" key={pathname}>
        {children}
      </div>
    </div>
  )
}
