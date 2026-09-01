import { useForm } from '@tanstack/react-form'
import { type ForwardedRef, forwardRef, useId, useImperativeHandle, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ModalHeading, ResponsiveSheet, ResponsiveSheetContent } from '@/components/patterns'
import { Button, DialogFooter, Field, FieldError, FieldLabel } from '@/components/ui'
import { firstFieldErrorMessage } from '@/lib/form/fieldMeta'

import { pinEditFormSchema } from '../schemas/pinFormSchema'

import { PinOtpField } from './PinOtpField'

export type PinEditDialogHandle = {
  close: () => void
  openChange: () => void
  openCreate: () => void
}

type Mode = 'change' | 'create'

function PinEditDialogImpl(
  {
    onSave,
    verifyCurrentPin,
  }: {
    onSave: (pin: string) => Promise<void>
    verifyCurrentPin: (pin: string) => Promise<boolean>
  },
  ref: ForwardedRef<PinEditDialogHandle>,
) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('create')

  useImperativeHandle(ref, () => ({
    close() {
      setOpen(false)
    },
    openChange() {
      setMode('change')
      setOpen(true)
    },
    openCreate() {
      setMode('create')
      setOpen(true)
    },
  }))

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
      }}
    >
      <ResponsiveSheetContent className="max-w-full sm:max-h-[min(90vh,46rem)] sm:overflow-y-auto sm:max-w-lg md:max-w-3xl">
        {open ? (
          <PinEditForm
            key={mode}
            mode={mode}
            onClose={() => setOpen(false)}
            onSave={onSave}
            verifyCurrentPin={verifyCurrentPin}
          />
        ) : null}
      </ResponsiveSheetContent>
    </ResponsiveSheet>
  )
}

function PinEditForm({
  mode,
  onClose,
  onSave,
  verifyCurrentPin,
}: {
  mode: Mode
  onClose: () => void
  onSave: (pin: string) => Promise<void>
  verifyCurrentPin: (pin: string) => Promise<boolean>
}) {
  const { t: ta } = useTranslation('auth')
  const { t: tc } = useTranslation()
  const formId = useId()
  const [wrongCurrent, setWrongCurrent] = useState(false)

  const form = useForm({
    defaultValues: {
      confirmPin: '',
      currentPin: '',
      pin: '',
    },
    onSubmit: async ({ value }) => {
      if (mode === 'change') {
        const ok = await verifyCurrentPin(value.currentPin)
        if (!ok) {
          setWrongCurrent(true)
          return
        }
      }
      await onSave(value.pin)
      onClose()
      form.reset()
    },
    validators: {
      onSubmit: pinEditFormSchema(mode === 'change'),
    },
  })

  return (
    <>
      <ModalHeading
        title={mode === 'change' ? ta('editTitle') : ta('setupTitle')}
        description={<p>{mode === 'change' ? ta('editDescription') : ta('createDescription')}</p>}
      />
      <form
        className="min-w-0 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        {mode === 'change' ? (
          <form.Field name="currentPin">
            {(field) => {
              const err = firstFieldErrorMessage(field.state.meta) ?? (wrongCurrent ? ta('errorWrongPin') : undefined)
              const errId = `${formId}-current-err`
              return (
                <Field invalid={!!err}>
                  <FieldLabel htmlFor={`${formId}-current`}>{ta('currentPin')}</FieldLabel>
                  <PinOtpField
                    autoFocus
                    aria-describedby={err ? errId : undefined}
                    id={`${formId}-current`}
                    invalid={!!err}
                    value={field.state.value}
                    onChange={(v) => {
                      setWrongCurrent(false)
                      field.handleChange(v)
                    }}
                  />
                  <FieldError id={errId}>{err}</FieldError>
                </Field>
              )
            }}
          </form.Field>
        ) : null}
        <form.Field name="pin">
          {(field) => {
            const err = firstFieldErrorMessage(field.state.meta)
            const errId = `${formId}-pin-err`
            return (
              <Field invalid={!!err}>
                <FieldLabel htmlFor={`${formId}-pin`}>{mode === 'change' ? ta('newPin') : ta('pinLabel')}</FieldLabel>
                <PinOtpField
                  autoFocus={mode === 'create'}
                  aria-describedby={err ? errId : undefined}
                  id={`${formId}-pin`}
                  invalid={!!err}
                  value={field.state.value}
                  onChange={(v) => field.handleChange(v)}
                />
                <FieldError id={errId}>{err}</FieldError>
              </Field>
            )
          }}
        </form.Field>
        <form.Field name="confirmPin">
          {(field) => {
            const err = firstFieldErrorMessage(field.state.meta)
            const errId = `${formId}-confirm-err`
            return (
              <Field invalid={!!err}>
                <FieldLabel htmlFor={`${formId}-confirm`}>{ta('confirmPin')}</FieldLabel>
                <PinOtpField
                  aria-describedby={err ? errId : undefined}
                  id={`${formId}-confirm`}
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
          <Button type="button" variant="outline" onClick={onClose}>
            {tc('cancel')}
          </Button>
          <Button type="submit">{tc('save')}</Button>
        </DialogFooter>
      </form>
    </>
  )
}

export const PinEditDialog = forwardRef(PinEditDialogImpl)
