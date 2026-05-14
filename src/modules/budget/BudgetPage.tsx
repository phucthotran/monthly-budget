import type { ActualExpense, BudgetItem } from '@/lib/types'

import { Plus, Wallet } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import { useAuthContext } from '@/components/AuthProvider'
import { YearFilterSelect } from '@/components/inputs'
import { ConfirmDeleteDialog, PageHeading, PageLoadingSkeleton, Panel } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { Button } from '@/components/ui'
import { useActualExpenses, useBudgetItems, useCategories } from '@/hooks/useUserCollections'
import { useYearFilterPageState } from '@/hooks/useYearFilterPageState'
import { asOfMonthForYearFilter, currentMonthKey, formatMonthLabel } from '@/lib/month'
import { actualExpenseLineDeleteDialogP1, budgetDeleteDialogP1, t } from '@/lib/strings'
import { formatVnd } from '@/lib/vnd'

import { ActualExpenseDialog, type ActualExpenseDialogHandle } from './components/ActualExpenseDialog'
import { BudgetItemDialog, type BudgetItemDialogHandle } from './components/BudgetItemDialog'
import { BudgetItemsTable } from './components/BudgetItemsTable'
import { useBudgetDerived } from './hooks/useBudgetDerived'
import { useBudgetMutations } from './hooks/useBudgetMutations'

export function BudgetPage() {
  const { user } = useAuthContext()
  const uid = user?.uid

  const { data: categories = [], isHydrated: categoriesReady } = useCategories(uid)

  const [itemToDelete, setItemToDelete] = useState<BudgetItem | null>(null)
  const [actualLineToDelete, setActualLineToDelete] = useState<ActualExpense | null>(null)
  const { filterYear, setFilterYear, yearOptions } = useYearFilterPageState()
  const asOfMonth = useMemo(() => asOfMonthForYearFilter(filterYear), [filterYear])

  const { data: items = [], isHydrated: itemsReady } = useBudgetItems(uid, filterYear)
  const { data: actuals = [], isHydrated: actualsReady } = useActualExpenses(uid)
  const dataLoading = !categoriesReady || !itemsReady || !actualsReady

  const { actualMap } = useBudgetDerived(actuals)

  const mutations = useBudgetMutations(uid)

  const budgetDialogRef = useRef<BudgetItemDialogHandle>(null)
  const actualDialogRef = useRef<ActualExpenseDialogHandle>(null)

  const dialogDefaultMonth = currentMonthKey()

  return (
    <RequireAuth>
      {dataLoading ? (
        <PageLoadingSkeleton showHeadingAction />
      ) : (
        <div className="space-y-6">
          <PageHeading
            icon={<Wallet />}
            title={t.budget.title}
            description={
              <div className="space-y-2 text-pretty">
                <p>{t.budget.pageLead}</p>
                <p className="text-sm text-muted-foreground">{t.budget.pageDetail}</p>
              </div>
            }
            actions={
              <Button type="button" onClick={() => budgetDialogRef.current?.openCreate()}>
                <Plus className="h-4 w-4" />
                {t.budget.add}
              </Button>
            }
          />

          <BudgetItemDialog
            ref={budgetDialogRef}
            categories={categories}
            defaultMonth={dialogDefaultMonth}
            onSubmit={async (editing, value) => {
              if (!mutations) return
              await mutations.upsertBudgetItem(editing, value)
            }}
          />

          <Panel
            title={
              <div className="mb-4 flex justify-end">
                <YearFilterSelect value={filterYear} years={yearOptions} onValueChange={setFilterYear} />
              </div>
            }
          >
            {items.length > 0 ? (
              <BudgetItemsTable
                month={asOfMonth}
                items={items}
                categories={categories}
                actualMap={actualMap}
                onAddActual={(item) => actualDialogRef.current?.openForItem(item)}
                onEdit={(item) => budgetDialogRef.current?.openEdit(item)}
                onDelete={(item) => setItemToDelete(item)}
              />
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">{t.common.noItemsInSelectedYear}</p>
            )}
          </Panel>

          <ActualExpenseDialog
            ref={actualDialogRef}
            actuals={actuals}
            defaultMonth={dialogDefaultMonth}
            snapshotMonth={asOfMonth}
            onDeleteLine={(expense) => setActualLineToDelete(expense)}
            onSubmit={async (item, value) => {
              if (!mutations) return
              await mutations.addActualExpense(item, value)
            }}
          />

          <ConfirmDeleteDialog
            open={itemToDelete !== null}
            title={t.budget.deleteDialogTitle}
            description={itemToDelete ? <p>{budgetDeleteDialogP1(itemToDelete.title)}</p> : null}
            emphasis={itemToDelete ? t.budget.deleteDialogP2 : null}
            onOpenChange={(open) => {
              if (!open) setItemToDelete(null)
            }}
            onConfirm={async () => {
              if (!mutations || !itemToDelete) return
              await mutations.deleteBudgetItem(itemToDelete.id)
            }}
          />

          <ConfirmDeleteDialog
            open={actualLineToDelete !== null}
            title={t.budget.actualExpenseLineDeleteDialogTitle}
            description={
              actualLineToDelete ? (
                <p>
                  {actualExpenseLineDeleteDialogP1(
                    formatVnd(actualLineToDelete.amountVnd),
                    formatMonthLabel(actualLineToDelete.spentMonth),
                  )}
                </p>
              ) : null
            }
            onOpenChange={(open) => {
              if (!open) setActualLineToDelete(null)
            }}
            onConfirm={async () => {
              if (!mutations || !actualLineToDelete) return
              await mutations.deleteActualExpense(actualLineToDelete.id)
            }}
          />
        </div>
      )}
    </RequireAuth>
  )
}
