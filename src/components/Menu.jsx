import { useState, memo } from 'react';
import { Link } from 'react-router';
import './Menu.css';


let MENU_SECTIONS = [
  {
    title: "Admin Control",
    links: [
      {
        icon: "fa-user-shield", label: 'Management', to: '/admin/users'
      }
    ]
  },
  {
    title: "Practice",
    links: [
      { icon: "fa-file-pen", label: "CBT Simulator", to: "/simulator" },
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
      { icon: "fa-unlock", label: "Unlock Full Access", to: "/payment" },
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

export const Menu = memo(function Menu({ menuOpen, setMenuOpen, isAdmin }) {

  if (!isAdmin){
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