import { memo, useEffect, useState, useMemo } from 'react'
import './SubmittingOverlay.css'

export const SubmittingOverlay = memo(function SubmittingOverlay({
  currentStep,
  title = 'Submitting',
  subtitle = 'Please don’t close this window',
}) {
  const [autoStep, setAutoStep] = useState(0)
  const steps = useMemo(() => {
    const online = navigator.onLine
    const submissionSteps = [
      { key: 'prepare', label: 'Preparing your answers' },
      { key: 'verify',  label: 'Verifying submission' },
      { key: 'upload',  label: 'Submitting to server' },
      { key: 'calculate',  label: 'Calculating score' },
      { key: 'done',    label: 'Finalizing' },
    ]
    return online ? submissionSteps : submissionSteps.filter(step => step.key !== 'upload')
  },[])

  // If caller doesn't control the step, advance on a timer,
  // pausing on the last step (don't loop back to done->done).
  useEffect(() => {
    if (currentStep != null) return
    setAutoStep(0)
    const id = setInterval(() => {
      setAutoStep((s) => Math.min(s + 1, steps.length - 1))
    }, 900)
    return () => clearInterval(id)
  }, [currentStep, steps.length])

  const active = currentStep ?? autoStep

  return (
    <div className="sub-overlay" role="alertdialog" aria-busy="true" aria-live="assertive">
      <div className="sub-card">
        {/* Orbiting spinner */}
        <div className="sub-spinner" aria-hidden="true">
          <span className="sub-orbit" />
          <span className="sub-orbit" />
          <span className="sub-orbit" />
          <span className="sub-core" />
        </div>

        <h2 className="sub-title">{title}</h2>
        <p className="sub-subtitle">{subtitle}</p>

        {/* Step list */}
        <ol className="sub-steps">
          {steps.map((step, i) => {
            const state = i < active ? 'done' : i === active ? 'active' : 'idle'
            return (
              <li key={step.key} className={`sub-step ${state}`}>
                <span className="sub-step-marker">
                  {state === 'done' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="sub-step-dot" />
                  )}
                </span>
                <span className="sub-step-label">{step.label}</span>
              </li>
            )
          })}
        </ol>

        {/* Progress bar */}
        <div className="sub-progress" aria-hidden="true">
          <div
            className="sub-progress-fill"
            style={{ width: `${((active + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
})