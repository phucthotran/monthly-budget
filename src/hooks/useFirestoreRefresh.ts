import { useSyncExternalStore } from 'react'

import { getRefreshNonce, subscribeRefreshNonce } from '@/lib/firestore/refreshSignal'

/** Changes whenever a manual refresh is requested, forcing listeners to re-subscribe. */
export function useFirestoreRefreshNonce(): number {
  return useSyncExternalStore(subscribeRefreshNonce, getRefreshNonce, getRefreshNonce)
}
