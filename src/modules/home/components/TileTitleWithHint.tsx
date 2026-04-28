import type { ReactNode } from 'react'

import { InfoTooltip } from '@/components/patterns'

export function TileTitleWithHint({ content, label }: { content: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 min-w-0">
      {label}
      <InfoTooltip content={content} className="h-5 w-5 shrink-0" />
    </span>
  )
}
