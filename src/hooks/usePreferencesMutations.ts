import type { CurrencyCode, UserPreferences } from '@/lib/types'

import { useQueryClient } from '@tanstack/react-query'
import { doc, runTransaction } from 'firebase/firestore'
import { useMemo } from 'react'

import { getFirestoreDb } from '@/lib/firebase'
import { isCurrencyCode } from '@/lib/money'
import { queryKeys } from '@/lib/query-keys'

export function usePreferencesMutations(uid: string | undefined) {
  const qc = useQueryClient()
  return useMemo(() => {
    if (!uid) return null
    const db = getFirestoreDb()
    const userId = uid

    async function setCurrencyOnce(currency: CurrencyCode) {
      const ref = doc(db, 'users', userId)
      const payload: UserPreferences = { currency, updatedAt: Date.now() }
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref)
        if (snap.exists() && isCurrencyCode(snap.data()?.currency)) {
          throw new Error('currency-already-set')
        }
        tx.set(ref, payload)
      })
      qc.setQueryData<null | UserPreferences>(queryKeys.userPreferences(userId), payload)
    }

    return { setCurrencyOnce }
  }, [qc, uid])
}
