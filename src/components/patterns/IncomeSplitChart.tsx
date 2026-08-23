import type { TooltipContentProps, TooltipPayloadEntry } from 'recharts'

import { useMemo } from 'react'
import { Cell, Label, Pie, PieChart } from 'recharts'

import { useMoney } from '@/hooks/useMoney'
import { type IncomeSplit, overspentSharePercent } from '@/lib/budget/incomeSplit'

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, type ChartTooltipRow } from '../ui'

import { Panel } from './Panel'

type SliceKey = 'actualSpentVnd' | 'leftoverVnd'

type Slice = {
  fill: string
  key: SliceKey
  value: number
}

export type IncomeSplitChartProps = {
  actualLabel: string
  centerLabel: string
  centerOverspentLabel: string
  className?: string
  empty: string
  leftoverLabel: string
  overspent: string
  split: IncomeSplit
  title: string
}

function leftoverSharePercent(split: IncomeSplit): number {
  if (split.incomeVnd <= 0) return 0
  return Math.round((split.leftoverVnd / split.incomeVnd) * 100)
}

function slicePercentOfIncome(value: number, split: IncomeSplit, pieTotal: number): number {
  if (split.incomeVnd > 0) return Math.round((value / split.incomeVnd) * 100)
  if (pieTotal > 0) return Math.round((value / pieTotal) * 100)
  return 0
}

export function IncomeSplitChart({
  actualLabel,
  centerLabel,
  centerOverspentLabel,
  className,
  empty,
  leftoverLabel,
  overspent,
  split,
  title,
}: IncomeSplitChartProps) {
  const { format } = useMoney()

  const config = useMemo(
    () =>
      ({
        actualSpentVnd: { color: 'hsl(var(--chart-3))', label: actualLabel },
        leftoverVnd: { color: 'hsl(var(--chart-1))', label: leftoverLabel },
      }) satisfies ChartConfig,
    [actualLabel, leftoverLabel],
  )

  const slices = useMemo(() => {
    const rows: Slice[] = [
      { fill: 'var(--color-actualSpentVnd)', key: 'actualSpentVnd', value: split.actualSpentVnd },
      { fill: 'var(--color-leftoverVnd)', key: 'leftoverVnd', value: split.leftoverVnd },
    ]
    return rows.filter((row) => row.value > 0)
  }, [split.actualSpentVnd, split.leftoverVnd])

  const pieTotal = slices.reduce((sum, row) => sum + row.value, 0)
  const isOverspent = split.overspentVnd > 0
  const leftoverPct = leftoverSharePercent(split)
  const overspentPct = overspentSharePercent(split)
  const centerPct = isOverspent ? overspentPct : leftoverPct
  const isEmpty = split.incomeVnd === 0 && split.actualSpentVnd === 0

  const PieTooltip = useMemo(() => {
    return function TooltipRenderer({ active, payload }: Partial<TooltipContentProps<number, string>>) {
      if (!active || !payload?.length) return null
      const entry = payload[0] as TooltipPayloadEntry | undefined
      const slice = entry?.payload as Slice | undefined
      if (!slice) return null
      const label = (config[slice.key]?.label as string) ?? slice.key
      const pct = slicePercentOfIncome(slice.value, split, pieTotal)
      const rows: ChartTooltipRow[] = [
        {
          color: entry?.color ?? entry?.fill ?? slice.fill,
          label,
          value: `${format(slice.value)} (${pct}%)`,
        },
      ]
      return <ChartTooltipContent active rows={rows} />
    }
  }, [config, format, pieTotal, split])

  return (
    <Panel bodyClassName="overflow-visible px-2 pb-3 pt-1" className={className} title={title}>
      {isEmpty ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="space-y-2">
          <ChartContainer className="mx-auto h-[200px] w-full max-w-[16rem] sm:h-[220px]" config={config}>
            <PieChart>
              <ChartTooltip content={<PieTooltip />} />
              <Pie
                data={slices}
                dataKey="value"
                innerRadius={58}
                nameKey="key"
                outerRadius={80}
                paddingAngle={slices.length > 1 ? 2 : 0}
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {slices.map((row) => (
                  <Cell key={row.key} fill={row.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null
                    const cx = viewBox.cx
                    const cy = viewBox.cy
                    if (cx == null || cy == null) return null
                    return (
                      <text dominantBaseline="middle" textAnchor="middle" x={cx} y={cy}>
                        <tspan
                          className={`text-lg font-semibold ${isOverspent ? 'fill-destructive' : 'fill-foreground'}`}
                          x={cx}
                          y={cy}
                        >
                          {centerPct}%
                        </tspan>
                        <tspan className="fill-muted-foreground text-[11px]" x={cx} y={cy + 18}>
                          {isOverspent ? centerOverspentLabel : centerLabel}
                        </tspan>
                      </text>
                    )
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1">
            {slices.map((row) => (
              <span key={row.key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: config[row.key].color }}
                />
                {config[row.key].label}
              </span>
            ))}
          </div>
          {split.overspentVnd > 0 ? <p className="px-2 text-center text-xs text-destructive">{overspent}</p> : null}
        </div>
      )}
    </Panel>
  )
}
