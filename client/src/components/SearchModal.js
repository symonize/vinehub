import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Wine as WineIcon, Building2, X } from 'lucide-react';
import { winesAPI, wineriesAPI } from '../utils/api';
import './SearchModal.css';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ wines: [], wineries: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleSearch = async () => {
      if (!query.trim()) {
        setResults({ wines: [], wineries: [] });
        return;
      }

      setLoading(true);
      try {
        const [winesResponse, wineriesResponse] = await Promise.all([
          winesAPI.getAll({ search: query, limit: 5 }),
          wineriesAPI.getAll({ search: query, limit: 5 })
        ]);

        setResults({
          wines: winesResponse.data?.data || [],
          wineries: wineriesResponse.data?.data || []
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const allResults = [
    ...results.wineries.map(w => ({ type: 'winery', data: w })),
    ...results.wines.map(w => ({ type: 'wine', data: w }))
  ];

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && allResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(allResults[selectedIndex]);
    }
  };

  const handleSelect = (result) => {
    const path = result.type === 'wine'
      ? `/wines/${result.data._id}`
      : `/wineries/${result.data._id}`;
    navigate(path);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <Search size={20} className="search-modal-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search wines and wineries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="search-modal-input"
          />
          <button onClick={onClose} className="search-modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="search-modal-results">
          {loading ? (
            <div className="search-modal-loading">
              <div className="spinner"></div>
              <span>Searching...</span>
            </div>
          ) : query.trim() === '' ? (
            <div className="search-modal-empty">
              <Search size={48} />
              <p>Start typing to search for wines and wineries</p>
              <div className="search-modal-shortcuts">
                <kbd>↑</kbd> <kbd>↓</kbd> to navigate
                <kbd>↵</kbd> to select
                <kbd>esc</kbd> to close
              </div>
            </div>
          ) : allResults.length === 0 ? (
            <div className="search-modal-empty">
              <Search size={48} />
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <>
              {results.wineries.length > 0 && (
                <div className="search-modal-section">
                  <div className="search-modal-section-title">
                    <Building2 size={16} />
                    <span>Wineries</span>
                  </div>
                  {results.wineries.map((winery, index) => {
                    const globalIndex = index;
                    return (
                      <div
                        key={winery._id}
                        className={`search-modal-item ${selectedIndex === globalIndex ? 'selected' : ''}`}
                        onClick={() => handleSelect({ type: 'winery', data: winery })}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <div className="search-modal-item-icon winery">
                          <Building2 size={20} />
                        </div>
                        <div className="search-modal-item-content">
                          <div className="search-modal-item-title">{winery.name}</div>
                          {winery.description && (
                            <div className="search-modal-item-description">
                              {winery.description.substring(0, 60)}...
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {results.wines.length > 0 && (
                <div className="search-modal-section">
                  <div className="search-modal-section-title">
                    <WineIcon size={16} />
                    <span>Wines</span>
                  </div>
                  {results.wines.map((wine, index) => {
                    const globalIndex = results.wineries.length + index;
                    return (
                      <div
                        key={wine._id}
                        className={`search-modal-item ${selectedIndex === globalIndex ? 'selected' : ''}`}
                        onClick={() => handleSelect({ type: 'wine', data: wine })}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <div className="search-modal-item-icon wine">
                          <WineIcon size={20} />
                        </div>
                        <div className="search-modal-item-content">
                          <div className="search-modal-item-title">{wine.name}</div>
                          <div className="search-modal-item-meta">
                            {wine.winery?.name && <span>{wine.winery.name}</span>}
                            {wine.type && <span className="wine-type">{wine.type}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
