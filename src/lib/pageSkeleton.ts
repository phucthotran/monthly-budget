import type { PageLoadingSkeletonProps } from '@/components/patterns'

/**
 * The `PageLoadingSkeleton` props each nav destination renders while loading.
 *
 * Shared so the swipe pager can peek the incoming page's skeleton, and
 * `RequireAuth` can show the right shape without tracking it in state. Keep in
 * sync with the `PageLoadingSkeleton` call in each page component.
 */
export function pageSkeletonPropsForPath(pathname: string): PageLoadingSkeletonProps {
  if (pathname === '/') return { variant: 'home' }
  if (pathname === '/stats') return { variant: 'stats' }
  return { showHeadingAction: true, variant: 'default' }
}
