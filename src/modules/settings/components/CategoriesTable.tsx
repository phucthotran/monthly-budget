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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.settings.name}</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead className="w-[200px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((c) => (
          <TableRow key={c.id}>
            <TableCell className="font-medium">{c.name}</TableCell>
            <TableCell>
              {c.archived ? (
                <Badge variant="muted">{t.settings.archived}</Badge>
              ) : (
                <Badge variant="secondary">Hiển thị</Badge>
              )}
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button size="sm" variant="outline" type="button" onClick={() => onToggleArchive(c)}>
                {c.archived ? 'Hiện' : 'Ẩn'}
              </Button>
              <Button size="sm" variant="ghost" type="button" onClick={() => onDelete(c)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
