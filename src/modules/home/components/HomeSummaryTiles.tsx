import { Banknote, HandCoinsIcon, Landmark, PiggyBank, TrendingUp, Wallet } from 'lucide-react'

import { MetricTile } from '@/components/patterns'
import { type HomeMonthLineItem } from '@/lib/budget/homeMonthBreakdown'
import { t } from '@/lib/strings'

import { AggregateTileContents } from './AggregateTileContents'
import { BreakdownLines } from './BreakdownLines'
import { TileTitleWithHint } from './TileTitleWithHint'

export type HomeSummaryTilesSharedProps = {
  breakdown: {
    actualLines: readonly HomeMonthLineItem[]
    incomeLines: readonly HomeMonthLineItem[]
    plannedLines: readonly HomeMonthLineItem[]
  }
  incomeLabel: string
  plannedBudgetLabel: string
  plannedSavingsComposition?: {
    amountLabel: string
    monthLabel: string
    priorAmountLabel: string
    priorMonthLabel: string
    /** Footnote line for carry-in: planned cumulative vs actual cumulative prior to {{monthLabel}}. */
    priorBasis?: 'actual' | 'planned'
  }
  /** Overrides default `t.home.plannedSavingsHint` for this tile row (e.g. next-month projection). */
  plannedSavingsHint?: string
  plannedSavingsToDateLabel: string
  plannedSurplusLabel: string
}

export type HomeSummaryTilesProps =
  | ({
      plannedOverviewOnly: true
    } & HomeSummaryTilesSharedProps)
  | ({
      plannedOverviewOnly?: false
      actualSavingsComposition?: {
        amountLabel: string
        monthLabel: string
        priorAmountLabel: string
        priorMonthLabel: string
      }
      actualSavingsToDateLabel: string
      actualSpentLabel: string
      actualSurplusLabel: string
    } & HomeSummaryTilesSharedProps)

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

export function HomeSummaryTiles(props: HomeSummaryTilesProps) {
  const {
    breakdown,
    incomeLabel,
    plannedBudgetLabel,
    plannedSavingsComposition,
    plannedSavingsHint: plannedSavingsHintOverride,
    plannedSavingsToDateLabel,
    plannedSurplusLabel,
  } = props
  const plannedSavingsHintText = plannedSavingsHintOverride ?? t.home.plannedSavingsHint
  const plannedOverviewOnly = props.plannedOverviewOnly === true
  const actualSavingsComposition = 'actualSavingsComposition' in props ? props.actualSavingsComposition : undefined
  const actualSavingsToDateLabel = 'actualSavingsToDateLabel' in props ? props.actualSavingsToDateLabel : ''
  const actualSpentLabel = 'actualSpentLabel' in props ? props.actualSpentLabel : ''
  const actualSurplusLabel = 'actualSurplusLabel' in props ? props.actualSurplusLabel : ''

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
      <MetricTile
        className="min-w-0 lg:col-span-2"
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
        className="min-w-0"
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
      <div className="flex flex-col gap-4">
        <MetricTile
          className="min-w-0 flex-1"
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
          className="min-w-0 flex-1"
          title={
            <span className="inline-flex items-center gap-2">
              <PiggyBank className="size-5 text-muted-foreground shrink-0" />
              <TileTitleWithHint
                content={<p className="max-w-xs text-pretty text-sm leading-snug">{plannedSavingsHintText}</p>}
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
                    plannedSavingsComposition.priorBasis === 'actual'
                      ? t.home.actualSavingsToDatePriorLine
                      : t.home.plannedSavingsToDatePriorLine,
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

      {!plannedOverviewOnly ? (
        <MetricTile
          className="min-w-0"
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
      ) : null}
      <div className="flex flex-col gap-4">
        {!plannedOverviewOnly ? (
          <MetricTile
            className="min-w-0 flex-1"
            title={
              <span className="inline-flex items-center gap-2">
                <Banknote className="size-5 text-muted-foreground shrink-0" />
                <TileTitleWithHint
                  content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.home.actualSurplusHint}</p>}
                  label={t.home.actualSurplus}
                />
              </span>
            }
          >
            <span className="text-primary">{actualSurplusLabel}</span>
          </MetricTile>
        ) : null}
        {!plannedOverviewOnly ? (
          <MetricTile
            className="min-w-0 flex-1"
            title={
              <span className="inline-flex items-center gap-2">
                <Landmark className="size-5 text-muted-foreground shrink-0" />
                <TileTitleWithHint
                  content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.home.actualSavingsHint}</p>}
                  label={t.home.savingsToDateActual}
                />
              </span>
            }
            contentClassName={actualSavingsComposition ? 'font-normal' : undefined}
          >
            {actualSavingsComposition ? (
              <AggregateTileContents
                footer={
                  <div className="space-y-1.5 text-sm leading-snug">
                    {fillMonthAmountTemplate(
                      t.home.actualSavingsToDatePriorLine,
                      actualSavingsComposition.priorMonthLabel,
                      actualSavingsComposition.priorAmountLabel,
                    )}
                    {fillMonthAmountTemplate(
                      t.home.actualSavingsToDatePlusSurplusLine,
                      actualSavingsComposition.monthLabel,
                      actualSavingsComposition.amountLabel,
                    )}
                  </div>
                }
              >
                <span className="text-primary">{actualSavingsToDateLabel}</span>
              </AggregateTileContents>
            ) : (
              actualSavingsToDateLabel
            )}
          </MetricTile>
        ) : null}
      </div>
    </div>
  )
}
