import * as React from 'react'

import { cn } from '@/lib/utils'

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'role' | 'type'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, className, disabled, onCheckedChange, ...props }, ref) => {
    return (
      <button
        aria-checked={checked}
        disabled={disabled}
        ref={ref}
        role="switch"
        type="button"
        className={cn(
          'peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent p-0.5 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-primary' : 'bg-muted-foreground/30',
          className,
        )}
        onClick={() => onCheckedChange?.(!checked)}
        {...props}
      >
        <span
          aria-hidden
          className={cn(
            'pointer-events-none block size-6 rounded-full bg-background shadow-md ring-0 transition-transform duration-200 ease-out',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    )
  },
)
Switch.displayName = 'Switch'

export { Switch }
