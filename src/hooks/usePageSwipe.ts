import { createContext, useContext } from 'react'

/** True while a swipe is tracking the thumb or committing a page change. */
export const PageSwipeContext = createContext(false)

/**
 * Lets viewport-pinned page chrome step aside during a swipe.
 *
 * Portaled `position: fixed` controls sit outside the page that owns them, so
 * they would otherwise hang over the incoming page for the whole transition.
 * Defaults to `false` where there is no pager, i.e. on desktop.
 */
export function useIsPageSwiping(): boolean {
  return useContext(PageSwipeContext)
}
