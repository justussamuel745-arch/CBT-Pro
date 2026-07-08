import { useContext } from 'react';
import AdminContext from '../context/AdminContext';
import { Ic } from '../../../scripts/utilis/Ic';
import './Nav.css';

export function Nav({ sidebarOpen, setSidebarOpen }) {
  const { page, setPage, stats } = useContext(AdminContext)
  
  const NAV = [
    { key: 'home', icon: <Ic.Home />, label: 'Home' },
    { key: 'users', icon: <Ic.Users />, label: 'Users' },
    { key: 'payments', icon: <Ic.Card />, label: 'Payments' },
    { key: 'reports', icon: <Ic.Flag />, label: 'Reported Questions' },
    { key: 'feedback', icon: <Ic.Feedback />, label: 'Feedback', badge: stats?.unread },
    { key: 'settings', icon: <Ic.Settings />, label: 'Settings' },
  ];

  return (
    <>
      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar-logo">
          <Ic.Shield /> AdminPanel
        </div>
        <ul className="admin-nav">
          {NAV.map(n => (
            <li key={n.key} className={`admin-nav-item ${page === n.key ? 'is-active' : ''}`}
              onClick={() => { setSidebarOpen(false); setPage(n.key) }}>
              {n.icon} {n.label}
              {n.badge > 0 && <span className="admin-nav-badge">{n.badge}</span>}
            </li>
          ))}
        </ul>
      </aside>
    </>
  )
}