import 'i18next'

import type auth from '@/locales/vi/auth.json'
import type budget from '@/locales/vi/budget.json'
import type common from '@/locales/vi/common.json'
import type home from '@/locales/vi/home.json'
import type income from '@/locales/vi/income.json'
import type settings from '@/locales/vi/settings.json'
import type stats from '@/locales/vi/stats.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      auth: typeof auth
      budget: typeof budget
      common: typeof common
      home: typeof home
      income: typeof income
      settings: typeof settings
      stats: typeof stats
    }
  }
}
