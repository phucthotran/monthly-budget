import type { IncomePeriod, MonthKey } from '@/lib/types'

import { useForm } from '@tanstack/react-form'
import { type ForwardedRef, forwardRef, useImperativeHandle, useState } from 'react'
import { z } from 'zod'

import { MonthYearPicker, VndAmountInput } from '@/components/inputs'
import { FormLabelWithHint, ModalHeading } from '@/components/patterns'
import { Button, Dialog, DialogContent, DialogFooter, Input, Label } from '@/components/ui'
import { t } from '@/lib/strings'

const schema = z.object({
  amountVnd: z.number().min(0),
  label: z.string().min(1),
  validFrom: z.string().regex(/^\d{4}-\d{2}$/),
  validTo: z.string().optional(),
})

export type IncomeDialogHandle = {
  openCreate: () => void
  openEdit: (row: IncomePeriod) => void
  close: () => void
}

function IncomeDialogImpl(
  {
    defaultMonth,
    onSubmit,
  }: {
    defaultMonth: MonthKey
    onSubmit: (
      editing: IncomePeriod | null,
      value: { label: string; amountVnd: number; validFrom: MonthKey; validTo: MonthKey | null },
    ) => Promise<void>
  },
  ref: ForwardedRef<IncomeDialogHandle>,
) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<IncomePeriod | null>(null)

  const form = useForm({
    defaultValues: {
      amountVnd: 0,
      label: '',
      validFrom: defaultMonth,
      validTo: '',
    },
    onSubmit: async ({ value }) => {
      const parsed = schema.safeParse(value)
      if (!parsed.success) return

      await onSubmit(editing, {
        amountVnd: parsed.data.amountVnd,
        label: parsed.data.label,
        validFrom: parsed.data.validFrom as MonthKey,
        validTo: parsed.data.validTo?.trim() ? (parsed.data.validTo.trim() as MonthKey) : null,
      })

      setOpen(false)
      setEditing(null)
      form.reset()
    },
  })

  useImperativeHandle(ref, () => ({
    close() {
      setOpen(false)
      setEditing(null)
    },
    openCreate() {
      setEditing(null)
      form.setFieldValue('amountVnd', 0)
      form.setFieldValue('label', '')
      form.setFieldValue('validFrom', defaultMonth)
      form.setFieldValue('validTo', '')
      setOpen(true)
    },
    openEdit(row) {
      setEditing(row)
      form.setFieldValue('amountVnd', row.amountVnd)
      form.setFieldValue('label', row.label)
      form.setFieldValue('validFrom', row.validFrom)
      form.setFieldValue('validTo', row.validTo ?? '')
      setOpen(true)
    },
  }))

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setEditing(null)
      }}
    >
      <DialogContent>
        <ModalHeading
          title={editing ? t.income.editTitle : t.income.add}
          description={
            <div className="space-y-2.5 text-pretty leading-relaxed">
              <p>{t.income.dialogP1}</p>
              <p>{t.income.dialogP2c}</p>
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
          <form.Field name="label">
            {(field) => (
              <div className="space-y-2">
                <Label>{t.income.label}</Label>
                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
              </div>
            )}
          </form.Field>

          <form.Field name="amountVnd">
            {(field) => (
              <div className="space-y-2">
                <Label>{t.income.amount}</Label>
                <VndAmountInput value={field.state.value} onValueChange={(n) => field.handleChange(n)} />
              </div>
            )}
          </form.Field>

          <form.Field name="validFrom">
            {(field) => (
              <div className="space-y-2">
                <Label>{t.income.validFrom}</Label>
                <MonthYearPicker value={field.state.value} onChange={(v) => field.handleChange(v)} />
              </div>
            )}
          </form.Field>
          <form.Field name="validTo">
            {(field) => (
              <div className="space-y-2">
                <FormLabelWithHint hint={<p className="text-pretty">{t.income.validToHint}</p>}>
                  {t.income.validTo}
                </FormLabelWithHint>
                <MonthYearPicker value={field.state.value} onChange={(v) => field.handleChange(v)} />
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

export const IncomeDialog = forwardRef(IncomeDialogImpl)
