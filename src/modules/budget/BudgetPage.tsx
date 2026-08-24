import type { ActualExpense, BudgetItem } from '@/lib/types'

import { Plus, Wallet } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuthContext } from '@/components/AuthProvider'
import { PeriodStatusFilterToggle, YearFilterSelect } from '@/components/inputs'
import {
  ConfirmDeleteDialog,
  EmptyState,
  MobileFab,
  PageHeading,
  PageLoadingSkeleton,
  Panel,
} from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { Button } from '@/components/ui'
import { useMoney } from '@/hooks/useMoney'
import { usePeriodListPageState } from '@/hooks/usePeriodListPageState'
import { useActualExpenses, useBudgetItems, useCategories } from '@/hooks/useUserCollections'
import { asOfMonthForYearFilter, currentMonthKey, formatMonthLabel, matchesPeriodStatusFilter } from '@/lib/month'
import { runWithToast } from '@/lib/toast'

import { ActualExpenseDialog, type ActualExpenseDialogHandle } from './components/ActualExpenseDialog'
import { BudgetItemDialog, type BudgetItemDialogHandle } from './components/BudgetItemDialog'
import { BudgetItemsTable } from './components/BudgetItemsTable'
import { useBudgetDerived } from './hooks/useBudgetDerived'
import { useBudgetMutations } from './hooks/useBudgetMutations'

export function BudgetPage() {
  const { t } = useTranslation('budget')
  const { t: tc } = useTranslation()
  const { format } = useMoney()
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
  const itemIdsWithActuals = useMemo(() => new Set(actuals.map((a) => a.budgetItemId)), [actuals])

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
            title={t('title')}
            description={
              <div className="space-y-2 text-pretty">
                <p>{t('pageLead')}</p>
                <p className="text-sm text-muted-foreground">{t('pageDetail')}</p>
              </div>
            }
            actions={
              <span className="hidden md:inline-flex">
                <Button type="button" onClick={() => budgetDialogRef.current?.openCreate()}>
                  <Plus className="h-4 w-4" />
                  {t('add')}
                </Button>
              </span>
            }
          />

          <BudgetItemDialog
            ref={budgetDialogRef}
            categories={categories}
            defaultMonth={dialogDefaultMonth}
            itemIdsWithActuals={itemIdsWithActuals}
            onSubmit={async (editing, value) => {
              if (!mutations) return
              await runWithToast(() => mutations.upsertBudgetItem(editing, value), tc('toast.budgetSaved'))
            }}
          />

          <Panel
            title={
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
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
                title={t('emptyList')}
                description={t('emptyHint')}
                action={
                  <Button type="button" onClick={() => budgetDialogRef.current?.openCreate()}>
                    <Plus className="h-4 w-4" />
                    {t('add')}
                  </Button>
                }
              />
            ) : (
              <EmptyState
                compact
                description={
                  periodStatus === 'expired' ? tc('noExpiredItemsInSelectedYear') : tc('noActiveItemsInSelectedYear')
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
              await runWithToast(() => mutations.addActualExpense(item, value), tc('toast.actualSaved'))
            }}
          />

          <ConfirmDeleteDialog
            open={itemToDelete !== null}
            title={t('deleteDialogTitle')}
            description={itemToDelete ? <p>{t('deleteDialogP1', { title: itemToDelete.title })}</p> : null}
            emphasis={itemToDelete ? t('deleteDialogP2') : null}
            onOpenChange={(open) => {
              if (!open) setItemToDelete(null)
            }}
            onConfirm={async () => {
              if (!mutations || !itemToDelete) return
              await runWithToast(() => mutations.deleteBudgetItem(itemToDelete.id), tc('toast.budgetDeleted'))
            }}
          />

          <ConfirmDeleteDialog
            open={actualLineToDelete !== null}
            title={t('actualExpenseLineDeleteDialogTitle')}
            description={
              actualLineToDelete ? (
                <p>
                  {t('actualExpenseLineDeleteDialogP1', {
                    formattedAmount: format(actualLineToDelete.amountVnd),
                    monthLabel: formatMonthLabel(actualLineToDelete.spentMonth),
                  })}
                </p>
              ) : null
            }
            onOpenChange={(open) => {
              if (!open) setActualLineToDelete(null)
            }}
            onConfirm={async () => {
              if (!mutations || !actualLineToDelete) return
              await runWithToast(() => mutations.deleteActualExpense(actualLineToDelete.id), tc('toast.actualDeleted'))
            }}
          />

          <MobileFab label={t('add')} onClick={() => budgetDialogRef.current?.openCreate()} />
        </div>
      )}
    </RequireAuth>
  )
}
