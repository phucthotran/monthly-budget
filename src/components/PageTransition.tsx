import type { ReactNode } from 'react'

import { useRouterState } from '@tanstack/react-router'
import { m } from 'motion/react'

import { useIsMobile } from '@/hooks/useIsMobile'
import { PAGE_ENTER_TRANSITION } from '@/lib/motion'

import { MobilePageGestures } from './MobilePageGestures'

/**
 * Page-level transition for the routed content.
 *
 * Mobile gets the drag-tracked swipe pager; desktop, which has no gesture, gets
 * a fade and a short rise on route change. There is no exit animation on
 * purpose: waiting one out would leave `main` empty and double the perceived
 * latency of every nav click.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  if (isMobile) return <MobilePageGestures>{children}</MobilePageGestures>

  return (
    <m.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={PAGE_ENTER_TRANSITION}
    >
      {children}
    </m.div>
  )
}
