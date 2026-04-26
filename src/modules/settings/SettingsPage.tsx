import { Plus, Settings } from 'lucide-react'
import { useState } from 'react'

import { useAuthContext } from '@/components/AuthProvider'
import { PageHeading, Panel } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { Button } from '@/components/ui'
import { useCategories } from '@/hooks/useUserCollections'
import { t } from '@/lib/strings'

import { CategoriesTable } from './components/CategoriesTable'
import { CategoryDialog } from './components/CategoryDialog'
import { categoryMutations } from './hooks/useCategoryMutations'

export function SettingsPage() {
  const { user } = useAuthContext()
  const uid = user?.uid
  const { data: categories = [] } = useCategories(uid)

  const [open, setOpen] = useState(false)

  const mutations = uid ? categoryMutations(uid) : null

  return (
    <RequireAuth>
      <div className="space-y-6">
        <PageHeading
          icon={<Settings />}
          title={t.settings.title}
          description="Dùng để phân loại các khoản dự chi."
          actions={
            <Button type="button" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              {t.settings.add}
            </Button>
          }
        />

        <CategoryDialog
          open={open}
          onOpenChange={setOpen}
          onSubmit={async (value) => {
            if (!mutations) return
            const maxOrder = categories.reduce((m, c) => Math.max(m, c.sortOrder ?? 0), 0)
            await mutations.addCategory({ name: value.name, sortOrder: maxOrder + 10 })
          }}
        />

        <Panel title="Danh sách" description="Ẩn danh mục không xóa dữ liệu cũ.">
          <CategoriesTable
            categories={categories}
            onToggleArchive={(c) => {
              if (!mutations) return
              void mutations.toggleArchive(c)
            }}
            onDelete={(c) => {
              if (!mutations) return
              if (!confirm(`Xóa danh mục “${c.name}”?`)) return
              void mutations.deleteCategory(c)
            }}
          />
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Chưa có danh mục.</p>
          ) : null}
        </Panel>
      </div>
    </RequireAuth>
  )
}
