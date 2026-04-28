import { WalletCards } from 'lucide-react'
import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Separator } from '../ui'

export type AuthCardProps = {
  title: ReactNode
  children: ReactNode
  className?: string
}

export function AuthCard({ children, className, title }: AuthCardProps) {
  return (
    <Card className={cn('w-full max-w-md border-border', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WalletCards className="size-6 shrink-0 text-primary" />
          {title}
        </CardTitle>
        <Separator className="my-6 h-[1px]" />
        <CardDescription className="items-center justify-center flex">
          <img src="./logo.png" alt="Money" className="max-w-full h-80" />
        </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
