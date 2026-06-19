import type { QueryKey } from '@tanstack/react-query'

/** Prefix keys for `invalidateQueries` — aligned with `useUserCollections` hook keys. */
export const queryKeys = {
  actualExpenses: (uid: string): QueryKey => ['actualExpenses', uid],
  budgetItems: (uid: string): QueryKey => ['budgetItems', uid],
  categories: (uid: string): QueryKey => ['categories', uid],
  incomePeriods: (uid: string): QueryKey => ['incomePeriods', uid],
}
