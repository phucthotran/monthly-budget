import type { BudgetItem, Category, MonthKey } from '@/lib/types'

import { useForm } from '@tanstack/react-form'
import { type ForwardedRef, forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { z } from 'zod'

import { MonthYearPicker, VndAmountInput } from '@/components/inputs'
import { FormLabelWithHint, ModalHeading } from '@/components/patterns'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { currentMonthKey } from '@/lib/month'
import { t } from '@/lib/strings'

const schema = z.object({
  amountVnd: z.number().min(0),
  categoryId: z.string().min(1),
  title: z.string().min(1),
  validFrom: z.string().regex(/^\d{4}-\d{2}$/),
  validTo: z.string().optional(),
})

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

  const form = useForm({
    defaultValues: {
      amountVnd: 0,
      categoryId: '',
      title: '',
      validFrom: defaultMonth,
      validTo: '',
    },
    onSubmit: async ({ value }) => {
      const parsed = schema.safeParse(value)
      if (!parsed.success) return
      if (!editing) {
        if (parsed.data.validFrom < currentMonthKey()) return
      }
      const validTo = parsed.data.validTo?.trim() ? (parsed.data.validTo.trim() as MonthKey) : null
      if (validTo && validTo < (parsed.data.validFrom as MonthKey)) return

      await onSubmit(editing, {
        amountVnd: parsed.data.amountVnd,
        categoryId: parsed.data.categoryId,
        title: parsed.data.title,
        validFrom: parsed.data.validFrom as MonthKey,
        validTo,
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
      <DialogContent>
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
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field name="title">
            {(field) => (
              <div className="space-y-2">
                <Label>{t.budget.titleLabel}</Label>
                <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
              </div>
            )}
          </form.Field>

          <form.Field name="amountVnd">
            {(field) => (
              <div className="space-y-2">
                <Label>{t.budget.amount}</Label>
                <VndAmountInput value={field.state.value} onValueChange={(n) => field.handleChange(n)} />
              </div>
            )}
          </form.Field>

          <form.Field name="categoryId">
            {(field) => (
              <div className="space-y-2">
                <Label>{t.budget.category}</Label>
                <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                  <SelectTrigger>
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
              </div>
            )}
          </form.Field>
          <form.Field name="validFrom">
            {(field) => (
              <div className="space-y-2">
                {editing ? (
                  <Label>{t.budget.validFrom}</Label>
                ) : (
                  <FormLabelWithHint hint={<p className="text-pretty">{t.budget.validFromCreateHint}</p>}>
                    {t.budget.validFrom}
                  </FormLabelWithHint>
                )}
                <MonthYearPicker
                  value={field.state.value}
                  minMonth={editing ? undefined : defaultMonth}
                  onChange={(v) => {
                    field.handleChange(v)
                    const to = form.state.values.validTo?.trim() ?? ''
                    if (to && to < v) {
                      form.setFieldValue('validTo', '')
                    }
                  }}
                />
              </div>
            )}
          </form.Field>
          <form.Subscribe selector={(s) => s.values.validFrom}>
            {(validFrom) => {
              const fromKey = /^\d{4}-\d{2}$/.test(validFrom) ? (validFrom as MonthKey) : defaultMonth
              return (
                <form.Field name="validTo">
                  {(field) => (
                    <div className="space-y-2">
                      <FormLabelWithHint hint={<p className="text-pretty">{t.budget.validToHint}</p>}>
                        {t.budget.validTo}
                      </FormLabelWithHint>
                      <MonthYearPicker
                        value={field.state.value}
                        minMonth={fromKey}
                        onChange={(v) => field.handleChange(v)}
                      />
                    </div>
                  )}
                </form.Field>
              )
            }}
          </form.Subscribe>

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
