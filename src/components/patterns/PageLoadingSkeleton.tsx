import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'

import { Card, CardContent, CardHeader, Skeleton } from '../ui'

export type PageLoadingSkeletonVariant = 'default' | 'home' | 'stats'

function HeadingBlock({ showAction }: { showAction?: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-8 w-[min(100%,17rem)] max-w-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="max-w-2xl space-y-2">
          <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-4 w-[88%] bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
      {showAction ? <Skeleton className="h-10 w-[7.5rem] shrink-0 rounded-md bg-slate-200 dark:bg-slate-800" /> : null}
    </div>
  )
}

function TablePanelSkeleton({ rows }: { rows: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-28" />
      </CardHeader>
      <CardContent className="space-y-0">
        <div className="flex gap-3 border-b border-border py-2.5" role="presentation">
          <Skeleton className="h-3.5 min-w-[5rem] flex-[1.4]" />
          <Skeleton className="h-3.5 min-w-[4rem] flex-1" />
          <Skeleton className="h-3.5 w-20 shrink-0" />
          <Skeleton className="hidden h-3.5 w-24 shrink-0 sm:block" />
          <Skeleton className="h-3.5 w-16 shrink-0" />
          <Skeleton className="h-3.5 w-24 shrink-0" />
        </div>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-border/60 py-3 last:border-b-0">
            <Skeleton className="h-4 min-w-[5rem] flex-[1.4]" />
            <Skeleton className="h-6 min-w-[4rem] flex-1 rounded-full" />
            <Skeleton className="h-4 w-20 shrink-0" />
            <Skeleton className="hidden h-4 w-24 shrink-0 sm:block" />
            <Skeleton className="h-4 w-16 shrink-0" />
            <Skeleton className="ml-auto h-8 w-20 shrink-0 rounded-md" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/** Matches HomePage `PageHeading` + `description` / `descriptionClassName="text-base"`. */
function HomeHeadingSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          <span className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 flex-1">
              <span className="inline-flex min-w-0 items-center gap-2.5">
                <Skeleton className="h-7 w-7 shrink-0 rounded-md bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-8 w-[min(100%,14rem)] max-w-full bg-slate-200 dark:bg-slate-800" />
              </span>
            </span>
          </span>
        </h1>
        <div className="mt-1 space-y-2 text-pretty text-base text-muted-foreground">
          <Skeleton className="h-6 w-full max-w-2xl bg-slate-200 dark:bg-slate-800" />
          <p className="text-sm text-muted-foreground">
            <Skeleton className="h-4 w-full max-w-xl bg-slate-200 dark:bg-slate-800" />
          </p>
        </div>
      </div>
    </div>
  )
}

type HomeMetricTileFooter = 'breakdown' | 'compact' | 'savings'

/** Matches `MetricTile` + `TileTitleWithHint` + optional `AggregateTileContents` footers (HomeSummaryTiles). */
function HomeMetricTileSkeleton({ footer }: { footer: HomeMetricTileFooter }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="size-5 shrink-0 rounded-md" />
          <Skeleton className="h-6 min-w-0 flex-1 max-w-[12rem]" />
          <Skeleton className="h-5 w-5 shrink-0 rounded-sm" />
        </div>
      </CardHeader>
      <CardContent className={footer === 'compact' ? undefined : 'font-normal'}>
        {footer === 'breakdown' ? (
          <div className="space-y-3">
            <div className="text-2xl font-semibold tabular-nums">
              <Skeleton className="h-8 w-[min(100%,12rem)] max-w-full rounded-md" />
            </div>
            <div className="border-t border-border pt-3">
              <Skeleton className="h-16 w-full rounded-md" />
            </div>
          </div>
        ) : null}
        {footer === 'compact' ? (
          <div className="text-2xl font-semibold tabular-nums">
            <Skeleton className="h-8 w-[min(100%,12rem)] max-w-full rounded-md" />
          </div>
        ) : null}
        {footer === 'savings' ? (
          <div className="space-y-3">
            <div className="text-2xl font-semibold tabular-nums">
              <Skeleton className="h-8 w-[min(100%,12rem)] max-w-full rounded-md" />
            </div>
            <div className="space-y-1.5 border-t border-border pt-3 text-sm leading-snug">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[94%]" />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

/** Order matches `HomeSummaryTiles`: income, dự chi, dư dự tính, tích lũy dự, thực chi, dư thực tế, tích lũy thực tế. */
const HOME_SUMMARY_TILE_FOOTERS_FULL: readonly HomeMetricTileFooter[] = [
  'breakdown',
  'breakdown',
  'compact',
  'savings',
  'breakdown',
  'compact',
  'savings',
]

const HOME_SUMMARY_TILE_FOOTERS_PLANNED_ONLY: readonly HomeMetricTileFooter[] = [
  'breakdown',
  'breakdown',
  'compact',
  'savings',
]

/**
 * Matches HomePage `space-y-4` month block: CalendarDays + heading | pill (`formatMonthLabel`), then HomeSummaryTiles.
 */
function HomeMonthSectionSkeleton({
  monthTitleWidth,
  tiles,
}: {
  monthTitleWidth: string
  tiles: readonly HomeMetricTileFooter[]
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2">
          <Skeleton className="h-4 w-4 shrink-0 rounded-sm bg-slate-200 dark:bg-slate-800" />
          <Skeleton className={cn('h-6 shrink-0 bg-slate-200 dark:bg-slate-800', monthTitleWidth)} />
        </div>
        <Skeleton className="h-8 min-w-[4.75rem] shrink-0 rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((footer, i) =>
          i === 0 ? (
            <div key={i} className="min-w-0 lg:col-span-3">
              <HomeMetricTileSkeleton footer={footer} />
            </div>
          ) : (
            <div key={i} className="min-w-0">
              <HomeMetricTileSkeleton footer={footer} />
            </div>
          ),
        )}
      </div>
    </div>
  )
}

function StatsExtraBlock() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[148px] w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-[148px] w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
      <Skeleton className="h-10 w-full rounded-md bg-slate-200 dark:bg-slate-800" />
      <TablePanelSkeleton rows={5} />
    </>
  )
}

export type PageLoadingSkeletonProps = {
  className?: string
  showHeadingAction?: boolean
  variant?: PageLoadingSkeletonVariant
}

export function PageLoadingSkeleton({
  className,
  showHeadingAction = false,
  variant = 'default',
}: PageLoadingSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)} aria-busy="true" aria-live="polite" aria-label={t.common.loading}>
      {variant === 'home' ? (
        <>
          <HomeHeadingSkeleton />
          <HomeMonthSectionSkeleton monthTitleWidth="w-[6.5rem]" tiles={HOME_SUMMARY_TILE_FOOTERS_FULL} />
          <HomeMonthSectionSkeleton monthTitleWidth="w-[5.75rem]" tiles={HOME_SUMMARY_TILE_FOOTERS_PLANNED_ONLY} />
        </>
      ) : (
        <HeadingBlock showAction={showHeadingAction} />
      )}
      {variant === 'stats' ? <StatsExtraBlock /> : null}
      {variant === 'default' ? <TablePanelSkeleton rows={6} /> : null}
    </div>
  )
}
