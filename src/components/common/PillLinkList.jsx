import { Link } from 'react-router'
import './PillLinkList.css'

/* A wrapping list of real links. items: [{ key, to, label, title? }] */
export function PillLinkList({ items, label }) {
  return (
    <ul className="pill-list" aria-label={label}>
      {items.map((item) => (
        <li key={item.key}>
          <Link to={item.to} title={item.title} className="pill-link">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
