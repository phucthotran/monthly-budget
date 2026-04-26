import { createRoute } from '@tanstack/react-router'

import { StatsPage } from '@/modules/stats/StatsPage'

import { rootRoute } from './__root'

export const statsRoute = createRoute({
  component: StatsPage,
  getParentRoute: () => rootRoute,
  path: '/stats',
})
