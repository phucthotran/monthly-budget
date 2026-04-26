import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

import { AppShell } from '@/components/AppShell'

export const rootRoute = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  // GitHub Pages SPA fallback: 404.html redirects to /?p=...
  // Restore the original path on first load.
  const url = new URL(window.location.href)
  const p = url.searchParams.get('p')
  if (p) {
    url.searchParams.delete('p')
    window.history.replaceState({}, '', `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}${url.search}${url.hash}`)
  }

  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const hideShell = pathname === '/login'

  return (
    <>
      {hideShell ? (
        <Outlet />
      ) : (
        <AppShell>
          <Outlet />
        </AppShell>
      )}
      {import.meta.env.DEV ? <TanStackRouterDevtools position="bottom-right" /> : null}
    </>
  )
}
