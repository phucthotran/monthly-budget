import { useLocation, useNavigate } from '@tanstack/react-router'
import { type ReactNode, useEffect } from 'react'

import { pageSkeletonPropsForPath } from '@/lib/pageSkeleton'

import { useAuthContext } from './AuthProvider'
import { PageLoadingSkeleton } from './patterns/PageLoadingSkeleton'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, user } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !user) {
      void navigate({ to: '/login' })
    }
  }, [loading, user, navigate])

  if (loading) {
    return <PageLoadingSkeleton {...pageSkeletonPropsForPath(location.pathname)} />
  }

  if (!user) return null

  return children
}
