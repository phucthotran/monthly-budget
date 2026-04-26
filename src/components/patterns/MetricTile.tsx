import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui'

export type MetricTileProps = {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
  /** Class cho vùng hiển thị số liệu / nội dung chính (mặc định: số lớn). */
  contentClassName?: string
}

/** Thẻ chỉ số (KPI): tiêu đề + mô tả + vùng giá trị — dùng Tổng quan / Thống kê. */
export function MetricTile({ children, className, contentClassName, description, title }: MetricTileProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description != null && description !== '' ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={cn('text-2xl font-semibold tabular-nums', contentClassName)}>{children}</CardContent>
    </Card>
  )
}
