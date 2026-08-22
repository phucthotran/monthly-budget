import { LayoutDashboard, PiggyBank, Settings, TrendingUp, Wallet } from 'lucide-react'

import { t } from '@/lib/strings'

export const navItems = [
  { icon: LayoutDashboard, label: t.nav.home, to: '/' },
  { icon: TrendingUp, label: t.nav.stats, to: '/stats' },
  { icon: Wallet, label: t.nav.budget, to: '/budget' },
  { icon: PiggyBank, label: t.nav.income, to: '/income' },
  { icon: Settings, label: t.nav.settings, to: '/settings' },
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
