export type MonthKey = string

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
  /** Tháng ghi nhận chi (VN). */
  spentMonth: MonthKey
  spentAt?: string
  note?: string
  createdAt: number
}
