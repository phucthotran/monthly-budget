import { toast } from 'sonner'

import { haptic } from './haptics'
import { t } from './strings'

/**
 * Runs a mutation and reports the outcome as a toast.
 *
 * Errors are re-thrown after being surfaced so callers (dialogs, confirm
 * sheets) can keep themselves open instead of pretending the action succeeded.
 */
export async function runWithToast(action: () => Promise<void>, successMessage: string): Promise<void> {
  try {
    await action()
  } catch (error) {
    toast.error(t.toast.error)
    throw error
  }
  haptic('success')
  toast.success(successMessage)
}
