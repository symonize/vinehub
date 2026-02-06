import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { winesAPI, wineriesAPI } from '../utils/api';
import './Wineries.css';

const Wineries = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('wines');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedMarkets, setSelectedMarkets] = useState([]);

  // Collapse state for filter sections
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    region: true,
    market: true,
    award: true,
    score: true
  });

  // Fetch wines
  const { data: winesData, isLoading: winesLoading } = useQuery(
    ['wines-portfolio', search, selectedTypes, selectedRegions, selectedMarkets],
    () => {
      const params = {
        search,
        limit: 100
      };

      // Only add type filter if selected
      if (selectedTypes.length > 0) {
        params.type = selectedTypes[0];
      }

      // Only add region filter if selected
      if (selectedRegions.length > 0) {
        params.region = selectedRegions[0];
      }

      // Only add market filter if selected
      if (selectedMarkets.length > 0) {
        params.market = selectedMarkets[0];
      }

      return winesAPI.getAll(params);
    },
    {
      keepPreviousData: true,
      enabled: activeTab === 'wines'
    }
  );

  // Fetch brands (wineries)
  const { data: brandsData, isLoading: brandsLoading } = useQuery(
    ['brands-portfolio', search],
    () => wineriesAPI.getAll({
      search,
      limit: 100
    }),
    {
      keepPreviousData: true,
      enabled: activeTab === 'brands'
    }
  );

  const wines = winesData?.data?.data || [];
  const brands = brandsData?.data?.data || [];
  const isLoading = activeTab === 'wines' ? winesLoading : brandsLoading;

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleRegion = (region) => {
    setSelectedRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  };

  const toggleMarket = (market) => {
    setSelectedMarkets(prev =>
      prev.includes(market) ? prev.filter(m => m !== market) : [...prev, market]
    );
  };

  // Available regions and markets (matching backend enum values)
  const regions = [
    'Napa Valley',
    'Sonoma County',
    'Paso Robles',
    'Santa Barbara',
    'Willamette Valley',
    'Finger Lakes',
    'Columbia Valley',
    'Walla Walla',
    'Russian River Valley',
    'Alexander Valley',
    'Other'
  ];
  const markets = ['On-Premise', 'Off-Premise', 'E-Commerce', 'Export'];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getWineTypeColor = (wineType) => {
    const colors = {
      red: '#722f37',
      white: '#d4a574',
      sparkling: '#d4a017',
      rosé: '#e07a5f',
      dessert: '#5a9279',
      fortified: '#5a252c'
    };
    return colors[wineType] || '#6c757d';
  };

  return (
    <div className="portfolio-page">
      {/* Portfolio Header */}
      <div className="portfolio-header">
        <div className="container">
          <div className="portfolio-header-content">
            <h1>Portfolio</h1>
            <div className="portfolio-tabs">
              <button
                className={activeTab === 'wines' ? 'tab active' : 'tab'}
                onClick={() => setActiveTab('wines')}
              >
                Wines
              </button>
              <button
                className={activeTab === 'brands' ? 'tab active' : 'tab'}
                onClick={() => setActiveTab('brands')}
              >
                Brands
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="portfolio-content">
        <div className="container">
          {/* Controls Bar - Above Grid */}
          <div className="portfolio-controls-bar">
            <div className="results-count">
              Showing <span className="count-badge">
                {activeTab === 'wines' ? wines.length : brands.length}
              </span>
            </div>
            <button className="sort-button">Sort</button>
          </div>

          <div className="portfolio-layout">
            {/* Sidebar Filters */}
            <aside className="portfolio-sidebar">
              <h3>Filters</h3>

              <div className="filter-group">
                <h4 className="filter-header" onClick={() => toggleSection('type')}>
                  <span>Type</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={expandedSections.type ? 'chevron expanded' : 'chevron'}
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </h4>
                {expandedSections.type && (
                <div className="filter-pills">
                  <button
                    className={selectedTypes.includes('red') ? 'pill active' : 'pill'}
                    onClick={() => toggleType('red')}
                  >
                    Red
                  </button>
                  <button
                    className={selectedTypes.includes('white') ? 'pill active' : 'pill'}
                    onClick={() => toggleType('white')}
                  >
                    White
                  </button>
                  <button
                    className={selectedTypes.includes('sparkling') ? 'pill active' : 'pill'}
                    onClick={() => toggleType('sparkling')}
                  >
                    Sparkling
                  </button>
                  <button
                    className={selectedTypes.includes('rosé') ? 'pill active' : 'pill'}
                    onClick={() => toggleType('rosé')}
                  >
                    Rosé
                  </button>
                  <button
                    className={selectedTypes.includes('dessert') ? 'pill active' : 'pill'}
                    onClick={() => toggleType('dessert')}
                  >
                    Dessert
                  </button>
                </div>
                )}
              </div>

              <div className="filter-group">
                <h4 className="filter-header" onClick={() => toggleSection('region')}>
                  <span>Region</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={expandedSections.region ? 'chevron expanded' : 'chevron'}
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </h4>
                {expandedSections.region && (
                <div className="filter-checkboxes">
                  {regions.map((region) => (
                    <label key={region} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedRegions.includes(region)}
                        onChange={() => toggleRegion(region)}
                      />
                      <span className="checkbox-text">{region}</span>
                    </label>
                  ))}
                </div>
                )}
              </div>

              <div className="filter-group">
                <h4 className="filter-header" onClick={() => toggleSection('market')}>
                  <span>Market</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={expandedSections.market ? 'chevron expanded' : 'chevron'}
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </h4>
                {expandedSections.market && (
                <div className="filter-checkboxes">
                  {markets.map((market) => (
                    <label key={market} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedMarkets.includes(market)}
                        onChange={() => toggleMarket(market)}
                      />
                      <span className="checkbox-text">{market}</span>
                    </label>
                  ))}
                </div>
                )}
              </div>

              <div className="filter-group">
                <h4 className="filter-header" onClick={() => toggleSection('award')}>
                  <span>Award</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={expandedSections.award ? 'chevron expanded' : 'chevron'}
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </h4>
                {expandedSections.award && (
                  <div className="filter-content">
                    {/* Add award filters here if needed */}
                  </div>
                )}
              </div>

              <div className="filter-group">
                <h4 className="filter-header" onClick={() => toggleSection('score')}>
                  <span>Score</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={expandedSections.score ? 'chevron expanded' : 'chevron'}
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </h4>
                {expandedSections.score && (
                <div className="score-slider">
                  <input type="range" min="0" max="100" />
                  <div className="score-labels">
                    <span>90</span>
                    <span>97</span>
                  </div>
                </div>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <div className="portfolio-main">
              {/* Wines/Brands Grid */}
              {isLoading ? (
                <div className="loading">
                  <div className="spinner"></div>
                </div>
              ) : activeTab === 'wines' ? (
                wines.length === 0 ? (
                  <div className="empty-state">
                    <p>No wines found</p>
                  </div>
                ) : (
                  <div className="wines-portfolio-grid">
                    {wines.map((wine) => (
                      <Link
                        key={wine._id}
                        to={`/wines/${wine._id}`}
                        className="wine-portfolio-card"
                      >
                        <div className="wine-portfolio-producer">
                          {wine.winery?.name || 'L\'ANTICA QUERCIA'}
                        </div>
                        <h3 className="wine-portfolio-name">{wine.name}</h3>
                        <div className="wine-portfolio-image">
                          {wine.bottleImage?.url ? (
                            <img src={wine.bottleImage.url} alt={wine.name} />
                          ) : (
                            <div className="wine-portfolio-placeholder">
                              <svg width="80" height="200" viewBox="0 0 100 250" fill="none">
                                <path d="M50 10 L35 60 L25 240 L75 240 L65 60 Z" fill={getWineTypeColor(wine.type)}/>
                                <ellipse cx="50" cy="50" rx="15" ry="8" fill={getWineTypeColor(wine.type)} opacity="0.3"/>
                              </svg>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              ) : (
                brands.length === 0 ? (
                  <div className="empty-state">
                    <p>No brands found</p>
                  </div>
                ) : (
                  <div className="wines-portfolio-grid">
                    {brands.map((brand) => (
                      <Link
                        key={brand._id}
                        to={`/wineries/${brand._id}`}
                        className="wine-portfolio-card"
                      >
                        <div className="wine-portfolio-producer">
                          {brand.region || 'ITALY'}
                        </div>
                        <h3 className="wine-portfolio-name">{brand.name}</h3>
                        <div className="wine-portfolio-image">
                          {brand.logo?.url ? (
                            <img src={brand.logo.url} alt={brand.name} />
                          ) : (
                            <div className="wine-portfolio-placeholder">
                              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                                <circle cx="60" cy="60" r="50" stroke="#722f37" strokeWidth="2" fill="none"/>
                                <text x="60" y="70" textAnchor="middle" fill="#722f37" fontSize="40" fontFamily="moret">W</text>
                              </svg>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wineries;
