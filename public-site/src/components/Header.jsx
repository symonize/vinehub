import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <nav className="nav-left">
            <Link to="/wineries" className="nav-link">Portfolio</Link>
            <Link to="/trade-tools" className="nav-link">Trade Tools</Link>
            <Link to="/wineries" className="nav-link">About</Link>
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
