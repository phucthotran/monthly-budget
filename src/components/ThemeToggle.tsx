import { Monitor, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { ActionTooltipButton } from './patterns/ActionTooltipButton'
import { useTheme } from './ThemeProvider'

export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { setTheme, theme } = useTheme()

  const items = [
    { icon: Sun, label: t('themeLight'), value: 'light' as const },
    { icon: Moon, label: t('themeDark'), value: 'dark' as const },
    { icon: Monitor, label: t('themeSystem'), value: 'system' as const },
  ]

  return (
    <div aria-label={t('theme')} className={cn('inline-flex items-center gap-0.5', className)} role="group">
      {items.map((item) => {
        const Icon = item.icon
        const active = theme === item.value
        return (
          <ActionTooltipButton
            key={item.value}
            label={item.label}
            aria-pressed={active}
            className={cn('shrink-0', {
              '!bg-gray-300 dark:!bg-gray-700': active,
            })}
            variant={active ? 'secondary' : 'ghost'}
            onClick={() => {
              setTheme(item.value)
            }}
          >
            <Icon className="h-4 w-4" />
          </ActionTooltipButton>
        )
      })}
    </div>
  )
}
