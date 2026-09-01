import type { PinLockDoc } from '@/lib/types'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { doc, onSnapshot } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'

import { useFirestoreRefreshNonce } from '@/hooks/useFirestoreRefresh'
import { getFirestoreDb } from '@/lib/firebase'
import { notifySnapshotSettled } from '@/lib/firestore/refreshSignal'
import { queryKeys } from '@/lib/query-keys'

export function usePinLockDoc(uid: string | undefined) {
  const qc = useQueryClient()
  const db = getFirestoreDb()
  const refreshNonce = useFirestoreRefreshNonce()
  const queryKey = useMemo(() => (uid ? queryKeys.pinLock(uid) : ['pinLock']), [uid])
  const enabled = Boolean(uid)
  const [hydratedUid, setHydratedUid] = useState<string | undefined>(undefined)
  const isHydrated = !enabled || hydratedUid === uid

  useEffect(() => {
    if (!uid) {
      setHydratedUid(undefined)
      return
    }
    const unsub = onSnapshot(
      doc(db, 'users', uid, 'security', 'lock'),
      (snap) => {
        const data = snap.exists() ? (snap.data() as PinLockDoc) : null
        qc.setQueryData(queryKey, data)
        setHydratedUid(uid)
        notifySnapshotSettled()
      },
      () => {
        setHydratedUid(uid)
        notifySnapshotSettled()
      },
    )
    return unsub
  }, [db, qc, queryKey, refreshNonce, uid])

  const query = useQuery({
    enabled,
    initialData: null as null | PinLockDoc,
    queryFn: async () => qc.getQueryData<null | PinLockDoc>(queryKey) ?? null,
    queryKey,
    staleTime: Infinity,
  })

  return { ...query, isHydrated }
}
