import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>WineHub</h3>
            <p>Discover exceptional wines from renowned wineries.</p>
          </div>

          <div className="footer-section">
            <h4>Explore</h4>
            <ul>
              <li><a href="/wineries">Wineries</a></li>
              <li><a href="/wines">Wines</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Connect</h4>
            <p>© {currentYear} WineHub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
