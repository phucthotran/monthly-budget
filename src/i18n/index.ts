import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import enAuth from '@/locales/en/auth.json'
import enBudget from '@/locales/en/budget.json'
import enCommon from '@/locales/en/common.json'
import enHome from '@/locales/en/home.json'
import enIncome from '@/locales/en/income.json'
import enSettings from '@/locales/en/settings.json'
import enStats from '@/locales/en/stats.json'
import viAuth from '@/locales/vi/auth.json'
import viBudget from '@/locales/vi/budget.json'
import viCommon from '@/locales/vi/common.json'
import viHome from '@/locales/vi/home.json'
import viIncome from '@/locales/vi/income.json'
import viSettings from '@/locales/vi/settings.json'
import viStats from '@/locales/vi/stats.json'

export const SUPPORTED_LOCALES = ['en', 'vi'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = 'vi'

function applyDocumentLang(lng: string) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = lng === 'en' ? 'en' : 'vi'
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    defaultNS: 'common',
    detection: {
      caches: ['localStorage'],
      order: ['localStorage'],
    },
    fallbackLng: DEFAULT_LOCALE,
    interpolation: { escapeValue: false },
    ns: ['common', 'auth', 'home', 'budget', 'income', 'stats', 'settings'],
    react: { useSuspense: false },
    resources: {
      en: {
        auth: enAuth,
        budget: enBudget,
        common: enCommon,
        home: enHome,
        income: enIncome,
        settings: enSettings,
        stats: enStats,
      },
      vi: {
        auth: viAuth,
        budget: viBudget,
        common: viCommon,
        home: viHome,
        income: viIncome,
        settings: viSettings,
        stats: viStats,
      },
    },
    supportedLngs: [...SUPPORTED_LOCALES],
  })

applyDocumentLang(i18n.language)
i18n.on('languageChanged', applyDocumentLang)

export default i18n
