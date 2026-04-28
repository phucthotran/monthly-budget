import type { HomeMonthLineItem } from '@/lib/budget/homeMonthBreakdown'

import { t } from '@/lib/strings'
import { formatVnd } from '@/lib/vnd'

export function BreakdownLines({ lines }: { lines: readonly HomeMonthLineItem[] }) {
  if (lines.length === 0) {
    return <p className="text-sm leading-snug text-muted-foreground">{t.home.breakdownEmpty}</p>
  }

  return (
    <ul className="max-h-56 space-y-1.5 overflow-y-auto text-sm leading-snug bg-slate-50 dark:bg-slate-800 rounded-md p-2 ">
      {lines.map((line) => (
        <li key={line.id} className="flex min-w-0 justify-between gap-3 tabular-nums">
          <span className="min-w-0 shrink truncate text-foreground font-normal">{line.label}</span>
          <span className="shrink-0 tabular-nums text-muted-foreground font-semibold">{formatVnd(line.amountVnd)}</span>
        </li>
      ))}
    </ul>
  )
}
