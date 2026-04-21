import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activePage, onNavigate }) {
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'sales', icon: '💰', label: 'Sales' },
    ...(isAdmin() ? [{ id: 'members', icon: '👥', label: 'Team Members' }] : []),
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">📊</div>
        <div className="sidebar-logo-text">Tenant<span>Dash</span></div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-card-name">{user?.full_name}</div>
          <div className="user-card-org">🏢 {user?.organization_name}</div>
          <span className={`role-badge ${user?.role}`}>{user?.role}</span>
        </div>
        <button className="btn-logout" onClick={logout}>
          <span>⏏</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
