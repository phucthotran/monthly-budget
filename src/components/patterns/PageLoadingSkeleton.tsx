import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'

import { Card, CardContent, CardHeader, Skeleton } from '../ui'

export type PageLoadingSkeletonVariant = 'default' | 'home' | 'stats'

function HeadingBlock({ showAction }: { showAction?: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
          <Skeleton className="h-8 w-[min(100%,17rem)] max-w-full" />
        </div>
        <div className="max-w-2xl space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[88%]" />
        </div>
      </div>
      {showAction ? <Skeleton className="h-10 w-[7.5rem] shrink-0 rounded-md" /> : null}
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

/** Matches HomePage `PageHeading`: h1 icon+title (gap-2.5), then description with mt-1 (base + sm). */
function HomeHeadingSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          <span className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 flex-1">
              <span className="inline-flex min-w-0 items-center gap-2.5">
                <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
                <Skeleton className="h-8 w-[min(100%,14rem)] max-w-full" />
              </span>
            </span>
          </span>
        </h1>
        <div className="text-muted-foreground mt-1 max-w-2xl space-y-2 text-pretty text-base">
          <Skeleton className="h-5 w-full" />
          <div className="text-sm">
            <Skeleton className="h-4 w-[92%]" />
          </div>
        </div>
      </div>
    </div>
  )
}

/** One MetricTile-shaped card (icon + label row, large amount below). */
function HomeMetricTileSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="size-5 shrink-0 rounded" />
          <Skeleton className="h-4 min-w-0 flex-1 max-w-[11rem]" />
          <Skeleton className="size-5 shrink-0 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-40 max-w-[85%] rounded-md" />
      </CardContent>
    </Card>
  )
}

/**
 * Matches HomePage `space-y-4` month block: CalendarDays + title | pill, then HomeSummaryTiles grid (5 tiles).
 */
function HomeMonthSectionSkeleton({ monthTitleWidth }: { monthTitleWidth: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex min-w-0 items-center gap-2">
          <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
          <Skeleton className={cn('h-5 shrink-0', monthTitleWidth)} />
        </div>
        <Skeleton className="h-7 w-[4.75rem] shrink-0 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 5 }, (_, i) => (
          <HomeMetricTileSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

function StatsExtraBlock() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[148px] w-full rounded-lg" />
        <Skeleton className="h-[148px] w-full rounded-lg" />
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
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
          <HomeMonthSectionSkeleton monthTitleWidth="w-[6.5rem]" />
          <HomeMonthSectionSkeleton monthTitleWidth="w-[5.75rem]" />
        </>
      ) : (
        <HeadingBlock showAction={showHeadingAction} />
      )}
      {variant === 'stats' ? <StatsExtraBlock /> : null}
      {variant === 'default' ? <TablePanelSkeleton rows={6} /> : null}
    </div>
  )
}
