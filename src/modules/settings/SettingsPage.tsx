import { Plus, Settings } from 'lucide-react'
import { useState } from 'react'

import { useAuthContext } from '@/components/AuthProvider'
import { EmptyState, PageHeading, PageLoadingSkeleton, Panel } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { Button } from '@/components/ui'
import { useCategories } from '@/hooks/useUserCollections'
import { haptic } from '@/lib/haptics'
import { t } from '@/lib/strings'
import { runWithToast } from '@/lib/toast'

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
              <span className="hidden md:inline-flex">
                <Button type="button" onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4" />
                  {t.settings.add}
                </Button>
              </span>
            }
          />

          <CategoryDialog
            open={open}
            onOpenChange={setOpen}
            onSubmit={async (value) => {
              if (!mutations) return
              const maxOrder = categories.reduce((m, c) => Math.max(m, c.sortOrder ?? 0), 0)
              await runWithToast(
                () => mutations.addCategory({ name: value.name, sortOrder: maxOrder + 10 }),
                t.toast.categoryAdded,
              )
            }}
          />

          <Panel title={<></>}>
            <CategoriesTable
              categories={categories}
              onToggleArchive={(c) => {
                if (!mutations) return
                // No dialog to keep open here, so the reported failure needs no further unwinding.
                runWithToast(
                  () => mutations.toggleArchive(c),
                  c.archived ? t.toast.categoryShown : t.toast.categoryHidden,
                ).catch(() => undefined)
              }}
            />
            {categories.length === 0 ? (
              <EmptyState
                icon={<Settings />}
                title={t.settings.emptyList}
                description={t.settings.pageLead}
                action={
                  <Button type="button" onClick={() => setOpen(true)}>
                    <Plus className="h-4 w-4" />
                    {t.settings.add}
                  </Button>
                }
              />
            ) : null}
          </Panel>

          <Button
            type="button"
            size="icon"
            className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-6 z-40 h-14 w-14 rounded-full shadow-lg md:hidden"
            onClick={() => {
              haptic('light')
              setOpen(true)
            }}
            aria-label={t.settings.add}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </RequireAuth>
  )
}
