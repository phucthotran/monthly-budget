import { Link, useRouterState } from '@tanstack/react-router'

import { navItems } from '@/lib/nav'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch border-t border-border bg-card/95 backdrop-blur-sm md:hidden"
      aria-label="Điều hướng chính"
    >
      {navItems.map((item) => {
        const active = pathname === item.to
        const Icon = item.icon
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className={cn('h-5 w-5 shrink-0 transition-transform', active && 'scale-110')} aria-hidden />
            <span className="truncate leading-tight">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
