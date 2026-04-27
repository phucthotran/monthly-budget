import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui'

export type MetricTileProps = {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

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
