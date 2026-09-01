import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useAuthContext } from '@/components/AuthProvider'
import { useKeyboardInset } from '@/hooks/useKeyboardInset'
import { usePinLockDoc } from '@/hooks/usePinLockDoc'
import { pinLockHasHash, verifyPin } from '@/lib/pinCrypto'
import {
  clearBackoffState,
  type PinBackoffState,
  readBackoffState,
  recordPinFailure,
  remainingBackoffMs,
  shouldStartUnlocked,
  writeUnlockSession,
} from '@/lib/pinSession'
import { runWithToast } from '@/lib/toast'
import { PinEditDialog, type PinEditDialogHandle } from '@/modules/lock/components/PinEditDialog'
import { type PinGateMode, PinGateScreen } from '@/modules/lock/components/PinGateScreen'
import { useGoogleReauth } from '@/modules/lock/hooks/useGoogleReauth'
import { usePinIdleAndVisibilityLock } from '@/modules/lock/hooks/usePinIdleAndVisibilityLock'
import { usePinLockMutations } from '@/modules/lock/hooks/usePinLockMutations'

type Gate = 'none' | PinGateMode

type PinLockContextValue = {
  backoffRemainingMs: number
  gate: Gate
  hasPin: boolean
  hideAppShell: boolean
  openChangePin: () => void
  openSetPin: () => void
}

const PinLockContext = createContext<null | PinLockContextValue>(null)

export function usePinLock(): PinLockContextValue {
  const ctx = useContext(PinLockContext)
  if (!ctx) throw new Error('usePinLock must be used within PinLockProvider')
  return ctx
}

export function PinLockProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { t: ta } = useTranslation('auth')
  const { user } = useAuthContext()
  const uid = user?.uid
  const { data: doc, isHydrated } = usePinLockDoc(uid)
  const mutations = usePinLockMutations(uid)
  const reauth = useGoogleReauth()
  const editRef = useRef<PinEditDialogHandle>(null)
  const didInitLock = useRef(false)

  const hasPin = pinLockHasHash(doc)
  const skipped = Boolean(doc?.skipped) && !hasPin

  const [locked, setLocked] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [pending, setPending] = useState(false)
  const [unlockError, setUnlockError] = useState<null | string>(null)
  const [backoff, setBackoff] = useState<PinBackoffState>({ fails: 0, lockUntil: 0 })
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    didInitLock.current = false
    setResetting(false)
    setUnlockError(null)
    setLocked(true)
    if (!uid) {
      setBackoff({ fails: 0, lockUntil: 0 })
      return
    }
    setBackoff(readBackoffState(uid))
  }, [uid])

  useEffect(() => {
    if (!uid || !isHydrated || didInitLock.current) return
    didInitLock.current = true
    setLocked(!shouldStartUnlocked(uid, hasPin))
  }, [hasPin, isHydrated, uid])

  const backoffRemainingMs = remainingBackoffMs(backoff, now)

  useEffect(() => {
    if (backoffRemainingMs <= 0) return
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [backoffRemainingMs])

  const lock = useCallback(() => {
    if (!hasPin) return
    setLocked(true)
    setUnlockError(null)
  }, [hasPin])

  let gate: Gate = 'none'
  if (uid) {
    if (!isHydrated) gate = 'hydrating'
    else if (resetting) gate = 'reset'
    else if (!hasPin && !skipped) gate = 'setup'
    else if (hasPin && locked) gate = 'unlock'
  }

  const idleEnabled = Boolean(uid && hasPin && !locked && gate === 'none')
  const gateOpen = gate !== 'none'
  usePinIdleAndVisibilityLock(idleEnabled, lock)
  useKeyboardInset(gateOpen)

  const hideAppShell = gate !== 'none'

  const markUnlocked = useCallback(() => {
    if (!uid) return
    writeUnlockSession(uid)
    clearBackoffState(uid)
    setBackoff({ fails: 0, lockUntil: 0 })
    setUnlockError(null)
    setLocked(false)
    setResetting(false)
  }, [uid])

  const handleUnlock = useCallback(
    async (pin: string) => {
      if (!uid || !pinLockHasHash(doc)) return
      if (remainingBackoffMs(readBackoffState(uid)) > 0) return
      setPending(true)
      setUnlockError(null)
      try {
        const ok = await verifyPin(pin, doc.pinHash, doc.pinSalt, doc.iterations)
        if (!ok) {
          const next = recordPinFailure(uid)
          setBackoff(next)
          setNow(Date.now())
          setUnlockError(ta('errorWrongPin'))
          return
        }
        markUnlocked()
      } finally {
        setPending(false)
      }
    },
    [doc, markUnlocked, ta, uid],
  )

  const handleSetup = useCallback(
    async (pin: string) => {
      if (!mutations) return
      setPending(true)
      try {
        await runWithToast(() => mutations.setPin(pin), t('toast.pinSaved'))
        markUnlocked()
      } finally {
        setPending(false)
      }
    },
    [markUnlocked, mutations, t],
  )

  const handleSkip = useCallback(async () => {
    if (!mutations) return
    setPending(true)
    try {
      await mutations.skipSetup()
      setLocked(false)
      setResetting(false)
    } catch {
      toast.error(t('toast.error'))
    } finally {
      setPending(false)
    }
  }, [mutations, t])

  const handleForgotPin = useCallback(async () => {
    const result = await reauth.reauthenticate()
    if (result.ok) {
      setResetting(true)
      setUnlockError(null)
    }
  }, [reauth])

  const openSetPin = useCallback(() => {
    editRef.current?.openCreate()
  }, [])

  const openChangePin = useCallback(() => {
    editRef.current?.openChange()
  }, [])

  const verifyCurrentPin = useCallback(
    async (pin: string) => {
      if (!pinLockHasHash(doc)) return false
      return verifyPin(pin, doc.pinHash, doc.pinSalt, doc.iterations)
    },
    [doc],
  )

  const value = useMemo(
    () => ({
      backoffRemainingMs,
      gate,
      hasPin,
      hideAppShell,
      openChangePin,
      openSetPin,
    }),
    [backoffRemainingMs, gate, hasPin, hideAppShell, openChangePin, openSetPin],
  )

  return (
    <PinLockContext.Provider value={value}>
      <div className={gateOpen ? 'hidden' : 'min-h-dvh'}>{children}</div>
      {gate !== 'none' ? (
        <PinGateScreen
          backoffRemainingMs={backoffRemainingMs}
          mode={gate}
          pending={pending || reauth.pending}
          unlockError={unlockError}
          onForgotPin={gate === 'unlock' ? () => void handleForgotPin() : undefined}
          onSkip={gate === 'setup' ? () => void handleSkip() : undefined}
          onSubmitSetup={handleSetup}
          onUnlock={handleUnlock}
        />
      ) : null}
      {gateOpen ? null : (
        <PinEditDialog
          ref={editRef}
          verifyCurrentPin={verifyCurrentPin}
          onSave={async (pin) => {
            if (!mutations) return
            await runWithToast(() => mutations.setPin(pin), t('toast.pinSaved'))
          }}
        />
      )}
    </PinLockContext.Provider>
  )
}
