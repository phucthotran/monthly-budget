import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui'

export type AuthCardProps = {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
}

export function AuthCard({ children, className, description, title }: AuthCardProps) {
  return (
    <Card className={cn('w-full max-w-md border-border', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description != null && description !== '' ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
