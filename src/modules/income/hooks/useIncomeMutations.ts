import type { IncomePeriod, MonthKey } from '@/lib/types'

import { useQueryClient } from '@tanstack/react-query'
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { useMemo } from 'react'

import { getFirestoreDb } from '@/lib/firebase'
import { queryKeys } from '@/lib/query-keys'

export type IncomeInput = {
  label: string
  amountVnd: number
  validFrom: MonthKey
  validTo: MonthKey | null
}

export function useIncomeMutations(uid: string | undefined) {
  const qc = useQueryClient()

  return useMemo(() => {
    if (uid === undefined) return null

    const db = getFirestoreDb()
    const userId = uid

    async function upsertIncome(editing: IncomePeriod | null, input: IncomeInput) {
      const payload = {
        amountVnd: input.amountVnd,
        label: input.label.trim(),
        updatedAt: Date.now(),
        validFrom: input.validFrom,
        validTo: input.validTo,
      }

      if (editing) {
        await updateDoc(doc(db, 'users', userId, 'incomePeriods', editing.id), payload)
      } else {
        await addDoc(collection(db, 'users', userId, 'incomePeriods'), {
          ...payload,
          createdAt: Date.now(),
        })
      }

      await qc.invalidateQueries({ queryKey: queryKeys.incomePeriods(userId) })
    }

    async function deleteIncome(id: string) {
      await deleteDoc(doc(db, 'users', userId, 'incomePeriods', id))
      await qc.invalidateQueries({ queryKey: queryKeys.incomePeriods(userId) })
    }

    return { deleteIncome, upsertIncome }
  }, [qc, uid])
}
