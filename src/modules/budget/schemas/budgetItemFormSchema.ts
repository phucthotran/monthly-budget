import type { MonthKey } from '@/lib/types'

import { z } from 'zod'

import { compareMonthKeys, currentMonthKey, MONTH_KEY_REGEX } from '@/lib/month'
import { t } from '@/lib/strings'

export function budgetItemFormSchema(isEditing: boolean) {
  return z
    .object({
      amountVnd: z.number().min(1000, { message: t.validation.amountAtLeastOne }),
      categoryId: z.string().min(1, { message: t.validation.categoryRequired }),
      title: z.string().refine((s) => s.trim().length > 0, { message: t.validation.titleRequired }),
      validFrom: z.string().regex(MONTH_KEY_REGEX, { message: t.validation.monthFormat }),
      validTo: z.string().refine(
        (s) => {
          const t = s.trim()
          return t === '' || MONTH_KEY_REGEX.test(t)
        },
        { message: t.validation.monthFormat },
      ),
    })
    .refine((data) => isEditing || compareMonthKeys(data.validFrom, currentMonthKey()) >= 0, {
      message: t.validation.validFromNotBeforeCurrent,
      path: ['validFrom'],
    })
    .refine(
      (data) => {
        const to = data.validTo.trim()
        if (!to) return true
        return compareMonthKeys(to, data.validFrom as MonthKey) >= 0
      },
      { message: t.validation.validToBeforeFrom, path: ['validTo'] },
    )
}
