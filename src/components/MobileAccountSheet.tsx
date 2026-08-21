import { type User } from 'firebase/auth'

import { t } from '@/lib/strings'

import { AppShellUserCard } from './AppShellUserCard'
import { ThemeToggle } from './ThemeToggle'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from './ui'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: null | undefined | User
}

export function MobileAccountSheet({ onOpenChange, open, user }: Props) {
  return (
    <Drawer direction="bottom" open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="bg-card focus:outline-none">
        <div className="mx-auto mb-1 mt-3 h-1.5 w-20 shrink-0 rounded-full bg-muted" />
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-sm font-semibold">{t.nav.accountSheet}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-3 px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
          {user ? <AppShellUserCard user={user} /> : null}
          <ThemeToggle fullWidth />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
