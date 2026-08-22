import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as React from 'react'

import { type TouchTooltipActivation, useTouchTooltip } from '@/hooks/useTouchTooltip'
import { cn } from '@/lib/utils'

const TooltipProvider = TooltipPrimitive.Provider

type TouchTooltipContextValue = {
  triggerProps: ReturnType<typeof useTouchTooltip>['triggerProps']
}

const TouchTooltipContext = React.createContext<null | TouchTooltipContextValue>(null)

type TooltipProps = {
  touchActivation?: TouchTooltipActivation
  touchAutoHideMs?: number
} & React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>

function composeHandlers<E extends React.SyntheticEvent>(
  theirs?: React.EventHandler<E>,
  ours?: React.EventHandler<E>,
): React.EventHandler<E> | undefined {
  if (!theirs && !ours) return undefined
  return (event) => {
    ours?.(event)
    if (event.defaultPrevented) return
    theirs?.(event)
  }
}

function Tooltip({ children, touchActivation, touchAutoHideMs, ...props }: TooltipProps) {
  const touchEnabled = touchActivation != null
  const { rootProps, triggerProps } = useTouchTooltip({
    activation: touchActivation ?? 'tap',
    autoHideMs: touchAutoHideMs,
  })

  return (
    <TooltipPrimitive.Root {...props} {...(touchEnabled ? rootProps : {})}>
      {touchEnabled ? (
        <TouchTooltipContext.Provider value={{ triggerProps }}>{children}</TouchTooltipContext.Provider>
      ) : (
        children
      )}
    </TooltipPrimitive.Root>
  )
}

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ onClick, onPointerCancel, onPointerDown, onPointerUp, ...props }, ref) => {
  const ctx = React.useContext(TouchTooltipContext)
  const touch = ctx?.triggerProps

  return (
    <TooltipPrimitive.Trigger
      ref={ref}
      onClick={composeHandlers(onClick, touch?.onClick)}
      onPointerCancel={composeHandlers(onPointerCancel, touch?.onPointerCancel)}
      onPointerDown={composeHandlers(onPointerDown, touch?.onPointerDown)}
      onPointerUp={composeHandlers(onPointerUp, touch?.onPointerUp)}
      {...props}
    />
  )
})
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 max-w-xs overflow-hidden rounded-md border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
