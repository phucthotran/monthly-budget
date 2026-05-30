import type { BudgetItem, MonthKey } from '@/lib/types'

import { useQueryClient } from '@tanstack/react-query'
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { useMemo } from 'react'

import { canRecordActualExpenseForBudgetItem } from '@/lib/budget/apply'
import { getFirestoreDb } from '@/lib/firebase'
import { compareMonthKeys, currentMonthKey } from '@/lib/month'
import { queryKeys } from '@/lib/queryKeys'

export type BudgetItemInput = {
  title: string
  amountVnd: number
  categoryId: string
  validFrom: MonthKey
  validTo: MonthKey | null
}

export function useBudgetMutations(uid: string | undefined) {
  const qc = useQueryClient()

  return useMemo(() => {
    if (uid === undefined) return null

    const db = getFirestoreDb()
    const userId = uid

    async function upsertBudgetItem(editing: BudgetItem | null, input: BudgetItemInput) {
      if (!editing && compareMonthKeys(input.validFrom, currentMonthKey()) < 0) {
        throw new Error('New budget item validFrom must be current month or later')
      }

      const payload = {
        amountVnd: input.amountVnd,
        categoryId: input.categoryId,
        title: input.title.trim(),
        updatedAt: Date.now(),
        validFrom: input.validFrom,
        validTo: input.validTo,
      }

      if (editing) {
        await updateDoc(doc(db, 'users', userId, 'budgetItems', editing.id), payload)
      } else {
        await addDoc(collection(db, 'users', userId, 'budgetItems'), {
          ...payload,
          createdAt: Date.now(),
        })
      }

      await qc.invalidateQueries({ queryKey: queryKeys.budgetItems(userId) })
    }

    async function deleteBudgetItem(id: string) {
      await deleteDoc(doc(db, 'users', userId, 'budgetItems', id))
      await qc.invalidateQueries({ queryKey: queryKeys.budgetItems(userId) })
    }

    async function deleteActualExpense(id: string) {
      await deleteDoc(doc(db, 'users', userId, 'actualExpenses', id))
      await qc.invalidateQueries({ queryKey: queryKeys.actualExpenses(userId) })
    }

    async function addActualExpense(
      item: BudgetItem,
      input: { amountVnd: number; spentMonth: MonthKey; note: null | string },
    ) {
      if (!canRecordActualExpenseForBudgetItem(item, input.spentMonth)) {
        throw new Error('Actual expense month is outside the budget item period')
      }

      if (input.spentMonth !== currentMonthKey()) {
        throw new Error('Actual expense can only be recorded for the current month')
      }

      await addDoc(collection(db, 'users', userId, 'actualExpenses'), {
        amountVnd: input.amountVnd,
        budgetItemId: item.id,
        createdAt: Date.now(),
        note: input.note,
        spentMonth: input.spentMonth,
      })

      await qc.invalidateQueries({ queryKey: queryKeys.actualExpenses(userId) })
    }

    return { addActualExpense, deleteActualExpense, deleteBudgetItem, upsertBudgetItem }
  }, [qc, uid])
}
