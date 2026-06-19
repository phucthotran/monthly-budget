import type { ReactNode } from 'react'

import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/lib/utils'

import { Dialog, DialogContent, Drawer, DrawerContent } from '../ui'

import { SheetVariantContext } from './sheetContext'

export type ResponsiveSheetProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
  children: ReactNode
}

export function ResponsiveSheet({ children, onOpenChange, open }: ResponsiveSheetProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
        {children}
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  )
}

export type ResponsiveSheetContentProps = {
  children: ReactNode
  className?: string
}

export function ResponsiveSheetContent({ children, className }: ResponsiveSheetContentProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <SheetVariantContext.Provider value="drawer">
        <DrawerContent
          className={cn('flex flex-col data-[vaul-drawer-direction=bottom]:after:content-[initial]', className)}
        >
          <div className="mx-auto mt-3 mb-1 h-1.5 w-20 rounded-full bg-muted shrink-0" />
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-4 space-y-4">{children}</div>
        </DrawerContent>
      </SheetVariantContext.Provider>
    )
  }

  return (
    <SheetVariantContext.Provider value="dialog">
      <DialogContent className={className}>{children}</DialogContent>
    </SheetVariantContext.Provider>
  )
}
