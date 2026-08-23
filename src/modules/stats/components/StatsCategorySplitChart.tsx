import type { CategoryIncomeSplit } from '@/lib/budget/categoryIncomeSplit'
import type { Category } from '@/lib/types'
import type { TooltipContentProps, TooltipPayloadEntry } from 'recharts'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Cell, Label, Pie, PieChart } from 'recharts'

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartTooltipRow,
} from '@/components/ui'
import { useMoney } from '@/hooks/useMoney'
import { leftoverSharePercent, overspentSharePercent } from '@/lib/budget/incomeSplit'

const viCollator = new Intl.Collator('vi-VN', { sensitivity: 'base' })

const LEFTOVER_KEY = 'leftoverVnd'

const LEFTOVER_HUE = 217

const CATEGORY_COLORS = [
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(var(--chart-7))',
  'hsl(var(--chart-8))',
  'hsl(var(--chart-9))',
  'hsl(var(--chart-10))',
] as const

/** Theme tokens first, then spaced hues so two slices never share a color. */
function categorySliceColor(index: number): string {
  const token = CATEGORY_COLORS[index]
  if (token) return token
  let hue = Math.round((index * 137.508 + 12) % 360)
  if (Math.abs(hue - LEFTOVER_HUE) < 18) hue = (hue + 36) % 360
  const lightness = 40 + ((index * 17) % 22)
  return `hsl(${hue} 72% ${lightness}%)`
}

type Slice = {
  fill: string
  key: string
  value: number
}

function slicePercentOfIncome(value: number, incomeVnd: number, pieTotal: number): number {
  if (incomeVnd > 0) return Math.round((value / incomeVnd) * 100)
  if (pieTotal > 0) return Math.round((value / pieTotal) * 100)
  return 0
}

function sliceKey(categoryId: null | string): string {
  if (categoryId == null) return 'uncategorized'
  return `c_${categoryId.replace(/[^a-zA-Z0-9_-]/g, '_')}`
}

export function StatsCategorySplitChart({ categories, split }: { categories: Category[]; split: CategoryIncomeSplit }) {
  const { t } = useTranslation('stats')
  const { format } = useMoney()

  const leftoverLabel = t('chartLeftover')

  const labeled = useMemo(() => {
    const nameById = new Map(categories.map((c) => [c.id, c.name]))
    return [...split.slices]
      .map((row) => ({
        amountVnd: row.amountVnd,
        key: sliceKey(row.categoryId),
        label:
          row.categoryId == null ? t('chartUncategorized') : (nameById.get(row.categoryId) ?? t('chartUncategorized')),
      }))
      .sort((a, b) => {
        const byAmount = b.amountVnd - a.amountVnd
        if (byAmount !== 0) return byAmount
        return viCollator.compare(a.label, b.label)
      })
  }, [categories, split.slices, t])

  const config = useMemo(() => {
    const next: ChartConfig = {
      leftoverVnd: { color: 'hsl(var(--chart-1))', label: leftoverLabel },
    }
    labeled.forEach((row, index) => {
      next[row.key] = { color: categorySliceColor(index), label: row.label }
    })
    return next
  }, [labeled, leftoverLabel])

  const slices = useMemo(() => {
    const rows: Slice[] = labeled.map((row) => ({
      fill: `var(--color-${row.key})`,
      key: row.key,
      value: row.amountVnd,
    }))
    if (split.leftoverVnd > 0) {
      rows.push({ fill: 'var(--color-leftoverVnd)', key: LEFTOVER_KEY, value: split.leftoverVnd })
    }
    return rows.filter((row) => row.value > 0)
  }, [labeled, split.leftoverVnd])

  const pieTotal = slices.reduce((sum, row) => sum + row.value, 0)
  const actualSpentVnd = labeled.reduce((sum, row) => sum + row.amountVnd, 0)
  const isOverspent = split.overspentVnd > 0
  const leftoverPct = leftoverSharePercent(split)
  const overspentPct = overspentSharePercent(split)
  const centerPct = isOverspent ? overspentPct : leftoverPct
  const isEmpty = split.incomeVnd === 0 && actualSpentVnd === 0

  const PieTooltip = useMemo(() => {
    return function TooltipRenderer({ active, payload }: Partial<TooltipContentProps<number, string>>) {
      if (!active || !payload?.length) return null
      const entry = payload[0] as TooltipPayloadEntry | undefined
      const slice = entry?.payload as Slice | undefined
      if (!slice) return null
      const label = (config[slice.key]?.label as string) ?? slice.key
      const pct = slicePercentOfIncome(slice.value, split.incomeVnd, pieTotal)
      const rows: ChartTooltipRow[] = [
        {
          color: entry?.color ?? entry?.fill ?? slice.fill,
          label,
          value: `${format(slice.value)} (${pct}%)`,
        },
      ]
      return <ChartTooltipContent active rows={rows} />
    }
  }, [config, format, pieTotal, split.incomeVnd])

  if (isEmpty) {
    return <p className="px-4 py-10 text-center text-sm text-muted-foreground">{t('chartIncomeSplitEmpty')}</p>
  }

  return (
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
                      {isOverspent ? t('chartIncomeSplitCenterOver') : t('chartIncomeSplitCenter')}
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
              style={{ backgroundColor: config[row.key]?.color }}
            />
            {config[row.key]?.label}
          </span>
        ))}
      </div>
      {split.overspentVnd > 0 ? (
        <p className="px-2 text-center text-xs text-destructive">
          {t('chartIncomeSplitOverspent', {
            amount: format(split.overspentVnd),
            percent: overspentPct,
          })}
        </p>
      ) : null}
    </div>
  )
}
