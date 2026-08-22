import { Link, useRouterState } from '@tanstack/react-router'
import { type ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { PageNavigationTransitionProvider } from '@/hooks/usePageNavigationTransition'
import { haptic } from '@/lib/haptics'
import { useNavItems } from '@/lib/nav'
import { cn } from '@/lib/utils'

import Logo from '../../public/header-logo.png'

import { AppShellUserCard } from './AppShellUserCard'
import { useAuthContext } from './AuthProvider'
import { LocaleToggle } from './LocaleToggle'
import { MobileAccountSheet } from './MobileAccountSheet'
import { MobileBottomNav } from './MobileBottomNav'
import { PageTransition } from './PageTransition'
import { RouteLoadingBar } from './RouteLoadingBar'
import { ThemeToggle } from './ThemeToggle'
import { Separator } from './ui'
import { UserAvatar } from './UserAvatar'

function AppShellSidebarBody() {
  const { t } = useTranslation()
  const navItems = useNavItems()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { user } = useAuthContext()

  return (
    <>
      <div className="flex flex-col gap-2 px-3 pt-2.5 pb-1.5 md:px-4 md:pt-3 md:pb-2">
        <div className="flex min-h-9 items-center gap-2 font-semibold tracking-tight">
          <img src={Logo} alt={t('appName')} className="size-6 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{t('appName')}</span>
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
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all ease-in-out duration-200',
                active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto border-t border-border bg-gray-100 p-2 dark:bg-gray-800">
        <div className="flex items-center justify-center gap-2">
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </div>
    </>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { user } = useAuthContext()
  const [accountSheetOpen, setAccountSheetOpen] = useState(false)

  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    setAccountSheetOpen(false)
  }, [pathname])

  return (
    <PageNavigationTransitionProvider>
      <div className="flex min-h-dvh flex-col md:flex-row bg-slate-100 dark:bg-slate-900">
        {/* Mobile top header */}
        <header className="sticky top-0 z-30 flex shrink-0 items-center gap-2 border-b border-border bg-card/80 px-3 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] backdrop-blur-md md:hidden">
          <div className="flex min-h-9 min-w-0 flex-1 items-center gap-2 font-semibold tracking-tight">
            <img src={Logo} alt={t('appName')} className="size-6 shrink-0" />
            <span className="truncate">{t('appName')}</span>
          </div>
          <button
            type="button"
            aria-label={t('nav.accountSheet')}
            onClick={() => {
              haptic('light')
              setAccountSheetOpen(true)
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted active:scale-95"
          >
            <UserAvatar user={user} />
          </button>
        </header>

        <RouteLoadingBar />

        {/* Desktop sidebar */}
        <aside className="hidden min-h-0 w-72 shrink-0 flex-col border-r border-border bg-card/50 md:flex md:min-h-dvh max-h-screen fixed top-0 left-0">
          <AppShellSidebarBody />
        </aside>

        {/* Main content — extra bottom padding on mobile to clear the bottom nav bar and FAB */}
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:p-8 md:pb-8">
          <PageTransition>{children}</PageTransition>
        </main>

        {/* Mobile bottom nav & account sheet */}
        <MobileBottomNav />
        <MobileAccountSheet open={accountSheetOpen} onOpenChange={setAccountSheetOpen} user={user} />
      </div>
    </PageNavigationTransitionProvider>
  )
}
