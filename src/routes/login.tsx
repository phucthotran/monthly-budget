import { createRoute } from '@tanstack/react-router'

import { LoginPage } from '@/modules/auth/LoginPage'

import { rootRoute } from './__root'

export const loginRoute = createRoute({
  component: LoginPage,
  getParentRoute: () => rootRoute,
  path: '/login',
})
