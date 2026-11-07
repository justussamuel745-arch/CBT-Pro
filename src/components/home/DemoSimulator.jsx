import { useEffect, useId, useRef, useState } from 'react'
import './DemoSimulator.css'

const CANVAS_WIDTH = 560
const CANVAS_HEIGHT = 300

// Theme colors are read from your CSS variables, so the canvas matches the site
const readColors = () => {
  const styles = getComputedStyle(document.documentElement)
  const get = (name, fallback) => styles.getPropertyValue(name).trim() || fallback
  return {
    primary: get('--primary', '#4f46e5'),
    primaryLight: get('--primary-light', '#eef2ff'),
    text: get('--text', '#0f172a'),
    muted: get('--text-muted', '#64748b'),
    border: get('--border', '#e2e8f0'),
    success: get('--c-success', '#16a34a'),
    error: get('--c-error', '#dc2626'),
    warning: get('--c-warning', '#d97706'),
    fontFamily: getComputedStyle(document.body).fontFamily || 'sans-serif',
  }
}

/* Interactive simulator: a canvas, sliders, live results and Play / Reset.
   `config` describes one simulator (see demoSimulators/):
   { label, controls, initial, duration, playLabel, compute(values, progress), results(live), note(values, live), draw(ctx, env, live) }
   progress is null when idle and 0 to 1 while the animation runs. */
export function DemoSimulator({ config }) {
  const { label, controls, initial, duration, playLabel, compute, results, note, draw } = config
  const uid = useId()
  const canvasRef = useRef(null)
  const frameRef = useRef(null)
  const colorsRef = useRef(null)
  const [values, setValues] = useState(initial)
  const [progress, setProgress] = useState(null)

  const live = compute(values, progress)

  // Redraw after every change
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    colorsRef.current ??= readColors()
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    draw(ctx, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, colors: colorsRef.current }, live)
  })

  // Stop any running animation when the simulator is removed
  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  const stop = () => {
    cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    setProgress(null)
  }

  const handleChange = (key, value) => {
    stop()
    setValues((prev) => ({ ...prev, [key]: Number(value) }))
  }

  const handlePlay = () => {
    cancelAnimationFrame(frameRef.current)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProgress(null)
      return
    }

    let start = null
    const step = (timestamp) => {
      if (start === null) start = timestamp
      const p = Math.min((timestamp - start) / duration, 1)
      if (p < 1) {
        setProgress(p)
        frameRef.current = requestAnimationFrame(step)
      } else {
        frameRef.current = null
        setProgress(null)
      }
    }
    setProgress(0)
    frameRef.current = requestAnimationFrame(step)
  }

  const handleReset = () => {
    stop()
    setValues(initial)
  }

  return (
    <div className="dsim">
      <p className="dsim-title">
        <i className="fa-solid fa-sliders" aria-hidden="true"></i> Try it yourself
      </p>

      <canvas
        ref={canvasRef}
        className="dsim-canvas"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        role="img"
        aria-label={label}
      />

      {controls.map((control) => (
        <div className="dsim-control" key={control.key}>
          <label htmlFor={`${uid}-${control.key}`}>
            <span>{control.label}</span>
            <span>{control.format(values[control.key])}</span>
          </label>
          <input
            id={`${uid}-${control.key}`}
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={values[control.key]}
            onChange={(e) => handleChange(control.key, e.target.value)}
          />
        </div>
      ))}

      <div className="dsim-results">
        {results(live).map((result) => (
          <div className={`dsim-result ${result.tone ?? ''}`} key={result.label}>
            <small>{result.label}</small>
            <strong>{result.value}</strong>
          </div>
        ))}
      </div>

      <div className="dsim-actions">
        <button type="button" className="dsim-btn" onClick={handlePlay}>
          <i className="fa-solid fa-play" aria-hidden="true"></i> {playLabel}
        </button>
        <button type="button" className="dsim-btn dsim-btn-ghost" onClick={handleReset}>
          <i className="fa-solid fa-rotate-left" aria-hidden="true"></i> Reset
        </button>
      </div>

      <p className="dsim-note" aria-live="polite">{note(values, live)}</p>
    </div>
  )
}
