import { useLocation, useNavigate } from '@tanstack/react-router'
import { type ReactNode, useEffect, useState } from 'react'

import { useAuthContext } from './AuthProvider'
import { PageLoadingSkeleton, type PageLoadingSkeletonVariant } from './patterns/PageLoadingSkeleton'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, user } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [skeletonVariant, setSkeletonVariant] = useState<PageLoadingSkeletonVariant>('default')

  useEffect(() => {
    if (!loading && !user) {
      void navigate({ to: '/login' })
    }
  }, [loading, user, navigate])

  useEffect(() => {
    if (location.pathname === '/') {
      setSkeletonVariant('home')
    } else if (location.pathname === '/stats') {
      setSkeletonVariant('stats')
    }
  }, [location.pathname])

  if (loading) {
    return <PageLoadingSkeleton variant={skeletonVariant} />
  }

  if (!user) return null

  return children
}
