import { type User } from 'firebase/auth'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

import { Skeleton } from './ui'

export function userInitials(user: User): string {
  const name = user.displayName?.trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  const email = user.email?.trim()
  if (email) {
    const local = email.split('@')[0] ?? email
    return local.slice(0, 2).toUpperCase()
  }
  return '?'
}

export type UserAvatarProps = {
  user?: null | User
  className?: string
}

export function UserAvatar({ className, user }: UserAvatarProps) {
  const [broken, setBroken] = useState(false)

  useEffect(() => {
    setBroken(false)
  }, [user?.uid, user?.photoURL])

  if (!user) {
    return <Skeleton className={cn('size-7 rounded-full', className)} />
  }

  if (user.photoURL && !broken) {
    return (
      <img
        src={user.photoURL}
        alt=""
        className={cn('h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-border/80', className)}
        onError={() => setBroken(true)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold leading-none text-primary ring-1 ring-border/80',
        className,
      )}
      aria-hidden
    >
      {userInitials(user)}
    </div>
  )
}
