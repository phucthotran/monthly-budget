import type { HomeMonthLineItem } from '@/lib/budget/homeMonthBreakdown'

import { useTranslation } from 'react-i18next'

import { EmptyState } from '@/components/patterns'
import { useMoney } from '@/hooks/useMoney'

export function BreakdownLines({ lines }: { lines: readonly HomeMonthLineItem[] }) {
  const { t } = useTranslation('home')
  const { format } = useMoney()

  if (lines.length === 0) {
    return <EmptyState compact className="py-2" description={t('breakdownEmpty')} />
  }

  return (
    <ul className="max-h-56 space-y-1.5 overflow-y-auto text-sm leading-snug bg-slate-50 dark:bg-slate-800 rounded-md p-2 ">
      {lines.map((line) => (
        <li key={line.id} className="flex min-w-0 justify-between gap-3 tabular-nums">
          <span className="min-w-0 shrink truncate text-foreground font-normal">{line.label}</span>
          <span className="shrink-0 tabular-nums text-muted-foreground font-semibold">{format(line.amountVnd)}</span>
        </li>
      ))}
    </ul>
  )
}
