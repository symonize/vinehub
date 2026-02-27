import React from 'react';
import { useLocation } from 'react-router-dom';
import { useInkTransition, InkLink } from './InkTransition';
import './Header.css';

const SwapLink = ({ to, children, swapText }) => (
  <InkLink to={to} className="nav-link nav-link-swap">
    <span className="nav-link-default">{children}</span>
    <span className="nav-link-hover">{swapText || children}</span>
  </InkLink>
);

const Header = ({ onAboutOpen }) => {
  const { navigateWithInk } = useInkTransition();
  const location = useLocation();

  function handleLogoClick(e) {
    e.preventDefault();
    if (location.pathname === '/') return;
    navigateWithInk('/');
  }

  function handleContactClick(e) {
    e.preventDefault();
    if (location.pathname === '/contact') return;
    navigateWithInk('/contact');
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <nav className="nav-left">
            <SwapLink to="/wineries">Portfolio</SwapLink>
            <SwapLink to="/trade-tools">Trade Tools</SwapLink>
            <button className="nav-link nav-link-swap nav-btn-about" onClick={onAboutOpen}>
              <span className="nav-link-default">About</span>
              <span className="nav-link-hover">About</span>
            </button>
          </nav>

          <a href="/" className="logo" onClick={handleLogoClick}>
            <span>VineHub</span>
          </a>

          <nav className="nav-right">
            <SwapLink to="/">Login</SwapLink>
            <a href="/contact" className="btn-contact" onClick={handleContactClick}>Contact</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
