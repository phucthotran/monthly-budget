import { useNavigate, useRouterState } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import { Button } from '../ui'

export type MobileBackButtonProps = {
  className?: string
}

export function MobileBackButton({ className }: MobileBackButtonProps) {
  const { t } = useTranslation()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()

  if (pathname === '/') return null

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('size-10 flex items-center justify-center shrink-0 md:hidden', className)}
      aria-label={t('back')}
      onClick={() => void navigate({ to: '/' })}
    >
      <ArrowLeft className="mx-auto text-muted-foreground" style={{ height: '24px', width: '20px' }} />
    </Button>
  )
}
