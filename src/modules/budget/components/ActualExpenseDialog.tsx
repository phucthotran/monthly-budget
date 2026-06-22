import type { ActualExpense, BudgetItem, MonthKey } from '@/lib/types'

import { useForm } from '@tanstack/react-form'
import { Loader2 } from 'lucide-react'
import {
  type ForwardedRef,
  forwardRef,
  type ReactNode,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'

import { VndAmountInput } from '@/components/inputs'
import { FormLabelWithHint, ModalHeading, ResponsiveSheet, ResponsiveSheetContent } from '@/components/patterns'
import { Button, Field, FieldError, FieldLabel, Input } from '@/components/ui'
import { useActualExpenses } from '@/hooks/useUserCollections'
import { firstFieldErrorMessage } from '@/lib/form/fieldMeta'
import { currentMonthKey, formatMonthLabel, isPeriodClosedBefore } from '@/lib/month'
import { t } from '@/lib/strings'

import { actualExpenseFormSchema } from '../schemas/actualExpenseFormSchema'

import { ActualAmountQuickPick } from './ActualAmountQuickPick'
import { ActualExpenseMonthTabs } from './ActualExpenseMonthTabs'

const em = (children: ReactNode) => <strong className="font-medium text-foreground">{children}</strong>

export type ActualExpenseDialogHandle = {
  openForItem: (item: BudgetItem) => void
  close: () => void
}

function ActualExpenseDialogImpl(
  {
    onDeleteLine,
    onSubmit,
    snapshotMonth,
    uid,
  }: {
    uid: string | undefined
    onDeleteLine: (expense: ActualExpense) => void
    onSubmit: (
      item: BudgetItem,
      value: { amountVnd: number; spentMonth: MonthKey; note: null | string },
    ) => Promise<void>
    snapshotMonth: MonthKey
  },
  ref: ForwardedRef<ActualExpenseDialogHandle>,
) {
  const [open, setOpen] = useState(false)
  const [item, setItem] = useState<BudgetItem | null>(null)
  const formId = useId()
  const recordMonth = currentMonthKey()

  const { data: currentMonthLines = [], isHydrated: currentMonthReady } = useActualExpenses(
    open && uid && item ? uid : undefined,
    recordMonth,
    item?.id,
  )

  const spentInMonthVnd = useMemo(
    () => currentMonthLines.reduce((sum, line) => sum + line.amountVnd, 0),
    [currentMonthLines],
  )

  const form = useForm({
    defaultValues: {
      amountVnd: 0,
      note: '',
      spentMonth: recordMonth,
    },
    onSubmit: async ({ value }) => {
      if (!item) return

      await onSubmit(item, {
        amountVnd: value.amountVnd,
        note: value.note?.trim() || null,
        spentMonth: recordMonth,
      })

      form.setFieldValue('note', '')
      form.setFieldValue('amountVnd', 0)
    },
    validators: {
      onSubmit: actualExpenseFormSchema,
    },
  })

  useImperativeHandle(
    ref,
    () => ({
      close() {
        setOpen(false)
        setItem(null)
      },
      openForItem(next) {
        setItem(next)
        form.setFieldValue('spentMonth', recordMonth)
        form.setFieldValue('note', '')
        form.setFieldValue('amountVnd', 0)
        setOpen(true)
      },
    }),
    [form, recordMonth],
  )

  useEffect(() => {
    form.setFieldValue('spentMonth', recordMonth)
  }, [form, recordMonth])

  useEffect(() => {
    if (!open || !item || !currentMonthReady) return
    form.setFieldValue('amountVnd', currentMonthLines.length === 0 ? item.amountVnd : 0)
  }, [currentMonthLines.length, currentMonthReady, form, item, open])

  if (!item || !uid) return null

  const deleteLocked = isPeriodClosedBefore(item.validTo, snapshotMonth)

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setItem(null)
      }}
    >
      <ResponsiveSheetContent className="max-w-full sm:max-h-[min(90vh,46rem)] sm:overflow-y-auto sm:max-w-lg md:max-w-3xl">
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
          className="min-w-0 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <ActualExpenseMonthTabs
            budgetItemId={item.id}
            defaultMonth={recordMonth}
            deleteLocked={deleteLocked}
            uid={uid}
            onDeleteLine={onDeleteLine}
          />

          <div className="space-y-2 rounded-md border border-border/60 bg-muted/30 p-3 shadow-sm dark:border-border/80 dark:bg-muted/50">
            <form.Field name="amountVnd">
              {(field) => {
                const err = firstFieldErrorMessage(field.state.meta)
                const errId = `${formId}-amount-err`
                const quickPickDescId = `${formId}-amount-quick`
                const describedBy = [err ? errId : null, quickPickDescId].filter(Boolean).join(' ') || undefined
                return (
                  <Field invalid={!!err}>
                    <FieldLabel htmlFor={`${formId}-amount`}>{t.budget.amount}</FieldLabel>
                    <VndAmountInput
                      aria-describedby={describedBy}
                      id={`${formId}-amount`}
                      invalid={!!err}
                      value={field.state.value}
                      onValueChange={(n) => field.handleChange(n)}
                    />
                    <FieldError id={errId}>{err}</FieldError>
                    <div className="min-w-0 pt-2" id={quickPickDescId}>
                      <p className="mb-1.5 text-xs text-muted-foreground">{t.common.amountQuickPickHint}</p>
                      <ActualAmountQuickPick
                        currentAmountVnd={field.state.value}
                        plannedAmountVnd={item.amountVnd}
                        spentInMonthVnd={spentInMonthVnd}
                        onPick={(n) => field.handleChange(n)}
                      />
                    </div>
                  </Field>
                )
              }}
            </form.Field>

            <Field>
              <FormLabelWithHint hint={<p className="text-pretty">{t.budget.actualSpentMonthReadOnlyHint}</p>}>
                {t.common.month}
              </FormLabelWithHint>
              <p className="text-sm font-medium">{formatMonthLabel(recordMonth)}</p>
            </Field>

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
                      maxLength={45}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError id={errId}>{err}</FieldError>
                  </Field>
                )
              }}
            </form.Field>

            <Button className="w-full" disabled={form.state.isSubmitting} type="submit">
              {form.state.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.budget.saveActualAction}
            </Button>
          </div>
        </form>
      </ResponsiveSheetContent>
    </ResponsiveSheet>
  )
}

export const ActualExpenseDialog = forwardRef(ActualExpenseDialogImpl)
