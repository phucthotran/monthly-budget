import type { ReactNode } from 'react'

import { CircleAlert } from 'lucide-react'
import { useState } from 'react'

import { t } from '@/lib/strings'

import { Alert, AlertDescription, Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui'

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
    setPending(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground leading-relaxed [&_p]:text-pretty">{description}</div>
          {emphasis ? (
            <Alert className="border-primary/25 bg-primary/5 [&>svg]:text-primary">
              <CircleAlert className="h-4 w-4" aria-hidden />
              <AlertDescription className="text-pretty text-foreground/90">{emphasis}</AlertDescription>
            </Alert>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button type="button" variant="destructive" disabled={pending} onClick={() => void handleConfirm()}>
            {pending ? t.common.loading : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
