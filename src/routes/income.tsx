import { createRoute } from '@tanstack/react-router'

import { IncomePage } from '@/modules/income/IncomePage'

import { rootRoute } from './__root'

export const incomeRoute = createRoute({
  component: IncomePage,
  getParentRoute: () => rootRoute,
  path: '/income',
})
