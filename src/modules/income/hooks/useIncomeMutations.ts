import type { IncomePeriod, MonthKey } from '@/lib/types'

import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'

import { getFirestoreDb } from '@/lib/firebase'

export type IncomeInput = {
  label: string
  amountVnd: number
  validFrom: MonthKey
  validTo: MonthKey | null
}

export function incomeMutations(uid: string) {
  const db = getFirestoreDb()

  async function upsertIncome(editing: IncomePeriod | null, input: IncomeInput) {
    const payload = {
      amountVnd: input.amountVnd,
      label: input.label.trim(),
      updatedAt: Date.now(),
      validFrom: input.validFrom,
      validTo: input.validTo,
    }

    if (editing) {
      await updateDoc(doc(db, 'users', uid, 'incomePeriods', editing.id), payload)
      return
    }

    await addDoc(collection(db, 'users', uid, 'incomePeriods'), {
      ...payload,
      createdAt: Date.now(),
    })
  }

  async function deleteIncome(id: string) {
    await deleteDoc(doc(db, 'users', uid, 'incomePeriods', id))
  }

  return { deleteIncome, upsertIncome }
}
