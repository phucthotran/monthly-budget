import type { BudgetItem, MonthKey } from '@/lib/types'

import { useForm } from '@tanstack/react-form'
import { type ForwardedRef, forwardRef, type ReactNode, useImperativeHandle, useState } from 'react'
import { z } from 'zod'

import { MonthYearPicker } from '@/components/inputs/MonthYearPicker'
import { VndAmountInput } from '@/components/inputs/VndAmountInput'
import { ModalHeading } from '@/components/patterns'
import { Button, Dialog, DialogContent, DialogFooter, Input, Label } from '@/components/ui'
import { t } from '@/lib/strings'

const em = (children: ReactNode) => <strong className="font-medium text-foreground">{children}</strong>

const schema = z.object({
  amountVnd: z.number().min(1),
  note: z.string().optional(),
  spentMonth: z.string().regex(/^\d{4}-\d{2}$/),
})

export type ActualExpenseDialogHandle = {
  openForItem: (item: BudgetItem) => void
  close: () => void
}

function ActualExpenseDialogImpl(
  {
    defaultMonth,
    onSubmit,
  }: {
    defaultMonth: MonthKey
    onSubmit: (value: {
      budgetItemId: string
      amountVnd: number
      spentMonth: MonthKey
      note: null | string
    }) => Promise<void>
  },
  ref: ForwardedRef<ActualExpenseDialogHandle>,
) {
  const [open, setOpen] = useState(false)
  const [item, setItem] = useState<BudgetItem | null>(null)

  const form = useForm({
    defaultValues: {
      amountVnd: 0,
      note: '',
      spentMonth: defaultMonth,
    },
    onSubmit: async ({ value }) => {
      const parsed = schema.safeParse(value)
      if (!parsed.success || !item) return

      await onSubmit({
        amountVnd: parsed.data.amountVnd,
        budgetItemId: item.id,
        note: parsed.data.note?.trim() || null,
        spentMonth: parsed.data.spentMonth as MonthKey,
      })

      setOpen(false)
      setItem(null)
      form.reset()
    },
  })

  useImperativeHandle(ref, () => ({
    close() {
      setOpen(false)
      setItem(null)
    },
    openForItem(next) {
      setItem(next)
      form.reset({ amountVnd: 0, note: '', spentMonth: defaultMonth })
      setOpen(true)
    },
  }))

  if (!item) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setItem(null)
      }}
    >
      <DialogContent>
        <ModalHeading
          title={t.budget.addActual}
          description={
            <div className="space-y-2.5 text-pretty leading-relaxed">
              <p>
                {em(item.title)} — {t.budget.addActualContext}
              </p>
              <p className="text-muted-foreground">{t.budget.addActualBody}</p>
            </div>
          }
        />
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field name="amountVnd">
            {(field) => (
              <div className="space-y-2">
                <Label>{t.budget.amount}</Label>
                <VndAmountInput value={field.state.value} onValueChange={(n) => field.handleChange(n)} />
              </div>
            )}
          </form.Field>

          <form.Field name="spentMonth">
            {(field) => (
              <div className="space-y-2">
                <Label>{t.common.month}</Label>
                <MonthYearPicker value={field.state.value} onChange={(v) => field.handleChange(v)} />
              </div>
            )}
          </form.Field>

          <form.Field name="note">
            {(field) => (
              <div className="space-y-2">
                <Label>{t.common.note}</Label>
                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit">{t.common.save}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const ActualExpenseDialog = forwardRef(ActualExpenseDialogImpl)
