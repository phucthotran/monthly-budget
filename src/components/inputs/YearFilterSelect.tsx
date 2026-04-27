import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'

export function YearFilterSelect({
  className,
  onValueChange,
  value,
  years,
}: {
  className?: string
  value: number
  onValueChange: (year: number) => void
  years: number[]
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground whitespace-nowrap">{t.common.year}</span>
      <Select value={String(value)} onValueChange={(v) => onValueChange(Number(v))}>
        <SelectTrigger className="w-[5.75rem]">
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
