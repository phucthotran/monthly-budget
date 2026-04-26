import { type QueryKey, useQuery, useQueryClient } from '@tanstack/react-query'
import { collection, type DocumentData, type Firestore, onSnapshot, orderBy, query } from 'firebase/firestore'
import { useEffect } from 'react'

import { getFirestoreDb } from '@/lib/firebase'

type Options = {
  orderByField?: string
  orderDirection?: 'asc' | 'desc'
}

function collectionFromSegments(db: Firestore, segments: readonly string[]) {
  const [a, b, ...rest] = segments
  return collection(db, a, b, ...(rest as string[]))
}

export function useFirestoreCollection<T extends { id: string }>(
  uid: string | undefined,
  segments: readonly string[] | undefined,
  queryKey: QueryKey,
  options: Options = {},
) {
  const qc = useQueryClient()
  const db = getFirestoreDb()

  useEffect(() => {
    if (!uid || !segments?.length) return
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
      },
      (err) => {
        // Avoid failing silently: this is usually permission / index / network.
        console.error('[useFirestoreCollection] onSnapshot error', { err, queryKey, segments })
        qc.setQueryData(queryKey, [])
      },
    )
    return unsub
  }, [db, qc, uid, segments, options.orderByField, options.orderDirection, queryKey])

  return useQuery({
    enabled: Boolean(uid && segments?.length),
    initialData: [] as T[],
    queryFn: async () => [] as T[],
    queryKey,
    staleTime: Infinity,
  })
}
