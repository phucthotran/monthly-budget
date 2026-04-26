import type { BudgetItem, MonthKey } from '@/lib/types'

import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'

import { getFirestoreDb } from '@/lib/firebase'

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

  async function addActualExpense(input: {
    budgetItemId: string
    amountVnd: number
    spentMonth: MonthKey
    note: null | string
  }) {
    await addDoc(collection(db, 'users', uid, 'actualExpenses'), {
      amountVnd: input.amountVnd,
      budgetItemId: input.budgetItemId,
      createdAt: Date.now(),
      note: input.note,
      spentMonth: input.spentMonth,
    })
  }

  return { addActualExpense, deleteBudgetItem, upsertBudgetItem }
}
