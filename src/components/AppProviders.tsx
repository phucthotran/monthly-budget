import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
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
    /*
     * `domAnimation` + `m` instead of the full `motion` bundle: the swipe pager
     * drives its drag from our own touch handlers and MotionValues, so none of
     * `domMax`'s gesture features are needed. `strict` makes a stray
     * `motion.*` component throw rather than silently pulling the bundle back in.
     *
     * `reducedMotion="user"` is not optional: the `prefers-reduced-motion` block
     * in index.css only neutralises CSS animations, and has no reach into
     * Motion's JS-driven inline styles.
     */
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={client}>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
            <Toaster />
            <PwaUpdatePrompt />
          </ThemeProvider>
        </QueryClientProvider>
      </MotionConfig>
    </LazyMotion>
  )
}
