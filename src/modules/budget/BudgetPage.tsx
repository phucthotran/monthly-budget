import type { ActualExpense, BudgetItem } from '@/lib/types'

import { Plus, Wallet } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import { useAuthContext } from '@/components/AuthProvider'
import { PeriodStatusFilterToggle, YearFilterSelect } from '@/components/inputs'
import { ConfirmDeleteDialog, EmptyState, PageHeading, PageLoadingSkeleton, Panel } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { Button } from '@/components/ui'
import { usePeriodListPageState } from '@/hooks/usePeriodListPageState'
import { useActualExpenses, useBudgetItems, useCategories } from '@/hooks/useUserCollections'
import { asOfMonthForYearFilter, currentMonthKey, formatMonthLabel, matchesPeriodStatusFilter } from '@/lib/month'
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
  const { filterYear, periodStatus, setFilterYear, setPeriodStatus, yearOptions } = usePeriodListPageState()
  const asOfMonth = useMemo(() => asOfMonthForYearFilter(filterYear), [filterYear])

  const { data: items = [], isHydrated: itemsReady } = useBudgetItems(uid, filterYear)
  const filteredItems = useMemo(
    () => items.filter((item) => matchesPeriodStatusFilter(item.validTo, asOfMonth, periodStatus)),
    [asOfMonth, items, periodStatus],
  )
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
              <span className="hidden sm:inline-flex">
                <Button type="button" onClick={() => budgetDialogRef.current?.openCreate()}>
                  <Plus className="h-4 w-4" />
                  {t.budget.add}
                </Button>
              </span>
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
              <div className="mb-4 flex flex-nowrap items-center justify-between gap-2">
                <PeriodStatusFilterToggle value={periodStatus} onValueChange={setPeriodStatus} />
                <YearFilterSelect value={filterYear} years={yearOptions} onValueChange={setFilterYear} />
              </div>
            }
          >
            {filteredItems.length > 0 ? (
              <BudgetItemsTable
                month={asOfMonth}
                items={filteredItems}
                categories={categories}
                actualMap={actualMap}
                onAddActual={(item) => actualDialogRef.current?.openForItem(item)}
                onEdit={(item) => budgetDialogRef.current?.openEdit(item)}
                onDelete={(item) => setItemToDelete(item)}
              />
            ) : items.length === 0 ? (
              <EmptyState
                icon={<Wallet />}
                title={t.budget.emptyList}
                description={t.budget.emptyHint}
                action={
                  <Button type="button" onClick={() => budgetDialogRef.current?.openCreate()}>
                    <Plus className="h-4 w-4" />
                    {t.budget.add}
                  </Button>
                }
              />
            ) : (
              <EmptyState
                compact
                description={
                  periodStatus === 'expired'
                    ? t.common.noExpiredItemsInSelectedYear
                    : t.common.noActiveItemsInSelectedYear
                }
              />
            )}
          </Panel>

          <ActualExpenseDialog
            ref={actualDialogRef}
            snapshotMonth={asOfMonth}
            uid={uid}
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

          <Button
            type="button"
            size="icon"
            className="fixed bottom-20 right-6 z-40 h-14 w-14 rounded-full shadow-lg sm:hidden"
            onClick={() => budgetDialogRef.current?.openCreate()}
            aria-label={t.budget.add}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </RequireAuth>
  )
}
