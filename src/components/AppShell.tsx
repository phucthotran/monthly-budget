import { Link, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, PiggyBank, Settings, TrendingUp, Wallet, WalletCards } from 'lucide-react'
import { type ReactNode } from 'react'

import { AppShellUserCard } from '@/components/AppShellUserCard'
import { useAuthContext } from '@/components/AuthProvider'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button, Separator, TooltipProvider } from '@/components/ui'
import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'

const nav = [
  { icon: LayoutDashboard, label: t.nav.home, to: '/' },
  { icon: Wallet, label: t.nav.budget, to: '/budget' },
  { icon: PiggyBank, label: t.nav.income, to: '/income' },
  { icon: TrendingUp, label: t.nav.stats, to: '/stats' },
  { icon: Settings, label: t.nav.settings, to: '/settings' },
] as const

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { user } = useAuthContext()

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-dvh flex flex-col md:flex-row">
        <aside className="flex min-h-0 shrink-0 flex-col border-b border-border bg-card/50 md:min-h-dvh md:border-b-0 md:border-r md:w-72">
          <div className="flex flex-col gap-2 px-3 pt-2.5 pb-1.5 md:px-4 md:pt-3 md:pb-2">
            <div className="flex min-h-9 items-center gap-2 font-semibold tracking-tight">
              <WalletCards className="h-5 w-5 shrink-0 text-primary" />
              <span className="truncate">{t.appName}</span>
            </div>
            {user ? <AppShellUserCard user={user} /> : null}
          </div>
          <Separator />
          <nav className="flex min-h-0 flex-1 gap-1 overflow-x-auto p-2 md:flex-col md:overflow-visible">
            {nav.map((item) => {
              const active = pathname === item.to
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap',
                    active
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="mt-auto flex flex-col gap-1 border-t border-border p-2">
            {!user ? (
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                <Link to="/login">{t.nav.login}</Link>
              </Button>
            ) : null}
            <ThemeToggle fullWidth />
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </TooltipProvider>
  )
}
