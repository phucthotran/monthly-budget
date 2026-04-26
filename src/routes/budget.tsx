import { createRoute } from '@tanstack/react-router'

import { BudgetPage } from '@/modules/budget/BudgetPage'

import { rootRoute } from './__root'

export const budgetRoute = createRoute({
  component: BudgetPage,
  getParentRoute: () => rootRoute,
  path: '/budget',
})
