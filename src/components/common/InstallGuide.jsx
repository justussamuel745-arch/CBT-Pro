import './InstallGuide.css'

/* Renders the install instructions for a guidance object from getInstallGuidance().
   Used by the header popover and the menu card. */
export function InstallGuide({ guidance }) {
  if (guidance.mode === 'guide') {
    return (
      <ol className="install-guide-steps">
        {guidance.steps.map((step, i) => (
          <li className="install-guide-step" key={i}>
            <span className="install-guide-num">{i + 1}</span>
            <span className="install-guide-icon">{step.icon}</span>
            <span className="install-guide-text">{step.text}</span>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <p className="install-guide-note">
      <i className={`fa-solid ${guidance.mode === 'redirect' ? 'fa-compass' : 'fa-bookmark'}`}></i>
      <span>{guidance.message}</span>
    </p>
  )
}