import { Link, useRouterState } from '@tanstack/react-router'
import { signOut } from 'firebase/auth'
import { LayoutDashboard, LogOut, PiggyBank, Settings, TrendingUp, Wallet, WalletCards } from 'lucide-react'
import { type ReactNode } from 'react'

import { useAuthContext } from '@/components/AuthProvider'
import { Button, Separator, TooltipProvider } from '@/components/ui'
import { getFirebaseAuth } from '@/lib/firebase'
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
        <aside className="border-b border-border md:border-b-0 md:border-r md:w-56 shrink-0 bg-card/50">
          <div className="flex h-14 items-center gap-2 px-4 font-semibold tracking-tight">
            <WalletCards className="h-5 w-5 text-primary" />
            <span className="truncate">{t.appName}</span>
          </div>
          <Separator />
          <nav className="flex gap-1 p-2 md:flex-col overflow-x-auto md:overflow-visible">
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
          <div className="p-2 mt-auto border-t border-border md:border-t-0 space-y-1">
            {user ? (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => void signOut(getFirebaseAuth())}
              >
                <LogOut className="h-4 w-4" />
                {t.nav.logout}
              </Button>
            ) : (
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                <Link to="/login">{t.nav.login}</Link>
              </Button>
            )}
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </TooltipProvider>
  )
}
