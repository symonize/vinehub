import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('wines');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name-asc');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);
  const heroSearchRef = useRef(null);

  // Collapse state for filter sections
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    country: true,
    region: true,
  });

  // Fetch wines
  const { data: winesData, isLoading: winesLoading } = useQuery(
    ['wines-portfolio', search, selectedTypes, selectedCountries, selectedRegions],
    () => {
      const params = {
        search,
        limit: 100
      };

      // Only add type filter if selected
      if (selectedTypes.length > 0) {
        params.type = selectedTypes[0];
      }

      // Only add country filter if selected
      if (selectedCountries.length > 0) {
        params.country = selectedCountries[0];
      }

      // Only add region filter if selected
      if (selectedRegions.length > 0) {
        params.region = selectedRegions[0];
      }

      return winesAPI.getAll(params);
    },
    {
      keepPreviousData: true,
    }
  );

  // Fetch brands (wineries) — always enabled so hero search dropdown can show both groups
  const { data: brandsData, isLoading: brandsLoading } = useQuery(
    ['brands-portfolio', search],
    () => wineriesAPI.getAll({
      search,
      limit: 100
    }),
    {
      keepPreviousData: true,
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

  const toggleCountry = (country) => {
    setSelectedCountries(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  const toggleRegion = (region) => {
    setSelectedRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  };

  // Derive unique countries and regions from wine data
  const countries = [...new Set(wines.map(w => w.country).filter(Boolean))].sort();
  const regions = [...new Set(wines.map(w => w.region).filter(Boolean))].sort();

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!sortOpen) return;
    function handleClick(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sortOpen]);

  const SORT_OPTIONS = [
    { value: 'name-asc',    label: 'Name A–Z' },
    { value: 'name-desc',   label: 'Name Z–A' },
    { value: 'type',        label: 'Type' },
    { value: 'region',      label: 'Appellation' },
    { value: 'producer',    label: 'Producer' },
  ];

  function applySortWines(list) {
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'name-desc': return (b.name || '').localeCompare(a.name || '');
        case 'type':      return (a.type || '').localeCompare(b.type || '');
        case 'region':    return (a.region || '').localeCompare(b.region || '');
        case 'producer':  return (a.winery?.name || '').localeCompare(b.winery?.name || '');
        default:          return (a.name || '').localeCompare(b.name || '');
      }
    });
  }

  function applySortBrands(list) {
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'name-desc': return (b.name || '').localeCompare(a.name || '');
        case 'region':    return (a.region || '').localeCompare(b.region || '');
        default:          return (a.name || '').localeCompare(b.name || '');
      }
    });
  }

  const sortedWines = applySortWines(wines);
  const sortedBrands = applySortBrands(brands);

  // Hero search dropdown — client-side filter from loaded data
  const heroQuery = search.trim().toLowerCase();
  const heroWineResults = heroQuery.length > 0
    ? wines.filter(w => w.name?.toLowerCase().includes(heroQuery) || w.winery?.name?.toLowerCase().includes(heroQuery)).slice(0, 5)
    : [];
  const heroBrandResults = heroQuery.length > 0
    ? brands.filter(b => b.name?.toLowerCase().includes(heroQuery) || b.region?.toLowerCase().includes(heroQuery)).slice(0, 5)
    : [];
  const showHeroDropdown = heroQuery.length > 0 && (heroWineResults.length > 0 || heroBrandResults.length > 0);

  // Close hero search dropdown on outside click
  useEffect(() => {
    if (!showHeroDropdown) return;
    function handleClick(e) {
      if (heroSearchRef.current && !heroSearchRef.current.contains(e.target)) {
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showHeroDropdown]);

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
      {/* Portfolio Hero */}
      <div className="portfolio-hero">
        <div className="portfolio-hero-overlay" />
        <div className="portfolio-hero-content">
          <h1>Portfolio</h1>
          <div className="portfolio-hero-search" ref={heroSearchRef}>
            <svg className="portfolio-hero-search-icon" width="18" height="18" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              className="portfolio-hero-search-input"
              placeholder="Find a wine or producer"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
            />
            {search && (
              <button className="portfolio-hero-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
            {showHeroDropdown && (
              <div className="search-results-dropdown">
                {heroWineResults.length > 0 && (
                  <div className="search-results-group">
                    <div className="search-results-group-label">
                      <svg width="7" height="22" viewBox="0 0 21 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.41406 0.23877C9.57799 -0.114485 12.8209 -0.173047 13.7207 0.746582C14.2719 1.3108 14.1559 4.79025 14.2256 5.78564C14.3504 7.6219 14.6235 9.49041 14.667 11.3267C14.7134 13.3557 14.1122 17.8339 15.2383 19.3638C15.5866 19.8367 16.3274 20.1758 16.7686 20.5991C17.4335 21.2359 19.2753 23.0887 19.7139 23.7661C21.4844 26.4841 20.9159 38.504 20.9043 42.2876C20.884 49.5978 21.0142 52.5232 20.6543 59.8335C20.4888 63.1645 20.135 66.8897 16.1934 67.6079C12.7801 68.2297 5.95348 68.3262 3.04785 66.3062C1.19905 65.0188 0.978285 64.0199 0.644531 61.8599C0.351375 59.971 0.37763 57.5416 0.345703 55.6089C0.287654 52.0327 0.258641 53.0221 0.139648 49.5894C0.0264487 46.378 0.478705 43.1015 0.290039 39.8726L0.287109 39.8696L0 40.019C0.0957844 39.6337 0.252387 39.534 0.298828 39.0786C0.409031 37.9928 0.0640239 37.2252 0.0117188 36.4487C-0.00569559 36.1626 0.263862 35.6632 0.287109 35.272C0.501899 31.611 -0.30756 25.9061 2.10156 22.937C3.35544 21.3928 5.49198 20.5639 6.41211 18.6606C7.07965 17.274 6.84749 14.1501 6.82715 12.4976C6.78651 9.21908 6.3797 5.70962 6.66992 2.42529C6.76859 1.3044 7.33464 0.568744 8.41406 0.23877ZM13.0674 15.5571C11.262 15.4112 9.49096 15.3934 7.68848 15.4927C7.63914 16.7393 7.74418 18.3512 7.22754 19.481C5.99677 22.1666 2.77727 22.6571 2.04004 25.7954C1.76146 26.9806 1.79984 28.3001 1.60254 29.5874C1.52127 30.1158 1.4774 31.3453 1.46289 31.9321C1.23649 42.121 1.21865 48.4621 1.93848 58.6597C2.12424 61.3076 1.73 64.4574 4.79492 65.5669C7.41578 66.5157 9.92642 65.9235 12.2803 66.481C12.4021 66.5101 12.3156 66.7349 12.5908 66.7817C13.3273 66.8984 13.2619 66.4875 13.3457 66.4722C13.5837 66.4313 13.8427 66.6157 14.0488 66.5952C15.6045 66.4491 17.137 65.6572 18.1006 64.4194C19.3542 62.8109 19.3686 61.1351 19.2031 59.1763L19.4902 59.3257C19.4902 58.9578 19.6356 58.6251 19.1973 58.5229V58.231C20.0202 58.3038 19.2087 57.9574 19.1973 57.9155C19.0057 57.0339 19.5309 55.9008 19.4961 55.6089C19.4874 55.5301 19.2267 55.5447 19.2002 55.4312C18.9796 54.5057 19.6449 53.7054 19.4824 52.5435C19.3997 51.9419 19.3384 52.2047 19.2998 52.6353C19.2929 52.322 19.2816 52.0084 19.293 51.6968L19.5811 51.8452C19.6879 51.6711 19.5637 50.4874 19.5811 50.1753C19.9642 43.1746 19.6096 35.9807 19.0029 28.9976C18.7011 25.5092 19.1128 24.8262 16.4629 22.2104C15.7054 21.4631 14.9362 20.7067 14.1699 19.9155C14.045 19.7844 13.7782 19.8077 13.665 19.6968L13.6738 19.6938C12.9774 18.9962 13.3805 15.7773 13.0674 15.5571ZM19.2998 52.6353C19.3053 52.8825 19.3083 53.1295 19.293 53.3755C19.2357 54.2908 19.2424 53.2767 19.2998 52.6353ZM9.98145 30.7173C11.3224 30.6793 16.1325 30.454 17.0381 31.1255C17.1251 31.1897 17.2209 31.2344 17.2441 31.3569C17.2325 34.4689 17.0901 37.5663 17.1162 40.6812C17.1191 41.0986 17.2696 41.455 17.2725 41.8374C17.2811 42.6006 17.3876 46.8038 16.9873 47.104L16.9883 47.1069H16.9834C12.935 47.6235 8.81963 47.959 4.74219 47.5767C4.19679 47.2614 3.96432 46.6896 3.90625 46.0825C3.55214 42.4157 3.92993 36.2875 4.47852 32.6294C4.68166 31.2778 4.1155 30.957 6.01953 30.8228C6.28191 30.8046 6.52344 30.8265 6.75195 30.8589L8.29883 30.9292C8.85149 30.8574 9.4665 30.7303 9.97852 30.7173H9.98145Z" fill="currentColor"/>
                      </svg>
                      Wines
                    </div>
                    {heroWineResults.map(wine => (
                      <button key={wine._id} className="search-result-item" onClick={() => { navigate(`/wines/${wine._id}`); setSearch(''); }}>
                        <div className="search-result-thumb">
                          {wine.bottleImage?.url ? (
                            <img src={wine.bottleImage.url} alt={wine.name} />
                          ) : (
                            <svg width="12" height="28" viewBox="0 0 100 250" fill="none">
                              <path d="M50 10 L35 60 L25 240 L75 240 L65 60 Z" fill={getWineTypeColor(wine.type)}/>
                            </svg>
                          )}
                        </div>
                        <div className="search-result-info">
                          <span className="search-result-name">{wine.name}</span>
                          {wine.winery?.name && <span className="search-result-sub">{wine.winery.name}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {heroBrandResults.length > 0 && (
                  <div className="search-results-group">
                    <div className="search-results-group-label">
                      <svg width="16" height="22" viewBox="0 0 35 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.1227 1.21047C18.6208 2.58836 19.2628 5.00377 20.2341 6.74397C22.2206 7.94619 25.4968 4.95437 26.4132 6.05228C27.7467 7.63877 25.4309 8.6763 24.0974 8.95078C22.9121 9.19781 21.7048 9.02763 20.514 9.07155C20.7939 11.0094 20.064 12.7166 19.6963 14.5611L22.6212 12.1347C26.5394 10.1256 31.1051 10.658 33.6459 14.4733C36.3293 18.4972 35.0507 24.8541 29.5741 24.9968C30.1722 27.555 29.6783 29.8277 27.2308 31.0354C28.1418 34.7134 26.0126 38.88 22.2426 39.7528C21.6499 39.8901 20.4042 39.632 20.0915 40.0712C20.075 42.4866 19.7512 44.2653 18.2805 46.2195C13.5612 52.4667 1.91099 47.3394 6.47668 39.3521C6.84984 38.6933 7.57969 38.3694 7.6236 37.6229C-0.437709 38.8415 -2.44069 29.5312 3.22802 25.1231C3.80422 24.6784 5.95536 24.0526 4.77552 23.597C3.71641 23.1853 2.55853 22.8888 1.8616 21.8403C0.401896 19.6555 1.83965 15.9061 3.5024 14.1439C5.85658 11.6462 12.8862 8.9398 14.6532 13.2052L17.7373 13.1503C19.0488 10.4769 17.8196 6.5189 16.1898 4.20778C15.4654 3.17574 12.3868 1.33124 13.7697 0.266263C14.7355 -0.48032 16.3599 0.507805 17.1227 1.21047ZM13.1057 13.7432C9.879 11.7285 3.52984 15.434 3.48594 19.0955C3.46398 20.8302 4.95113 21.5 6.52059 21.4231C6.78948 18.9528 8.56747 16.8503 10.3948 15.2803L13.1112 13.7487L13.1057 13.7432ZM28.7729 22.779C32.263 22.7296 33.5361 19.639 32.2849 16.6527C31.0338 13.6663 26.9949 13.0295 24.0809 13.7487L24.6297 14.1549C23.9383 14.8082 23.1865 15.8292 22.1658 15.3901L22.1328 16.5703C24.7889 18.0031 27.6314 19.8476 28.7729 22.779ZM17.6769 25.1725C19.5866 23.3774 21.1231 19.0351 18.736 17.0314C13.6764 12.788 5.63159 21.8019 9.7473 25.5513C11.7448 27.3683 15.7562 26.9786 17.6714 25.1725H17.6769ZM21.0847 24.6839C23.0383 25.5513 24.52 26.9786 25.9193 28.5321C26.4955 28.6858 26.9674 28.1369 27.165 27.6703C28.4436 24.64 24.8492 21.2529 22.5664 19.7872C21.9737 19.7049 22.2316 19.8531 22.1713 20.1989C21.8859 21.747 21.6335 23.2182 21.0847 24.6894V24.6839ZM12.2771 29.394C9.90644 28.9603 7.99675 27.5659 6.66326 25.5732C4.08957 26.3308 -0.0700385 31.3592 2.86583 33.4508C4.46822 34.5926 6.84984 35.202 8.79246 34.8067C9.90644 34.5816 10.5759 33.4178 11.6954 33.1818L12.2826 29.3885L12.2771 29.394ZM20.1408 26.4076C18.0555 28.9438 14.3624 28.0216 14.1868 31.9906C13.9837 36.5579 20.1408 39.3411 23.5048 36.3603C26.8687 33.3794 23.4444 27.9502 20.1408 26.4131V26.4076ZM8.54003 44.935C9.16013 45.5992 11.2454 46.6258 12.1509 46.6971C15.1252 46.9167 19.1092 42.7666 17.6385 39.8132C17.5397 39.6156 13.9947 37.6503 13.7752 37.6229C10.4881 37.1947 5.5822 41.751 8.54003 44.9405V44.935Z" fill="currentColor"/>
                      </svg>
                      Producers
                    </div>
                    {heroBrandResults.map(brand => (
                      <button key={brand._id} className="search-result-item" onClick={() => { navigate(`/wineries/${brand._id}`); setSearch(''); }}>
                        <div className="search-result-thumb search-result-thumb-brand">
                          {brand.logo?.url ? (
                            <img src={brand.logo.url} alt={brand.name} />
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 120 120" fill="none">
                              <circle cx="60" cy="60" r="50" stroke="#722f37" strokeWidth="4" fill="none"/>
                              <text x="60" y="75" textAnchor="middle" fill="#722f37" fontSize="50" fontFamily="moret">W</text>
                            </svg>
                          )}
                        </div>
                        <div className="search-result-info">
                          <span className="search-result-name">{brand.name}</span>
                          {brand.region && <span className="search-result-sub">{brand.region}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="portfolio-content">
        <div className="container">
          {/* Mobile tab row — hidden on desktop, shown on tablet/mobile */}
          <div className="portfolio-mobile-tabs">
            <button
              className={`portfolio-mobile-tab${activeTab === 'wines' ? ' active' : ''}`}
              onClick={() => setActiveTab('wines')}
            >
              <svg width="7" height="22" viewBox="0 0 21 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.41406 0.23877C9.57799 -0.114485 12.8209 -0.173047 13.7207 0.746582C14.2719 1.3108 14.1559 4.79025 14.2256 5.78564C14.3504 7.6219 14.6235 9.49041 14.667 11.3267C14.7134 13.3557 14.1122 17.8339 15.2383 19.3638C15.5866 19.8367 16.3274 20.1758 16.7686 20.5991C17.4335 21.2359 19.2753 23.0887 19.7139 23.7661C21.4844 26.4841 20.9159 38.504 20.9043 42.2876C20.884 49.5978 21.0142 52.5232 20.6543 59.8335C20.4888 63.1645 20.135 66.8897 16.1934 67.6079C12.7801 68.2297 5.95348 68.3262 3.04785 66.3062C1.19905 65.0188 0.978285 64.0199 0.644531 61.8599C0.351375 59.971 0.37763 57.5416 0.345703 55.6089C0.287654 52.0327 0.258641 53.0221 0.139648 49.5894C0.0264487 46.378 0.478705 43.1015 0.290039 39.8726L0.287109 39.8696L0 40.019C0.0957844 39.6337 0.252387 39.534 0.298828 39.0786C0.409031 37.9928 0.0640239 37.2252 0.0117188 36.4487C-0.00569559 36.1626 0.263862 35.6632 0.287109 35.272C0.501899 31.611 -0.30756 25.9061 2.10156 22.937C3.35544 21.3928 5.49198 20.5639 6.41211 18.6606C7.07965 17.274 6.84749 14.1501 6.82715 12.4976C6.78651 9.21908 6.3797 5.70962 6.66992 2.42529C6.76859 1.3044 7.33464 0.568744 8.41406 0.23877ZM13.0674 15.5571C11.262 15.4112 9.49096 15.3934 7.68848 15.4927C7.63914 16.7393 7.74418 18.3512 7.22754 19.481C5.99677 22.1666 2.77727 22.6571 2.04004 25.7954C1.76146 26.9806 1.79984 28.3001 1.60254 29.5874C1.52127 30.1158 1.4774 31.3453 1.46289 31.9321C1.23649 42.121 1.21865 48.4621 1.93848 58.6597C2.12424 61.3076 1.73 64.4574 4.79492 65.5669C7.41578 66.5157 9.92642 65.9235 12.2803 66.481C12.4021 66.5101 12.3156 66.7349 12.5908 66.7817C13.3273 66.8984 13.2619 66.4875 13.3457 66.4722C13.5837 66.4313 13.8427 66.6157 14.0488 66.5952C15.6045 66.4491 17.137 65.6572 18.1006 64.4194C19.3542 62.8109 19.3686 61.1351 19.2031 59.1763L19.4902 59.3257C19.4902 58.9578 19.6356 58.6251 19.1973 58.5229V58.231C20.0202 58.3038 19.2087 57.9574 19.1973 57.9155C19.0057 57.0339 19.5309 55.9008 19.4961 55.6089C19.4874 55.5301 19.2267 55.5447 19.2002 55.4312C18.9796 54.5057 19.6449 53.7054 19.4824 52.5435C19.3997 51.9419 19.3384 52.2047 19.2998 52.6353C19.2929 52.322 19.2816 52.0084 19.293 51.6968L19.5811 51.8452C19.6879 51.6711 19.5637 50.4874 19.5811 50.1753C19.9642 43.1746 19.6096 35.9807 19.0029 28.9976C18.7011 25.5092 19.1128 24.8262 16.4629 22.2104C15.7054 21.4631 14.9362 20.7067 14.1699 19.9155C14.045 19.7844 13.7782 19.8077 13.665 19.6968L13.6738 19.6938C12.9774 18.9962 13.3805 15.7773 13.0674 15.5571ZM19.2998 52.6353C19.3053 52.8825 19.3083 53.1295 19.293 53.3755C19.2357 54.2908 19.2424 53.2767 19.2998 52.6353ZM9.98145 30.7173C11.3224 30.6793 16.1325 30.454 17.0381 31.1255C17.1251 31.1897 17.2209 31.2344 17.2441 31.3569C17.2325 34.4689 17.0901 37.5663 17.1162 40.6812C17.1191 41.0986 17.2696 41.455 17.2725 41.8374C17.2811 42.6006 17.3876 46.8038 16.9873 47.104L16.9883 47.1069H16.9834C12.935 47.6235 8.81963 47.959 4.74219 47.5767C4.19679 47.2614 3.96432 46.6896 3.90625 46.0825C3.55214 42.4157 3.92993 36.2875 4.47852 32.6294C4.68166 31.2778 4.1155 30.957 6.01953 30.8228C6.28191 30.8046 6.52344 30.8265 6.75195 30.8589L8.29883 30.9292C8.85149 30.8574 9.4665 30.7303 9.97852 30.7173H9.98145Z" fill="currentColor"/>
              </svg>
              Wines
            </button>
            <button
              className={`portfolio-mobile-tab${activeTab === 'brands' ? ' active' : ''}`}
              onClick={() => setActiveTab('brands')}
            >
              <svg width="16" height="22" viewBox="0 0 35 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.1227 1.21047C18.6208 2.58836 19.2628 5.00377 20.2341 6.74397C22.2206 7.94619 25.4968 4.95437 26.4132 6.05228C27.7467 7.63877 25.4309 8.6763 24.0974 8.95078C22.9121 9.19781 21.7048 9.02763 20.514 9.07155C20.7939 11.0094 20.064 12.7166 19.6963 14.5611L22.6212 12.1347C26.5394 10.1256 31.1051 10.658 33.6459 14.4733C36.3293 18.4972 35.0507 24.8541 29.5741 24.9968C30.1722 27.555 29.6783 29.8277 27.2308 31.0354C28.1418 34.7134 26.0126 38.88 22.2426 39.7528C21.6499 39.8901 20.4042 39.632 20.0915 40.0712C20.075 42.4866 19.7512 44.2653 18.2805 46.2195C13.5612 52.4667 1.91099 47.3394 6.47668 39.3521C6.84984 38.6933 7.57969 38.3694 7.6236 37.6229C-0.437709 38.8415 -2.44069 29.5312 3.22802 25.1231C3.80422 24.6784 5.95536 24.0526 4.77552 23.597C3.71641 23.1853 2.55853 22.8888 1.8616 21.8403C0.401896 19.6555 1.83965 15.9061 3.5024 14.1439C5.85658 11.6462 12.8862 8.9398 14.6532 13.2052L17.7373 13.1503C19.0488 10.4769 17.8196 6.5189 16.1898 4.20778C15.4654 3.17574 12.3868 1.33124 13.7697 0.266263C14.7355 -0.48032 16.3599 0.507805 17.1227 1.21047ZM13.1057 13.7432C9.879 11.7285 3.52984 15.434 3.48594 19.0955C3.46398 20.8302 4.95113 21.5 6.52059 21.4231C6.78948 18.9528 8.56747 16.8503 10.3948 15.2803L13.1112 13.7487L13.1057 13.7432ZM28.7729 22.779C32.263 22.7296 33.5361 19.639 32.2849 16.6527C31.0338 13.6663 26.9949 13.0295 24.0809 13.7487L24.6297 14.1549C23.9383 14.8082 23.1865 15.8292 22.1658 15.3901L22.1328 16.5703C24.7889 18.0031 27.6314 19.8476 28.7729 22.779ZM17.6769 25.1725C19.5866 23.3774 21.1231 19.0351 18.736 17.0314C13.6764 12.788 5.63159 21.8019 9.7473 25.5513C11.7448 27.3683 15.7562 26.9786 17.6714 25.1725H17.6769ZM21.0847 24.6839C23.0383 25.5513 24.52 26.9786 25.9193 28.5321C26.4955 28.6858 26.9674 28.1369 27.165 27.6703C28.4436 24.64 24.8492 21.2529 22.5664 19.7872C21.9737 19.7049 22.2316 19.8531 22.1713 20.1989C21.8859 21.747 21.6335 23.2182 21.0847 24.6894V24.6839ZM12.2771 29.394C9.90644 28.9603 7.99675 27.5659 6.66326 25.5732C4.08957 26.3308 -0.0700385 31.3592 2.86583 33.4508C4.46822 34.5926 6.84984 35.202 8.79246 34.8067C9.90644 34.5816 10.5759 33.4178 11.6954 33.1818L12.2826 29.3885L12.2771 29.394ZM20.1408 26.4076C18.0555 28.9438 14.3624 28.0216 14.1868 31.9906C13.9837 36.5579 20.1408 39.3411 23.5048 36.3603C26.8687 33.3794 23.4444 27.9502 20.1408 26.4131V26.4076ZM8.54003 44.935C9.16013 45.5992 11.2454 46.6258 12.1509 46.6971C15.1252 46.9167 19.1092 42.7666 17.6385 39.8132C17.5397 39.6156 13.9947 37.6503 13.7752 37.6229C10.4881 37.1947 5.5822 41.751 8.54003 44.9405V44.935Z" fill="currentColor"/>
              </svg>
              Producers
            </button>
          </div>
          {/* Controls Bar - Above Grid */}
        <div className="portfolio-controls-bar">
                <div className="results-count">
                  Showing <span className="count-badge">
                    {activeTab === 'wines' ? sortedWines.length : sortedBrands.length}
                  </span>
                </div>
                <div className="controls-right">
                <div className="view-toggle-group">
                  <button
                    className={`view-toggle-btn${viewMode === 'grid' ? ' active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                  >
                    {viewMode === 'grid' ? (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <rect x="1" y="1" width="7" height="7" rx="1"/>
                        <rect x="10" y="1" width="7" height="7" rx="1"/>
                        <rect x="1" y="10" width="7" height="7" rx="1"/>
                        <rect x="10" y="10" width="7" height="7" rx="1"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="1" y="1" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="10" y="1" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="1" y="10" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="10" y="10" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    )}
                  </button>
                  <button
                    className={`view-toggle-btn${viewMode === 'table' ? ' active' : ''}`}
                    onClick={() => setViewMode('table')}
                    title="Table view"
                  >
                    {viewMode === 'table' ? (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <rect x="1" y="1.25" width="16" height="2.5" rx="1.25"/>
                        <rect x="1" y="5.25" width="16" height="2.5" rx="1.25"/>
                        <rect x="1" y="9.25" width="16" height="2.5" rx="1.25"/>
                        <rect x="1" y="13.25" width="16" height="2.5" rx="1.25"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <line x1="1" y1="3" x2="17" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="1" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="1" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="1" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                </div>
                <div ref={sortRef} style={{ position: 'relative' }}>
                  <button
                    className={`sort-button${sortOpen ? ' sort-open' : ''}`}
                    onClick={() => setSortOpen(o => !o)}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <line x1="1" y1="3" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="5" y1="11" x2="9" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Sort
                  </button>
                  {sortOpen && (
                    <div className="sort-dropdown">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          className={`sort-option${sortBy === opt.value ? ' active' : ''}`}
                          onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="filter-sheet-btn" onClick={() => setFilterSheetOpen(true)}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="6" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Filters
                  {(selectedTypes.length + selectedCountries.length + selectedRegions.length) > 0 && (
                    <span className="filter-sheet-btn-badge">
                      {selectedTypes.length + selectedCountries.length + selectedRegions.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

          <div className="portfolio-layout">
            {/* Sidebar Filters */}
            <aside className="portfolio-sidebar">
              {/* Wines / Producers tabs */}
              <div className="portfolio-sidebar-tabs">
                <button
                  className={`portfolio-sidebar-tab${activeTab === 'wines' ? ' active' : ''}`}
                  onClick={() => setActiveTab('wines')}
                >
                  <svg width="9" height="28" viewBox="0 0 21 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.41406 0.23877C9.57799 -0.114485 12.8209 -0.173047 13.7207 0.746582C14.2719 1.3108 14.1559 4.79025 14.2256 5.78564C14.3504 7.6219 14.6235 9.49041 14.667 11.3267C14.7134 13.3557 14.1122 17.8339 15.2383 19.3638C15.5866 19.8367 16.3274 20.1758 16.7686 20.5991C17.4335 21.2359 19.2753 23.0887 19.7139 23.7661C21.4844 26.4841 20.9159 38.504 20.9043 42.2876C20.884 49.5978 21.0142 52.5232 20.6543 59.8335C20.4888 63.1645 20.135 66.8897 16.1934 67.6079C12.7801 68.2297 5.95348 68.3262 3.04785 66.3062C1.19905 65.0188 0.978285 64.0199 0.644531 61.8599C0.351375 59.971 0.37763 57.5416 0.345703 55.6089C0.287654 52.0327 0.258641 53.0221 0.139648 49.5894C0.0264487 46.378 0.478705 43.1015 0.290039 39.8726L0.287109 39.8696L0 40.019C0.0957844 39.6337 0.252387 39.534 0.298828 39.0786C0.409031 37.9928 0.0640239 37.2252 0.0117188 36.4487C-0.00569559 36.1626 0.263862 35.6632 0.287109 35.272C0.501899 31.611 -0.30756 25.9061 2.10156 22.937C3.35544 21.3928 5.49198 20.5639 6.41211 18.6606C7.07965 17.274 6.84749 14.1501 6.82715 12.4976C6.78651 9.21908 6.3797 5.70962 6.66992 2.42529C6.76859 1.3044 7.33464 0.568744 8.41406 0.23877ZM13.0674 15.5571C11.262 15.4112 9.49096 15.3934 7.68848 15.4927C7.63914 16.7393 7.74418 18.3512 7.22754 19.481C5.99677 22.1666 2.77727 22.6571 2.04004 25.7954C1.76146 26.9806 1.79984 28.3001 1.60254 29.5874C1.52127 30.1158 1.4774 31.3453 1.46289 31.9321C1.23649 42.121 1.21865 48.4621 1.93848 58.6597C2.12424 61.3076 1.73 64.4574 4.79492 65.5669C7.41578 66.5157 9.92642 65.9235 12.2803 66.481C12.4021 66.5101 12.3156 66.7349 12.5908 66.7817C13.3273 66.8984 13.2619 66.4875 13.3457 66.4722C13.5837 66.4313 13.8427 66.6157 14.0488 66.5952C15.6045 66.4491 17.137 65.6572 18.1006 64.4194C19.3542 62.8109 19.3686 61.1351 19.2031 59.1763L19.4902 59.3257C19.4902 58.9578 19.6356 58.6251 19.1973 58.5229V58.231C20.0202 58.3038 19.2087 57.9574 19.1973 57.9155C19.0057 57.0339 19.5309 55.9008 19.4961 55.6089C19.4874 55.5301 19.2267 55.5447 19.2002 55.4312C18.9796 54.5057 19.6449 53.7054 19.4824 52.5435C19.3997 51.9419 19.3384 52.2047 19.2998 52.6353C19.2929 52.322 19.2816 52.0084 19.293 51.6968L19.5811 51.8452C19.6879 51.6711 19.5637 50.4874 19.5811 50.1753C19.9642 43.1746 19.6096 35.9807 19.0029 28.9976C18.7011 25.5092 19.1128 24.8262 16.4629 22.2104C15.7054 21.4631 14.9362 20.7067 14.1699 19.9155C14.045 19.7844 13.7782 19.8077 13.665 19.6968L13.6738 19.6938C12.9774 18.9962 13.3805 15.7773 13.0674 15.5571ZM19.2998 52.6353C19.3053 52.8825 19.3083 53.1295 19.293 53.3755C19.2357 54.2908 19.2424 53.2767 19.2998 52.6353ZM9.98145 30.7173C11.3224 30.6793 16.1325 30.454 17.0381 31.1255C17.1251 31.1897 17.2209 31.2344 17.2441 31.3569C17.2325 34.4689 17.0901 37.5663 17.1162 40.6812C17.1191 41.0986 17.2696 41.455 17.2725 41.8374C17.2811 42.6006 17.3876 46.8038 16.9873 47.104L16.9883 47.1069H16.9834C12.935 47.6235 8.81963 47.959 4.74219 47.5767C4.19679 47.2614 3.96432 46.6896 3.90625 46.0825C3.55214 42.4157 3.92993 36.2875 4.47852 32.6294C4.68166 31.2778 4.1155 30.957 6.01953 30.8228C6.28191 30.8046 6.52344 30.8265 6.75195 30.8589L8.29883 30.9292C8.85149 30.8574 9.4665 30.7303 9.97852 30.7173H9.98145Z" fill="currentColor"/>
                  </svg>
                  Wines
                </button>
                <button
                  className={`portfolio-sidebar-tab${activeTab === 'brands' ? ' active' : ''}`}
                  onClick={() => setActiveTab('brands')}
                >
                  <svg width="20" height="28" viewBox="0 0 35 49" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.1227 1.21047C18.6208 2.58836 19.2628 5.00377 20.2341 6.74397C22.2206 7.94619 25.4968 4.95437 26.4132 6.05228C27.7467 7.63877 25.4309 8.6763 24.0974 8.95078C22.9121 9.19781 21.7048 9.02763 20.514 9.07155C20.7939 11.0094 20.064 12.7166 19.6963 14.5611L22.6212 12.1347C26.5394 10.1256 31.1051 10.658 33.6459 14.4733C36.3293 18.4972 35.0507 24.8541 29.5741 24.9968C30.1722 27.555 29.6783 29.8277 27.2308 31.0354C28.1418 34.7134 26.0126 38.88 22.2426 39.7528C21.6499 39.8901 20.4042 39.632 20.0915 40.0712C20.075 42.4866 19.7512 44.2653 18.2805 46.2195C13.5612 52.4667 1.91099 47.3394 6.47668 39.3521C6.84984 38.6933 7.57969 38.3694 7.6236 37.6229C-0.437709 38.8415 -2.44069 29.5312 3.22802 25.1231C3.80422 24.6784 5.95536 24.0526 4.77552 23.597C3.71641 23.1853 2.55853 22.8888 1.8616 21.8403C0.401896 19.6555 1.83965 15.9061 3.5024 14.1439C5.85658 11.6462 12.8862 8.9398 14.6532 13.2052L17.7373 13.1503C19.0488 10.4769 17.8196 6.5189 16.1898 4.20778C15.4654 3.17574 12.3868 1.33124 13.7697 0.266263C14.7355 -0.48032 16.3599 0.507805 17.1227 1.21047ZM13.1057 13.7432C9.879 11.7285 3.52984 15.434 3.48594 19.0955C3.46398 20.8302 4.95113 21.5 6.52059 21.4231C6.78948 18.9528 8.56747 16.8503 10.3948 15.2803L13.1112 13.7487L13.1057 13.7432ZM28.7729 22.779C32.263 22.7296 33.5361 19.639 32.2849 16.6527C31.0338 13.6663 26.9949 13.0295 24.0809 13.7487L24.6297 14.1549C23.9383 14.8082 23.1865 15.8292 22.1658 15.3901L22.1328 16.5703C24.7889 18.0031 27.6314 19.8476 28.7729 22.779ZM17.6769 25.1725C19.5866 23.3774 21.1231 19.0351 18.736 17.0314C13.6764 12.788 5.63159 21.8019 9.7473 25.5513C11.7448 27.3683 15.7562 26.9786 17.6714 25.1725H17.6769ZM21.0847 24.6839C23.0383 25.5513 24.52 26.9786 25.9193 28.5321C26.4955 28.6858 26.9674 28.1369 27.165 27.6703C28.4436 24.64 24.8492 21.2529 22.5664 19.7872C21.9737 19.7049 22.2316 19.8531 22.1713 20.1989C21.8859 21.747 21.6335 23.2182 21.0847 24.6894V24.6839ZM12.2771 29.394C9.90644 28.9603 7.99675 27.5659 6.66326 25.5732C4.08957 26.3308 -0.0700385 31.3592 2.86583 33.4508C4.46822 34.5926 6.84984 35.202 8.79246 34.8067C9.90644 34.5816 10.5759 33.4178 11.6954 33.1818L12.2826 29.3885L12.2771 29.394ZM20.1408 26.4076C18.0555 28.9438 14.3624 28.0216 14.1868 31.9906C13.9837 36.5579 20.1408 39.3411 23.5048 36.3603C26.8687 33.3794 23.4444 27.9502 20.1408 26.4131V26.4076ZM8.54003 44.935C9.16013 45.5992 11.2454 46.6258 12.1509 46.6971C15.1252 46.9167 19.1092 42.7666 17.6385 39.8132C17.5397 39.6156 13.9947 37.6503 13.7752 37.6229C10.4881 37.1947 5.5822 41.751 8.54003 44.9405V44.935Z" fill="currentColor"/>
                  </svg>
                  Producers
                </button>
              </div>

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
                <h4 className="filter-header" onClick={() => toggleSection('country')}>
                  <span>Country</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={expandedSections.country ? 'chevron expanded' : 'chevron'}
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </h4>
                {expandedSections.country && (
                <div className="filter-checkboxes">
                  {countries.map((country) => (
                    <label key={country} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(country)}
                        onChange={() => toggleCountry(country)}
                      />
                      <span className="checkbox-text">{country}</span>
                    </label>
                  ))}
                </div>
                )}
              </div>

              <div className="filter-group">
                <h4 className="filter-header" onClick={() => toggleSection('region')}>
                  <span>Appellation</span>
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
                    sortedWines.length === 0 ? (
                      <div className="empty-state"><p>No wines found</p></div>
                    ) : (
                      <div className="wines-portfolio-grid">
                        {sortedWines.map((wine) => (
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
                    sortedBrands.length === 0 ? (
                      <div className="empty-state"><p>No brands found</p></div>
                    ) : (
                      <div className="wines-portfolio-grid">
                        {sortedBrands.map((brand) => (
                          <Link key={brand._id} to={`/wineries/${brand._id}`} className="wine-portfolio-card trade-wine-card brand-card">
                            <div
                              className="brand-card-bg"
                              style={{
                                backgroundImage: brand.featuredImage?.url ? `url(${brand.featuredImage.url})` : 'none'
                              }}
                            />
                            <div className="trade-wine-card-overlay"></div>
                            <div className="trade-wine-producer">
                              {brand.region || brand.country || '—'}
                            </div>
                            <h3 className="trade-wine-name">{brand.name}</h3>
                            <div className="trade-wine-image">
                              {brand.logo?.url ? (
                                <img src={brand.logo.url} alt={brand.name} className="trade-wine-card-logo" />
                              ) : (
                                <div className="trade-wine-placeholder">
                                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                                    <circle cx="60" cy="60" r="50" stroke="white" strokeWidth="2" fill="none"/>
                                    <text x="60" y="70" textAnchor="middle" fill="white" fontSize="40" fontFamily="moret">W</text>
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
                    sortedWines.length === 0 ? (
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
                            {sortedWines.map((wine) => (
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
                    sortedBrands.length === 0 ? (
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
                            {sortedBrands.map((brand) => (
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

      {/* Mobile Filter Sheet */}
      {filterSheetOpen && (
        <div className="filter-sheet-overlay" onClick={() => setFilterSheetOpen(false)} />
      )}
      <div className={`filter-sheet${filterSheetOpen ? ' open' : ''}`}>
        <div className="filter-sheet-handle" />
        <div className="filter-sheet-header">
          <span className="filter-sheet-title">Filters</span>
          <button className="filter-sheet-clear" onClick={() => { setSelectedTypes([]); setSelectedCountries([]); setSelectedRegions([]); }}>
            Clear all
          </button>
        </div>
        <div className="filter-sheet-body">
          <div className="filter-group">
            <h4 className="filter-header" onClick={() => toggleSection('type')}>
              <span>Type</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={expandedSections.type ? 'chevron expanded' : 'chevron'}>
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </h4>
            {expandedSections.type && (
              <div className="filter-pills">
                {['red','white','sparkling','rosé','dessert'].map(t => (
                  <button key={t} className={selectedTypes.includes(t) ? 'pill active' : 'pill'} onClick={() => toggleType(t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="filter-group">
            <h4 className="filter-header" onClick={() => toggleSection('country')}>
              <span>Country</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={expandedSections.country ? 'chevron expanded' : 'chevron'}>
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </h4>
            {expandedSections.country && (
              <div className="filter-checkboxes">
                {countries.map(country => (
                  <label key={country} className="checkbox-label">
                    <input type="checkbox" checked={selectedCountries.includes(country)} onChange={() => toggleCountry(country)} />
                    <span className="checkbox-text">{country}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="filter-group">
            <h4 className="filter-header" onClick={() => toggleSection('region')}>
              <span>Region</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={expandedSections.region ? 'chevron expanded' : 'chevron'}>
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </h4>
            {expandedSections.region && (
              <div className="filter-checkboxes">
                {regions.map(region => (
                  <label key={region} className="checkbox-label">
                    <input type="checkbox" checked={selectedRegions.includes(region)} onChange={() => toggleRegion(region)} />
                    <span className="checkbox-text">{region}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="filter-sheet-footer">
          <button className="filter-sheet-done" onClick={() => setFilterSheetOpen(false)}>
            Show {activeTab === 'wines' ? wines.length : brands.length} results
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wineries;
