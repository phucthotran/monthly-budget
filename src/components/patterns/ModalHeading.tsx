import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { DialogDescription, DialogHeader, DialogTitle } from '../ui'

export type ModalHeadingProps = {
  title: ReactNode
  description?: ReactNode
  className?: string
}

export function ModalHeading({ className, description, title }: ModalHeadingProps) {
  return (
    <DialogHeader>
      <DialogTitle className={cn('pr-8', className)}>{title}</DialogTitle>
      {description != null && description !== '' ? (
        <DialogDescription asChild>
          <div
            className={cn(
              'space-y-2 text-pretty pr-2 text-sm text-muted-foreground',
              '[&_strong]:font-medium [&_strong]:text-foreground/90',
            )}
          >
            {description}
          </div>
        </DialogDescription>
      ) : null}
    </DialogHeader>
  )
}
