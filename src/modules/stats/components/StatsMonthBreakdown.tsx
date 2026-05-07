import type { HomeMonthLineItem } from '@/lib/budget/homeMonthBreakdown'

import { ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button, TableCell, TableRow } from '@/components/ui'
import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'

import { StatsTableColgroup } from '../statsTableColgroup'

const PREVIEW_LINE_CAP = 2

type Tagged = { actual?: HomeMonthLineItem; planned: HomeMonthLineItem }

function buildTagged(plannedLines: readonly HomeMonthLineItem[], actualLines: readonly HomeMonthLineItem[]): Tagged[] {
  return plannedLines.map((p) => ({ actual: actualLines.find((a) => a.id === p.id), planned: p }) as Tagged)
}

function BreakdownNestedTable({ formatVnd, rows }: { formatVnd: (n: number) => string; rows: Tagged[] }) {
  return (
    <table className="w-full table-fixed border-collapse text-sm">
      <StatsTableColgroup />
      <tbody>
        {rows.map((row, index) => {
          const plannedVnd = row.planned.amountVnd
          const actualVnd = row.actual?.amountVnd ?? 0

          return (
            <tr
              key={`${row.planned.id}-${String(index)}`}
              className="border-b border-border/60 bg-muted/30 last:border-b-0"
            >
              <td className="min-w-0 p-2 align-middle font-normal text-foreground">
                <span className="block line-clamp-2 text-left leading-snug">{row.planned.label}</span>
              </td>
              <td className="p-2 text-right align-middle tabular-nums">{'\u200b'}</td>
              <td className="p-2 text-right align-middle tabular-nums">{formatVnd(plannedVnd)}</td>
              <td className="align-middle whitespace-nowrap p-2 text-right tabular-nums">{formatVnd(actualVnd)}</td>
              <td className="align-middle whitespace-nowrap p-2 text-right tabular-nums">
                {formatVnd(Math.abs(plannedVnd - actualVnd))}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export function StatsMonthDetailRows({
  actualLines,
  formatVnd,
  plannedLines,
}: {
  formatVnd: (n: number) => string
  actualLines: readonly HomeMonthLineItem[]
  plannedLines: readonly HomeMonthLineItem[]
}) {
  const taggedRows = useMemo(() => buildTagged(plannedLines, actualLines), [plannedLines, actualLines])
  const rowCount = taggedRows.length
  const needsToggle = rowCount > PREVIEW_LINE_CAP
  const [expanded, setExpanded] = useState(false)

  const showCompactPreview = needsToggle && !expanded
  const visibleRows = showCompactPreview ? taggedRows.slice(0, PREVIEW_LINE_CAP) : taggedRows

  if (rowCount === 0) {
    return null
  }

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="p-0" colSpan={5}>
        <div className="border-b border-border bg-muted/30">
          {!needsToggle ? (
            <div>
              <BreakdownNestedTable formatVnd={formatVnd} rows={visibleRows} />
            </div>
          ) : (
            <>
              <div
                className={cn(
                  'overflow-hidden py-2 transition-[max-height] duration-300 ease-in-out',
                  showCompactPreview ? 'max-h-[6.25rem]' : 'max-h-[min(3200px,90vh)]',
                  'motion-reduce:transition-none motion-reduce:max-h-none',
                )}
              >
                <BreakdownNestedTable formatVnd={formatVnd} rows={visibleRows} />
              </div>
              <div className="flex justify-center border-t border-border/80 py-2">
                <Button
                  className="gap-1.5 text-muted-foreground"
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setExpanded((v) => !v)
                  }}
                >
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      'h-4 w-4 duration-300 ease-out motion-reduce:transition-none motion-reduce:duration-0',
                      expanded ? '-rotate-180' : 'rotate-0',
                      'transition-transform',
                    )}
                  />
                  {expanded ? t.stats.collapseMonthBreakdown : t.stats.expandMonthBreakdown}
                </Button>
              </div>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
