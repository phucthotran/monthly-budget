import { type User } from 'firebase/auth'
import { KeyRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AppShellUserCard } from './AppShellUserCard'
import { LocaleToggle } from './LocaleToggle'
import { usePinLock } from './PinLockProvider'
import { ThemeToggle } from './ThemeToggle'
import { Button, Drawer, DrawerContent, DrawerHeader, DrawerTitle } from './ui'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: null | undefined | User
}

export function MobileAccountSheet({ onOpenChange, open, user }: Props) {
  const { t } = useTranslation()
  const { hasPin, openChangePin, openSetPin } = usePinLock()

  return (
    <Drawer direction="bottom" open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="bg-card focus:outline-none">
        <div className="mx-auto mb-1 mt-3 h-1.5 w-20 shrink-0 rounded-full bg-muted" />
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-sm font-semibold">{t('nav.accountSheet')}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-3 px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
          {user ? <AppShellUserCard user={user} /> : null}
          {user ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                onOpenChange(false)
                if (hasPin) openChangePin()
                else openSetPin()
              }}
            >
              <KeyRound className="h-4 w-4" />
              {hasPin ? t('nav.changePin') : t('nav.setPin')}
            </Button>
          ) : null}
          <div className="flex items-center justify-center gap-2">
            <LocaleToggle />
            <ThemeToggle />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
