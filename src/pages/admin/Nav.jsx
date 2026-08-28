import { useNavigate } from 'react-router';
import { Ic } from '../../scripts/utils/Ic';
import { adminStore } from '../../stores/AdminStore';
import './Nav.css';

export function Nav({ sidebarOpen, setSidebarOpen }) {
  const stats = adminStore(state => state.stats)
  const page = adminStore(state => state.page)
  const navigate = useNavigate()
  
  const NAV = [
    { key: '', icon: <Ic.Home />, label: 'Home' },
    { key: 'users', icon: <Ic.Users />, label: 'Users' },
//     { key: 'payments', icon: <Ic.Card />, label: 'Payments' },
    { key: 'reports', icon: <Ic.Flag />, label: 'Reported Questions' },
    { key: 'feedback', icon: <Ic.Feedback />, label: 'Feedback', badge: stats?.unread },
//     { key: 'settings', icon: <Ic.Settings />, label: 'Settings' },
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
              onClick={() => { setSidebarOpen(false); navigate(`/${n.key ? `admin/${n.key === 'users' ? '' : n.key}` : ''}`) }}>
              {n.icon} {n.label}
              {n.badge > 0 && <span className="admin-nav-badge">{n.badge}</span>}
            </li>
          ))}
        </ul>
      </aside>
    </>
  )
}