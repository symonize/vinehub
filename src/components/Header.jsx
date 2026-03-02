import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useInkTransition, InkLink } from './InkTransition';
import './Header.css';

const TRADE_TOOLS_ITEMS = [
  { label: 'Browse', sub: 'Explore all tools', path: '/trade-tools' },
  { label: 'Sales Sheet Generator', sub: 'Create producer sell sheets', path: '/trade-tools' },
  { label: 'Shelf Talker Generator', sub: 'Design shelf talker cards', path: '/trade-tools' },
];

const SPRITE_URL = '/ink-transition-sprite.png';
const FRAMES = 40;
const FRAME_ASPECT = (8192 / FRAMES) / 115;

function getMaskSize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let fw, fh;
  if (vw / vh > FRAME_ASPECT) {
    fw = vw; fh = vw / FRAME_ASPECT;
  } else {
    fh = vh; fw = fh * FRAME_ASPECT;
  }
  return { w: fw * FRAMES, h: fh };
}


const SwapLink = ({ to, children, swapText }) => (
  <InkLink to={to} className="nav-link nav-link-swap">
    <span className="nav-link-default">{children}</span>
    <span className="nav-link-hover">{swapText || children}</span>
  </InkLink>
);

const Header = ({ onAboutOpen }) => {
  const { navigateWithInk } = useInkTransition();
  const location = useLocation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [tradeMenuOpen, setTradeMenuOpen] = useState(false);
  const inkRef = useRef(null);
  const animatingRef = useRef(false);
  const tradeMenuRef = useRef(null);
  const headerRef = useRef(null);
  const mobileBarRef = useRef(null);
  const headerRevealedRef = useRef(false);

  const isHome = location.pathname === '/';

  useEffect(() => {
    if (!isHome) return;

    const targets = [headerRef.current, mobileBarRef.current].filter(Boolean);
    headerRevealedRef.current = false;

    // If already scrolled past intro (e.g. back navigation), show immediately
    if (window.scrollY > window.innerHeight * 0.3) {
      gsap.set(targets, { y: '0%', opacity: 1 });
      headerRevealedRef.current = true;
    } else {
      gsap.set(targets, { y: '-100%', opacity: 0 });
    }

    function onIntroProgress(e) {
      const progress = e.detail;
      if (!headerRevealedRef.current && progress >= 0.13) {
        headerRevealedRef.current = true;
        gsap.to(targets, { y: '0%', opacity: 1, duration: 0.5, ease: 'power2.out' });
      } else if (headerRevealedRef.current && progress < 0.1) {
        headerRevealedRef.current = false;
        gsap.to(targets, { y: '-100%', opacity: 0, duration: 0.3, ease: 'power2.in' });
      }
    }

    window.addEventListener('intro-progress', onIntroProgress);
    return () => {
      window.removeEventListener('intro-progress', onIntroProgress);
      // Ensure header is always visible on other pages
      gsap.set(targets, { y: '0%', opacity: 1 });
    };
  }, [isHome]);

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

  const runInkIn = useCallback((onDone) => {
    const el = inkRef.current;
    if (!el) return;
    const { w, h } = getMaskSize();

    el.style.visibility = 'visible';
    el.style.pointerEvents = 'auto';
    el.style.webkitMaskImage = `url(${SPRITE_URL})`;
    el.style.maskImage = `url(${SPRITE_URL})`;
    el.style.webkitMaskSize = `${w}px ${h}px`;
    el.style.maskSize = `${w}px ${h}px`;
    el.style.webkitMaskRepeat = 'no-repeat';
    el.style.maskRepeat = 'no-repeat';

    function setFrame(frame) {
      const pct = (frame / (FRAMES - 1)) * 100;
      el.style.webkitMaskPosition = `${pct}% 50%`;
      el.style.maskPosition = `${pct}% 50%`;
    }

    setFrame(FRAMES - 2);
    const proxy = { frame: FRAMES - 2 };
    gsap.to(proxy, {
      frame: 0,
      duration: 0.7,
      ease: `steps(${FRAMES - 1})`,
      onUpdate: () => setFrame(Math.round(proxy.frame)),
      onComplete: onDone,
    });
  }, []);

  const runInkOut = useCallback((onDone) => {
    const el = inkRef.current;
    if (!el) return;

    function setFrame(frame) {
      const pct = (frame / (FRAMES - 1)) * 100;
      el.style.webkitMaskPosition = `${pct}% 50%`;
      el.style.maskPosition = `${pct}% 50%`;
    }

    const proxy = { frame: 0 };
    gsap.to(proxy, {
      frame: FRAMES - 1,
      duration: 1.2,
      ease: `steps(${FRAMES - 1})`,
      onUpdate: () => setFrame(Math.round(proxy.frame)),
      onComplete: () => {
        el.style.visibility = 'hidden';
        el.style.pointerEvents = 'none';
        onDone();
      },
    });
  }, []);

  function openMenu() {
    if (animatingRef.current) return;
    animatingRef.current = true;
    // inkRef is always mounted — run animation on next frame to be safe
    requestAnimationFrame(() => {
      runInkIn(() => {
        setMenuVisible(true);
        animatingRef.current = false;
      });
    });
  }

  function closeMenu() {
    if (animatingRef.current) return;
    animatingRef.current = true;
    setMenuVisible(false);
    runInkOut(() => {
      animatingRef.current = false;
    });
  }

  function handleMenuNav(path) {
    closeMenu();
    if (location.pathname !== path) {
      // Let close animation finish then navigate
      setTimeout(() => navigateWithInk(path), 50);
    }
  }

  return (
    <>
      <header className={`header${isHome ? ' header--fixed' : ''}`} ref={headerRef}>
        <div className="container">
          <div className="header-content">
            <nav className="nav-left">
              <SwapLink to="/wineries">Portfolio</SwapLink>
              <div
                className={`trade-tools-nav-item${tradeMenuOpen ? ' is-open' : ''}`}
                onMouseEnter={() => setTradeMenuOpen(true)}
                onMouseLeave={() => setTradeMenuOpen(false)}
              >
                <button className="nav-link nav-link-swap trade-tools-trigger" aria-expanded={tradeMenuOpen}>
                  <span className="nav-link-default">Trade Tools</span>
                  <span className="nav-link-hover">Trade Tools</span>
                </button>
                <div className="trade-mega-menu" ref={tradeMenuRef} aria-hidden={!tradeMenuOpen}>
                  {TRADE_TOOLS_ITEMS.map((item, i) => (
                    <button
                      key={item.label}
                      className="trade-mega-item"
                      style={{ '--i': i }}
                      onClick={() => { setTradeMenuOpen(false); navigateWithInk(item.path); }}
                    >
                      <span className="trade-mega-label">{item.label}</span>
                      <span className="trade-mega-sub">{item.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button className="nav-link nav-link-swap nav-btn-about" onClick={onAboutOpen}>
                <span className="nav-link-default">About</span>
                <span className="nav-link-hover">About</span>
              </button>
            </nav>

            <a href="/" className="logo" onClick={handleLogoClick}>
              <span>VinoHub</span>
            </a>

            <nav className="nav-right">
              <SwapLink to="/">Login</SwapLink>
              <a href="/contact" className="btn-contact" onClick={handleContactClick}>Contact</a>
            </nav>

          </div>
        </div>
      </header>

      {/* Mobile top bar — fixed above ink overlay so logo + hamburger are always visible */}
      <div className="mobile-top-bar" ref={mobileBarRef}>
        <a href="/" className={`logo logo-mobile${menuVisible ? ' logo-menu-open' : ''}`} onClick={menuVisible ? closeMenu : handleLogoClick}>
          <span>VinoHub</span>
        </a>
        <button
          className={`hamburger${menuVisible ? ' menu-is-open' : ''}`}
          onClick={menuVisible ? closeMenu : openMenu}
          aria-label={menuVisible ? 'Close menu' : 'Open menu'}
        >
          <svg className="hamburger-icon" xmlns="http://www.w3.org/2000/svg" width="28" height="35" viewBox="0 0 58.16 73.08" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="3">
            <path d="M29.08,1.5h0c15.22,0,27.58,12.36,27.58,27.58v42.5H1.5V29.08C1.5,13.86,13.86,1.5,29.08,1.5Z"/>
            <rect className="stair-tread stair-tread-3" x="1.5" y="58.91" width="39.88" height="12.67"/>
            <rect className="stair-tread stair-tread-2" x="1.5" y="46.24" width="28.38" height="12.67"/>
            <rect className="stair-tread stair-tread-1" x="1.5" y="33.56" width="15.25" height="12.67"/>
            <line className="close-line close-line-1" x1="18" y1="25" x2="40" y2="60"/>
            <line className="close-line close-line-2" x1="40" y1="25" x2="18" y2="60"/>
          </svg>
        </button>
      </div>

      {/* Ink overlay for mobile menu — always mounted so inkRef is never null */}
      <div
        ref={inkRef}
        className="menu-ink-overlay"
        style={{ visibility: 'hidden', pointerEvents: 'none', backgroundColor: '#722f37' }}
      >
        {menuVisible && (
          <div className="menu-overlay-content">
            <nav className="menu-overlay-nav">
              <button className="menu-overlay-item" style={{ '--i': 0 }} onClick={() => handleMenuNav('/wineries')}>Portfolio</button>
              <button className="menu-overlay-item" style={{ '--i': 1 }} onClick={() => handleMenuNav('/trade-tools')}>Trade Tools</button>
              <button className="menu-overlay-item" style={{ '--i': 2 }} onClick={() => { closeMenu(); onAboutOpen(); }}>About</button>
              <button className="menu-overlay-item" style={{ '--i': 3 }} onClick={() => handleMenuNav('/')}>Login</button>
              <button className="menu-overlay-item menu-overlay-contact" style={{ '--i': 4 }} onClick={() => handleMenuNav('/contact')}>Contact</button>
            </nav>
          </div>
        )}
      </div>
    </>
  );
};

export default Header;
