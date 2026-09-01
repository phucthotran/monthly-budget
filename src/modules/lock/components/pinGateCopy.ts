import type { PinGateMode } from './pinGateTypes'
import type { TFunction } from 'i18next'

export function pinGateCopy(
  mode: PinGateMode,
  t: TFunction<'common'>,
  ta: TFunction<'auth'>,
): { description: string; title: string } {
  if (mode === 'unlock') {
    return { description: ta('unlockDescription'), title: ta('unlockTitle') }
  }
  if (mode === 'reset') {
    return { description: ta('resetDescription'), title: ta('resetTitle') }
  }
  if (mode === 'setup') {
    return { description: ta('setupDescription'), title: ta('setupTitle') }
  }
  return { description: ta('hydrating'), title: t('appName') }
}
