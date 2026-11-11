import { Link } from 'react-router'
import './Pagination.css'

// 1 … 4 5 6 … 12  (always first, last and the pages around the current one)
export function buildPageList(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const numbers = new Set([1, total, page - 1, page, page + 1])
  if (page <= 3) [2, 3, 4].forEach((n) => numbers.add(n))
  if (page >= total - 2) [total - 1, total - 2, total - 3].forEach((n) => numbers.add(n))

  const sorted = [...numbers].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)
  const list = []
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) list.push(`gap-${n}`)
    list.push(n)
  })
  return list
}

/* Page links. `getLink(page)` returns the `to` value for that page. Renders nothing for a single page. */
export function Pagination({ page, totalPages, getLink, label = 'Pagination' }) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label={label}>
      <ul className="pagination">
        <li>
          {page > 1 ? (
            <Link className="pagination-item" to={getLink(page - 1)} rel="prev" aria-label="Previous page">
              <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
            </Link>
          ) : (
            <span className="pagination-item is-disabled" aria-hidden="true">
              <i className="fa-solid fa-chevron-left"></i>
            </span>
          )}
        </li>

        {buildPageList(page, totalPages).map((item) =>
          typeof item === 'string' ? (
            <li key={item} className="pagination-gap" aria-hidden="true">…</li>
          ) : (
            <li key={item}>
              {item === page ? (
                <span className="pagination-item is-current" aria-current="page">{item}</span>
              ) : (
                <Link className="pagination-item" to={getLink(item)} aria-label={`Page ${item}`}>{item}</Link>
              )}
            </li>
          ),
        )}

        <li>
          {page < totalPages ? (
            <Link className="pagination-item" to={getLink(page + 1)} rel="next" aria-label="Next page">
              <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
            </Link>
          ) : (
            <span className="pagination-item is-disabled" aria-hidden="true">
              <i className="fa-solid fa-chevron-right"></i>
            </span>
          )}
        </li>
      </ul>
    </nav>
  )
}
