import type { MonthSnapshot } from '@/lib/budget/aggregate'
import type { BudgetItem, IncomePeriod, MonthKey } from '@/lib/types'
import type { TooltipContentProps, TooltipPayloadEntry } from 'recharts'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts'

import { YearFilterSelect } from '@/components/inputs'
import { Panel } from '@/components/patterns'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartTooltipRow,
} from '@/components/ui'
import { useMoney } from '@/hooks/useMoney'
import { formatMonthLabel, formatMonthLabelShort } from '@/lib/month'

import { buildChartYearSnapshots } from '../buildChartYearSnapshots'
import { useStatsChartYearState } from '../hooks/useStatsChartYearState'

type Props = {
  actuals: { spentMonth: MonthKey; amountVnd: number }[]
  budget: BudgetItem[]
  income: IncomePeriod[]
}

type ChartEntry = { label: string; shortLabel: string } & MonthSnapshot

function makeTooltip(config: ChartConfig, format: (n: number) => string) {
  return function TooltipRenderer({ active, payload }: Partial<TooltipContentProps<number, string>>) {
    if (!active || !payload?.length) return null
    const heading = (payload[0]?.payload as ChartEntry | undefined)?.label
    const rows: ChartTooltipRow[] = payload
      .filter((p: TooltipPayloadEntry) => p.value !== undefined)
      .map((p: TooltipPayloadEntry) => ({
        color: p.color ?? p.fill,
        label: (config[p.dataKey as string]?.label as string) ?? p.name ?? String(p.dataKey),
        value: format(p.value as number),
      }))
    return <ChartTooltipContent active headingLabel={heading} rows={rows} />
  }
}

const xAxisProps = {
  axisLine: false,
  dataKey: 'shortLabel',
  tick: { fontSize: 11 },
  tickLine: false,
} as const

// ─── Component ────────────────────────────────────────────────────────────────

export function StatsCharts({ actuals, budget, income }: Props) {
  const { t } = useTranslation('stats')
  const { format, formatShort } = useMoney()
  const { filterYear, setFilterYear, yearOptions } = useStatsChartYearState()

  const cashflowConfig = useMemo(
    () =>
      ({
        actualSpentVnd: { color: 'hsl(var(--chart-3))', label: t('chartActual') },
        incomeVnd: { color: 'hsl(var(--chart-1))', label: t('chartIncome') },
        plannedVnd: { color: 'hsl(var(--chart-2))', label: t('chartPlanned') },
      }) satisfies ChartConfig,
    [t],
  )

  const surplusConfig = useMemo(
    () =>
      ({
        actualSurplusVnd: { color: 'hsl(var(--chart-3))', label: t('chartActualSurplus') },
        plannedSurplusVnd: { color: 'hsl(var(--chart-2))', label: t('chartPlannedSurplus') },
      }) satisfies ChartConfig,
    [t],
  )

  const savingsConfig = useMemo(
    () =>
      ({
        actualSavingsToDateVnd: { color: 'hsl(var(--chart-3))', label: t('chartActualSavings') },
        plannedSavingsToDateVnd: { color: 'hsl(var(--chart-2))', label: t('chartPlannedSavings') },
      }) satisfies ChartConfig,
    [t],
  )

  const CashflowTooltip = useMemo(() => makeTooltip(cashflowConfig, format), [cashflowConfig, format])
  const SurplusTooltip = useMemo(() => makeTooltip(surplusConfig, format), [format, surplusConfig])
  const SavingsTooltip = useMemo(() => makeTooltip(savingsConfig, format), [format, savingsConfig])

  const yAxisProps = useMemo(
    () =>
      ({
        axisLine: false,
        tick: { fontSize: 10 },
        tickFormatter: formatShort,
        tickLine: false,
        width: 40,
      }) as const,
    [formatShort],
  )

  const snaps = useMemo(
    () => buildChartYearSnapshots(filterYear, income, budget, actuals),
    [actuals, budget, filterYear, income],
  )

  const chartData: ChartEntry[] = useMemo(
    () =>
      snaps.map((s) => ({
        ...s,
        label: formatMonthLabel(s.month),
        shortLabel: formatMonthLabelShort(s.month),
      })),
    [snaps],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{t('chartSectionTitle')}</h2>
        <YearFilterSelect value={filterYear} years={yearOptions} onValueChange={setFilterYear} />
      </div>

      {/* Chart 1: Cashflow */}
      <Panel bodyClassName="overflow-visible px-2 pb-3 pt-1" title={t('chartTitleCashflow')}>
        <ChartContainer className="h-[220px] w-full sm:h-[260px]" config={cashflowConfig}>
          <AreaChart data={chartData} margin={{ bottom: 0, left: 0, right: 8, top: 4 }}>
            <defs>
              <linearGradient id="gIncome" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-incomeVnd)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-incomeVnd)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gPlanned" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-plannedVnd)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-plannedVnd)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gActual" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-actualSpentVnd)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-actualSpentVnd)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <ChartTooltip content={<CashflowTooltip />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="incomeVnd"
              dot={false}
              fill="url(#gIncome)"
              stroke="var(--color-incomeVnd)"
              strokeWidth={2}
              type="monotone"
            />
            <Area
              dataKey="plannedVnd"
              dot={false}
              fill="url(#gPlanned)"
              stroke="var(--color-plannedVnd)"
              strokeWidth={2}
              type="monotone"
            />
            <Area
              dataKey="actualSpentVnd"
              dot={false}
              fill="url(#gActual)"
              stroke="var(--color-actualSpentVnd)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      </Panel>

      {/* Chart 2: Surplus */}
      <Panel bodyClassName="overflow-visible px-2 pb-3 pt-1" title={t('chartTitleSurplus')}>
        <ChartContainer className="h-[200px] w-full sm:h-[240px]" config={surplusConfig}>
          <BarChart barGap={2} data={chartData} margin={{ bottom: 0, left: 0, right: 8, top: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <ReferenceLine stroke="hsl(var(--border))" strokeWidth={1} y={0} />
            <ChartTooltip content={<SurplusTooltip />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="plannedSurplusVnd" fill="var(--color-plannedSurplusVnd)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="actualSurplusVnd" fill="var(--color-actualSurplusVnd)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </Panel>

      {/* Chart 3: Cumulative savings */}
      <Panel bodyClassName="overflow-visible px-2 pb-3 pt-1" title={t('chartTitleSavings')}>
        <ChartContainer className="h-[200px] w-full sm:h-[240px]" config={savingsConfig}>
          <AreaChart data={chartData} margin={{ bottom: 0, left: 0, right: 8, top: 4 }}>
            <defs>
              <linearGradient id="gPlannedSav" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-plannedSavingsToDateVnd)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-plannedSavingsToDateVnd)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gActualSav" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-actualSavingsToDateVnd)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-actualSavingsToDateVnd)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <ReferenceLine stroke="hsl(var(--border))" strokeWidth={1} y={0} />
            <ChartTooltip content={<SavingsTooltip />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="plannedSavingsToDateVnd"
              dot={false}
              fill="url(#gPlannedSav)"
              stroke="var(--color-plannedSavingsToDateVnd)"
              strokeWidth={2}
              type="monotone"
            />
            <Area
              dataKey="actualSavingsToDateVnd"
              dot={false}
              fill="url(#gActualSav)"
              stroke="var(--color-actualSavingsToDateVnd)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      </Panel>
    </div>
  )
}
