import type { ActualExpense, BudgetItem, Category, IncomePeriod, MonthKey } from '@/lib/types'

import { where } from 'firebase/firestore'
import { useMemo } from 'react'

import { useFirestoreCollection } from '@/hooks/useFirestoreCollection'
import { periodOverlapsCalendarYearConstraints } from '@/lib/firestore/periodOverlapsYearQuery'

const viCollator = new Intl.Collator('vi-VN', { sensitivity: 'base' })

function firestoreYearFilterOptions(
  collection: 'budgetItems' | 'incomePeriods',
  uid: string | undefined,
  calendarYear: number | undefined,
) {
  if (calendarYear == null) return {}
  return {
    constraints: periodOverlapsCalendarYearConstraints(calendarYear),
    hydrationQueryKey: [collection, uid] as const,
  }
}

export function useCategories(uid: string | undefined) {
  const segments = useMemo(() => (uid ? (['users', uid, 'categories'] as const) : undefined), [uid])
  const queryKey = useMemo(() => ['categories', uid] as const, [uid])
  const q = useFirestoreCollection<Category>(uid, segments, queryKey)
  const data = useMemo(
    () => [...(q.data ?? [])].sort((a, b) => viCollator.compare(a.name ?? '', b.name ?? '')),
    [q.data],
  )
  return { ...q, data }
}

export function useBudgetItems(uid: string | undefined, calendarYear?: number) {
  const segments = useMemo(() => (uid ? (['users', uid, 'budgetItems'] as const) : undefined), [uid])
  const queryKey = useMemo(
    () => (calendarYear != null ? (['budgetItems', uid, calendarYear] as const) : (['budgetItems', uid] as const)),
    [calendarYear, uid],
  )
  const firestoreOptions = useMemo(
    () => firestoreYearFilterOptions('budgetItems', uid, calendarYear),
    [calendarYear, uid],
  )
  const q = useFirestoreCollection<BudgetItem>(uid, segments, queryKey, firestoreOptions)
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

export function useIncomePeriods(uid: string | undefined, calendarYear?: number) {
  const segments = useMemo(() => (uid ? (['users', uid, 'incomePeriods'] as const) : undefined), [uid])
  const queryKey = useMemo(
    () => (calendarYear != null ? (['incomePeriods', uid, calendarYear] as const) : (['incomePeriods', uid] as const)),
    [calendarYear, uid],
  )
  const firestoreOptions = useMemo(
    () => firestoreYearFilterOptions('incomePeriods', uid, calendarYear),
    [calendarYear, uid],
  )
  const q = useFirestoreCollection<IncomePeriod>(uid, segments, queryKey, firestoreOptions)
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

export function useActualExpenses(uid: string | undefined, spentMonth?: MonthKey, budgetItemId?: string) {
  const segments = useMemo(() => (uid ? (['users', uid, 'actualExpenses'] as const) : undefined), [uid])
  const queryKey = useMemo(() => {
    if (uid == null) return ['actualExpenses'] as const
    if (spentMonth != null && budgetItemId != null) {
      return ['actualExpenses', uid, spentMonth, budgetItemId] as const
    }
    if (spentMonth != null) return ['actualExpenses', uid, spentMonth] as const
    if (budgetItemId != null) return ['actualExpenses', uid, 'item', budgetItemId] as const
    return ['actualExpenses', uid] as const
  }, [budgetItemId, spentMonth, uid])
  const firestoreOptions = useMemo(() => {
    const constraints = [
      ...(spentMonth != null ? [where('spentMonth', '==', spentMonth)] : []),
      ...(budgetItemId != null ? [where('budgetItemId', '==', budgetItemId)] : []),
    ]
    if (constraints.length === 0) return {}
    return {
      constraints,
      hydrationQueryKey: ['actualExpenses', uid] as const,
    }
  }, [budgetItemId, spentMonth, uid])
  return useFirestoreCollection<ActualExpense>(uid, segments, queryKey, firestoreOptions)
}
