import type { NavPath } from '@/lib/nav'

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type PageNavigationTransition = {
  isSettling: boolean
  swipeTarget: NavPath | null
}

const DEFAULT_TRANSITION: PageNavigationTransition = {
  isSettling: false,
  swipeTarget: null,
}

type PageNavigationTransitionContextValue = {
  setTransition: (next: PageNavigationTransition) => void
  transition: PageNavigationTransition
}

const PageNavigationTransitionContext = createContext<null | PageNavigationTransitionContextValue>(null)

export function PageNavigationTransitionProvider({ children }: { children: ReactNode }) {
  const [transition, setTransitionState] = useState(DEFAULT_TRANSITION)

  const setTransition = useCallback((next: PageNavigationTransition) => {
    setTransitionState((current) =>
      current.isSettling === next.isSettling && current.swipeTarget === next.swipeTarget ? current : next,
    )
  }, [])

  const value = useMemo(() => ({ setTransition, transition }), [setTransition, transition])

  return <PageNavigationTransitionContext.Provider value={value}>{children}</PageNavigationTransitionContext.Provider>
}

export function usePageNavigationTransition<T>(select: (state: PageNavigationTransition) => T): T {
  const ctx = useContext(PageNavigationTransitionContext)
  if (!ctx) {
    return select(DEFAULT_TRANSITION)
  }
  return select(ctx.transition)
}

/** Publishes swipe transition state from the gesture layer into app-shell chrome. */
export function useSyncPageNavigationTransition({ isSettling, swipeTarget }: PageNavigationTransition): void {
  const ctx = useContext(PageNavigationTransitionContext)

  useEffect(() => {
    ctx?.setTransition({ isSettling, swipeTarget })
  }, [ctx, isSettling, swipeTarget])
}
