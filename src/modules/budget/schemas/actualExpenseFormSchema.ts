import type { CurrencyCode } from '@/lib/types'

import { z } from 'zod'

import i18n from '@/i18n'
import { currencyMinAmountMinor, formatMoney } from '@/lib/money'
import { currentMonthKey, MONTH_KEY_REGEX } from '@/lib/month'

export function actualExpenseFormSchema(currency: CurrencyCode) {
  const min = currencyMinAmountMinor(currency)
  const minLabel = formatMoney(min, currency)
  return z
    .object({
      amountVnd: z.number().min(min, { message: i18n.t('validation.amountAtLeastOne', { min: minLabel }) }),
      note: z.string().min(1, i18n.t('validation.noteRequired')),
      spentMonth: z.string().regex(MONTH_KEY_REGEX, { message: i18n.t('validation.monthFormat') }),
    })
    .refine((value) => value.spentMonth === currentMonthKey(), {
      message: i18n.t('validation.actualSpentMonthCurrentOnly'),
      path: ['spentMonth'],
    })
}
