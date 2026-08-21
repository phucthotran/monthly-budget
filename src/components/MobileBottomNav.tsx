import { Link, useRouterState } from '@tanstack/react-router'

import { haptic } from '@/lib/haptics'
import { navItems } from '@/lib/nav'
import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 box-content flex h-16 items-stretch border-t border-border bg-card/95 pb-safe-b backdrop-blur-md md:hidden"
      aria-label={t.nav.mainNav}
    >
      {navItems.map((item) => {
        const active = pathname === item.to
        const Icon = item.icon
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium transition-colors duration-200 active:scale-95',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
            aria-current={active ? 'page' : undefined}
            onClick={() => haptic('light')}
          >
            <span
              className={cn(
                'flex h-7 w-12 items-center justify-center rounded-full transition-all duration-200',
                active ? 'bg-primary/15' : 'bg-transparent',
              )}
            >
              <Icon
                className={cn('h-5 w-5 shrink-0 transition-transform duration-200', active && 'scale-110')}
                aria-hidden
              />
            </span>
            <span className="truncate leading-tight">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
