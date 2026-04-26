import type { Category } from '@/lib/types'

import { Trash2 } from 'lucide-react'

import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { t } from '@/lib/strings'

export function CategoriesTable({
  categories,
  onDelete,
  onToggleArchive,
}: {
  categories: Category[]
  onToggleArchive: (c: Category) => void
  onDelete: (c: Category) => void
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[55%]">{t.settings.name}</TableHead>
            <TableHead className="whitespace-nowrap">{t.common.status}</TableHead>
            <TableHead className="w-[200px]" />
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
              <TableCell className="text-right whitespace-nowrap space-x-2">
                <Button size="sm" variant="outline" type="button" onClick={() => onToggleArchive(c)}>
                  {c.archived ? t.settings.show : t.settings.hide}
                </Button>
                <Button size="sm" variant="ghost" type="button" onClick={() => onDelete(c)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
