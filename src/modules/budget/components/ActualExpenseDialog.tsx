import type { BudgetItem, MonthKey } from '@/lib/types'

import { useForm } from '@tanstack/react-form'
import { type ForwardedRef, forwardRef, type ReactNode, useId, useImperativeHandle, useState } from 'react'

import { MonthYearPicker, VndAmountInput } from '@/components/inputs'
import { FormLabelWithHint, ModalHeading } from '@/components/patterns'
import { Button, Dialog, DialogContent, DialogFooter, Field, FieldError, FieldLabel, Input } from '@/components/ui'
import { firstFieldErrorMessage } from '@/lib/form/fieldMeta'
import { isMonthInRange } from '@/lib/month'
import { t } from '@/lib/strings'

import { actualExpenseFormSchema } from '../schemas/actualExpenseFormSchema'

const em = (children: ReactNode) => <strong className="font-medium text-foreground">{children}</strong>

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
    onSubmit: (
      item: BudgetItem,
      value: { amountVnd: number; spentMonth: MonthKey; note: null | string },
    ) => Promise<void>
  },
  ref: ForwardedRef<ActualExpenseDialogHandle>,
) {
  const [open, setOpen] = useState(false)
  const [item, setItem] = useState<BudgetItem | null>(null)
  const formId = useId()

  const form = useForm({
    defaultValues: {
      amountVnd: 0,
      note: '',
      spentMonth: defaultMonth,
    },
    onSubmit: async ({ value }) => {
      if (!item) return
      const spentMonth = value.spentMonth as MonthKey

      await onSubmit(item, {
        amountVnd: value.amountVnd,
        note: value.note?.trim() || null,
        spentMonth,
      })

      setOpen(false)
      setItem(null)
      form.reset()
    },
    validators: {
      onSubmit: actualExpenseFormSchema,
    },
  })

  useImperativeHandle(ref, () => ({
    close() {
      setOpen(false)
      setItem(null)
    },
    openForItem(next) {
      setItem(next)
      form.reset({
        amountVnd: 0,
        note: '',
        spentMonth: isMonthInRange(defaultMonth, next.validFrom, next.validTo) ? defaultMonth : next.validFrom,
      })
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
            {(field) => {
              const err = firstFieldErrorMessage(field.state.meta)
              const errId = `${formId}-amount-err`
              return (
                <Field invalid={!!err}>
                  <FieldLabel htmlFor={`${formId}-amount`}>{t.budget.amount}</FieldLabel>
                  <VndAmountInput
                    aria-describedby={err ? errId : undefined}
                    id={`${formId}-amount`}
                    invalid={!!err}
                    value={field.state.value}
                    onValueChange={(n) => field.handleChange(n)}
                  />
                  <FieldError id={errId}>{err}</FieldError>
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="spentMonth">
            {(field) => {
              const err = firstFieldErrorMessage(field.state.meta)
              const errId = `${formId}-spentMonth-err`
              return (
                <Field invalid={!!err}>
                  <FormLabelWithHint hint={<p className="text-pretty">{t.budget.actualPeriodHint}</p>}>
                    {t.common.month}
                  </FormLabelWithHint>
                  <MonthYearPicker
                    invalid={!!err}
                    value={field.state.value}
                    minMonth={item.validFrom}
                    maxMonth={item.validTo ?? undefined}
                    onChange={(v) => field.handleChange(v)}
                  />
                  <FieldError id={errId}>{err}</FieldError>
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="note">
            {(field) => {
              const err = firstFieldErrorMessage(field.state.meta)
              const errId = `${formId}-note-err`
              return (
                <Field invalid={!!err}>
                  <FieldLabel htmlFor={`${formId}-note`}>{t.common.note}</FieldLabel>
                  <Input
                    aria-describedby={err ? errId : undefined}
                    aria-invalid={!!err}
                    id={`${formId}-note`}
                    value={field.state.value}
                    maxLength={45}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError id={errId}>{err}</FieldError>
                </Field>
              )
            }}
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
