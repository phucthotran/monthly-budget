# Skill: Add Responsive Create/Edit Dialog

## When to use

Load this skill when the user asks to:

- Add a create or edit dialog / form modal
- Scaffold a `<Feature>Dialog` component
- Add a form inside a bottom sheet or dialog

## Checklist (execute in order)

---

### Step 1 — Zod schema (`src/modules/<feature>/schemas/<feature>FormSchema.ts`)

Define the schema and export it. Use `t.validation.*` for all error messages. Never hardcode Vietnamese strings.

```ts
import { z } from 'zod'
import { t } from '@/lib/strings'
import { MONTH_KEY_REGEX } from '@/lib/month'

export const <feature>FormSchema = z.object({
  name: z.string().refine((s) => s.trim().length > 0, { message: t.validation.nameRequired }),
  amountVnd: z.number().min(1000, { message: t.validation.amountAtLeastOne }),
  // For month fields:
  validFrom: z.string().regex(MONTH_KEY_REGEX, { message: t.validation.monthFormat }),
  validTo: z.string().refine(
    (s) => s.trim() === '' || MONTH_KEY_REGEX.test(s.trim()),
    { message: t.validation.monthFormat },
  ),
})
// Cross-field refine example:
// .refine((d) => !d.validTo.trim() || compareMonthKeys(d.validTo, d.validFrom) >= 0, {
//   message: t.validation.validToBeforeFrom,
//   path: ['validTo'],
// })
```

---

### Step 2 — Dialog handle type

Export a handle type for the `ref`:

```ts
export type <Feature>DialogHandle = {
  openCreate: () => void
  openEdit: (item: <Entity>) => void
  close: () => void
}
```

---

### Step 3 — Dialog component (`src/modules/<feature>/components/<Feature>Dialog.tsx`)

Full annotated template:

```tsx
import type { <Entity> } from '@/lib/types'

import { useForm } from '@tanstack/react-form'
import { type ForwardedRef, forwardRef, useId, useImperativeHandle, useState } from 'react'

import { MonthYearPicker, VndAmountInput } from '@/components/inputs'
import { FormLabelWithHint, ModalHeading, ResponsiveSheet, ResponsiveSheetContent } from '@/components/patterns'
import {
  Button,
  DialogFooter,
  Field,
  FieldError,
  FieldLabel,
  Input,
} from '@/components/ui'
import { firstFieldErrorMessage } from '@/lib/form/fieldMeta'
import { t } from '@/lib/strings'

import { <feature>FormSchema } from '../schemas/<feature>FormSchema'

export type <Feature>DialogHandle = {
  openCreate: () => void
  openEdit: (item: <Entity>) => void
  close: () => void
}

function <Feature>DialogImpl(
  {
    onSubmit,
  }: {
    onSubmit: (editing: <Entity> | null, value: <FormValues>) => Promise<void>
  },
  ref: ForwardedRef<<Feature>DialogHandle>,
) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<<Entity> | null>(null)
  const formId = useId()

  const form = useForm({
    defaultValues: {
      name: '',
      // ... other fields
    },
    onSubmit: async ({ value }) => {
      await onSubmit(editing, value)
      setOpen(false)
      setEditing(null)
      form.reset()
    },
    validators: {
      onSubmit: <feature>FormSchema,
    },
  })

  useImperativeHandle(ref, () => ({
    close() {
      setOpen(false)
      setEditing(null)
    },
    openCreate() {
      setEditing(null)
      form.setFieldValue('name', '')
      // reset other fields
      setOpen(true)
    },
    openEdit(item) {
      setEditing(item)
      form.setFieldValue('name', item.name)
      // set other fields from item
      setOpen(true)
    },
  }))

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setEditing(null)
      }}
    >
      <ResponsiveSheetContent className="max-w-full sm:max-h-[min(90vh,46rem)] sm:overflow-y-auto sm:max-w-lg md:max-w-3xl">
        <ModalHeading
          title={editing ? t.<feature>.editAction : t.<feature>.add}
          description={<p>{t.<feature>.dialogP1}</p>}
        />
        <form
          className="min-w-0 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
          }}
        >
          {/* Text field example */}
          <form.Field name="name">
            {(field) => {
              const err = firstFieldErrorMessage(field.state.meta)
              const errId = `${formId}-name-err`
              return (
                <Field invalid={!!err}>
                  <FieldLabel htmlFor={`${formId}-name`}>{t.<feature>.name}</FieldLabel>
                  <Input
                    aria-describedby={err ? errId : undefined}
                    aria-invalid={!!err}
                    id={`${formId}-name`}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError id={errId}>{err}</FieldError>
                </Field>
              )
            }}
          </form.Field>

          {/* Amount field example */}
          <form.Field name="amountVnd">
            {(field) => {
              const err = firstFieldErrorMessage(field.state.meta)
              const errId = `${formId}-amount-err`
              return (
                <Field invalid={!!err}>
                  <FieldLabel htmlFor={`${formId}-amount`}>{t.<feature>.amount}</FieldLabel>
                  <VndAmountInput
                    aria-describedby={err ? errId : undefined}
                    aria-invalid={!!err}
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

          {/* Month field example */}
          <form.Field name="validFrom">
            {(field) => {
              const err = firstFieldErrorMessage(field.state.meta)
              const errId = `${formId}-validFrom-err`
              return (
                <Field invalid={!!err}>
                  {/* Use FormLabelWithHint when a tooltip hint is needed */}
                  <FieldLabel>{t.<feature>.validFrom}</FieldLabel>
                  <MonthYearPicker
                    invalid={!!err}
                    value={field.state.value}
                    onChange={(v) => field.handleChange(v)}
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
      </ResponsiveSheetContent>
    </ResponsiveSheet>
  )
}

export const <Feature>Dialog = forwardRef(<Feature>DialogImpl)
```

---

### Step 4 — Wire ref in the parent page

```tsx
import { useRef } from 'react'
import { <Feature>Dialog, type <Feature>DialogHandle } from './components/<Feature>Dialog'

// Inside the page component:
const dialogRef = useRef<<Feature>DialogHandle>(null)

// Open from a button:
<Button onClick={() => dialogRef.current?.openCreate()}>{t.<feature>.add}</Button>

// Open edit from a table row:
<Button onClick={() => dialogRef.current?.openEdit(item)}>{t.common.edit}</Button>

// Render the dialog (outside tables/lists, at the end of JSX):
<Feature>Dialog
  ref={dialogRef}
  onSubmit={async (editing, value) => {
    if (editing) await mutations?.update(editing.id, value)
    else await mutations?.create(value)
  }}
/>
```

---

## Accessibility rules (mandatory)

- `useId()` once per dialog → ID prefix for all field elements.
- `aria-invalid={!!err}` on every `Input`, `SelectTrigger`, `VndAmountInput`, `MonthYearPicker`.
- `aria-describedby={err ? errId : undefined}` linking control to its `FieldError`.
- `id={errId}` on every `FieldError`.

## Key rules to follow

- `02-forms-dialog-edit-pattern` — imperative handle API
- `04-strings-and-ui-text` — all copy in `t.*`; dynamic strings as functions
- `05-tanstack-form-zod` — schema, `useForm`, `Field`/`FieldLabel`/`FieldError`
- `08-responsive-dialog` — shell components, sizing, cleanup on close
