import { z } from 'zod'

import { currentMonthKey, MONTH_KEY_REGEX } from '@/lib/month'
import { t } from '@/lib/strings'

export const actualExpenseFormSchema = z
  .object({
    amountVnd: z.number().min(1000, { message: t.validation.amountAtLeastOne }),
    note: z.string().min(1, t.validation.noteRequired),
    spentMonth: z.string().regex(MONTH_KEY_REGEX, { message: t.validation.monthFormat }),
  })
  .refine((value) => value.spentMonth === currentMonthKey(), {
    message: t.validation.actualSpentMonthCurrentOnly,
    path: ['spentMonth'],
  })
