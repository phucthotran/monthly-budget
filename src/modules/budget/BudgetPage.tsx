import type { BudgetItem } from '@/lib/types'

import { Plus } from 'lucide-react'
import { useRef } from 'react'

import { useAuthContext } from '@/components/AuthProvider'
import { PageHeading, Panel } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { Button } from '@/components/ui'
import { useActualExpenses, useBudgetItems, useCategories } from '@/hooks/useUserCollections'
import { formatMonthLabel } from '@/lib/month'
import { t } from '@/lib/strings'

import { ActualExpenseDialog, type ActualExpenseDialogHandle } from './components/ActualExpenseDialog'
import { BudgetItemDialog, type BudgetItemDialogHandle } from './components/BudgetItemDialog'
import { BudgetItemsTable } from './components/BudgetItemsTable'
import { useBudgetDerived } from './hooks/useBudgetDerived'
import { budgetMutations } from './hooks/useBudgetMutations'

export function BudgetPage() {
  const { user } = useAuthContext()
  const uid = user?.uid

  const { data: categories = [] } = useCategories(uid)
  const { data: items = [] } = useBudgetItems(uid)
  const { data: actuals = [] } = useActualExpenses(uid)

  const { actualMap, month } = useBudgetDerived(actuals)

  const mutations = uid ? budgetMutations(uid) : null

  const budgetDialogRef = useRef<BudgetItemDialogHandle>(null)
  const actualDialogRef = useRef<ActualExpenseDialogHandle>(null)

  async function onDelete(item: BudgetItem) {
    if (!mutations) return
    if (!confirm('Xóa khoản dự chi này?')) return
    await mutations.deleteBudgetItem(item.id)
  }

  return (
    <RequireAuth>
      <div className="space-y-6">
        <PageHeading
          title={t.budget.title}
          description="VND · áp dụng theo khoảng tháng"
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
          defaultMonth={month}
          onSubmit={async (editing, value) => {
            if (!mutations) return
            await mutations.upsertBudgetItem(editing, value)
          }}
        />

        <Panel
          title="Danh sách"
          description={`Còn lại trong tháng ${formatMonthLabel(month)} so với chi thực tế đã ghi.`}
        >
          <BudgetItemsTable
            month={month}
            items={items}
            categories={categories}
            actualMap={actualMap}
            onAddActual={(item) => actualDialogRef.current?.openForItem(item)}
            onEdit={(item) => budgetDialogRef.current?.openEdit(item)}
            onDelete={(item) => void onDelete(item)}
          />
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Chưa có khoản dự chi.</p>
          ) : null}
        </Panel>

        <ActualExpenseDialog
          ref={actualDialogRef}
          defaultMonth={month}
          onSubmit={async (value) => {
            if (!mutations) return
            await mutations.addActualExpense(value)
          }}
        />
      </div>
    </RequireAuth>
  )
}
