import { Link, useRouterState } from '@tanstack/react-router'
import { type ReactNode, useEffect, useState } from 'react'

import { navItems } from '@/lib/nav'
import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'

import Logo from '../../public/header-logo.png'

import { AppShellUserCard } from './AppShellUserCard'
import { useAuthContext } from './AuthProvider'
import { MobileAccountSheet } from './MobileAccountSheet'
import { MobileBottomNav } from './MobileBottomNav'
import { ThemeToggle } from './ThemeToggle'
import { Separator, TooltipProvider } from './ui'
import { UserAvatar } from './UserAvatar'

function AppShellSidebarBody() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { user } = useAuthContext()

  return (
    <>
      <div className="flex flex-col gap-2 px-3 pt-2.5 pb-1.5 md:px-4 md:pt-3 md:pb-2">
        <div className="flex min-h-9 items-center gap-2 font-semibold tracking-tight">
          <img src={Logo} alt="Money" className="size-6 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{t.appName}</span>
        </div>
        <AppShellUserCard user={user} />
      </div>
      <Separator />
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const active = pathname === item.to
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-1 border-t border-border bg-gray-100 dark:bg-gray-800 p-2">
        <ThemeToggle fullWidth />
      </div>
    </>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuthContext()
  const [accountSheetOpen, setAccountSheetOpen] = useState(false)

  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    setAccountSheetOpen(false)
  }, [pathname])

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-dvh flex-col md:flex-row bg-slate-100 dark:bg-slate-900">
        {/* Mobile top header */}
        <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card/50 px-3 py-2 md:hidden">
          <div className="flex min-h-9 min-w-0 flex-1 items-center gap-2 font-semibold tracking-tight">
            <img src={Logo} alt="Money" className="size-6 shrink-0" />
            <span className="truncate">{t.appName}</span>
          </div>
          <button
            type="button"
            aria-label={t.nav.accountSheet}
            onClick={() => setAccountSheetOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted"
          >
            <UserAvatar user={user} />
          </button>
        </header>

        {/* Desktop sidebar */}
        <aside className="hidden min-h-0 w-72 shrink-0 flex-col border-r border-border bg-card/50 md:flex md:min-h-dvh max-h-screen fixed top-0 left-0">
          <AppShellSidebarBody />
        </aside>

        {/* Main content — pb-16 on mobile to clear the bottom nav bar */}
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 pb-20 md:p-8 md:pb-8">{children}</main>

        {/* Mobile bottom nav & account sheet */}
        <MobileBottomNav />
        <MobileAccountSheet open={accountSheetOpen} onOpenChange={setAccountSheetOpen} user={user} />
      </div>
    </TooltipProvider>
  )
}
