import { Plus } from 'lucide-react'
import { createPortal } from 'react-dom'

import { useIsPageSwiping } from '@/hooks/usePageSwipe'
import { haptic } from '@/lib/haptics'
import { cn } from '@/lib/utils'

import { Button } from '../ui'

export type MobileFabProps = {
  className?: string
  /** Accessible name, e.g. `t.budget.add`. */
  label: string
  onClick: () => void
}

/**
 * Mobile "add" action pinned to the bottom-right of the viewport.
 *
 * Portals to `document.body` so the page transition can transform its wrapper:
 * a `transform` on any ancestor would turn that ancestor into the containing
 * block for this `position: fixed` button and re-anchor it mid-animation. The
 * flip side of being outside the page is that it has to bow out of swipes
 * itself, or it would hang over the page swiping in.
 */
export function MobileFab({ className, label, onClick }: MobileFabProps) {
  const isSwiping = useIsPageSwiping()

  return createPortal(
    <Button
      type="button"
      size="icon"
      aria-label={label}
      className={cn(
        'fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-6 z-40 h-14 w-14 rounded-full shadow-lg transition-opacity duration-150 md:hidden',
        isSwiping && 'pointer-events-none opacity-0',
        className,
      )}
      onClick={() => {
        haptic('light')
        onClick()
      }}
    >
      <Plus className="h-6 w-6" />
    </Button>,
    document.body,
  )
}
