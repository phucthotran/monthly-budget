export const PIN_FREE_ATTEMPTS = 5
export const PIN_BACKOFF_BASE_MS = 15_000
export const PIN_BACKOFF_CAP_MS = 15 * 60 * 1000

/** Wait after `failCount` wrong PINs. Zero until the 5th failure, then 15s doubling up to 15 min. */
export function backoffMs(failCount: number): number {
  if (failCount < PIN_FREE_ATTEMPTS) return 0
  const exp = failCount - PIN_FREE_ATTEMPTS
  return Math.min(PIN_BACKOFF_CAP_MS, PIN_BACKOFF_BASE_MS * 2 ** exp)
}
