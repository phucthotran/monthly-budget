import type { PinLockDoc } from '@/lib/types'

import { useQueryClient } from '@tanstack/react-query'
import { doc, setDoc } from 'firebase/firestore'
import { useMemo } from 'react'

import { getFirestoreDb } from '@/lib/firebase'
import { hashPin } from '@/lib/pinCrypto'
import { queryKeys } from '@/lib/query-keys'

export function usePinLockMutations(uid: string | undefined) {
  const qc = useQueryClient()
  return useMemo(() => {
    if (!uid) return null
    const db = getFirestoreDb()
    const userId = uid

    async function setPin(pin: string) {
      const hashed = await hashPin(pin)
      const payload: PinLockDoc = {
        iterations: hashed.iterations,
        kdf: hashed.kdf,
        pinHash: hashed.hash,
        pinSalt: hashed.salt,
        updatedAt: Date.now(),
      }
      await setDoc(doc(db, 'users', userId, 'security', 'lock'), payload)
      qc.setQueryData<null | PinLockDoc>(queryKeys.pinLock(userId), payload)
    }

    async function skipSetup() {
      const payload: PinLockDoc = { skipped: true, updatedAt: Date.now() }
      await setDoc(doc(db, 'users', userId, 'security', 'lock'), payload)
      qc.setQueryData<null | PinLockDoc>(queryKeys.pinLock(userId), payload)
    }

    return { setPin, skipSetup }
  }, [qc, uid])
}
