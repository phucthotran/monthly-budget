import type { AppLocale } from '@/i18n'
import type { CurrencyCode } from '@/lib/types'

import i18n from '@/i18n'

export const DEFAULT_CURRENCY: CurrencyCode = 'VND'

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return value === 'USD' || value === 'VND'
}

export function currencyFractionDigits(currency: CurrencyCode): number {
  return currency === 'USD' ? 2 : 0
}

/** Minimum stored minor-unit amount (VND 1_000 dong, USD 100 cents). */
export function currencyMinAmountMinor(currency: CurrencyCode): number {
  return currency === 'USD' ? 100 : 1_000
}

function uiLocale(): AppLocale {
  return i18n.language === 'en' ? 'en' : 'vi'
}

function numberLocale(currency: CurrencyCode): string {
  return currency === 'USD' ? 'en-US' : 'vi-VN'
}

function majorFromMinor(amountMinor: number, currency: CurrencyCode): number {
  const digits = currencyFractionDigits(currency)
  return amountMinor / 10 ** digits
}

function minorFromMajor(amountMajor: number, currency: CurrencyCode): number {
  const digits = currencyFractionDigits(currency)
  return Math.round(amountMajor * 10 ** digits)
}

export function formatMoney(amountMinor: number, currency: CurrencyCode): string {
  const locale = numberLocale(currency)
  return new Intl.NumberFormat(locale, {
    currency,
    maximumFractionDigits: currencyFractionDigits(currency),
    minimumFractionDigits: currencyFractionDigits(currency),
    style: 'currency',
  }).format(majorFromMinor(Math.round(amountMinor), currency))
}

export function formatMoneyNumber(amountMinor: number, currency: CurrencyCode): string {
  const locale = numberLocale(currency)
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: currencyFractionDigits(currency),
    minimumFractionDigits: currencyFractionDigits(currency),
  }).format(majorFromMinor(Math.round(amountMinor), currency))
}

export function formatMoneyShort(
  amountMinor: number,
  currency: CurrencyCode,
  language: AppLocale = uiLocale(),
): string {
  const absMinor = Math.abs(amountMinor)
  const digits = currencyFractionDigits(currency)
  const absMajor = absMinor / 10 ** digits
  const billion = 1_000_000_000
  const million = 1_000_000
  const thousand = 1_000

  const formatScaled = (major: number) =>
    new Intl.NumberFormat(numberLocale(currency), {
      maximumFractionDigits: 1,
      minimumFractionDigits: 0,
    }).format(major)

  if (currency === 'VND' && language === 'vi') {
    if (absMajor >= billion) return `${formatScaled(amountMinor / billion / 10 ** digits)} tỷ`
    if (absMajor >= million) return `${formatScaled(amountMinor / million / 10 ** digits)}tr`
    if (absMajor >= thousand) return `${formatScaled(amountMinor / thousand / 10 ** digits)}k`
    return String(Math.round(amountMinor))
  }

  const signedMajor = amountMinor / 10 ** digits
  if (absMajor >= billion) return `${formatScaled(signedMajor / billion)}B`
  if (absMajor >= million) return `${formatScaled(signedMajor / million)}M`
  if (absMajor >= thousand) return `${formatScaled(signedMajor / thousand)}k`
  return formatMoneyNumber(amountMinor, currency)
}

/** Parse a typed amount into stored minor units. Returns null when empty or invalid. */
export function parseMoneyInput(raw: string, currency: CurrencyCode): null | number {
  const trimmed = raw.trim().replace(/\s/g, '')
  if (!trimmed) return null

  if (currency === 'VND') {
    const normalized = trimmed.replace(/\./g, '').replace(/,/g, '')
    const n = Number(normalized)
    if (!Number.isFinite(n) || n < 0) return null
    return Math.round(n)
  }

  const normalized = trimmed.replace(/,/g, '')
  const n = Number(normalized)
  if (!Number.isFinite(n) || n < 0) return null
  return minorFromMajor(n, currency)
}

const VND_QUICK_MIN = 1_000
const VND_QUICK_MAX = 1_000_000_000
const USD_QUICK_MIN = 100
const USD_QUICK_MAX = 100_000_00

const VND_QUICK_DEFAULT_PRESETS = [10_000, 50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000] as const
const USD_QUICK_DEFAULT_PRESETS = [1_000, 2_500, 5_000, 10_000, 20_000, 50_000, 100_000, 200_000] as const

function quickBounds(currency: CurrencyCode): { max: number; min: number } {
  return currency === 'USD' ? { max: USD_QUICK_MAX, min: USD_QUICK_MIN } : { max: VND_QUICK_MAX, min: VND_QUICK_MIN }
}

/** Whole minor-unit amount suitable for quick-pick chips (matches validation minimum). */
export function coerceMoneyQuickPickCandidate(n: number, currency: CurrencyCode): null | number {
  const x = Math.round(n)
  const { max, min } = quickBounds(currency)
  if (!Number.isFinite(x) || x < min || x > max) return null
  return x
}

function pushInRange(acc: Set<number>, n: number, currency: CurrencyCode) {
  const x = coerceMoneyQuickPickCandidate(n, currency)
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
 * Suggested whole amounts for quick fill (chip buttons), in stored minor units.
 */
export function moneyQuickAmountSuggestions(
  currentMinor: number,
  currency: CurrencyCode,
  plannedBudgetHintMinor?: number,
  remainingUnspentMinor?: number,
): number[] {
  const acc = new Set<number>()
  const { min } = quickBounds(currency)
  const presets = currency === 'USD' ? USD_QUICK_DEFAULT_PRESETS : VND_QUICK_DEFAULT_PRESETS
  const budgetHint =
    plannedBudgetHintMinor != null &&
    Number.isFinite(plannedBudgetHintMinor) &&
    (remainingUnspentMinor == null || remainingUnspentMinor === plannedBudgetHintMinor)
      ? coerceMoneyQuickPickCandidate(plannedBudgetHintMinor, currency)
      : undefined
  const remainingPin =
    remainingUnspentMinor != null && Number.isFinite(remainingUnspentMinor)
      ? coerceMoneyQuickPickCandidate(remainingUnspentMinor, currency)
      : undefined

  if (currentMinor <= 0) {
    if (budgetHint != null) acc.add(budgetHint)
    if (remainingPin != null) acc.add(remainingPin)
    for (const p of presets) acc.add(p)
    return finalizeQuickPicks(acc, remainingPin, null)
  }

  const current = Math.round(currentMinor)
  if (remainingPin != null) acc.add(remainingPin)

  if (currency === 'USD') {
    if (current < min) {
      const mults = [100, 1_000, 10_000, 100_000]
      for (const m of mults) pushInRange(acc, current * m, currency)
    } else {
      const shifts = [0.1, 0.5, 2, 5, 10]
      for (const f of shifts) pushInRange(acc, current * f, currency)
    }
  } else if (current < min) {
    const mults = [1_000, 10_000, 100_000, 1_000_000, 10_000_000]
    for (const m of mults) pushInRange(acc, current * m, currency)
  } else {
    const shifts = [0.001, 0.01, 0.1, 10, 100, 1_000]
    for (const f of shifts) pushInRange(acc, current * f, currency)
    pushInRange(acc, Math.ceil(current / 50_000) * 50_000, currency)
    pushInRange(acc, Math.ceil(current / 100_000) * 100_000, currency)
  }

  if (budgetHint != null && budgetHint !== current) pushInRange(acc, budgetHint, currency)

  return finalizeQuickPicks(acc, remainingPin, current)
}

/** @deprecated Use formatMoney — kept as a VND-only alias for tests during migration. */
export function formatVnd(amount: number): string {
  return formatMoney(amount, 'VND')
}

/** @deprecated Use formatMoneyNumber. */
export function formatVndNumber(amount: number): string {
  return formatMoneyNumber(amount, 'VND')
}

/** @deprecated Use formatMoneyShort. */
export function formatVndShort(amount: number): string {
  return formatMoneyShort(amount, 'VND', 'vi')
}

/** @deprecated Use parseMoneyInput. */
export function parseVndInput(raw: string): null | number {
  return parseMoneyInput(raw, 'VND')
}

/** @deprecated Use coerceMoneyQuickPickCandidate. */
export function coerceVndQuickPickCandidate(n: number): null | number {
  return coerceMoneyQuickPickCandidate(n, 'VND')
}

/** @deprecated Use moneyQuickAmountSuggestions. */
export function vndQuickAmountSuggestions(
  currentVnd: number,
  plannedBudgetHintVnd?: number,
  remainingUnspentVnd?: number,
): number[] {
  return moneyQuickAmountSuggestions(currentVnd, 'VND', plannedBudgetHintVnd, remainingUnspentVnd)
}
