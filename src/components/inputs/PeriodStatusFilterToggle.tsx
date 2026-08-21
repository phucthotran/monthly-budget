import type { PeriodStatusFilter } from '@/lib/month'

import { haptic } from '@/lib/haptics'
import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'

const options: { label: string; value: PeriodStatusFilter }[] = [
  { label: t.common.periodStatusActive, value: 'active' },
  { label: t.common.periodStatusExpired, value: 'expired' },
]

export function PeriodStatusFilterToggle({
  className,
  onValueChange,
  value,
}: {
  className?: string
  value: PeriodStatusFilter
  onValueChange: (filter: PeriodStatusFilter) => void
}) {
  return (
    <div
      role="group"
      aria-label={t.common.periodStatus}
      className={cn(
        'inline-flex shrink-0 items-center rounded-md border border-border bg-muted p-0.5 text-xs sm:text-sm',
        className,
      )}
    >
      {options.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => {
              haptic('light')
              onValueChange(option.value)
            }}
            className={cn(
              'whitespace-nowrap rounded-[0.3rem] px-3 py-2 font-medium transition-colors active:scale-[0.97] md:py-1',
              selected ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
