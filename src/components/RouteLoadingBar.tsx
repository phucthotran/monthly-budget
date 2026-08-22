import { useRouterState } from '@tanstack/react-router'
import { m } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { usePageNavigationTransition } from '@/hooks/usePageNavigationTransition'
import { cn } from '@/lib/utils'

const INDETERMINATE_TRANSITION = {
  duration: 1.1,
  ease: 'easeInOut',
  repeat: Infinity,
} as const

/**
 * Thin indeterminate bar shown while a route is loading or a swipe commit is
 * settling. Sits below the mobile header; on desktop it hugs the viewport top.
 */
export function RouteLoadingBar() {
  const { t } = useTranslation()
  const isRoutePending = useRouterState({ select: (s) => s.status === 'pending' })
  const isSettling = usePageNavigationTransition((s) => s.isSettling)
  const visible = isRoutePending || isSettling

  return (
    <m.div
      role="progressbar"
      aria-busy={visible}
      aria-label={t('loading')}
      aria-hidden={!visible}
      className={cn(
        'pointer-events-none fixed inset-x-0 z-[31] h-0.5 overflow-hidden bg-primary/15',
        'max-md:top-[calc(3.25rem+env(safe-area-inset-top))] md:top-0',
      )}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.15 }}
    >
      <m.div
        aria-hidden
        className="absolute inset-y-0 w-1/3 bg-primary"
        initial={{ x: '-100%' }}
        animate={visible ? { x: '400%' } : { x: '-100%' }}
        transition={INDETERMINATE_TRANSITION}
      />
    </m.div>
  )
}
