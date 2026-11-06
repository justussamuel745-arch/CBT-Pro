import { useEffect, useId, useMemo, useRef, useState } from 'react'
import './FormControls.css'
import './CheckboxDropdown.css'

/* Multi-select dropdown with checkboxes, optional search and "select all".
   Controlled: pass `selected` (array of option values) and `onChange(newArray)`.
   `noun` is the singular word used in the summary, e.g. "topic" -> "All topics". */
export function CheckboxDropdown({ label, noun, options, selected, onChange, searchable = false }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  const uid = useId()
  const triggerId = `${uid}-trigger`
  const panelId = `${uid}-panel`

  // Close on outside press or Escape while open
  useEffect(() => {
    if (!open) return undefined
    const close = () => {
      setOpen(false)
      setQuery('')
    }
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) close()
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        close()
        document.getElementById(triggerId)?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, triggerId])

  const selectedSet = useMemo(() => new Set(selected), [selected])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options
  }, [options, query])

  const allVisibleSelected = visible.length > 0 && visible.every((o) => selectedSet.has(o.value))

  const toggleOpen = () => {
    setOpen((o) => !o)
    setQuery('')
  }

  const toggleOne = (value) => {
    onChange(selectedSet.has(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  const toggleAllVisible = (checked) => {
    if (checked) {
      onChange([...selected, ...visible.filter((o) => !selectedSet.has(o.value)).map((o) => o.value)])
    } else {
      const visibleValues = new Set(visible.map((o) => o.value))
      onChange(selected.filter((v) => !visibleValues.has(v)))
    }
  }

  const summary =
    selected.length === 0
      ? `Select ${noun}s`
      : selected.length === options.length
        ? `All ${noun}s`
        : `${selected.length} ${noun}${selected.length === 1 ? '' : 's'}`

  return (
    <div className="cbd" ref={rootRef}>
      <label className="ui-field-label" htmlFor={triggerId}>{label}</label>
      <button
        id={triggerId}
        type="button"
        className="ui-field-control cbd-trigger"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={toggleOpen}
      >
        <span className="cbd-value">{summary}</span>
        <i className="fa-solid fa-chevron-down" aria-hidden="true"></i>
      </button>

      {open && (
        <div className="cbd-panel" id={panelId} role="group" aria-label={label}>
          {searchable && (
            <input
              type="search"
              className="cbd-search"
              placeholder={`Search ${noun}s`}
              aria-label={`Search ${noun}s`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          )}

          {visible.length > 0 && (
            <label className="cbd-option cbd-all">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(e) => toggleAllVisible(e.target.checked)}
              />
              {query ? 'Select all results' : `Select all ${noun}s`}
            </label>
          )}

          <ul className="cbd-list">
            {visible.map((option) => (
              <li key={String(option.value)}>
                <label className="cbd-option">
                  <input
                    type="checkbox"
                    checked={selectedSet.has(option.value)}
                    onChange={() => toggleOne(option.value)}
                  />
                  {option.label}
                </label>
              </li>
            ))}
          </ul>

          {visible.length === 0 && <p className="cbd-empty">No {noun}s match your search.</p>}
        </div>
      )}
    </div>
  )
}
