import { type MouseEventHandler, type PointerEventHandler, useCallback, useEffect, useRef, useState } from 'react'

import { usePrefersTouch } from './usePrefersTouch'

const DEFAULT_AUTO_HIDE_MS = 5_000
const LONG_PRESS_MS = 500

export type TouchTooltipActivation = 'longPress' | 'tap'

export type UseTouchTooltipOptions = {
  activation: TouchTooltipActivation
  autoHideMs?: number
}

export type TouchTooltipRootProps = {
  delayDuration?: number
  onOpenChange?: (open: boolean) => void
  open?: boolean
}

export type TouchTooltipTriggerProps = {
  onClick?: MouseEventHandler<HTMLElement>
  onPointerCancel?: PointerEventHandler<HTMLElement>
  onPointerDown?: PointerEventHandler<HTMLElement>
  onPointerUp?: PointerEventHandler<HTMLElement>
}

export function useTouchTooltip({ activation, autoHideMs = DEFAULT_AUTO_HIDE_MS }: UseTouchTooltipOptions): {
  rootProps: TouchTooltipRootProps
  triggerProps: TouchTooltipTriggerProps
} {
  const prefersTouch = usePrefersTouch()
  const [open, setOpen] = useState(false)
  const autoHideTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const ignoreCloseRef = useRef(false)
  const longPressHandledRef = useRef(false)

  const clearAutoHideTimer = useCallback(() => {
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current)
      autoHideTimerRef.current = undefined
    }
  }, [])

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = undefined
    }
  }, [])

  const showTooltip = useCallback(() => {
    clearAutoHideTimer()
    ignoreCloseRef.current = true
    setOpen(true)
    autoHideTimerRef.current = setTimeout(() => {
      setOpen(false)
    }, autoHideMs)
  }, [autoHideMs, clearAutoHideTimer])

  useEffect(() => {
    return () => {
      clearAutoHideTimer()
      clearLongPressTimer()
    }
  }, [clearAutoHideTimer, clearLongPressTimer])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setOpen(true)
        return
      }

      if (ignoreCloseRef.current) {
        ignoreCloseRef.current = false
        return
      }

      clearAutoHideTimer()
      setOpen(false)
    },
    [clearAutoHideTimer],
  )

  if (!prefersTouch) {
    return { rootProps: {}, triggerProps: {} }
  }

  if (activation === 'tap') {
    return {
      rootProps: {
        delayDuration: 0,
        onOpenChange: handleOpenChange,
        open,
      },
      triggerProps: {
        onClick: (event) => {
          showTooltip()
          event.currentTarget.focus()
        },
      },
    }
  }

  return {
    rootProps: {
      delayDuration: 0,
      onOpenChange: handleOpenChange,
      open,
    },
    triggerProps: {
      onClick: (event) => {
        if (longPressHandledRef.current) {
          longPressHandledRef.current = false
          event.preventDefault()
          event.stopPropagation()
        }
      },
      onPointerCancel: () => {
        clearLongPressTimer()
      },
      onPointerDown: () => {
        clearLongPressTimer()
        longPressTimerRef.current = setTimeout(() => {
          longPressHandledRef.current = true
          showTooltip()
        }, LONG_PRESS_MS)
      },
      onPointerUp: () => {
        clearLongPressTimer()
      },
    },
  }
}
