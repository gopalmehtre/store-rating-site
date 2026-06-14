import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', icon: '', path: '/admin' },
  { label: 'Manage Users', icon: '', path: '/admin/users' },
  { label: 'Manage Stores', icon: '', path: '/admin/stores' },
];

const userNav: NavItem[] = [
  { label: 'Browse Stores', icon: '', path: '/dashboard' },
  { label: 'Change Password', icon: '', path: '/change-password' },
];

const ownerNav: NavItem[] = [
  { label: 'My Store', icon: '', path: '/owner' },
  { label: 'Change Password', icon: '', path: '/change-password' },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems =
    user?.role === 'ADMIN' ? adminNav : user?.role === 'STORE_OWNER' ? ownerNav : userNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = user?.role === 'STORE_OWNER' ? 'Store Owner' : user?.role === 'ADMIN' ? 'Administrator' : 'User';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>StoreRater</h2>
          <p>{roleLabel}</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ padding: '8px 12px', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{user?.name?.split(' ')[0]}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '1px', wordBreak: 'break-all' }}>{user?.email}</div>
          </div>
          <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            <span className="nav-icon"></span>
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
