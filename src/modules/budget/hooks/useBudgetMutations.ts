import type { BudgetItem, MonthKey } from '@/lib/types'

import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'

import { canRecordActualExpenseForBudgetItem } from '@/lib/budget/apply'
import { getFirestoreDb } from '@/lib/firebase'
import { currentMonthKey } from '@/lib/month'

export type BudgetItemInput = {
  title: string
  amountVnd: number
  categoryId: string
  validFrom: MonthKey
  validTo: MonthKey | null
}

export function budgetMutations(uid: string) {
  const db = getFirestoreDb()

  async function upsertBudgetItem(editing: BudgetItem | null, input: BudgetItemInput) {
    if (!editing && input.validFrom < currentMonthKey()) {
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
      await updateDoc(doc(db, 'users', uid, 'budgetItems', editing.id), payload)
      return
    }

    await addDoc(collection(db, 'users', uid, 'budgetItems'), {
      ...payload,
      createdAt: Date.now(),
    })
  }

  async function deleteBudgetItem(id: string) {
    await deleteDoc(doc(db, 'users', uid, 'budgetItems', id))
  }

  async function addActualExpense(
    item: BudgetItem,
    input: { amountVnd: number; spentMonth: MonthKey; note: null | string },
  ) {
    if (!canRecordActualExpenseForBudgetItem(item, input.spentMonth)) {
      throw new Error('Actual expense month is outside the budget item period')
    }

    await addDoc(collection(db, 'users', uid, 'actualExpenses'), {
      amountVnd: input.amountVnd,
      budgetItemId: item.id,
      createdAt: Date.now(),
      note: input.note,
      spentMonth: input.spentMonth,
    })
  }

  return { addActualExpense, deleteBudgetItem, upsertBudgetItem }
}
