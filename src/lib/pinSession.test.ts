import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clearUnlockSession, readUnlockSession, shouldStartUnlocked, writeUnlockSession } from '@/lib/pinSession'

const UID = 'user-1'
const store = new Map<string, string>()

function mockNavigation(type: PerformanceNavigationTiming['type']) {
  vi.spyOn(performance, 'getEntriesByType').mockReturnValue([{ type }] as unknown as PerformanceEntry[])
}

beforeEach(() => {
  store.clear()
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    removeItem: (key: string) => {
      store.delete(key)
    },
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('shouldStartUnlocked', () => {
  it('returns true when the user has no PIN', () => {
    mockNavigation('reload')
    expect(shouldStartUnlocked(UID, false)).toBe(true)
  })

  it('returns false when a PIN is set but there is no unlock session, even on reload', () => {
    mockNavigation('reload')
    expect(shouldStartUnlocked(UID, true)).toBe(false)
  })

  it('returns true when a PIN is set, the session flag is present, and navigation is a reload', () => {
    mockNavigation('reload')
    writeUnlockSession(UID)
    expect(shouldStartUnlocked(UID, true)).toBe(true)
  })

  it('returns false when the session flag is present but navigation is not a reload', () => {
    mockNavigation('navigate')
    writeUnlockSession(UID)
    expect(shouldStartUnlocked(UID, true)).toBe(false)
  })

  it('returns false after lock clears the session flag, even on reload', () => {
    mockNavigation('reload')
    writeUnlockSession(UID)
    expect(readUnlockSession(UID)).toBe(true)
    clearUnlockSession(UID)
    expect(readUnlockSession(UID)).toBe(false)
    expect(shouldStartUnlocked(UID, true)).toBe(false)
  })
})
