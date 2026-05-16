import type { ActualExpense, BudgetItem, MonthKey } from '@/lib/types'

import { useForm } from '@tanstack/react-form'
import { Loader2, Trash2 } from 'lucide-react'
import { type ForwardedRef, forwardRef, type ReactNode, useId, useImperativeHandle, useState } from 'react'

import { MonthYearPicker, VndAmountInput } from '@/components/inputs'
import { ActionTooltipButton, FormLabelWithHint, ModalHeading } from '@/components/patterns'
import {
  Button,
  Dialog,
  DialogContent,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { formatDateLong } from '@/lib/datetime'
import { firstFieldErrorMessage } from '@/lib/form/fieldMeta'
import { compareMonthKeys, currentMonthKey, isMonthInRange, isPeriodClosedBefore } from '@/lib/month'
import { t } from '@/lib/strings'
import { formatVnd } from '@/lib/vnd'

import { actualExpenseFormSchema } from '../schemas/actualExpenseFormSchema'

import { ActualAmountQuickPick } from './ActualAmountQuickPick'

const em = (children: ReactNode) => <strong className="font-medium text-foreground">{children}</strong>

export type ActualExpenseDialogHandle = {
  openForItem: (item: BudgetItem) => void
  close: () => void
}

function ActualExpenseDialogImpl(
  {
    actuals,
    defaultMonth,
    onDeleteLine,
    onSubmit,
    snapshotMonth,
  }: {
    actuals: ActualExpense[]
    defaultMonth: MonthKey
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

      form.reset()
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
        const nowMonth = currentMonthKey()
        const initialMonth = isMonthInRange(nowMonth, next.validFrom, next.validTo) ? nowMonth : next.validFrom

        const hasLinesForMonth = actuals.some(
          (a) => a.budgetItemId === next.id && compareMonthKeys(a.spentMonth, initialMonth) === 0,
        )

        const defaultAmountForFirstLines = hasLinesForMonth ? 0 : next.amountVnd

        setItem(next)
        form.setFieldValue('spentMonth', initialMonth)
        form.setFieldValue('note', '')
        form.setFieldValue('amountVnd', defaultAmountForFirstLines)
        setOpen(true)
      },
    }),
    [actuals, form],
  )

  if (!item) return null

  const deleteLocked = isPeriodClosedBefore(item.validTo, snapshotMonth)

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setItem(null)
      }}
    >
      <DialogContent className="max-h-[min(90vh,46rem)] overflow-y-auto sm:max-w-lg md:max-w-3xl max-w-full">
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
          className="min-w-0 space-y-4 overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Subscribe selector={(s) => s.values.spentMonth}>
            {(spentMonth) => {
              const rows = [...actuals]
                .filter((a) => a.budgetItemId === item.id && compareMonthKeys(a.spentMonth, spentMonth) === 0)
                .sort((a, b) => {
                  const t = a.createdAt - b.createdAt
                  if (t !== 0) return t
                  return a.amountVnd - b.amountVnd
                })

              return (
                <div className="space-y-2 rounded-md border p-3">
                  <div className="text-sm font-medium">{t.budget.actualLinesHeading}</div>
                  {rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t.budget.actualLinesEmpty}</p>
                  ) : (
                    <div className="overflow-x-auto -mx-1 px-1">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="whitespace-nowrap">{t.budget.amount}</TableHead>
                            <TableHead className="whitespace-nowrap">{t.common.note}</TableHead>
                            <TableHead className="whitespace-nowrap">{t.budget.createdAt}</TableHead>
                            <TableHead className="w-12" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell className="tabular-nums whitespace-nowrap text-sm font-medium">
                                {formatVnd(row.amountVnd)}
                              </TableCell>
                              <TableCell className="max-w-[10rem] truncate text-sm">
                                {row.note?.trim() || '—'}
                              </TableCell>
                              <TableCell className="text-sm">{formatDateLong(row.createdAt)}</TableCell>
                              <TableCell className="text-right whitespace-nowrap p-1 align-middle">
                                <ActionTooltipButton
                                  aria-label={t.common.delete}
                                  variant="ghost"
                                  className="h-8 w-8 shrink-0 p-0"
                                  disabled={deleteLocked}
                                  label={deleteLocked ? t.budget.periodEndedLocked : t.common.delete}
                                  onClick={() => onDeleteLine(row)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </ActionTooltipButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )
            }}
          </form.Subscribe>

          <div className="space-y-2 rounded-md border p-3 border-border/60 bg-muted/30 shadow-sm dark:bg-muted/50 dark:border-border/80">
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
                      <p className="text-xs text-muted-foreground mb-1.5">{t.common.amountQuickPickHint}</p>
                      <form.Subscribe selector={(s) => s.values.spentMonth}>
                        {(spentMonth) => (
                          <ActualAmountQuickPick
                            actuals={actuals}
                            budgetItemId={item.id}
                            currentAmountVnd={field.state.value}
                            plannedAmountVnd={item.amountVnd}
                            spentMonth={spentMonth as MonthKey}
                            onPick={(n) => field.handleChange(n)}
                          />
                        )}
                      </form.Subscribe>
                    </div>
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
                      maxMonth={item.validFrom}
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

            <Button type="submit" disabled={form.state.isSubmitting} className="w-full">
              {form.state.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.budget.saveActualAction}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const ActualExpenseDialog = forwardRef(ActualExpenseDialogImpl)
