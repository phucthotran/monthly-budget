import { z } from 'zod'

import i18n from '@/i18n'

export function categoryFormSchema() {
  return z.object({
    name: z.string().refine((s) => s.trim().length > 0, { message: i18n.t('validation.nameRequired') }),
  })
}
