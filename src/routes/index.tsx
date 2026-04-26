import { createRoute } from '@tanstack/react-router'

import { HomePage } from '@/modules/home/HomePage'

import { rootRoute } from './__root'

export const indexRoute = createRoute({
  component: HomePage,
  getParentRoute: () => rootRoute,
  path: '/',
})
