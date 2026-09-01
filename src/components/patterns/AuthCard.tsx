import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import Logo from '../../../public/header-logo.png'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Separator } from '../ui'

export type AuthCardProps = {
  children: ReactNode
  className?: string
  compact?: boolean
  title: ReactNode
}

export function AuthCard({ children, className, compact = false, title }: AuthCardProps) {
  const { t } = useTranslation()

  return (
    <Card className={cn('w-full max-w-md border-border', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img src={Logo} alt={t('appName')} className="size-6 shrink-0 text-primary" />
          {title}
        </CardTitle>
        <Separator className={cn('h-[1px]', compact ? 'my-3' : 'my-6')} />
        {compact ? null : (
          <CardDescription className="items-center justify-center flex">
            <img src="./logo.png" alt={t('appName')} className="max-w-full h-80" />
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
