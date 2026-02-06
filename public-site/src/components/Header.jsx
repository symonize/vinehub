import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const SwapLink = ({ to, children, swapText }) => {
  return (
    <Link to={to} className="nav-link nav-link-swap">
      <span className="nav-link-default">{children}</span>
      <span className="nav-link-hover">{swapText || children}</span>
    </Link>
  );
};

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
            <nav className="nav-left">
              <SwapLink to="/wineries">Portfolio</SwapLink>
              <SwapLink to="/trade-tools">Trade Tools</SwapLink>
              <SwapLink to="/wineries">About</SwapLink>
            </nav>

          <Link to="/" className="logo">
            <span>VineHub</span>
          </Link>

          <nav className="nav-right">
            <Link to="/" className="nav-link">Login</Link>
            <Link to="/" className="btn-contact">Contact</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
