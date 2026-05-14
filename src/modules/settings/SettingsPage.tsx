import { Plus, Settings } from 'lucide-react'
import { useState } from 'react'

import { useAuthContext } from '@/components/AuthProvider'
import { PageHeading, PageLoadingSkeleton, Panel } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { Button } from '@/components/ui'
import { useCategories } from '@/hooks/useUserCollections'
import { t } from '@/lib/strings'

import { CategoriesTable } from './components/CategoriesTable'
import { CategoryDialog } from './components/CategoryDialog'
import { useCategoryMutations } from './hooks/useCategoryMutations'

export function SettingsPage() {
  const { user } = useAuthContext()
  const uid = user?.uid
  const { data: categories = [], isHydrated: categoriesReady } = useCategories(uid)
  const dataLoading = !categoriesReady

  const [open, setOpen] = useState(false)

  const mutations = useCategoryMutations(uid)

  return (
    <RequireAuth>
      {dataLoading ? (
        <PageLoadingSkeleton showHeadingAction />
      ) : (
        <div className="space-y-6">
          <PageHeading
            icon={<Settings />}
            title={t.settings.title}
            description={
              <div className="space-y-2 text-pretty">
                <p>{t.settings.pageLead}</p>
                <p className="text-sm text-muted-foreground">{t.settings.pageDetail}</p>
              </div>
            }
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

          <Panel title={<></>}>
            <CategoriesTable
              categories={categories}
              onToggleArchive={async (c) => {
                if (!mutations) return
                await mutations.toggleArchive(c)
              }}
            />
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">{t.settings.emptyList}</p>
            ) : null}
          </Panel>
        </div>
      )}
    </RequireAuth>
  )
}
