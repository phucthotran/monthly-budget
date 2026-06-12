import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { DialogDescription, DialogHeader, DialogTitle, DrawerDescription, DrawerTitle } from '../ui'

import { useSheetVariant } from './sheetContext'

export type ModalHeadingProps = {
  title: ReactNode
  description?: ReactNode
  className?: string
}

export function ModalHeading({ className, description, title }: ModalHeadingProps) {
  const variant = useSheetVariant()

  if (variant === 'drawer') {
    return (
      <div className="grid gap-1.5 pb-1">
        <DrawerTitle className={cn('text-lg font-semibold leading-none tracking-tight', className)}>
          {title}
        </DrawerTitle>
        {description != null && description !== '' ? (
          <DrawerDescription asChild>
            <div
              className={cn(
                'space-y-2 text-pretty text-sm text-muted-foreground text-left',
                '[&_strong]:font-medium [&_strong]:text-foreground/90',
              )}
            >
              {description}
            </div>
          </DrawerDescription>
        ) : null}
      </div>
    )
  }

  return (
    <DialogHeader>
      <DialogTitle className={cn('pr-8', className)}>{title}</DialogTitle>
      {description != null && description !== '' ? (
        <DialogDescription asChild>
          <div
            className={cn(
              'space-y-2 text-pretty pr-2 text-sm text-muted-foreground text-left',
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
