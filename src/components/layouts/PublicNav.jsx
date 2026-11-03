import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { authStore } from '@/stores/authStore'
import { Menu } from '@/components/layouts/Menu'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { GUEST_PATH, PUBLIC_NAV_LINKS } from '@/lib/config/publicLinks'
import './PublicNav.css'

/* Header for every public (crawlable) page: logo, 3 main links,
   auth actions, scroll progress, and a slide-out drawer on small screens. */
export function PublicNav() {
  const token = authStore((state) => state.token)
  const isActivated = authStore((state) => state.isActivated)
  const { scrolled, progress } = useScrollProgress()
  const [menuOpen, setMenuOpen] = useState(false)

  const accountLinks = token
    ? isActivated
      ? [{ icon: 'fa-gauge', label: 'Go to practice', to: '/study' }]
      : [{ icon: 'fa-unlock', label: 'Activate now', to: '/payment' }]
    : [
        { icon: 'fa-right-to-bracket', label: 'Sign In', to: '/auth' },
        { icon: 'fa-user-plus', label: 'Sign Up', to: '/auth/signup' },
        { icon: 'fa-user', label: 'Continue as guest', to: GUEST_PATH },
      ]

  const drawerSections = [
    { title: 'Explore', links: PUBLIC_NAV_LINKS },
    { title: 'Account', links: accountLinks },
  ]

  return (
    <>
      <div className="scroll-progress" style={{ width: `${progress}%` }} aria-hidden="true"></div>

      <nav className={`public-nav${scrolled ? ' is-scrolled' : ''}`} aria-label="Main">
        <div className="nav-container">
          <div className="nav-content">
            <Link to="/" className="logo">CBT Pro</Link>

            <div className="public-nav-links">
              {PUBLIC_NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} className="public-nav-link">
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="nav-right">
              {token ? (
                !isActivated && <Link to="/payment" className="btn btn-outline">Activate now</Link>
              ) : (
                <>
                  <Link to="/auth" className="btn btn-outline public-nav-signin">Sign In</Link>
                  <Link to="/auth/signup" className="btn btn-primary">Sign Up</Link>
                </>
              )}
              <button
                type="button"
                className="public-nav-burger"
                aria-label="Open menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
              >
                <i className="fa-solid fa-bars"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <Menu menuOpen={menuOpen} setMenuOpen={setMenuOpen} sections={drawerSections} />
    </>
  )
}
