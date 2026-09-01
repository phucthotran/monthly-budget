import { z } from 'zod'

import i18n from '@/i18n'
import { PIN_DIGIT_REGEX } from '@/lib/pinCrypto'

function pinField() {
  return z.string().regex(PIN_DIGIT_REGEX, { message: i18n.t('validation.pinFormat') })
}

export function pinCreateFormSchema() {
  return z
    .object({
      confirmPin: pinField(),
      pin: pinField(),
    })
    .refine((data) => data.pin === data.confirmPin, {
      message: i18n.t('validation.pinConfirmMismatch'),
      path: ['confirmPin'],
    })
}

export function pinEditFormSchema(requireCurrent: boolean) {
  return z
    .object({
      confirmPin: pinField(),
      currentPin: requireCurrent ? pinField() : z.string(),
      pin: pinField(),
    })
    .refine((data) => data.pin === data.confirmPin, {
      message: i18n.t('validation.pinConfirmMismatch'),
      path: ['confirmPin'],
    })
}
