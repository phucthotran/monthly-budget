import type { IncomePeriod } from '@/lib/types'

import { Plus } from 'lucide-react'
import { useRef } from 'react'

import { useAuthContext } from '@/components/AuthProvider'
import { PageHeading, Panel } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { Button } from '@/components/ui'
import { useIncomePeriods } from '@/hooks/useUserCollections'
import { currentMonthKey } from '@/lib/month'
import { t } from '@/lib/strings'

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

  async function onDelete(row: IncomePeriod) {
    if (!mutations) return
    if (!confirm('Xóa kỳ thu nhập này?')) return
    await mutations.deleteIncome(row.id)
  }

  return (
    <RequireAuth>
      <div className="space-y-6">
        <PageHeading
          title={t.income.title}
          description="Mỗi kỳ có thể có mức thu nhập khác nhau theo tháng."
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

        <Panel title="Danh sách kỳ" description="Tổng thu nhập một tháng = tổng các kỳ đang hiệu lực.">
          <IncomeTable
            rows={rows}
            onEdit={(row) => dialogRef.current?.openEdit(row)}
            onDelete={(row) => void onDelete(row)}
          />
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Chưa có kỳ thu nhập.</p>
          ) : null}
        </Panel>
      </div>
    </RequireAuth>
  )
}
