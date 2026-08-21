import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'

import { AuthProvider } from './AuthProvider'
import { PwaUpdatePrompt } from './PwaUpdatePrompt'
import { ThemeProvider } from './ThemeProvider'
import { Toaster } from './ui'

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 60_000,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
        <PwaUpdatePrompt />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
