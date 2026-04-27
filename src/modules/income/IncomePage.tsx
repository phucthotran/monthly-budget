import type { IncomePeriod } from '@/lib/types'

import { PiggyBank, Plus } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import { useAuthContext } from '@/components/AuthProvider'
import { YearFilterSelect } from '@/components/inputs'
import { ConfirmDeleteDialog, PageHeading, PageLoadingSkeleton, Panel } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { Button } from '@/components/ui'
import { useIncomePeriods } from '@/hooks/useUserCollections'
import { useYearFilterPageState } from '@/hooks/useYearFilterPageState'
import { asOfMonthForYearFilter, currentMonthKey } from '@/lib/month'
import { incomeDeleteDialogP1, t } from '@/lib/strings'

import { IncomeDialog, type IncomeDialogHandle } from './components/IncomeDialog'
import { IncomeTable } from './components/IncomeTable'
import { incomeMutations } from './hooks/useIncomeMutations'

export function IncomePage() {
  const { user } = useAuthContext()
  const uid = user?.uid
  const [rowToDelete, setRowToDelete] = useState<IncomePeriod | null>(null)
  const { filterYear, setFilterYear, yearOptions } = useYearFilterPageState()
  const asOfMonth = useMemo(() => asOfMonthForYearFilter(filterYear), [filterYear])

  const { data: rows = [], isHydrated: incomeReady } = useIncomePeriods(uid, filterYear)
  const dataLoading = !incomeReady

  const dialogDefaultMonth = currentMonthKey()
  const mutations = uid ? incomeMutations(uid) : null

  const dialogRef = useRef<IncomeDialogHandle>(null)

  return (
    <RequireAuth>
      {dataLoading ? (
        <PageLoadingSkeleton showHeadingAction />
      ) : (
        <div className="space-y-6">
          <PageHeading
            icon={<PiggyBank />}
            title={t.income.title}
            description={
              <div className="space-y-2 text-pretty">
                <p>{t.income.pageLead}</p>
                <p className="text-sm text-muted-foreground">{t.income.pageDetail}</p>
              </div>
            }
            actions={
              <Button type="button" onClick={() => dialogRef.current?.openCreate()}>
                <Plus className="h-4 w-4" />
                {t.income.add}
              </Button>
            }
          />

          <IncomeDialog
            ref={dialogRef}
            defaultMonth={dialogDefaultMonth}
            onSubmit={async (editing, value) => {
              if (!mutations) return
              await mutations.upsertIncome(editing, value)
            }}
          />

          <Panel
            title={
              <div className="mb-4 flex justify-end">
                <YearFilterSelect value={filterYear} years={yearOptions} onValueChange={setFilterYear} />
              </div>
            }
          >
            {rows.length > 0 ? (
              <IncomeTable
                asOfMonth={asOfMonth}
                rows={rows}
                onEdit={(row) => dialogRef.current?.openEdit(row)}
                onDelete={(row) => setRowToDelete(row)}
              />
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">{t.common.noItemsInSelectedYear}</p>
            )}
          </Panel>

          <ConfirmDeleteDialog
            open={rowToDelete !== null}
            title={t.income.deleteDialogTitle}
            description={rowToDelete ? <p>{incomeDeleteDialogP1(rowToDelete.label)}</p> : null}
            emphasis={rowToDelete ? t.income.deleteDialogP2 : null}
            onOpenChange={(open) => {
              if (!open) setRowToDelete(null)
            }}
            onConfirm={async () => {
              if (!mutations || !rowToDelete) return
              await mutations.deleteIncome(rowToDelete.id)
            }}
          />
        </div>
      )}
    </RequireAuth>
  )
}
