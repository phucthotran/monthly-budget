import { Monitor, Moon, Sun } from 'lucide-react'

import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'

import { ActionTooltipButton } from './patterns/ActionTooltipButton'
import { useTheme } from './ThemeProvider'

const items = [
  { icon: Sun, label: t.common.themeLight, value: 'light' as const },
  { icon: Moon, label: t.common.themeDark, value: 'dark' as const },
  { icon: Monitor, label: t.common.themeSystem, value: 'system' as const },
] as const

export function ThemeToggle({ className, fullWidth = false }: { className?: string; fullWidth?: boolean }) {
  const { setTheme, theme } = useTheme()

  return (
    <div
      aria-label={t.common.theme}
      className={cn('flex items-center gap-0.5', fullWidth ? 'w-full justify-center' : 'inline-flex', className)}
      role="group"
    >
      {items.map((item) => {
        const Icon = item.icon
        const active = theme === item.value
        return (
          <ActionTooltipButton
            key={item.value}
            label={item.label}
            aria-pressed={active}
            className="shrink-0"
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
