import { useInstallAction } from '@/hooks/useInstallAction'
import { InstallGuide } from '@/components/common/InstallGuide'
import './MenuInstall.css'

/* Install card for the slide-out menu. Hidden when the app is installed or installing.
   `onAutoInstall` lets the menu close itself before the native prompt appears. */
export function MenuInstall({ onAutoInstall }) {
  const { guidance, isAuto, isInstalled, installing, open, trigger } = useInstallAction()

  if (isInstalled || installing) return null

  function handleClick() {
    if (isAuto) onAutoInstall?.()
    trigger()
  }

  return (
    <div className={`menu-install${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="menu-install-btn"
        aria-expanded={isAuto ? undefined : open}
        aria-controls={isAuto ? undefined : 'menu-install-guide'}
        onClick={handleClick}
      >
        <span className="menu-install-icon">
          <i className="fa-solid fa-download"></i>
        </span>

        <span className="menu-install-copy">
          <span className="menu-install-title">Install CBT Pro</span>
          <span className="menu-install-sub">
            {isAuto ? 'One tap. Opens like a real app.' : 'Add it to your home screen'}
          </span>
        </span>

        {isAuto ? (
          <span className="menu-install-pill">Install</span>
        ) : (
          <i className="fa-solid fa-chevron-down menu-install-chevron" aria-hidden="true"></i>
        )}
      </button>

      {open && !isAuto && (
        <div id="menu-install-guide" className="menu-install-guide">
          <InstallGuide guidance={guidance} />
        </div>
      )}
    </div>
  )
}