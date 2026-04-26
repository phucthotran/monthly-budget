import type { ActualExpense, BudgetItem, Category, IncomePeriod } from '@/lib/types'

import { useMemo } from 'react'

import { useFirestoreCollection } from '@/hooks/useFirestoreCollection'

const viCollator = new Intl.Collator('vi-VN', { sensitivity: 'base' })

export function useCategories(uid: string | undefined) {
  const segments = useMemo(() => (uid ? (['users', uid, 'categories'] as const) : undefined), [uid])
  const q = useFirestoreCollection<Category>(uid, segments, ['categories', uid])
  const data = useMemo(
    () => [...(q.data ?? [])].sort((a, b) => viCollator.compare(a.name ?? '', b.name ?? '')),
    [q.data],
  )
  return { ...q, data }
}

export function useBudgetItems(uid: string | undefined) {
  const segments = useMemo(() => (uid ? (['users', uid, 'budgetItems'] as const) : undefined), [uid])
  const q = useFirestoreCollection<BudgetItem>(uid, segments, ['budgetItems', uid])
  const data = useMemo(
    () =>
      [...(q.data ?? [])].sort((a, b) => {
        const monthCmp = (a.validFrom ?? '').localeCompare(b.validFrom ?? '')
        if (monthCmp !== 0) return monthCmp
        return viCollator.compare(a.title ?? '', b.title ?? '')
      }),
    [q.data],
  )
  return { ...q, data }
}

export function useIncomePeriods(uid: string | undefined) {
  const segments = useMemo(() => (uid ? (['users', uid, 'incomePeriods'] as const) : undefined), [uid])
  const q = useFirestoreCollection<IncomePeriod>(uid, segments, ['incomePeriods', uid])
  const data = useMemo(
    () =>
      [...(q.data ?? [])].sort((a, b) => {
        const monthCmp = (a.validFrom ?? '').localeCompare(b.validFrom ?? '')
        if (monthCmp !== 0) return monthCmp
        return viCollator.compare(a.label ?? '', b.label ?? '')
      }),
    [q.data],
  )
  return { ...q, data }
}

export function useActualExpenses(uid: string | undefined) {
  const segments = useMemo(() => (uid ? (['users', uid, 'actualExpenses'] as const) : undefined), [uid])
  return useFirestoreCollection<ActualExpense>(uid, segments, ['actualExpenses', uid])
}
