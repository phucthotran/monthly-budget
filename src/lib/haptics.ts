/**
 * Short vibration feedback for touch interactions.
 *
 * `navigator.vibrate` is unsupported on iOS Safari, so every call is a silent
 * no-op there. Users who ask for reduced motion opt out of haptics too.
 */
export type HapticKind = 'light' | 'success' | 'warning'

const PATTERNS: Record<HapticKind, number | number[]> = {
  light: 8,
  success: [10, 40, 14],
  warning: [16, 60, 16],
}

export function haptic(kind: HapticKind): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return
  if (typeof navigator.vibrate !== 'function') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  try {
    navigator.vibrate(PATTERNS[kind])
  } catch {
    // Some browsers throw when vibration is blocked by user settings.
  }
}
