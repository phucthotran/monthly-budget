import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { ActionTooltipButton } from './patterns/ActionTooltipButton'

const LOCALE_FLAGS = {
  en: '🇬🇧',
  vi: '🇻🇳',
} as const

export function LocaleToggle({ className }: { className?: string }) {
  const { i18n, t } = useTranslation()
  const locale = i18n.language.startsWith('en') ? 'en' : 'vi'
  const nextLocale = locale === 'vi' ? 'en' : 'vi'

  return (
    <ActionTooltipButton
      className={cn('shrink-0', className)}
      label={locale === 'vi' ? t('langVi') : t('langEn')}
      tooltipLabel={nextLocale === 'vi' ? t('langVi') : t('langEn')}
      variant="ghost"
      onClick={() => {
        void i18n.changeLanguage(nextLocale)
      }}
    >
      <span aria-hidden className="text-base leading-none">
        {LOCALE_FLAGS[locale]}
      </span>
    </ActionTooltipButton>
  )
}
