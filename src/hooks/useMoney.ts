import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuthContext } from '@/components/AuthProvider'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { currencyMinAmountMinor, formatMoney, formatMoneyNumber, formatMoneyShort } from '@/lib/money'

export function useMoney() {
  const { user } = useAuthContext()
  const { currency, isHydrated, isLocked } = useUserPreferences(user?.uid)
  const { i18n } = useTranslation()
  const language = i18n.language.startsWith('en') ? 'en' : 'vi'

  return useMemo(
    () => ({
      currency,
      format: (n: number) => formatMoney(n, currency),
      formatNumber: (n: number) => formatMoneyNumber(n, currency),
      formatShort: (n: number) => formatMoneyShort(n, currency, language),
      isHydrated,
      isLocked,
      minAmountMinor: currencyMinAmountMinor(currency),
    }),
    [currency, isHydrated, isLocked, language],
  )
}
