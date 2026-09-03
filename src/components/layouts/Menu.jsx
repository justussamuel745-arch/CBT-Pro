import { memo } from 'react';
import { Link } from 'react-router';
import { authStore } from '../../stores/authStore';
import './Menu.css';


export const Menu = memo(function Menu({ menuOpen, setMenuOpen }) {
  const isActivated = authStore(store => store.isActivated)
  const isAdmin = authStore(store => store.isAdmin)
  let MENU_SECTIONS = [
    {
      title: "Admin Control",
      links: [
        {
          icon: "fa-user-shield", label: 'Management', to: '/admin/'
        }
      ]
    },
    {
      title: "Practice",
      links: [
        { icon: "fa-file-pen", label: "CBT Simulator", to: "/practice" },
        { icon: "fa-book-open", label: "Study Past Questions", to: "/study" },
      ],
    },
    {
      title: "Study tools",
      links: [{ icon: "fa-list-check", label: "JAMB Syllabus 2027", to: "/syllabus" }],
    },
    {
      title: "My account",
      links: [
        { icon: "fa-clock-rotate-left", label: "Test History", to: "/history" },
        { icon: "fa-bookmark", label: "Bookmarked Questions", to: "/bookmark" },
      ],
    },
    {
      title: "Subscription",
      links: [
        { icon: isActivated ? " fa-robot" : "fa-unlock", label: isActivated ? "Buy AI Credits" : "Unlock Full Access", to: "/payment" },
      ],
    },
    {
      title: "Manage account",
      links: [{ icon: "fa-gear", label: "Manage Account", to: "/settings" }],
    },
    {
      title: "Support",
      links: [
        { icon: "fa-comment-dots", label: "Feedback", to: "/feedback" },
        { icon: "fa-circle-info", label: "About", to: "/about" },
      ],
    },
  ];
  if (!isAdmin) {
    MENU_SECTIONS = MENU_SECTIONS.filter(m => m.title !== 'Admin Control')
  }
  return (
    <>
      {/* Slide-out menu */}
      <nav className={`dash-menu-panel${menuOpen ? " show" : ""}`}>
        <div className="dash-menu-panel-header">
          <div className="dash-logo">CBT Pro</div>
          <button
            className="dash-icon-btn"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {MENU_SECTIONS.map((section) => (
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
      </nav>

      <div
        className={`dash-menu-overlay${menuOpen ? " show" : ""}`}
        onClick={() => setMenuOpen(false)}
      ></div>
    </>
  )
})