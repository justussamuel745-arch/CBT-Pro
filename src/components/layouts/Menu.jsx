import { memo } from 'react';
import { Link } from 'react-router';
import { authStore } from '@/stores/authStore';
import { ThemeToggle } from './ThemeToggle';
import './Menu.css';

/* Dashboard sections. Exported so other layouts can extend them. */
export const getMenuSections = (isActivated) => [
  {
    title: 'Practice',
    links: [
      { icon: 'fa-file-pen', label: 'CBT Simulator', to: '/practice' },
      { icon: 'fa-book-open', label: 'Study Past Questions', to: '/study' },
      { icon: 'fa-layer-group', label: 'Browse Past Questions', to: '/jamb-past-questions' },
    ],
  },
  {
    title: 'Study tools',
    links: [{ icon: 'fa-list-check', label: 'JAMB Syllabus 2027', to: '/syllabus' }],
  },
  {
    title: 'My account',
    links: [
      { icon: 'fa-clock-rotate-left', label: 'Test History', to: '/history' },
      { icon: 'fa-bookmark', label: 'Bookmarked Questions', to: '/bookmark' },
    ],
  },
  {
    title: 'Subscription',
    links: [
      {
        icon: isActivated ? 'fa-robot' : 'fa-unlock',
        label: isActivated ? 'Buy AI Credits' : 'Unlock Full Access',
        to: '/payment',
      },
    ],
  },
  {
    title: 'Manage account',
    links: [{ icon: 'fa-gear', label: 'Manage Account', to: '/settings' }],
  },
  {
    title: 'Support',
    links: [
      { icon: 'fa-comment-dots', label: 'Feedback', to: '/feedback' },
      { icon: 'fa-circle-info', label: 'About', to: '/about' },
    ],
  },
];

/* `sections` is optional: the public site passes its own list
   so the same slide-out drawer serves both areas. */
export const Menu = memo(function Menu({ menuOpen, setMenuOpen, sections }) {
  const isActivated = authStore((store) => store.isActivated);
  const menuSections = sections ?? getMenuSections(isActivated);

  return (
    <>
      <nav className={`dash-menu-panel${menuOpen ? ' show' : ''}`} aria-label="Menu">
        <div className="dash-menu-panel-header">
          <div className="dash-logo">CBT Pro</div>
          <button className="dash-icon-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {menuSections.map((section) => (
          <div className="dash-menu-section" key={section.title}>
            <div className="dash-menu-section-title">{section.title}</div>
            {section.links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={link.className}
                onClick={() => setMenuOpen(false)}
              >
                <i className={`fa-solid ${link.icon}`}></i> {link.label}
              </Link>
            ))}
          </div>
        ))}
        <div className="dash-menu-section">
          <div className="dash-menu-section-title">Appearance</div>
          <div className="theme-toggle-row">
            <span className="theme-toggle-label">
              <i className="fa-solid fa-circle-half-stroke"></i>
              Dark mode
            </span>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div
        className={`dash-menu-overlay${menuOpen ? ' show' : ''}`}
        onClick={() => setMenuOpen(false)}
      ></div>
    </>
  );
});
