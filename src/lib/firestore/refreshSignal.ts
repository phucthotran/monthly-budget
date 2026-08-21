/**
 * Manual resync for the Firestore `onSnapshot` listeners.
 *
 * Collections are streamed live, so there is nothing to "refetch" — the failure
 * mode a refresh gesture needs to fix is a listener that silently died while the
 * PWA was backgrounded or the network flapped. Bumping the nonce re-runs the
 * subscription effect in `useFirestoreCollection`, and re-subscribing makes
 * Firestore raise a cached snapshot followed by a server snapshot.
 */

/** Hard cap so the spinner always stops, even if no listener is mounted. */
const SETTLE_TIMEOUT_MS = 2000

let nonce = 0
const nonceListeners = new Set<() => void>()
const settleWaiters = new Set<() => void>()
let pending: null | Promise<void> = null

export function subscribeRefreshNonce(onChange: () => void): () => void {
  nonceListeners.add(onChange)
  return () => {
    nonceListeners.delete(onChange)
  }
}

export function getRefreshNonce(): number {
  return nonce
}

/** Called by `useFirestoreCollection` whenever a listener delivers a result. */
export function notifySnapshotSettled(): void {
  if (settleWaiters.size === 0) return
  const waiters = [...settleWaiters]
  settleWaiters.clear()
  for (const resolve of waiters) resolve()
}

function waitForSettle(): Promise<void> {
  return new Promise((resolve) => {
    settleWaiters.add(resolve)
  })
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/** Re-subscribes every listener. Concurrent calls share one in-flight refresh. */
export function triggerFirestoreRefresh(): Promise<void> {
  if (pending) return pending

  nonce += 1
  for (const listener of nonceListeners) listener()

  pending = Promise.race([waitForSettle(), delay(SETTLE_TIMEOUT_MS)]).finally(() => {
    pending = null
  })
  return pending
}
