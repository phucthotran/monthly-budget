import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { Card, CardContent, CardHeader, CardTitle } from '../ui'

export type PanelProps = {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
  /** Ghép thêm class cho vùng nội dung (vd. bỏ overflow, thêm padding). */
  bodyClassName?: string
}

/**
 * Khối nội dung có tiêu đề (bảng, danh sách dài).
 * Card primitives được bọc sẵn để sau này đổi layout/skin một chỗ.
 */
export function Panel({ bodyClassName, children, className, description, title }: PanelProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description != null && description !== '' ? (
          <div className="text-sm text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground/90">
            {description}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className={cn('overflow-x-auto', bodyClassName)}>{children}</CardContent>
    </Card>
  )
}
