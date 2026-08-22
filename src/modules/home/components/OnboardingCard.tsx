import type { CurrencyCode } from '@/lib/types'

import { Link } from '@tanstack/react-router'
import { PiggyBank, Receipt, Sparkles, Wallet } from 'lucide-react'
import { type ComponentType, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuthContext } from '@/components/AuthProvider'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { usePreferencesMutations } from '@/hooks/usePreferencesMutations'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { DEFAULT_CURRENCY } from '@/lib/money'
import { runWithToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

type Step = {
  cta: string
  description: string
  icon: ComponentType<{ className?: string }>
  title: string
  to: '/budget' | '/income'
}

export function OnboardingCard() {
  const { t } = useTranslation('home')
  const { t: tc } = useTranslation()
  const { user } = useAuthContext()
  const { isHydrated, isLocked } = useUserPreferences(user?.uid)
  const mutations = usePreferencesMutations(user?.uid)
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY)
  const [pending, setPending] = useState(false)

  const steps: Step[] = useMemo(
    () => [
      {
        cta: t('onboarding.step1Cta'),
        description: t('onboarding.step1Desc'),
        icon: PiggyBank,
        title: t('onboarding.step1Title'),
        to: '/income',
      },
      {
        cta: t('onboarding.step2Cta'),
        description: t('onboarding.step2Desc'),
        icon: Wallet,
        title: t('onboarding.step2Title'),
        to: '/budget',
      },
      {
        cta: t('onboarding.step3Cta'),
        description: t('onboarding.step3Desc'),
        icon: Receipt,
        title: t('onboarding.step3Title'),
        to: '/budget',
      },
    ],
    [t],
  )

  async function confirmCurrency() {
    if (!mutations) return
    setPending(true)
    try {
      await runWithToast(() => mutations.setCurrencyOnce(currency), tc('toast.currencySaved'))
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden />
          {t('onboarding.title')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t('onboarding.description')}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {isHydrated && !isLocked ? (
          <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <div>
              <p className="font-medium">{t('onboarding.currencyTitle')}</p>
              <p className="text-sm text-muted-foreground text-pretty">{t('onboarding.currencyHint')}</p>
            </div>
            <div className="flex items-center gap-1.5" role="group" aria-label={t('onboarding.currencyTitle')}>
              {(['VND', 'USD'] as const).map((code) => {
                const active = currency === code
                return (
                  <Button
                    key={code}
                    type="button"
                    aria-pressed={active}
                    className={cn('min-w-16', active && '!bg-gray-300 dark:!bg-gray-700')}
                    variant={active ? 'secondary' : 'outline'}
                    onClick={() => setCurrency(code)}
                  >
                    {code === 'VND' ? tc('currencyVnd') : tc('currencyUsd')}
                  </Button>
                )
              })}
            </div>
            <Button type="button" disabled={pending || !mutations} onClick={() => void confirmCurrency()}>
              {pending ? tc('loading') : t('onboarding.currencyConfirm')}
            </Button>
          </div>
        ) : null}
        <ol className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <li
                key={step.title}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-2 font-medium">
                    <Icon className="h-4 w-4 text-primary" aria-hidden />
                    {step.title}
                  </div>
                  <p className="text-sm text-muted-foreground text-pretty">{step.description}</p>
                </div>
                <Button asChild size="sm" variant="outline" className="sm:shrink-0">
                  <Link to={step.to}>{step.cta}</Link>
                </Button>
              </li>
            )
          })}
        </ol>
        <p className="text-xs text-muted-foreground text-pretty">{t('onboarding.categoriesNote')}</p>
      </CardContent>
    </Card>
  )
}
