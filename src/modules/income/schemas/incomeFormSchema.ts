import type { MonthKey } from '@/lib/types'

import { z } from 'zod'

import { compareMonthKeys, MONTH_KEY_REGEX } from '@/lib/month'
import { t } from '@/lib/strings'

export const incomeFormSchema = z
  .object({
    amountVnd: z.number().min(1000, { message: t.validation.amountAtLeastOne }),
    label: z.string().refine((s) => s.trim().length > 0, { message: t.validation.labelRequired }),
    validFrom: z.string().regex(MONTH_KEY_REGEX, { message: t.validation.monthFormat }),
    validTo: z.string().refine(
      (s) => {
        const t = s.trim()
        return t === '' || MONTH_KEY_REGEX.test(t)
      },
      { message: t.validation.monthFormat },
    ),
  })
  .refine(
    (data) => {
      const to = data.validTo.trim()
      if (!to) return true
      return compareMonthKeys(to, data.validFrom as MonthKey) >= 0
    },
    { message: t.validation.validToBeforeFrom, path: ['validTo'] },
  )
