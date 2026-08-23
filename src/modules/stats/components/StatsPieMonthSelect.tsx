import { useTranslation } from 'react-i18next'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { formatMonthLabelShort } from '@/lib/month'
import { cn } from '@/lib/utils'

import { isPieMonthScope, PIE_MONTH_SCOPE_ALL, type PieMonthScope } from '../hooks/useStatsChartYearState'

const MONTH_VALUES = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'] as const

export function StatsPieMonthSelect({
  className,
  onValueChange,
  value,
}: {
  className?: string
  value: PieMonthScope
  onValueChange: (scope: PieMonthScope) => void
}) {
  const { t } = useTranslation('stats')
  const { t: tc } = useTranslation()

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground whitespace-nowrap">{tc('month')}</span>
      <Select
        value={value}
        onValueChange={(next) => {
          if (isPieMonthScope(next)) onValueChange(next)
        }}
      >
        <SelectTrigger className="w-[7.5rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={PIE_MONTH_SCOPE_ALL}>{t('chartIncomeSplitAllYear')}</SelectItem>
          {MONTH_VALUES.map((mm) => (
            <SelectItem key={mm} value={mm}>
              {formatMonthLabelShort(`yyyy-${mm}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
