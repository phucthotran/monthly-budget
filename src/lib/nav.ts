import { LayoutDashboard, PiggyBank, Settings, TrendingUp, Wallet } from 'lucide-react'

import { t } from '@/lib/strings'

export const navItems = [
  { icon: LayoutDashboard, label: t.nav.home, to: '/' },
  { icon: TrendingUp, label: t.nav.stats, to: '/stats' },
  { icon: Wallet, label: t.nav.budget, to: '/budget' },
  { icon: PiggyBank, label: t.nav.income, to: '/income' },
  { icon: Settings, label: t.nav.settings, to: '/settings' },
] as const
