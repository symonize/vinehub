import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';
import SearchModal from './SearchModal';
import { usePageTitle } from '../context/PageTitleContext';
import './ContentHeader.css';

const ContentHeader = ({ onMenuClick }) => {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { customTitle, customBreadcrumb } = usePageTitle();

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Determine page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;

    if (path === '/') return 'Dashboard';
    if (path.startsWith('/wineries/new')) return 'New Brand';
    if (path.match(/\/wineries\/[^/]+\/edit/)) return 'Edit Brand';
    if (path.match(/\/wineries\/[^/]+/)) return 'Brand Details';
    if (path.startsWith('/wineries')) return 'Brands';

    if (path.startsWith('/wines/new')) return 'New Wine';
    if (path.match(/\/wines\/[^/]+\/edit/)) return 'Edit Wine';
    if (path.match(/\/wines\/[^/]+/)) return 'Wine Details';
    if (path.startsWith('/wines')) return 'Wines';

    if (path.startsWith('/vintages/new')) return 'New Vintage';
    if (path.match(/\/vintages\/[^/]+\/edit/)) return 'Edit Vintage';
    if (path.match(/\/vintages\/[^/]+/)) return 'Vintage Details';
    if (path.startsWith('/vintages')) return 'Vintages';

    if (path.startsWith('/style-guide')) return 'Style Guide';

    return 'WineHub CMS';
  };

  // Generate breadcrumbs based on current route
  const getBreadcrumbs = () => {
    const path = location.pathname;

    // Dashboard has no breadcrumbs
    if (path === '/') return null;

    // Wineries/Brands section
    if (path.startsWith('/wineries')) {
      if (path === '/wineries') return null; // List page has no breadcrumbs
      return (
        <>
          <Link to="/wineries" className="breadcrumb-link">Brands</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">
            {path.includes('/new') ? 'New Brand' : 'Brand Details'}
          </span>
        </>
      );
    }

    // Wines section
    if (path.startsWith('/wines')) {
      if (path === '/wines') return null; // List page has no breadcrumbs
      return (
        <>
          <Link to="/wines" className="breadcrumb-link">Wines</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">
            {path.includes('/new') ? 'New Wine' : 'Wine Details'}
          </span>
        </>
      );
    }

    // Vintages section
    if (path.startsWith('/vintages')) {
      if (path === '/vintages') return null; // List page has no breadcrumbs
      return (
        <>
          <Link to="/vintages" className="breadcrumb-link">Vintages</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">
            {path.includes('/new') ? 'New Vintage' : 'Vintage Details'}
          </span>
        </>
      );
    }

    return null;
  };

  const breadcrumbs = customBreadcrumb || getBreadcrumbs();

  return (
    <>
      <div className="content-header">
        <div className="content-header-left">
          <button className="mobile-menu-button" onClick={onMenuClick} aria-label="Open menu">
            <Menu size={24} />
          </button>
          <h1 className="content-header-title">{customTitle || getPageTitle()}</h1>
          {breadcrumbs && (
            <div className="breadcrumb">
              {breadcrumbs}
            </div>
          )}
        </div>

        <div className="content-header-search" onClick={() => setIsSearchOpen(true)}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search..."
            className="content-header-search-input"
            readOnly
          />
          <kbd className="search-shortcut">⌘K</kbd>
        </div>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default ContentHeader;
