import { LayoutDashboard, PiggyBank, Settings, TrendingUp, Wallet } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const navItems = [
  { icon: LayoutDashboard, navKey: 'home' as const, to: '/' },
  { icon: TrendingUp, navKey: 'stats' as const, to: '/stats' },
  { icon: Wallet, navKey: 'budget' as const, to: '/budget' },
  { icon: PiggyBank, navKey: 'income' as const, to: '/income' },
  { icon: Settings, navKey: 'settings' as const, to: '/settings' },
] as const

export type NavPath = (typeof navItems)[number]['to']

/** `1` moves to the next nav item (swipe left), `-1` to the previous one (swipe right). */
export type SwipeDirection = -1 | 1

/**
 * The nav destination a swipe would land on, or `null` at either end of the bar
 * (and on routes outside it, such as `/login`).
 */
export function resolveSwipeTarget(pathname: string, dir: SwipeDirection): NavPath | null {
  const index = navItems.findIndex((item) => item.to === pathname)
  if (index < 0) return null
  const target = index + dir
  if (target < 0 || target >= navItems.length) return null
  return navItems[target].to
}

export function useNavItems() {
  const { t } = useTranslation()
  return useMemo(
    () =>
      navItems.map((item) => ({
        ...item,
        label: t(`nav.${item.navKey}`),
      })),
    [t],
  )
}
