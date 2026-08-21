import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'

import { t } from '@/lib/strings'

const UPDATE_TOAST_ID = 'pwa-update'

/**
 * Surfaces service worker lifecycle events as toasts.
 *
 * The worker is registered with `registerType: 'prompt'`, so a waiting version
 * only activates once the user confirms — no surprise reloads mid-edit.
 */
export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    if (!offlineReady) return
    toast.success(t.toast.offlineReady)
    setOfflineReady(false)
  }, [offlineReady, setOfflineReady])

  useEffect(() => {
    if (!needRefresh) return
    toast.info(t.toast.updateAvailable, {
      action: {
        label: t.toast.updateAction,
        onClick: () => void updateServiceWorker(true),
      },
      duration: Infinity,
      id: UPDATE_TOAST_ID,
    })
  }, [needRefresh, updateServiceWorker])

  return null
}
