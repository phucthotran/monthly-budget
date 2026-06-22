import { signOut, type User } from 'firebase/auth'
import { LogOut } from 'lucide-react'

import { getFirebaseAuth } from '@/lib/firebase'
import { t } from '@/lib/strings'

import { ActionTooltipButton } from './patterns/ActionTooltipButton'
import { Skeleton } from './ui'
import { UserAvatar } from './UserAvatar'

export type AppShellUserCardProps = {
  user?: null | User
}

export function AppShellUserCard({ user }: AppShellUserCardProps) {
  if (!user) {
    return (
      <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-1.5 py-1">
        <Skeleton className="size-7 rounded-full" />
        <div className="min-w-0 flex-1 leading-tight h-8">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-24 h-3" />
        </div>
      </div>
    )
  }

  const primaryName = user.displayName?.trim() || user.email?.trim() || t.nav.account
  const secondaryEmail = user.displayName?.trim() && user.email?.trim() ? user.email.trim() : null

  return (
    <div
      className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-1.5 py-1"
      aria-label={t.nav.account}
    >
      <UserAvatar user={user} />
      <div className="min-w-0 flex-1 leading-tight h-8">
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
