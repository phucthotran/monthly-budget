import { useForm } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { Button, Field, FieldError, FieldLabel } from '@/components/ui'
import { firstFieldErrorMessage } from '@/lib/form/fieldMeta'

import { pinCreateFormSchema } from '../schemas/pinFormSchema'

import { PinOtpField } from './PinOtpField'

export function PinSetupFields({
  disabled,
  formId,
  onSkip,
  onSubmitSetup,
  showSkip,
}: {
  disabled: boolean
  formId: string
  onSkip?: () => void
  onSubmitSetup: (pin: string) => Promise<void>
  showSkip: boolean
}) {
  const { t: ta } = useTranslation('auth')
  const { t: tc } = useTranslation()
  const form = useForm({
    defaultValues: { confirmPin: '', pin: '' },
    onSubmit: async ({ value }) => {
      await onSubmitSetup(value.pin)
      form.reset()
    },
    validators: {
      onSubmit: pinCreateFormSchema(),
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="pin">
        {(field) => {
          const err = firstFieldErrorMessage(field.state.meta)
          const errId = `${formId}-pin-err`
          return (
            <Field invalid={!!err}>
              <FieldLabel className="w-full justify-center" htmlFor={`${formId}-pin`}>
                {ta('pinLabel')}
              </FieldLabel>
              <PinOtpField
                autoFocus
                aria-describedby={err ? errId : undefined}
                disabled={disabled}
                id={`${formId}-pin`}
                invalid={!!err}
                value={field.state.value}
                onChange={(v) => field.handleChange(v)}
              />
              <FieldError className="text-center" id={errId}>
                {err}
              </FieldError>
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
              <FieldLabel className="w-full justify-center" htmlFor={`${formId}-confirm`}>
                {ta('confirmPin')}
              </FieldLabel>
              <PinOtpField
                aria-describedby={err ? errId : undefined}
                disabled={disabled}
                id={`${formId}-confirm`}
                invalid={!!err}
                value={field.state.value}
                onChange={(v) => field.handleChange(v)}
              />
              <FieldError className="text-center" id={errId}>
                {err}
              </FieldError>
            </Field>
          )
        }}
      </form.Field>
      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={disabled}>
          {disabled ? tc('loading') : ta('setupSubmit')}
        </Button>
        {showSkip && onSkip ? (
          <Button type="button" variant="outline" disabled={disabled} onClick={onSkip}>
            {ta('setupSkip')}
          </Button>
        ) : null}
      </div>
    </form>
  )
}
