import type { MonthSnapshot } from '@/lib/budget/aggregate'
import type { ReactNode } from 'react'

import { InfoTooltip } from '@/components/patterns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { formatMonthLabel } from '@/lib/month'
import { t } from '@/lib/strings'

function HeadWithHint({
  align = 'right',
  className,
  content,
  label,
}: {
  align?: 'left' | 'right'
  className?: string
  content: ReactNode
  label: string
}) {
  return (
    <TableHead className={className ?? (align === 'right' ? 'text-right whitespace-nowrap' : 'whitespace-nowrap')}>
      <span
        className={
          align === 'right' ? 'inline-flex w-full items-center justify-end gap-0.5' : 'inline-flex items-center gap-0.5'
        }
      >
        {label}
        <InfoTooltip className="h-4 w-4 shrink-0" content={content} />
      </span>
    </TableHead>
  )
}

export function StatsTable({ formatVnd, rows }: { rows: MonthSnapshot[]; formatVnd: (n: number) => string }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <Table className="min-w-[760px]">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">{t.stats.month}</TableHead>
            <HeadWithHint
              label={t.stats.income}
              content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.stats.incomeColumnHint}</p>}
            />
            <HeadWithHint
              label={t.stats.planned}
              content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.stats.plannedHintColumn}</p>}
            />
            <HeadWithHint
              label={t.stats.actual}
              content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.stats.actualColumnHint}</p>}
            />
            <HeadWithHint
              label={t.stats.plannedSurplus}
              content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.stats.plannedSurplusColumnHint}</p>}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((s) => (
            <TableRow key={s.month}>
              <TableCell className="font-medium whitespace-nowrap">{formatMonthLabel(s.month)}</TableCell>
              <TableCell className="text-right tabular-nums whitespace-nowrap">{formatVnd(s.incomeVnd)}</TableCell>
              <TableCell className="text-right tabular-nums whitespace-nowrap">{formatVnd(s.plannedVnd)}</TableCell>
              <TableCell className="text-right tabular-nums whitespace-nowrap">{formatVnd(s.actualSpentVnd)}</TableCell>
              <TableCell className="text-right tabular-nums whitespace-nowrap text-primary">
                {formatVnd(s.plannedSurplusVnd)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
