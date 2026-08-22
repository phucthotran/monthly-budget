import type { CurrencyCode, UserPreferences } from '@/lib/types'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { doc, onSnapshot } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'

import { useFirestoreRefreshNonce } from '@/hooks/useFirestoreRefresh'
import { getFirestoreDb } from '@/lib/firebase'
import { notifySnapshotSettled } from '@/lib/firestore/refreshSignal'
import { DEFAULT_CURRENCY, isCurrencyCode } from '@/lib/money'
import { queryKeys } from '@/lib/query-keys'

export function useUserPreferences(uid: string | undefined) {
  const qc = useQueryClient()
  const db = getFirestoreDb()
  const refreshNonce = useFirestoreRefreshNonce()
  const queryKey = useMemo(() => (uid ? queryKeys.userPreferences(uid) : ['userPreferences']), [uid])
  const enabled = Boolean(uid)
  const [isHydrated, setIsHydrated] = useState(!enabled)

  useEffect(() => {
    if (!uid) {
      setIsHydrated(true)
      return
    }
    setIsHydrated(false)
    const unsub = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        const data = snap.exists() ? (snap.data() as UserPreferences) : null
        qc.setQueryData(queryKey, data)
        setIsHydrated(true)
        notifySnapshotSettled()
      },
      () => {
        setIsHydrated(true)
        notifySnapshotSettled()
      },
    )
    return unsub
  }, [db, qc, queryKey, refreshNonce, uid])

  const query = useQuery({
    enabled,
    initialData: null as null | UserPreferences,
    queryFn: async () => qc.getQueryData<null | UserPreferences>(queryKey) ?? null,
    queryKey,
    staleTime: Infinity,
  })

  const isLocked = isCurrencyCode(query.data?.currency)
  const currency: CurrencyCode = isLocked ? query.data!.currency : DEFAULT_CURRENCY

  return { ...query, currency, isHydrated, isLocked }
}
