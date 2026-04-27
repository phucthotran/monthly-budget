import type { BudgetItem } from '@/lib/types'

import { Plus, Wallet } from 'lucide-react'
import { useRef, useState } from 'react'

import { useAuthContext } from '@/components/AuthProvider'
import { ConfirmDeleteDialog, PageHeading, Panel } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { Button } from '@/components/ui'
import { useActualExpenses, useBudgetItems, useCategories } from '@/hooks/useUserCollections'
import { budgetDeleteDialogP1, t } from '@/lib/strings'

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

  const [itemToDelete, setItemToDelete] = useState<BudgetItem | null>(null)

  return (
    <RequireAuth>
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
          defaultMonth={month}
          onSubmit={async (editing, value) => {
            if (!mutations) return
            await mutations.upsertBudgetItem(editing, value)
          }}
        />

        <Panel title={<></>}>
          <BudgetItemsTable
            month={month}
            items={items}
            categories={categories}
            actualMap={actualMap}
            onAddActual={(item) => actualDialogRef.current?.openForItem(item)}
            onEdit={(item) => budgetDialogRef.current?.openEdit(item)}
            onDelete={(item) => setItemToDelete(item)}
          />
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{t.budget.emptyList}</p>
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
      </div>
    </RequireAuth>
  )
}
