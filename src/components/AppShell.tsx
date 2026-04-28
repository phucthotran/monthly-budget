import { Link, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, Menu, PiggyBank, Settings, TrendingUp, Wallet, X } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'

import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'

import Logo from '../../public/header-logo.png'

import { AppShellUserCard } from './AppShellUserCard'
import { useAuthContext } from './AuthProvider'
import { ThemeToggle } from './ThemeToggle'
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
  Separator,
  TooltipProvider,
} from './ui'
const nav = [
  { icon: LayoutDashboard, label: t.nav.home, to: '/' },
  { icon: TrendingUp, label: t.nav.stats, to: '/stats' },
  { icon: Wallet, label: t.nav.budget, to: '/budget' },
  { icon: PiggyBank, label: t.nav.income, to: '/income' },
  { icon: Settings, label: t.nav.settings, to: '/settings' },
] as const

function AppShellSidebarBody({ headerStart }: { headerStart?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { user } = useAuthContext()
  const mobileHeaderStrip = headerStart != null

  return (
    <>
      {mobileHeaderStrip ? (
        <>
          <div className="flex min-h-9 shrink-0 items-center gap-2 border-b border-border px-3 py-2 font-semibold tracking-tight">
            {headerStart}
            <img src={Logo} alt="Money" className="size-6 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{t.appName}</span>
          </div>
          <div className="flex flex-col gap-2 px-3 pb-1.5 pt-2.5">{user ? <AppShellUserCard user={user} /> : null}</div>
        </>
      ) : (
        <div className="flex flex-col gap-2 px-3 pt-2.5 pb-1.5 md:px-4 md:pt-3 md:pb-2">
          <div className="flex min-h-9 items-center gap-2 font-semibold tracking-tight">
            <img src={Logo} alt="Money" className="size-6 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{t.appName}</span>
          </div>
          {<AppShellUserCard user={user} />}
        </div>
      )}
      <Separator />
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2">
        {nav.map((item) => {
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
      <div className="mt-auto flex flex-col gap-1 border-t border-border p-2">
        <ThemeToggle fullWidth />
      </div>
    </>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-dvh flex-col md:flex-row">
        <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card/50 px-3 py-2 md:hidden">
          <Drawer direction="left" open={mobileNavOpen} onOpenChange={setMobileNavOpen} shouldScaleBackground={false}>
            <DrawerTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="shrink-0" aria-label={t.nav.openMenu}>
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-card p-0 focus:outline-none">
              <DrawerTitle className="sr-only">{t.nav.drawerTitle}</DrawerTitle>
              <div className="flex min-h-0 flex-1 flex-col">
                <AppShellSidebarBody
                  headerStart={
                    <DrawerClose asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        aria-label={t.common.close}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </DrawerClose>
                  }
                />
              </div>
            </DrawerContent>
          </Drawer>
          <div className="flex min-h-9 min-w-0 flex-1 items-center gap-2 font-semibold tracking-tight">
            <img src={Logo} alt="Money" className="size-6 shrink-0" />
            <span className="truncate">{t.appName}</span>
          </div>
        </header>

        <aside className="hidden min-h-0 w-72 shrink-0 flex-col border-r border-border bg-card/50 md:flex md:min-h-dvh max-h-screen fixed top-0 left-0">
          <AppShellSidebarBody />
        </aside>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">{children}</main>
      </div>
    </TooltipProvider>
  )
}
