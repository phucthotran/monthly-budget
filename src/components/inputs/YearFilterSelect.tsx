import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui'

export function YearFilterSelect({
  className,
  hideLabelOnMobile,
  onValueChange,
  value,
  years,
}: {
  className?: string
  hideLabelOnMobile?: boolean
  value: number
  onValueChange: (year: number) => void
  years: number[]
}) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex flex-wrap items-center gap-2', hideLabelOnMobile && 'min-w-0', className)}>
      <span
        className={cn('text-sm text-muted-foreground whitespace-nowrap', hideLabelOnMobile && 'sr-only sm:not-sr-only')}
      >
        {t('year')}
      </span>
      <Select value={String(value)} onValueChange={(v) => onValueChange(Number(v))}>
        <SelectTrigger className={hideLabelOnMobile ? 'w-full sm:w-[5.75rem]' : 'w-[5.75rem]'}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {String(y)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
