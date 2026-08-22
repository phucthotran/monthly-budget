import { useForm } from '@tanstack/react-form'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { ModalHeading, ResponsiveSheet, ResponsiveSheetContent } from '@/components/patterns'
import { Button, DialogFooter, Field, FieldError, FieldLabel, Input } from '@/components/ui'
import { firstFieldErrorMessage } from '@/lib/form/fieldMeta'

import { categoryFormSchema } from '../schemas/categoryFormSchema'

export function CategoryDialog({
  onOpenChange,
  onSubmit,
  open,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (value: { name: string }) => Promise<void>
}) {
  const { t } = useTranslation('settings')
  const { t: tc } = useTranslation()
  const formId = useId()
  const form = useForm({
    defaultValues: { name: '' },
    onSubmit: async ({ value }) => {
      await onSubmit({ name: value.name.trim() })
      onOpenChange(false)
      form.reset()
    },
    validators: {
      onSubmit: categoryFormSchema(),
    },
  })

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (v) form.reset({ name: '' })
      }}
    >
      <ResponsiveSheetContent>
        <ModalHeading
          title={t('add')}
          description={
            <div className="space-y-2.5 text-pretty leading-relaxed">
              <p>{t('dialogP1')}</p>
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
          <form.Field name="name">
            {(field) => {
              const err = firstFieldErrorMessage(field.state.meta)
              const errId = `${formId}-name-err`
              return (
                <Field invalid={!!err}>
                  <FieldLabel htmlFor={`${formId}-name`}>{t('name')}</FieldLabel>
                  <Input
                    aria-describedby={err ? errId : undefined}
                    aria-invalid={!!err}
                    id={`${formId}-name`}
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tc('cancel')}
            </Button>
            <Button type="submit">{tc('save')}</Button>
          </DialogFooter>
        </form>
      </ResponsiveSheetContent>
    </ResponsiveSheet>
  )
}
