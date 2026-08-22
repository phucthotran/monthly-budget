import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, TableCell, TableRow } from '@/components/ui'
import { cn } from '@/lib/utils'

export function StatsYearHeaderRow({
  colSpan,
  isOpen,
  onToggle,
  year,
}: {
  colSpan: number
  isOpen: boolean
  onToggle: () => void
  year: string
}) {
  const { t } = useTranslation('stats')

  return (
    <TableRow className="hover:bg-transparent">
      <TableCell className="bg-slate-200 p-0 dark:bg-slate-800" colSpan={colSpan}>
        <Button
          type="button"
          variant="ghost"
          className="h-auto w-full justify-start gap-1 rounded-none px-2 py-2 text-sm font-semibold text-foreground hover:bg-muted/80"
          aria-expanded={isOpen}
          aria-label={`${year}: ${isOpen ? t('collapseYearGroup') : t('expandYearGroup')}`}
          onClick={onToggle}
        >
          <ChevronDown className={cn('size-4 shrink-0 transition-transform', !isOpen && '-rotate-90')} />
          {year}
        </Button>
      </TableCell>
    </TableRow>
  )
}
