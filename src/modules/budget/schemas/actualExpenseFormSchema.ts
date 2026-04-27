import { z } from 'zod'

import { MONTH_KEY_REGEX } from '@/lib/month'
import { t } from '@/lib/strings'

export const actualExpenseFormSchema = z.object({
  amountVnd: z.number().min(1000, { message: t.validation.amountAtLeastOne }),
  note: z.string().optional(),
  spentMonth: z.string().regex(MONTH_KEY_REGEX, { message: t.validation.monthFormat }),
})
