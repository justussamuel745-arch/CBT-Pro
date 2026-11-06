import { Fragment } from 'react'
import { Link } from 'react-router'

/* Breadcrumb trail. Items without `to` are the current page.
   Styled by .pq-breadcrumb (JambPastQuestions.css), so import that file on the page. */
export function Breadcrumbs({ items }) {
  return (
    <nav className="pq-breadcrumb" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && ' / '}
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
        </Fragment>
      ))}
    </nav>
  )
}
