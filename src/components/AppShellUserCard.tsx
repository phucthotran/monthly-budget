import { signOut, type User } from 'firebase/auth'
import { LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ActionTooltipButton } from '@/components/patterns'
import { getFirebaseAuth } from '@/lib/firebase'
import { t } from '@/lib/strings'

function userInitials(user: User): string {
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

export type AppShellUserCardProps = {
  user: User
}

export function AppShellUserCard({ user }: AppShellUserCardProps) {
  const [avatarBroken, setAvatarBroken] = useState(false)

  useEffect(() => {
    setAvatarBroken(false)
  }, [user.uid, user.photoURL])

  const primaryName = user.displayName?.trim() || user.email?.trim() || t.nav.account
  const secondaryEmail = user.displayName?.trim() && user.email?.trim() ? user.email.trim() : null

  return (
    <div
      className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-1.5 py-1"
      aria-label={t.nav.account}
    >
      {user.photoURL && !avatarBroken ? (
        <img
          src={user.photoURL}
          alt=""
          className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-border/80"
          onError={() => setAvatarBroken(true)}
        />
      ) : (
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold leading-none text-primary ring-1 ring-border/80"
          aria-hidden
        >
          {userInitials(user)}
        </div>
      )}
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-xs font-medium">{primaryName}</p>
        {secondaryEmail ? <p className="truncate text-[11px] text-muted-foreground">{secondaryEmail}</p> : null}
      </div>
      <ActionTooltipButton
        className="h-7 w-7 shrink-0"
        label={t.nav.logout}
        variant="ghost"
        onClick={() => void signOut(getFirebaseAuth())}
      >
        <LogOut className="h-3.5 w-3.5" />
      </ActionTooltipButton>
    </div>
  )
}
