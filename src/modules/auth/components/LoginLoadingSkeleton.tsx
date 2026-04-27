import { AuthCard } from '@/components/patterns'
import { Skeleton } from '@/components/ui'
import { t } from '@/lib/strings'

export function LoginLoadingSkeleton() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <AuthCard title={<Skeleton className="h-7 w-44" />} description={<Skeleton className="mt-1 h-4 w-56" />}>
        <div className="space-y-4" aria-busy="true" aria-live="polite" aria-label={t.common.loading}>
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="mx-auto h-4 w-48" />
        </div>
      </AuthCard>
    </div>
  )
}
