const vndFormatter = new Intl.NumberFormat('vi-VN', {
  currency: 'VND',
  maximumFractionDigits: 0,
  style: 'currency',
})

const vndNumberFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
})

export function formatVnd(amount: number): string {
  return vndFormatter.format(Math.round(amount))
}

export function formatVndNumber(amount: number): string {
  return vndNumberFormatter.format(Math.round(amount))
}

export function parseVndInput(raw: string): null | number {
  const trimmed = raw.trim().replace(/\s/g, '')
  if (!trimmed) return null
  const normalized = trimmed.replace(/\./g, '').replace(/,/g, '')
  const n = Number(normalized)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n)
}

const VND_QUICK_MIN = 1_000
const VND_QUICK_MAX = 1_000_000_000

/** Whole VND amount suitable for quick-pick chips (matches validation minimum). */
export function coerceVndQuickPickCandidate(n: number): null | number {
  const x = Math.round(n)
  if (!Number.isFinite(x) || x < VND_QUICK_MIN || x > VND_QUICK_MAX) return null
  return x
}

const VND_QUICK_DEFAULT_PRESETS = [10_000, 50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000] as const

function pushInRange(acc: Set<number>, n: number) {
  const x = coerceVndQuickPickCandidate(n)
  if (x != null) acc.add(x)
}

function finalizeQuickPicks(
  acc: Set<number>,
  remainingPinned: null | number | undefined,
  excludeCurrentRounded: null | number,
) {
  if (excludeCurrentRounded != null) acc.delete(excludeCurrentRounded)
  const sorted = [...acc].sort((a, b) => a - b)
  const shouldLeadWithRemaining =
    remainingPinned != null && (excludeCurrentRounded == null || remainingPinned !== excludeCurrentRounded)
  if (!shouldLeadWithRemaining) return sorted.slice(0, 8)
  const rest = sorted.filter((x) => x !== remainingPinned)
  return [remainingPinned, ...rest].slice(0, 8)
}

/**
 * Suggested whole VND amounts for quick fill (chip buttons).
 * When `currentVnd <= 0`, returns common presets plus optional budget line hint.
 * When `currentVnd > 0`, scales by Vietnamese magnitude (e.g. 3 → 3.000 / 30.000 / …)
 * and adds decade-shifted variants for larger typed values.
 * When `remainingUnspentVnd` is passed (planned line amount − sum of actual lines in that month), it is
 * included when within quick-pick bounds and listed first among chips.
 */
export function vndQuickAmountSuggestions(
  currentVnd: number,
  plannedBudgetHintVnd?: number,
  remainingUnspentVnd?: number,
): number[] {
  const acc = new Set<number>()
  const budgetHint =
    plannedBudgetHintVnd != null &&
    Number.isFinite(plannedBudgetHintVnd) &&
    (remainingUnspentVnd == null || remainingUnspentVnd === plannedBudgetHintVnd)
      ? coerceVndQuickPickCandidate(plannedBudgetHintVnd)
      : undefined
  const remainingPin =
    remainingUnspentVnd != null && Number.isFinite(remainingUnspentVnd)
      ? coerceVndQuickPickCandidate(remainingUnspentVnd)
      : undefined

  if (currentVnd <= 0) {
    if (budgetHint != null) acc.add(budgetHint)
    if (remainingPin != null) acc.add(remainingPin)
    for (const p of VND_QUICK_DEFAULT_PRESETS) acc.add(p)
    return finalizeQuickPicks(acc, remainingPin, null)
  }

  const current = Math.round(currentVnd)
  if (remainingPin != null) acc.add(remainingPin)

  if (current < VND_QUICK_MIN) {
    const mults = [1_000, 10_000, 100_000, 1_000_000, 10_000_000]
    for (const m of mults) pushInRange(acc, current * m)
  } else {
    const shifts = [0.001, 0.01, 0.1, 10, 100, 1_000]
    for (const f of shifts) pushInRange(acc, current * f)
    pushInRange(acc, Math.ceil(current / 50_000) * 50_000)
    pushInRange(acc, Math.ceil(current / 100_000) * 100_000)
  }

  if (budgetHint != null && budgetHint !== current) pushInRange(acc, budgetHint)

  return finalizeQuickPicks(acc, remainingPin, current)
}
