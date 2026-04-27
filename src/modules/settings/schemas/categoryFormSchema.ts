import { z } from 'zod'

import { t } from '@/lib/strings'

export const categoryFormSchema = z.object({
  name: z.string().refine((s) => s.trim().length > 0, { message: t.validation.nameRequired }),
})
