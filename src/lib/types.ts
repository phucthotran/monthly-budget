export type MonthKey = string

export type CurrencyCode = 'USD' | 'VND'

export interface UserPreferences {
  currency: CurrencyCode
  updatedAt: number
}

export type PinKdf = 'pbkdf2-sha256'

/** `users/{uid}/security/lock` — hash fields when set, or `{ skipped: true }` after skip. */
export interface PinLockDoc {
  iterations?: number
  kdf?: PinKdf
  pinHash?: string
  pinSalt?: string
  skipped?: boolean
  updatedAt: number
}

export interface Category {
  id: string
  name: string
  slug?: string
  sortOrder: number
  archived?: boolean
}

export interface BudgetItem {
  id: string
  title: string
  amountVnd: number
  categoryId: string
  validFrom: MonthKey
  validTo: MonthKey | null
  createdAt: number
  updatedAt: number
}

export interface IncomePeriod {
  id: string
  label: string
  amountVnd: number
  validFrom: MonthKey
  validTo: MonthKey | null
  createdAt: number
  updatedAt: number
}

export interface ActualExpense {
  id: string
  budgetItemId: string
  amountVnd: number
  spentMonth: MonthKey
  spentAt?: string
  note?: string
  createdAt: number
}
