import { createRoute } from '@tanstack/react-router'

import { SettingsPage } from '@/modules/settings/SettingsPage'

import { rootRoute } from './__root'

export const settingsRoute = createRoute({
  component: SettingsPage,
  getParentRoute: () => rootRoute,
  path: '/settings',
})
