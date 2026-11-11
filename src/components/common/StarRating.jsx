import './StarRating.css'

/* Read-only when `onChange` is omitted, a radio-group input when provided. */
export function StarRating({ value, onChange, label }) {
  const interactive = typeof onChange === 'function'

  return (
    <div
      className={`star-rating${interactive ? ' is-input' : ''}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={label ?? `${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) =>
        interactive ? (
          <button
            type="button"
            key={n}
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className={n <= value ? 'is-on' : ''}
            onClick={() => onChange(n)}
          >
            <i className={`fa-solid fa-star${n <= value ? ' is-on' : ''}`} aria-hidden="true"></i>
          </button>
        ) : (
          <i key={n} className={`fa-solid fa-star${n <= value ? ' is-on' : ''}`} aria-hidden="true"></i>
        )
      )}
    </div>
  )
}
