import { useNavigate } from '@tanstack/react-router'
import { type ReactNode, useEffect } from 'react'

import { useAuthContext } from '@/components/AuthProvider'
import { PageLoadingSkeleton } from '@/components/patterns'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, user } = useAuthContext()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      void navigate({ to: '/login' })
    }
  }, [loading, user, navigate])

  if (loading) {
    return <PageLoadingSkeleton />
  }
  if (!user) return null
  return children
}
