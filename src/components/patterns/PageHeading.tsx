import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { MobileBackButton } from './MobileBackButton'

export type PageHeadingProps = {
  title: ReactNode
  /** Có thể là đoạn văn hoặc khối HTML (nhiều thẻ p, danh sách). */
  description?: ReactNode
  /** Icon cùng hàng với tiêu đề (ví dụ icon trùng sidebar). */
  icon?: ReactNode
  /** Nút / nhóm hành động bên phải (desktop). */
  actions?: ReactNode
  className?: string
  descriptionClassName?: string
  /** Ẩn nút quay lại trên mobile (mặc định hiện trừ khi đang ở trang chủ). */
  hideMobileBack?: boolean
}

/** Tiêu đề trang + mô tả + vùng actions — dùng chung mọi màn hình nội dung. */
export function PageHeading({
  actions,
  className,
  description,
  descriptionClassName,
  hideMobileBack,
  icon,
  title,
}: PageHeadingProps) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          <span className="flex min-w-0 items-center gap-2">
            {!hideMobileBack ? <MobileBackButton className="-ml-2" /> : null}
            <span className="min-w-0 flex-1">
              {icon != null ? (
                <span className="inline-flex min-w-0 items-center gap-2.5">
                  <span className="inline-flex shrink-0 text-primary [&>svg]:h-7 [&>svg]:w-7">{icon}</span>
                  <span className="min-w-0">{title}</span>
                </span>
              ) : (
                <span className="min-w-0">{title}</span>
              )}
            </span>
          </span>
        </h1>
        {description != null ? (
          <div
            className={cn(
              'text-muted-foreground mt-1 text-sm space-y-2 text-pretty',
              '[&_strong]:font-medium [&_strong]:text-foreground/90',
              descriptionClassName,
            )}
          >
            {description}
          </div>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">{actions}</div> : null}
    </div>
  )
}
