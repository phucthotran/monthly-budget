import { Link } from '@tanstack/react-router'
import { PiggyBank, Receipt, Sparkles, Wallet } from 'lucide-react'
import { type ComponentType } from 'react'

import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { t } from '@/lib/strings'

type Step = {
  cta: string
  description: string
  icon: ComponentType<{ className?: string }>
  title: string
  to: '/budget' | '/income'
}

const steps: Step[] = [
  {
    cta: t.home.onboarding.step1Cta,
    description: t.home.onboarding.step1Desc,
    icon: PiggyBank,
    title: t.home.onboarding.step1Title,
    to: '/income',
  },
  {
    cta: t.home.onboarding.step2Cta,
    description: t.home.onboarding.step2Desc,
    icon: Wallet,
    title: t.home.onboarding.step2Title,
    to: '/budget',
  },
  {
    cta: t.home.onboarding.step3Cta,
    description: t.home.onboarding.step3Desc,
    icon: Receipt,
    title: t.home.onboarding.step3Title,
    to: '/budget',
  },
]

export function OnboardingCard() {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden />
          {t.home.onboarding.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t.home.onboarding.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
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
        <p className="text-xs text-muted-foreground text-pretty">{t.home.onboarding.categoriesNote}</p>
      </CardContent>
    </Card>
  )
}
