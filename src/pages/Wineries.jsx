import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { winesAPI, wineriesAPI } from '../utils/api';
import './Wineries.css';

const regionCoordinates = {
  'Napa Valley': { x: 122, y: 295, label: 'Napa Valley' },
  'Sonoma County': { x: 98, y: 285, label: 'Sonoma County' },
  'Paso Robles': { x: 115, y: 395, label: 'Paso Robles' },
  'Santa Barbara': { x: 135, y: 430, label: 'Santa Barbara' },
  'Willamette Valley': { x: 95, y: 145, label: 'Willamette Valley' },
  'Finger Lakes': { x: 580, y: 170, label: 'Finger Lakes' },
  'Columbia Valley': { x: 155, y: 95, label: 'Columbia Valley' },
  'Walla Walla': { x: 170, y: 110, label: 'Walla Walla' },
  'Russian River Valley': { x: 85, y: 280, label: 'Russian River Valley' },
  'Alexander Valley': { x: 105, y: 270, label: 'Alexander Valley' },
  'Other': { x: 350, y: 320, label: 'Other' },
};

const MapView = ({ items, activeTab, getWineTypeColor }) => {
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  // Group items by region
  const regionGroups = {};
  items.forEach((item) => {
    const region = item.region || 'Other';
    if (!regionGroups[region]) regionGroups[region] = [];
    regionGroups[region].push(item);
  });

  const maxCount = Math.max(...Object.values(regionGroups).map(g => g.length), 1);

  return (
    <div className="portfolio-map-view">
      <div className="map-container">
        <svg viewBox="0 0 700 520" className="wine-regions-map">
          {/* US outline - simplified */}
          <path
            d="M60 60 L60 30 L200 20 L300 25 L400 30 L500 25 L620 40 L640 60 L650 100 L640 140 L620 170 L600 180 L580 160 L570 180 L590 210 L600 250 L610 280 L620 320 L615 360 L600 400 L580 430 L550 450 L500 460 L450 470 L400 475 L350 480 L300 475 L250 465 L200 460 L170 470 L150 480 L130 485 L110 470 L100 450 L95 420 L100 380 L105 340 L100 300 L90 260 L80 220 L75 180 L70 140 L65 100 Z"
            fill="rgba(114, 47, 55, 0.04)"
            stroke="rgba(114, 47, 55, 0.2)"
            strokeWidth="1.5"
          />

          {/* Washington State outline */}
          <path
            d="M60 60 L60 30 L200 20 L210 60 L200 100 L180 110 L140 105 L100 100 L75 90 Z"
            fill="rgba(114, 47, 55, 0.06)"
            stroke="rgba(114, 47, 55, 0.25)"
            strokeWidth="1"
          />

          {/* Oregon outline */}
          <path
            d="M60 60 L75 90 L100 100 L140 105 L180 110 L200 100 L200 170 L180 180 L140 175 L100 170 L75 160 L65 130 Z"
            fill="rgba(114, 47, 55, 0.06)"
            stroke="rgba(114, 47, 55, 0.25)"
            strokeWidth="1"
          />

          {/* California outline */}
          <path
            d="M65 130 L75 160 L100 170 L140 175 L180 180 L175 220 L165 260 L155 300 L145 340 L140 380 L135 420 L130 450 L115 465 L100 450 L95 420 L100 380 L105 340 L100 300 L90 260 L80 220 L75 180 Z"
            fill="rgba(114, 47, 55, 0.08)"
            stroke="rgba(114, 47, 55, 0.3)"
            strokeWidth="1"
          />

          {/* New York State outline */}
          <path
            d="M540 130 L560 120 L590 125 L610 140 L620 170 L610 200 L590 210 L570 205 L555 190 L545 170 L540 150 Z"
            fill="rgba(114, 47, 55, 0.06)"
            stroke="rgba(114, 47, 55, 0.25)"
            strokeWidth="1"
          />

          {/* State labels */}
          <text x="130" y="55" className="map-state-label">WASHINGTON</text>
          <text x="115" y="140" className="map-state-label">OREGON</text>
          <text x="105" y="330" className="map-state-label">CALIFORNIA</text>
          <text x="565" y="155" className="map-state-label" style={{ fontSize: '8px' }}>NEW YORK</text>

          {/* Region markers */}
          {Object.entries(regionCoordinates).map(([region, coords]) => {
            const count = regionGroups[region]?.length || 0;
            if (count === 0) return null;
            const opacity = 0.3 + (count / maxCount) * 0.7;
            const radius = 12 + (count / maxCount) * 18;
            const isHovered = hoveredRegion === region;
            const isSelected = selectedRegion === region;

            return (
              <g
                key={region}
                className="map-region-marker"
                onMouseEnter={() => setHoveredRegion(region)}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => setSelectedRegion(selectedRegion === region ? null : region)}
                style={{ cursor: 'pointer' }}
              >
                {/* Pulse ring on hover */}
                {(isHovered || isSelected) && (
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={radius + 6}
                    fill="none"
                    stroke="#722f37"
                    strokeWidth="1.5"
                    opacity="0.4"
                    className="marker-pulse"
                  />
                )}
                {/* Main circle */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={radius}
                  fill="#722f37"
                  opacity={isHovered || isSelected ? 0.9 : opacity}
                  className="marker-circle"
                />
                {/* Count text */}
                <text
                  x={coords.x}
                  y={coords.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="var(--font-family-base)"
                >
                  {count}
                </text>
                {/* Region label */}
                <text
                  x={coords.x}
                  y={coords.y + radius + 14}
                  textAnchor="middle"
                  fill="#722f37"
                  fontSize="9"
                  fontWeight="500"
                  fontFamily="var(--font-family-base)"
                  opacity={isHovered || isSelected ? 1 : 0.7}
                >
                  {coords.label}
                </text>
              </g>
            );
          })}

          {/* Tooltip */}
          {hoveredRegion && regionGroups[hoveredRegion] && (
            <g>
              <rect
                x={regionCoordinates[hoveredRegion].x + 20}
                y={regionCoordinates[hoveredRegion].y - 35}
                width={Math.max(hoveredRegion.length * 7.5, 120)}
                height="30"
                rx="4"
                fill="white"
                stroke="#722f37"
                strokeWidth="1"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
              />
              <text
                x={regionCoordinates[hoveredRegion].x + 28}
                y={regionCoordinates[hoveredRegion].y - 16}
                fill="#722f37"
                fontSize="11"
                fontWeight="600"
                fontFamily="var(--font-family-base)"
              >
                {hoveredRegion} — {regionGroups[hoveredRegion].length} {activeTab === 'wines' ? 'wine' : 'brand'}{regionGroups[hoveredRegion].length !== 1 ? 's' : ''}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Region detail panel */}
      {selectedRegion && regionGroups[selectedRegion] && (
        <div className="map-detail-panel">
          <div className="map-detail-header">
            <h3>{selectedRegion}</h3>
            <span className="map-detail-count">{regionGroups[selectedRegion].length} {activeTab === 'wines' ? 'wine' : 'brand'}{regionGroups[selectedRegion].length !== 1 ? 's' : ''}</span>
            <button className="map-detail-close" onClick={() => setSelectedRegion(null)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="map-detail-list">
            {regionGroups[selectedRegion].map((item) => (
              <Link
                key={item._id}
                to={activeTab === 'wines' ? `/wines/${item._id}` : `/wineries/${item._id}`}
                className="map-detail-item"
              >
                <div className="map-detail-thumb">
                  {activeTab === 'wines' ? (
                    item.bottleImage?.url ? (
                      <img src={item.bottleImage.url} alt={item.name} />
                    ) : (
                      <svg width="16" height="32" viewBox="0 0 100 250" fill="none">
                        <path d="M50 10 L35 60 L25 240 L75 240 L65 60 Z" fill={getWineTypeColor(item.type)}/>
                      </svg>
                    )
                  ) : (
                    item.logo?.url ? (
                      <img src={item.logo.url} alt={item.name} />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 120 120" fill="none">
                        <circle cx="60" cy="60" r="50" stroke="#722f37" strokeWidth="4" fill="none"/>
                        <text x="60" y="75" textAnchor="middle" fill="#722f37" fontSize="50" fontFamily="moret">W</text>
                      </svg>
                    )
                  )}
                </div>
                <div className="map-detail-info">
                  <span className="map-detail-name">{item.name}</span>
                  {activeTab === 'wines' && item.type && (
                    <span className="map-detail-type" style={{ color: getWineTypeColor(item.type) }}>
                      {item.type}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Wineries = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('wines');
  const [viewMode, setViewMode] = useState('grid');
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
              <div className="controls-right">
                <div className="view-toggle-group">
                  <button
                    className={`view-toggle-btn${viewMode === 'grid' ? ' active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <rect x="1" y="1" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="10" y="1" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="1" y="10" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="10" y="10" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </button>
                  <button
                    className={`view-toggle-btn${viewMode === 'table' ? ' active' : ''}`}
                    onClick={() => setViewMode('table')}
                    title="Table view"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <line x1="1" y1="3" x2="17" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="1" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="1" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="1" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <button
                    className={`view-toggle-btn${viewMode === 'map' ? ' active' : ''}`}
                    onClick={() => setViewMode('map')}
                    title="Map view"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M9 1C6.24 1 4 3.24 4 6c0 4.5 5 11 5 11s5-6.5 5-11c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                      <circle cx="9" cy="6" r="2" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </button>
                </div>
                <button className="sort-button">Sort</button>
              </div>
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
                {isLoading ? (
                  <div className="loading">
                    <div className="spinner"></div>
                  </div>
                ) : viewMode === 'grid' ? (
                  /* Grid View */
                  activeTab === 'wines' ? (
                    wines.length === 0 ? (
                      <div className="empty-state"><p>No wines found</p></div>
                    ) : (
                      <div className="wines-portfolio-grid">
                        {wines.map((wine) => (
                          <Link key={wine._id} to={`/wines/${wine._id}`} className="wine-portfolio-card">
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
                      <div className="empty-state"><p>No brands found</p></div>
                    ) : (
                      <div className="wines-portfolio-grid">
                        {brands.map((brand) => (
                          <Link key={brand._id} to={`/wineries/${brand._id}`} className="wine-portfolio-card">
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
                  )
                ) : viewMode === 'table' ? (
                  /* Table View */
                  activeTab === 'wines' ? (
                    wines.length === 0 ? (
                      <div className="empty-state"><p>No wines found</p></div>
                    ) : (
                      <div className="portfolio-table-wrapper">
                        <table className="portfolio-table">
                          <thead>
                            <tr>
                              <th></th>
                              <th>Name</th>
                              <th>Producer</th>
                              <th>Type</th>
                              <th>Region</th>
                            </tr>
                          </thead>
                          <tbody>
                            {wines.map((wine) => (
                              <tr key={wine._id} onClick={() => window.location.href = `/wines/${wine._id}`}>
                                <td className="table-thumb">
                                  {wine.bottleImage?.url ? (
                                    <img src={wine.bottleImage.url} alt={wine.name} />
                                  ) : (
                                    <div className="table-thumb-placeholder">
                                      <svg width="20" height="40" viewBox="0 0 100 250" fill="none">
                                        <path d="M50 10 L35 60 L25 240 L75 240 L65 60 Z" fill={getWineTypeColor(wine.type)}/>
                                      </svg>
                                    </div>
                                  )}
                                </td>
                                <td className="table-name">{wine.name}</td>
                                <td>{wine.winery?.name || '—'}</td>
                                <td>
                                  <span className="table-type-badge" style={{ background: getWineTypeColor(wine.type) }}>
                                    {wine.type}
                                  </span>
                                </td>
                                <td>{wine.region || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                    brands.length === 0 ? (
                      <div className="empty-state"><p>No brands found</p></div>
                    ) : (
                      <div className="portfolio-table-wrapper">
                        <table className="portfolio-table">
                          <thead>
                            <tr>
                              <th></th>
                              <th>Name</th>
                              <th>Region</th>
                            </tr>
                          </thead>
                          <tbody>
                            {brands.map((brand) => (
                              <tr key={brand._id} onClick={() => window.location.href = `/wineries/${brand._id}`}>
                                <td className="table-thumb">
                                  {brand.logo?.url ? (
                                    <img src={brand.logo.url} alt={brand.name} />
                                  ) : (
                                    <div className="table-thumb-placeholder">
                                      <svg width="30" height="30" viewBox="0 0 120 120" fill="none">
                                        <circle cx="60" cy="60" r="50" stroke="#722f37" strokeWidth="4" fill="none"/>
                                        <text x="60" y="75" textAnchor="middle" fill="#722f37" fontSize="50" fontFamily="moret">W</text>
                                      </svg>
                                    </div>
                                  )}
                                </td>
                                <td className="table-name">{brand.name}</td>
                                <td>{brand.region || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )
                ) : (
                  /* Map View */
                  <MapView
                    items={activeTab === 'wines' ? wines : brands}
                    activeTab={activeTab}
                    getWineTypeColor={getWineTypeColor}
                  />
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wineries;
