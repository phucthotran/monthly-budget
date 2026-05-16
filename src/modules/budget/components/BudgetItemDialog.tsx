import type { BudgetItem, Category, MonthKey } from '@/lib/types'

import { useForm } from '@tanstack/react-form'
import { type ForwardedRef, forwardRef, useId, useImperativeHandle, useMemo, useState } from 'react'

import { MonthYearPicker, VndAmountInput, VndAmountQuickPick } from '@/components/inputs'
import { FormLabelWithHint, ModalHeading } from '@/components/patterns'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { firstFieldErrorMessage } from '@/lib/form/fieldMeta'
import { compareMonthKeys, monthYearPickerYearConstraints } from '@/lib/month'
import { t } from '@/lib/strings'

import { budgetItemFormSchema } from '../schemas/budgetItemFormSchema'

export type BudgetItemDialogHandle = {
  openCreate: () => void
  openEdit: (item: BudgetItem) => void
  close: () => void
}

function BudgetItemDialogImpl(
  {
    categories,
    defaultMonth,
    onSubmit,
  }: {
    categories: Category[]
    defaultMonth: MonthKey
    onSubmit: (
      editing: BudgetItem | null,
      value: { title: string; amountVnd: number; categoryId: string; validFrom: MonthKey; validTo: MonthKey | null },
    ) => Promise<void>
  },
  ref: ForwardedRef<BudgetItemDialogHandle>,
) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<BudgetItem | null>(null)

  const defaultCategoryId = useMemo(() => categories.find((c) => !c.archived)?.id ?? '', [categories])
  const yearPick = useMemo(() => monthYearPickerYearConstraints(editing), [editing])
  const schema = useMemo(() => budgetItemFormSchema(!!editing), [editing])
  const formId = useId()

  const form = useForm({
    defaultValues: {
      amountVnd: 0,
      categoryId: '',
      title: '',
      validFrom: defaultMonth,
      validTo: '',
    },
    onSubmit: async ({ value }) => {
      const validTo = value.validTo.trim() ? (value.validTo.trim() as MonthKey) : null
      await onSubmit(editing, {
        amountVnd: value.amountVnd,
        categoryId: value.categoryId,
        title: value.title.trim(),
        validFrom: value.validFrom as MonthKey,
        validTo,
      })

      setOpen(false)
      setEditing(null)
      form.reset()
    },
    validators: {
      onSubmit: schema,
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
      form.setFieldValue('categoryId', defaultCategoryId)
      form.setFieldValue('title', '')
      form.setFieldValue('validFrom', defaultMonth)
      form.setFieldValue('validTo', '')
      setOpen(true)
    },
    openEdit(item) {
      setEditing(item)
      form.setFieldValue('amountVnd', item.amountVnd)
      form.setFieldValue('categoryId', item.categoryId)
      form.setFieldValue('title', item.title)
      form.setFieldValue('validFrom', item.validFrom)
      form.setFieldValue('validTo', item.validTo ?? '')
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
      <DialogContent className="max-h-[min(90vh,46rem)] overflow-y-auto sm:max-w-lg md:max-w-3xl max-w-full">
        <ModalHeading
          title={editing ? t.budget.edit : t.budget.add}
          description={
            <div className="space-y-2.5 text-pretty leading-relaxed">
              <p>{t.budget.dialogP1}</p>
              <p>{t.budget.dialogP2c}</p>
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
          <form.Field name="title">
            {(field) => {
              const err = firstFieldErrorMessage(field.state.meta)
              const errId = `${formId}-title-err`
              return (
                <Field invalid={!!err}>
                  <FieldLabel htmlFor={`${formId}-title`}>{t.budget.titleLabel}</FieldLabel>
                  <Input
                    aria-describedby={err ? errId : undefined}
                    aria-invalid={!!err}
                    id={`${formId}-title`}
                    value={field.state.value}
                    maxLength={45}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError id={errId}>{err}</FieldError>
                </Field>
              )
            }}
          </form.Field>

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
                    <VndAmountQuickPick
                      currentAmountVnd={field.state.value}
                      plannedHintVnd={editing?.amountVnd}
                      onPick={(n) => field.handleChange(n)}
                    />
                  </div>
                </Field>
              )
            }}
          </form.Field>

          <form.Field name="categoryId">
            {(field) => {
              const err = firstFieldErrorMessage(field.state.meta)
              const errId = `${formId}-category-err`
              return (
                <Field invalid={!!err}>
                  <FieldLabel htmlFor={`${formId}-category`}>{t.budget.category}</FieldLabel>
                  <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                    <SelectTrigger
                      aria-describedby={err ? errId : undefined}
                      aria-invalid={!!err}
                      id={`${formId}-category`}
                    >
                      <SelectValue placeholder={t.common.selectPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => !c.archived)
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FieldError id={errId}>{err}</FieldError>
                </Field>
              )
            }}
          </form.Field>
          <form.Field name="validFrom">
            {(field) => {
              const err = firstFieldErrorMessage(field.state.meta)
              const errId = `${formId}-validFrom-err`
              return (
                <Field invalid={!!err}>
                  {editing ? (
                    <FieldLabel>{t.budget.validFrom}</FieldLabel>
                  ) : (
                    <FormLabelWithHint hint={<p className="text-pretty">{t.budget.validFromCreateHint}</p>}>
                      {t.budget.validFrom}
                    </FormLabelWithHint>
                  )}
                  <MonthYearPicker
                    invalid={!!err}
                    value={field.state.value}
                    maxYear={yearPick.maxYear}
                    maxYears={yearPick.maxYears}
                    minMonth={editing ? undefined : defaultMonth}
                    minYear={yearPick.minYear}
                    onChange={(v) => {
                      field.handleChange(v)
                      const to = form.state.values.validTo?.trim() ?? ''
                      if (to && compareMonthKeys(to, v) < 0) {
                        form.setFieldValue('validTo', '')
                      }
                    }}
                  />
                  <FieldError id={errId}>{err}</FieldError>
                </Field>
              )
            }}
          </form.Field>
          <form.Field name="validTo">
            {(field) => {
              const err = firstFieldErrorMessage(field.state.meta)
              const errId = `${formId}-validTo-err`
              return (
                <Field invalid={!!err}>
                  <FormLabelWithHint hint={<p className="text-pretty">{t.budget.validToHint}</p>}>
                    {t.budget.validTo}
                  </FormLabelWithHint>
                  <form.Subscribe selector={(s) => s.values.validFrom}>
                    {(validFrom) => {
                      const fromKey = /^\d{4}-\d{2}$/.test(validFrom) ? (validFrom as MonthKey) : defaultMonth
                      const fromYear = Number(fromKey.slice(0, 4))
                      const toMinYear = Math.max(yearPick.minYear, fromYear)
                      return (
                        <MonthYearPicker
                          invalid={!!err}
                          outOfMinSync="empty"
                          value={field.state.value}
                          maxYear={yearPick.maxYear}
                          maxYears={yearPick.maxYears}
                          minMonth={fromKey}
                          minYear={toMinYear}
                          onChange={(v) => field.handleChange(v)}
                        />
                      )
                    }}
                  </form.Subscribe>
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

export const BudgetItemDialog = forwardRef(BudgetItemDialogImpl)
