import * as React from 'react'
import { Legend, ResponsiveContainer, Tooltip } from 'recharts'

import { cn } from '@/lib/utils'

// ─── Config ──────────────────────────────────────────────────────────────────

export type ChartConfig = Record<
  string,
  {
    color?: string
    label?: React.ReactNode
    theme?: { dark: string; light: string }
  }
>

// ─── Context ─────────────────────────────────────────────────────────────────

type ChartContextValue = { config: ChartConfig; id: string }
const ChartContext = React.createContext<ChartContextValue | null>(null)

function useChart() {
  const ctx = React.useContext(ChartContext)
  if (!ctx) throw new Error('useChart must be inside <ChartContainer>')
  return ctx
}

// ─── CSS variable injection ───────────────────────────────────────────────────

function ChartStyle({ config, id }: { config: ChartConfig; id: string }) {
  const entries = Object.entries(config).filter(([, c]) => c.color ?? c.theme)
  if (!entries.length) return null

  const light = entries
    .map(([k, c]) => `  --color-${k}: ${c.theme?.light ?? c.color ?? ''};`)
    .filter((l) => !l.endsWith(': ;'))
    .join('\n')

  const dark = entries
    .map(([k, c]) => `  --color-${k}: ${c.theme?.dark ?? c.color ?? ''};`)
    .filter((l) => !l.endsWith(': ;'))
    .join('\n')

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart="${id}"] {\n${light}\n}\n.dark [data-chart="${id}"] {\n${dark}\n}`,
      }}
    />
  )
}

// ─── Container ───────────────────────────────────────────────────────────────

export function ChartContainer({
  children,
  className,
  config,
  id,
  ...props
}: {
  children: React.ComponentProps<typeof ResponsiveContainer>['children']
  className?: string
  config: ChartConfig
  id?: string
} & Omit<React.ComponentProps<'div'>, 'children'>) {
  const uid = React.useId()
  const chartId = `chart-${id ?? uid.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config, id: chartId }}>
      <div
        data-chart={chartId}
        className={cn(
          'flex justify-center text-xs',
          '[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground',
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50",
          '[&_.recharts-surface]:overflow-visible',
          className,
        )}
        {...props}
      >
        <ChartStyle config={config} id={chartId} />
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

export const ChartTooltip = Tooltip

export type ChartTooltipRow = {
  color?: string
  label: string
  value: string
}

/** Fully custom tooltip content — avoids recharts v3 type incompatibilities. */
export function ChartTooltipContent({
  active,
  className,
  headingLabel,
  rows,
}: {
  active?: boolean
  className?: string
  headingLabel?: string
  rows?: ChartTooltipRow[]
}) {
  if (!active || !rows?.length) return null

  return (
    <div
      className={cn(
        'grid min-w-[10rem] gap-1.5 rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl',
        className,
      )}
    >
      {headingLabel && <p className="mb-0.5 font-medium text-foreground">{headingLabel}</p>}
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            {row.color && (
              <span className="inline-block h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: row.color }} />
            )}
            {row.label}
          </span>
          <span className="font-mono font-medium tabular-nums text-foreground">{row.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Legend ──────────────────────────────────────────────────────────────────

export const ChartLegend = Legend

export function ChartLegendContent({
  className,
  payload,
}: {
  className?: string
  payload?: Array<{ color?: string; dataKey?: string; value?: string }>
}) {
  const { config } = useChart()
  if (!payload?.length) return null

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-2', className)}>
      {payload.map((item) => {
        const key = String(item.dataKey ?? item.value ?? '')
        const cfg = config[key]
        return (
          <span key={key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="inline-block h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
            {cfg?.label ?? item.value}
          </span>
        )
      })}
    </div>
  )
}
