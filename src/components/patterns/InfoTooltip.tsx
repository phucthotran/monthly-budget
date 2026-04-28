import { Info } from 'lucide-react'
import { type ReactNode } from 'react'

import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'

import { Button, Label, Tooltip, TooltipContent, TooltipTrigger } from '../ui'

export type InfoTooltipProps = {
  content: ReactNode
  ariaLabel?: string
  className?: string
  htmlTag?: 'button' | 'span'
}

export function InfoTooltip({ ariaLabel, className, content, htmlTag = 'button' }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {htmlTag === 'button' ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn('size-6 rounded-full text-muted-foreground hover:text-foreground', className)}
            aria-label={ariaLabel ?? t.common.moreInfo}
          >
            <Info className="size-3.5" aria-hidden />
          </Button>
        ) : (
          <span className={cn('inline-flex items-center justify-center min-w-0 cursor-pointer', className)}>
            <Info className="size-3.5" aria-hidden />
          </span>
        )}
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
