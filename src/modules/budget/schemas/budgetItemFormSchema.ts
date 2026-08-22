import type { CurrencyCode, MonthKey } from '@/lib/types'

import { z } from 'zod'

import i18n from '@/i18n'
import { currencyMinAmountMinor, formatMoney } from '@/lib/money'
import { compareMonthKeys, currentMonthKey, MONTH_KEY_REGEX } from '@/lib/month'

export function budgetItemFormSchema(isEditing: boolean, currency: CurrencyCode) {
  const min = currencyMinAmountMinor(currency)
  const minLabel = formatMoney(min, currency)
  return z
    .object({
      amountVnd: z.number().min(min, { message: i18n.t('validation.amountAtLeastOne', { min: minLabel }) }),
      categoryId: z.string().min(1, { message: i18n.t('validation.categoryRequired') }),
      title: z.string().refine((s) => s.trim().length > 0, { message: i18n.t('validation.titleRequired') }),
      validFrom: z.string().regex(MONTH_KEY_REGEX, { message: i18n.t('validation.monthFormat') }),
      validTo: z.string().refine(
        (s) => {
          const trimmed = s.trim()
          return trimmed === '' || MONTH_KEY_REGEX.test(trimmed)
        },
        { message: i18n.t('validation.monthFormat') },
      ),
    })
    .refine((data) => isEditing || compareMonthKeys(data.validFrom, currentMonthKey()) >= 0, {
      message: i18n.t('validation.validFromNotBeforeCurrent'),
      path: ['validFrom'],
    })
    .refine(
      (data) => {
        const to = data.validTo.trim()
        if (!to) return true
        return compareMonthKeys(to, data.validFrom as MonthKey) >= 0
      },
      { message: i18n.t('validation.validToBeforeFrom'), path: ['validTo'] },
    )
}
