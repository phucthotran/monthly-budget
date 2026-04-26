import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type PageHeadingProps = {
  title: ReactNode
  description?: ReactNode
  /** Nút / nhóm hành động bên phải (desktop). */
  actions?: ReactNode
  className?: string
  descriptionClassName?: string
}

/** Tiêu đề trang + mô tả + vùng actions — dùng chung mọi màn hình nội dung. */
export function PageHeading({ actions, className, description, descriptionClassName, title }: PageHeadingProps) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description != null ? (
          <p className={cn('text-muted-foreground mt-1 text-sm', descriptionClassName)}>{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">{actions}</div> : null}
    </div>
  )
}
