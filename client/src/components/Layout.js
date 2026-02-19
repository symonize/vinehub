import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AnimatedOutlet from './AnimatedOutlet';
import { useAuth } from '../context/AuthContext';
import { PageTitleProvider } from '../context/PageTitleContext';
import { Wine, Building2, LogOut, LayoutDashboard, Users } from 'lucide-react';
import ContentHeader from './ContentHeader';
import ChatBot from './ChatBot';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="layout">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <img src="/VinoHub.svg" alt="VinoHub" className="sidebar-logo" />
          <div className="sidebar-subtitle">WineCMS</div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            onClick={closeMobileMenu}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <div className="nav-section-label">PORTFOLIO</div>

          <NavLink
            to="/wines"
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            onClick={closeMobileMenu}
          >
            <Wine size={20} />
            <span>Wines</span>
          </NavLink>

          <NavLink
            to="/wineries"
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            onClick={closeMobileMenu}
          >
            <Building2 size={20} />
            <span>Wineries</span>
          </NavLink>

          <div className="nav-section-label">SETTINGS</div>

          <NavLink
            to="/users"
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            onClick={closeMobileMenu}
          >
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
      <div className="main-content">
        <PageTitleProvider>
          <ContentHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
          {/* Page Content */}
          <main className="content">
            <AnimatedOutlet />
          </main>
        </PageTitleProvider>
      </div>

      {/* Mobile Dock */}
      <nav className="mobile-dock">
        <NavLink to="/dashboard" className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={24} strokeWidth={1.5} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/wines" className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}>
          <Wine size={24} strokeWidth={1.5} />
          <span>Wines</span>
        </NavLink>
        <NavLink to="/wineries" className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}>
          <Building2 size={24} strokeWidth={1.5} />
          <span>Wineries</span>
        </NavLink>
      </nav>

      {/* AI ChatBot - Available on all pages */}
      <ChatBot />
    </div>
  );
};

export default Layout;
