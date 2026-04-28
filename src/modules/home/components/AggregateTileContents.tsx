import type { ReactNode } from 'react'

export function AggregateTileContents({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="text-2xl font-semibold tabular-nums">{children}</div>
      <div className="border-t border-border pt-3">{footer}</div>
    </div>
  )
}
