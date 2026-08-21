import type { ReactNode } from 'react'

import { CircleAlert } from 'lucide-react'
import { useState } from 'react'

import { haptic } from '@/lib/haptics'
import { t } from '@/lib/strings'

import { Alert, AlertDescription, Button, DialogFooter } from '../ui'

import { ModalHeading } from './ModalHeading'
import { ResponsiveSheet, ResponsiveSheetContent } from './ResponsiveSheet'

export type ConfirmDeleteDialogProps = {
  confirmLabel?: string
  description: ReactNode
  emphasis?: ReactNode
  onConfirm: () => Promise<void> | void
  onOpenChange: (open: boolean) => void
  open: boolean
  title: string
}

export function ConfirmDeleteDialog({
  confirmLabel = t.common.delete,
  description,
  emphasis,
  onConfirm,
  onOpenChange,
  open,
  title,
}: ConfirmDeleteDialogProps) {
  const [pending, setPending] = useState(false)

  async function handleConfirm() {
    haptic('warning')
    setPending(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      // The caller surfaces the failure; keep the sheet open so the user can retry.
    } finally {
      setPending(false)
    }
  }

  return (
    <ResponsiveSheet open={open} onOpenChange={onOpenChange}>
      <ResponsiveSheetContent className="max-w-full sm:max-w-md">
        <ModalHeading title={title} description={description} />
        {emphasis ? (
          <Alert className="border-primary/25 bg-primary/5 [&>svg]:text-primary">
            <CircleAlert className="h-4 w-4" aria-hidden />
            <AlertDescription className="text-pretty text-foreground/90">{emphasis}</AlertDescription>
          </Alert>
        ) : null}
        <DialogFooter className="[&>button]:h-11 [&>button]:w-full sm:[&>button]:h-9 sm:[&>button]:w-auto">
          <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button type="button" variant="destructive" disabled={pending} onClick={() => void handleConfirm()}>
            {pending ? t.common.loading : confirmLabel}
          </Button>
        </DialogFooter>
      </ResponsiveSheetContent>
    </ResponsiveSheet>
  )
}
