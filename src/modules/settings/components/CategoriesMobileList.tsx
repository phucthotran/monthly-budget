import type { CategoriesTableProps } from './CategoriesTableDesktop'

import { Eye, EyeOff } from 'lucide-react'

import { Badge, Button } from '@/components/ui'
import { t } from '@/lib/strings'

export function CategoriesMobileList({ categories, onToggleArchive }: CategoriesTableProps) {
  return (
    <div className="space-y-2.5">
      {categories.map((c) => (
        <div
          key={c.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3.5"
        >
          <div className="min-w-0 flex-1 flex items-center gap-2.5">
            <span className="font-medium truncate">{c.name}</span>
            {c.archived ? (
              <Badge variant="muted" className="shrink-0">
                {t.settings.archived}
              </Badge>
            ) : (
              <Badge variant="secondary" className="shrink-0">
                {t.common.visible}
              </Badge>
            )}
          </div>
          <Button size="sm" variant="outline" className="shrink-0 gap-1.5" onClick={() => onToggleArchive(c)}>
            {c.archived ? (
              <>
                <Eye className="h-3.5 w-3.5" />
                {t.settings.show}
              </>
            ) : (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                {t.settings.hide}
              </>
            )}
          </Button>
        </div>
      ))}
    </div>
  )
}
