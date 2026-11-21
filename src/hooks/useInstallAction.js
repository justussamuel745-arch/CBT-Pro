import { useState, useCallback } from 'react'
import { useNotifications } from '@/context/NotificationContext'
import { detectEnvironment } from '@lib/utils/pwaInstall.js'
import { getInstallGuidance } from '@/components/common/PwaInstall'

/* Single source of truth for every "Install app" entry point (header icon, menu card).
   Native prompt available -> trigger() installs straight away.
   Otherwise -> trigger() toggles the step-by-step guide. */
export function useInstallAction() {
  const { pwa } = useNotifications()
  const { canInstall, isInstalled, install, installing } = pwa
  const [open, setOpen] = useState(false)

  const guidance = getInstallGuidance(detectEnvironment(), canInstall)
  const isAuto = guidance.mode === 'auto'

  const close = useCallback(() => setOpen(false), [])

  const trigger = useCallback(async () => {
    if (isAuto) {
      setOpen(false)
      try {
        await install()
      } catch (err) {
        console.error(err)
      }
      return
    }
    setOpen((prev) => !prev)
  }, [isAuto, install])

  return { guidance, isAuto, isInstalled, installing, open, close, trigger }
}