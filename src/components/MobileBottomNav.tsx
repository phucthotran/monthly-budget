import { Link, useRouterState } from '@tanstack/react-router'
import { m } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { haptic } from '@/lib/haptics'
import { useNavItems } from '@/lib/nav'
import { cn } from '@/lib/utils'

/**
 * Layout shared by every tab and by the sliding indicator, so the pill always
 * lands on the icons even if this changes.
 */
const TAB_LAYOUT = 'flex flex-col items-center justify-center gap-0.5 px-1 text-[11px] leading-tight'

const INDICATOR_TRANSITION = { bounce: 0.25, duration: 0.4, type: 'spring' } as const

export function MobileBottomNav() {
  const { t } = useTranslation()
  const labeledItems = useNavItems()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const activeIndex = labeledItems.findIndex((item) => item.to === pathname)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 box-content flex h-16 items-stretch border-t border-border bg-card/95 pb-safe-b backdrop-blur-md md:hidden"
      aria-label={t('nav.mainNav')}
    >
      {/*
       * One pill for the whole bar rather than one per tab, so switching tabs
       * slides it across instead of blinking it out and back in. Tabs are
       * equal-width flex items, so a column of `100 / count`% translated by
       * whole multiples of itself lands exactly on each one — no measuring.
       *
       * `h-16` rather than `inset-y-0`: absolute insets resolve against the
       * padding box, which `pb-safe-b` extends below the tabs.
       */}
      {activeIndex >= 0 ? (
        <m.div
          aria-hidden
          className={cn('pointer-events-none absolute left-0 top-0 h-16', TAB_LAYOUT)}
          style={{ width: `${String(100 / labeledItems.length)}%` }}
          initial={false}
          animate={{ x: `${String(activeIndex * 100)}%` }}
          transition={INDICATOR_TRANSITION}
        >
          <span className="h-7 w-12 rounded-full bg-primary/15" />
          {/* Reserves the label's line box, which centres the pill on the icons. */}
          <span className="invisible truncate">{labeledItems[activeIndex].label}</span>
        </m.div>
      ) : null}

      {labeledItems.map((item) => {
        const active = pathname === item.to
        const Icon = item.icon
        return (
          <Link
            key={item.to}
            to={item.to}
            // `relative` keeps the tabs painting above the indicator, which is
            // positioned and would otherwise cover them.
            className={cn(
              'relative flex-1 font-medium transition-colors duration-200 active:scale-95 ease-in-out',
              TAB_LAYOUT,
              active ? 'text-primary' : 'text-muted-foreground',
            )}
            aria-current={active ? 'page' : undefined}
            onClick={() => haptic('light')}
          >
            <span className="flex h-7 w-12 items-center justify-center">
              <Icon
                className={cn('h-5 w-5 shrink-0 transition-transform duration-200', active && 'scale-110')}
                aria-hidden
              />
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
