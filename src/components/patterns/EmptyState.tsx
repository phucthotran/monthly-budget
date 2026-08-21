import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type EmptyStateProps = {
  action?: ReactNode
  className?: string
  compact?: boolean
  description?: ReactNode
  icon?: ReactNode
  title?: ReactNode
}

export function EmptyState({ action, className, compact = false, description, icon, title }: EmptyStateProps) {
  if (compact) {
    return (
      <div className={cn('flex flex-col items-center gap-2 py-4 text-center', className)}>
        {title != null ? <p className="text-sm font-medium text-foreground">{title}</p> : null}
        {description != null ? <p className="text-sm text-muted-foreground text-pretty">{description}</p> : null}
        {action != null ? <div className="pt-1">{action}</div> : null}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center gap-3 px-4 py-10 text-center', className)}>
      {icon != null ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:h-6 [&_svg]:w-6">
          {icon}
        </div>
      ) : null}
      {title != null ? <p className="text-base font-medium text-foreground">{title}</p> : null}
      {description != null ? <p className="max-w-sm text-sm text-muted-foreground text-pretty">{description}</p> : null}
      {action != null ? <div className="pt-1">{action}</div> : null}
    </div>
  )
}
