import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageTitleProvider } from '../context/PageTitleContext';
import { Wine, Building2, LogOut, LayoutDashboard, Users } from 'lucide-react';
import ContentHeader from './ContentHeader';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar open">
        <div className="sidebar-header">
          <img src="/VinoHub.svg" alt="VinoHub" className="sidebar-logo" />
          <div className="sidebar-subtitle">WineCMS</div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <div className="nav-section-label">PORTFOLIO</div>

          <NavLink to="/wines" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Wine size={20} />
            <span>Wines</span>
          </NavLink>

          <NavLink to="/wineries" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Building2 size={20} />
            <span>Wineries</span>
          </NavLink>

          <div className="nav-section-label">SETTINGS</div>

          <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Users size={20} />
            <span>Users</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.firstName} {user?.lastName}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Logout">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content sidebar-open">
        {/* Page Content */}
        <main className="content">
          <PageTitleProvider>
            <ContentHeader />
            <Outlet />
          </PageTitleProvider>
        </main>
      </div>
    </div>
  );
};

export default Layout;
