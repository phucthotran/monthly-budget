import { Info } from 'lucide-react'
import { type ReactNode } from 'react'

import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'

import { Button, Label, Tooltip, TooltipContent, TooltipTrigger } from '../ui'

export type InfoTooltipProps = {
  /** Nội dung: văn bản hoặc HTML/JSX (đoạn, danh sách, nhấn mạnh). */
  content: ReactNode
  /** Nhãn cho trình đọc màn hình (mặc định: `t.common.moreInfo`). */
  ariaLabel?: string
  className?: string
}

/** Icon thông tin kèm tooltip — dùng cạnh nhãn ngắn, nội dung khi hover. */
export function InfoTooltip({ ariaLabel, className, content }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('h-6 w-6 rounded-full text-muted-foreground hover:text-foreground', className)}
          aria-label={ariaLabel ?? t.common.moreInfo}
        >
          <Info className="h-3.5 w-3.5" aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm text-pretty text-left">
        <div className="space-y-1.5 text-sm font-normal leading-snug [&_strong]:font-medium [&_strong]:text-foreground">
          {content}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

export type FormLabelWithHintProps = {
  children: ReactNode
  /** Giải thích dạng văn hoặc JSX. */
  hint: ReactNode
  className?: string
}

export function FormLabelWithHint({ children, className, hint }: FormLabelWithHintProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Label>{children}</Label>
      <InfoTooltip content={hint} className="h-5 w-5" />
    </div>
  )
}
