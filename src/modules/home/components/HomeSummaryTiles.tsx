import { HandCoinsIcon, PiggyBank, TrendingUp, Wallet } from 'lucide-react'

import { MetricTile } from '@/components/patterns'
import { type HomeMonthLineItem } from '@/lib/budget/homeMonthBreakdown'
import { t } from '@/lib/strings'

import { AggregateTileContents } from './AggregateTileContents'
import { BreakdownLines } from './BreakdownLines'
import { TileTitleWithHint } from './TileTitleWithHint'

function fillMonthAmountTemplate(template: string, monthLabel: string, amountLabel: string) {
  return (
    <p
      className="text-foreground font-normal"
      dangerouslySetInnerHTML={{
        __html: template
          .replaceAll('{{monthLabel}}', monthLabel)
          .replaceAll(
            '{{amount}}',
            `<span class="font-semibold text-muted-foreground tabular-nums">${amountLabel}</span>`,
          ),
      }}
    />
  )
}

export function HomeSummaryTiles({
  actualSpentLabel,
  breakdown,
  incomeLabel,
  plannedBudgetLabel,
  plannedSavingsComposition,
  plannedSavingsToDateLabel,
  plannedSurplusLabel,
}: {
  actualSpentLabel: string
  breakdown: {
    actualLines: readonly HomeMonthLineItem[]
    incomeLines: readonly HomeMonthLineItem[]
    plannedLines: readonly HomeMonthLineItem[]
  }
  incomeLabel: string
  plannedBudgetLabel: string
  /** When set, shows prior month cumulative + next month planned surplus under the main figure. */
  plannedSavingsComposition?: {
    amountLabel: string
    monthLabel: string
    priorAmountLabel: string
    priorMonthLabel: string
  }
  plannedSavingsToDateLabel: string
  plannedSurplusLabel: string
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <MetricTile
        title={
          <span className="inline-flex items-center gap-2">
            <Wallet className="size-5 text-muted-foreground shrink-0" />
            <TileTitleWithHint
              content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.home.incomeHint}</p>}
              label={t.home.income}
            />
          </span>
        }
        contentClassName="font-normal"
      >
        <AggregateTileContents footer={<BreakdownLines lines={breakdown.incomeLines} />}>
          <span className="text-primary">{incomeLabel}</span>
        </AggregateTileContents>
      </MetricTile>
      <MetricTile
        title={
          <span className="inline-flex items-center gap-2">
            <TrendingUp className="size-5 text-muted-foreground shrink-0" />
            <TileTitleWithHint
              content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.home.plannedBudgetHint}</p>}
              label={t.home.plannedBudget}
            />
          </span>
        }
        contentClassName="font-normal"
      >
        <AggregateTileContents footer={<BreakdownLines lines={breakdown.plannedLines} />}>
          <span className="text-primary">{plannedBudgetLabel}</span>
        </AggregateTileContents>
      </MetricTile>
      <MetricTile
        title={
          <span className="inline-flex items-center gap-2">
            <HandCoinsIcon className="size-5 text-muted-foreground shrink-0" />
            <TileTitleWithHint
              content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.home.actualSpentHint}</p>}
              label={t.home.actualSpent}
            />
          </span>
        }
        contentClassName="font-normal"
      >
        <AggregateTileContents footer={<BreakdownLines lines={breakdown.actualLines} />}>
          <span className="text-primary">{actualSpentLabel}</span>
        </AggregateTileContents>
      </MetricTile>
      <MetricTile
        title={
          <span className="inline-flex items-center gap-2">
            <PiggyBank className="size-5 text-muted-foreground shrink-0" />
            <TileTitleWithHint
              content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.home.plannedSurplusHint}</p>}
              label={t.home.plannedSurplus}
            />
          </span>
        }
      >
        <span className="text-primary">{plannedSurplusLabel}</span>
      </MetricTile>
      <MetricTile
        title={
          <span className="inline-flex items-center gap-2">
            <PiggyBank className="size-5 text-muted-foreground shrink-0" />
            <TileTitleWithHint
              content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.home.plannedSavingsHint}</p>}
              label={t.home.savingsToDatePlanned}
            />
          </span>
        }
        contentClassName={plannedSavingsComposition ? 'font-normal' : undefined}
      >
        {plannedSavingsComposition ? (
          <AggregateTileContents
            footer={
              <div className="space-y-1.5 text-sm leading-snug">
                {fillMonthAmountTemplate(
                  t.home.plannedSavingsToDatePriorLine,
                  plannedSavingsComposition.priorMonthLabel,
                  plannedSavingsComposition.priorAmountLabel,
                )}
                {fillMonthAmountTemplate(
                  t.home.plannedSavingsToDatePlusSurplusLine,
                  plannedSavingsComposition.monthLabel,
                  plannedSavingsComposition.amountLabel,
                )}
              </div>
            }
          >
            <span className="text-primary">{plannedSavingsToDateLabel}</span>
          </AggregateTileContents>
        ) : (
          plannedSavingsToDateLabel
        )}
      </MetricTile>
    </div>
  )
}
