import type { Category } from '@/lib/types'

import { Eye, EyeOff } from 'lucide-react'

import { ActionTooltipButton } from '@/components/patterns'
import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { t } from '@/lib/strings'

export type CategoriesTableProps = {
  categories: Category[]
  onToggleArchive: (c: Category) => void
}

export function CategoriesTableDesktop({ categories, onToggleArchive }: CategoriesTableProps) {
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[55%]">{t.settings.name}</TableHead>
            <TableHead className="whitespace-nowrap">{t.common.status}</TableHead>
            <TableHead className="w-[96px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium max-w-[18rem] truncate">
                <span className="block truncate">{c.name}</span>
              </TableCell>
              <TableCell>
                {c.archived ? (
                  <Badge variant="muted">{t.settings.archived}</Badge>
                ) : (
                  <Badge variant="secondary">{t.common.visible}</Badge>
                )}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                <div className="inline-flex items-center justify-end gap-1">
                  <ActionTooltipButton
                    variant="outline"
                    onClick={() => onToggleArchive(c)}
                    label={c.archived ? t.settings.showAction : t.settings.hideAction}
                  >
                    {c.archived ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </ActionTooltipButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
