import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { Button, type ButtonProps, Tooltip, TooltipContent, TooltipTrigger } from '../ui'

export type ActionTooltipButtonProps = {
  children: ReactNode
  label: string
} & Omit<ButtonProps, 'children' | 'size'>

export function ActionTooltipButton({ children, className, disabled, label, ...props }: ActionTooltipButtonProps) {
  const button = (
    <Button
      {...props}
      aria-label={label}
      className={cn('h-8 w-8', className)}
      disabled={disabled}
      size="icon"
      type="button"
    >
      {children}
    </Button>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>{disabled ? <span className="inline-flex">{button}</span> : button}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
