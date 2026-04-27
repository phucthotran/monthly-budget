import { type QueryKey, useQuery, useQueryClient } from '@tanstack/react-query'
import { collection, type DocumentData, type Firestore, onSnapshot, orderBy, query } from 'firebase/firestore'
import { useEffect, useState } from 'react'

import { getFirestoreDb } from '@/lib/firebase'

type Options = {
  orderByField?: string
  orderDirection?: 'asc' | 'desc'
}

function collectionFromSegments(db: Firestore, segments: readonly string[]) {
  const [a, b, ...rest] = segments
  return collection(db, a, b, ...(rest as string[]))
}

/** Avoid skeleton flash when remounting hooks for the same Firestore query (client navigation). */
const firestoreHydratedKeys = new Map<string, true>()

function hydrationIdForQueryKey(queryKey: QueryKey) {
  return JSON.stringify(queryKey)
}

export function useFirestoreCollection<T extends { id: string }>(
  uid: string | undefined,
  segments: readonly string[] | undefined,
  queryKey: QueryKey,
  options: Options = {},
) {
  const qc = useQueryClient()
  const db = getFirestoreDb()
  const enabled = Boolean(uid && segments?.length)
  const hydrationId = hydrationIdForQueryKey(queryKey)
  const [isHydrated, setIsHydrated] = useState(() => {
    if (!enabled) return true
    return firestoreHydratedKeys.has(hydrationId)
  })

  useEffect(() => {
    if (!uid || !segments?.length) {
      setIsHydrated(true)
      return
    }
    if (firestoreHydratedKeys.has(hydrationId)) {
      setIsHydrated(true)
    } else {
      setIsHydrated(false)
    }
    let didHydrate = false
    const markHydrated = () => {
      firestoreHydratedKeys.set(hydrationId, true)
      if (!didHydrate) {
        didHydrate = true
        setIsHydrated(true)
      }
    }

    const cref = collectionFromSegments(db, segments)
    const q =
      options.orderByField != null
        ? query(cref, orderBy(options.orderByField, options.orderDirection ?? 'asc'))
        : query(cref)

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) }) as T)
        qc.setQueryData(queryKey, rows)
        markHydrated()
      },
      (err) => {
        // Avoid failing silently: this is usually permission / index / network.
        console.error('[useFirestoreCollection] onSnapshot error', { err, queryKey, segments })
        qc.setQueryData(queryKey, [])
        markHydrated()
      },
    )
    return unsub
  }, [db, hydrationId, qc, uid, segments, options.orderByField, options.orderDirection, queryKey])

  const queryResult = useQuery({
    enabled,
    initialData: [] as T[],
    queryFn: async () => [] as T[],
    queryKey,
    staleTime: Infinity,
  })

  return { ...queryResult, isHydrated }
}
