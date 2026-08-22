import type { CategoriesTableProps } from './CategoriesTableDesktop'

import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge, Button } from '@/components/ui'

export function CategoriesMobileList({ categories, onToggleArchive }: CategoriesTableProps) {
  const { t } = useTranslation('settings')
  const { t: tc } = useTranslation()

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
                {t('archived')}
              </Badge>
            ) : (
              <Badge variant="secondary" className="shrink-0">
                {tc('visible')}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-10 shrink-0 gap-1.5 md:h-8"
            onClick={() => onToggleArchive(c)}
          >
            {c.archived ? (
              <>
                <Eye className="h-4 w-4" />
                {t('show')}
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                {t('hide')}
              </>
            )}
          </Button>
        </div>
      ))}
    </div>
  )
}
