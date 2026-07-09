import type { PeriodStatusFilter } from '@/lib/month'

import { Switch } from '@/components/ui'
import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'

export function PeriodStatusFilterToggle({
  className,
  onValueChange,
  value,
}: {
  className?: string
  value: PeriodStatusFilter
  onValueChange: (filter: PeriodStatusFilter) => void
}) {
  const showActive = value === 'active'

  return (
    <div className={cn('inline-flex shrink-0 items-center gap-2', className)}>
      <span className="text-xs whitespace-nowrap text-muted-foreground sm:text-sm">{t.common.periodStatusActive}</span>
      <Switch
        aria-label={t.common.periodStatusActive}
        checked={showActive}
        onCheckedChange={(checked) => onValueChange(checked ? 'active' : 'expired')}
      />
    </div>
  )
}
