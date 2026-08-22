import type { IncomePeriod } from '@/lib/types'

import { PiggyBank, Plus } from 'lucide-react'
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
import { usePeriodListPageState } from '@/hooks/usePeriodListPageState'
import { useIncomePeriods } from '@/hooks/useUserCollections'
import { asOfMonthForYearFilter, currentMonthKey, matchesPeriodStatusFilter } from '@/lib/month'
import { runWithToast } from '@/lib/toast'

import { IncomeDialog, type IncomeDialogHandle } from './components/IncomeDialog'
import { IncomeTable } from './components/IncomeTable'
import { useIncomeMutations } from './hooks/useIncomeMutations'

export function IncomePage() {
  const { t } = useTranslation('income')
  const { t: tc } = useTranslation()
  const { user } = useAuthContext()
  const uid = user?.uid
  const [rowToDelete, setRowToDelete] = useState<IncomePeriod | null>(null)
  const { filterYear, periodStatus, setFilterYear, setPeriodStatus, yearOptions } = usePeriodListPageState()
  const asOfMonth = useMemo(() => asOfMonthForYearFilter(filterYear), [filterYear])

  const { data: rows = [], isHydrated: incomeReady } = useIncomePeriods(uid, filterYear)
  const filteredRows = useMemo(
    () => rows.filter((row) => matchesPeriodStatusFilter(row.validTo, asOfMonth, periodStatus)),
    [asOfMonth, periodStatus, rows],
  )
  const dataLoading = !incomeReady

  const dialogDefaultMonth = currentMonthKey()
  const mutations = useIncomeMutations(uid)

  const dialogRef = useRef<IncomeDialogHandle>(null)

  return (
    <RequireAuth>
      {dataLoading ? (
        <PageLoadingSkeleton showHeadingAction />
      ) : (
        <div className="space-y-6">
          <PageHeading
            icon={<PiggyBank />}
            title={t('title')}
            description={
              <div className="space-y-2 text-pretty">
                <p>{t('pageLead')}</p>
                <p className="text-sm text-muted-foreground">{t('pageDetail')}</p>
              </div>
            }
            actions={
              <span className="hidden md:inline-flex">
                <Button type="button" onClick={() => dialogRef.current?.openCreate()}>
                  <Plus className="h-4 w-4" />
                  {t('add')}
                </Button>
              </span>
            }
          />

          <IncomeDialog
            ref={dialogRef}
            defaultMonth={dialogDefaultMonth}
            onSubmit={async (editing, value) => {
              if (!mutations) return
              await runWithToast(() => mutations.upsertIncome(editing, value), tc('toast.incomeSaved'))
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
            {filteredRows.length > 0 ? (
              <IncomeTable
                asOfMonth={asOfMonth}
                rows={filteredRows}
                onEdit={(row) => dialogRef.current?.openEdit(row)}
                onDelete={(row) => setRowToDelete(row)}
              />
            ) : rows.length === 0 ? (
              <EmptyState
                icon={<PiggyBank />}
                title={t('emptyList')}
                description={t('emptyHint')}
                action={
                  <Button type="button" onClick={() => dialogRef.current?.openCreate()}>
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

          <ConfirmDeleteDialog
            open={rowToDelete !== null}
            title={t('deleteDialogTitle')}
            description={rowToDelete ? <p>{t('deleteDialogP1', { label: rowToDelete.label })}</p> : null}
            emphasis={rowToDelete ? t('deleteDialogP2') : null}
            onOpenChange={(open) => {
              if (!open) setRowToDelete(null)
            }}
            onConfirm={async () => {
              if (!mutations || !rowToDelete) return
              await runWithToast(() => mutations.deleteIncome(rowToDelete.id), tc('toast.incomeDeleted'))
            }}
          />

          <MobileFab label={t('add')} onClick={() => dialogRef.current?.openCreate()} />
        </div>
      )}
    </RequireAuth>
  )
}
