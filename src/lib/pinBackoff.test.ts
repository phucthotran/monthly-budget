import { describe, expect, it } from 'vitest'

import { backoffMs, PIN_BACKOFF_BASE_MS, PIN_BACKOFF_CAP_MS, PIN_FREE_ATTEMPTS } from '@/lib/pinBackoff'

describe('backoffMs', () => {
  it('allows immediate retries before the free-attempt threshold', () => {
    expect(backoffMs(0)).toBe(0)
    expect(backoffMs(PIN_FREE_ATTEMPTS - 1)).toBe(0)
  })

  it('starts a 15s wait on the 5th failure and doubles after that', () => {
    expect(backoffMs(5)).toBe(PIN_BACKOFF_BASE_MS)
    expect(backoffMs(6)).toBe(PIN_BACKOFF_BASE_MS * 2)
    expect(backoffMs(7)).toBe(PIN_BACKOFF_BASE_MS * 4)
  })

  it('caps at 15 minutes', () => {
    expect(backoffMs(20)).toBe(PIN_BACKOFF_CAP_MS)
  })
})
