import type { IncomePeriod } from '@/lib/types'

import { PiggyBank, Plus } from 'lucide-react'
import { useRef, useState } from 'react'

import { useAuthContext } from '@/components/AuthProvider'
import { ConfirmDeleteDialog, PageHeading, Panel } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { Button } from '@/components/ui'
import { useIncomePeriods } from '@/hooks/useUserCollections'
import { currentMonthKey } from '@/lib/month'
import { incomeDeleteDialogP1, t } from '@/lib/strings'

import { IncomeDialog, type IncomeDialogHandle } from './components/IncomeDialog'
import { IncomeTable } from './components/IncomeTable'
import { incomeMutations } from './hooks/useIncomeMutations'

export function IncomePage() {
  const { user } = useAuthContext()
  const uid = user?.uid
  const { data: rows = [] } = useIncomePeriods(uid)

  const month = currentMonthKey()
  const mutations = uid ? incomeMutations(uid) : null

  const dialogRef = useRef<IncomeDialogHandle>(null)

  const [rowToDelete, setRowToDelete] = useState<IncomePeriod | null>(null)

  return (
    <RequireAuth>
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
          defaultMonth={month}
          onSubmit={async (editing, value) => {
            if (!mutations) return
            await mutations.upsertIncome(editing, value)
          }}
        />

        <Panel title={<></>}>
          <IncomeTable
            asOfMonth={month}
            rows={rows}
            onEdit={(row) => dialogRef.current?.openEdit(row)}
            onDelete={(row) => setRowToDelete(row)}
          />
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{t.income.emptyList}</p>
          ) : null}
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
    </RequireAuth>
  )
}
