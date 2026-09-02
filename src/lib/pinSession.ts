import { backoffMs } from '@/lib/pinBackoff'

export type PinBackoffState = {
  fails: number
  lockUntil: number
}

const EMPTY_BACKOFF: PinBackoffState = { fails: 0, lockUntil: 0 }

function unlockKey(uid: string): string {
  return `pinUnlocked:${uid}`
}

function backoffKey(uid: string): string {
  return `pinBackoff:${uid}`
}

export function isReloadNavigation(): boolean {
  const entries = performance.getEntriesByType('navigation')
  const nav = entries[0] as PerformanceNavigationTiming | undefined
  return nav?.type === 'reload'
}

export function readUnlockSession(uid: string): boolean {
  try {
    return sessionStorage.getItem(unlockKey(uid)) === '1'
  } catch {
    return false
  }
}

export function writeUnlockSession(uid: string): void {
  try {
    sessionStorage.setItem(unlockKey(uid), '1')
  } catch {
    // Private mode or quota — in-memory unlock still works for this visit.
  }
}

export function clearUnlockSession(uid: string): void {
  try {
    sessionStorage.removeItem(unlockKey(uid))
  } catch {
    // Ignore storage failures.
  }
}

export function readBackoffState(uid: string): PinBackoffState {
  try {
    const raw = sessionStorage.getItem(backoffKey(uid))
    if (!raw) return EMPTY_BACKOFF
    const parsed = JSON.parse(raw) as Partial<PinBackoffState>
    const fails = typeof parsed.fails === 'number' && parsed.fails >= 0 ? parsed.fails : 0
    const lockUntil = typeof parsed.lockUntil === 'number' ? parsed.lockUntil : 0
    return { fails, lockUntil }
  } catch {
    return EMPTY_BACKOFF
  }
}

export function writeBackoffState(uid: string, state: PinBackoffState): void {
  try {
    sessionStorage.setItem(backoffKey(uid), JSON.stringify(state))
  } catch {
    // Ignore storage failures.
  }
}

export function clearBackoffState(uid: string): void {
  try {
    sessionStorage.removeItem(backoffKey(uid))
  } catch {
    // Ignore storage failures.
  }
}

export function recordPinFailure(uid: string, now = Date.now()): PinBackoffState {
  const prev = readBackoffState(uid)
  const fails = prev.fails + 1
  const wait = backoffMs(fails)
  const next: PinBackoffState = { fails, lockUntil: wait > 0 ? now + wait : 0 }
  writeBackoffState(uid, next)
  return next
}

export function remainingBackoffMs(state: PinBackoffState, now = Date.now()): number {
  return Math.max(0, state.lockUntil - now)
}

export function shouldStartUnlocked(uid: string, hasPin: boolean): boolean {
  if (!hasPin) return true
  return isReloadNavigation() && readUnlockSession(uid)
}
