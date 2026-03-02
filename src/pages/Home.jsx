import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { wineriesAPI, winesAPI } from '../utils/api';
import CircularGallery from '../components/CircularGallery';
import Intro from './Intro';
import './Home.css';

const BOTTLE_PLACEHOLDER_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='400' viewBox='0 0 100 250'><rect width='100' height='250' fill='%23f5efe8'/><path d='M50 10 L35 60 L25 240 L75 240 L65 60 Z' fill='%23722f37'/><ellipse cx='50' cy='50' rx='15' ry='8' fill='%23722f37' opacity='0.3'/></svg>`;

const WINE_TYPES = ['Red', 'White', 'Sparkling', 'Rosé', 'Dessert', 'Fortified'];
const COUNTRIES = ['Italy', 'France', 'Spain', 'Portugal', 'Argentina', 'USA'];
const SCORES = ['88', '89', '90', '91', '92', '93', '94', '95'];

// Wine glass icon
const WineGlassIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 22h8M12 11v11M5 2h14l-2 9a5 5 0 01-10 0L5 2z"/>
  </svg>
);

// Globe icon
const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);

// Chevron down icon
const ChevronIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const NlSelect = ({ value, options, onChange, label }) => (
  <div className="nl-select-wrap">
    <select
      className="nl-select"
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label={label}
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    <span className="nl-select-display">
      {value} <ChevronIcon />
    </span>
  </div>
);

const Home = () => {
  const [wineType, setWineType] = useState('Red');
  const [country, setCountry] = useState('Italy');
  const [minScore, setMinScore] = useState('93');
  const [centerItem, setCenterItem] = useState(null);

  const filterKey = `${wineType}-${country}-${minScore}`;

  const { data: filteredWinesData } = useQuery(
    ['filtered-wines', wineType, country, minScore],
    () => winesAPI.getAll({
      limit: 12,
      status: 'published',
      type: wineType.toLowerCase(),
      country,
      sort: '-score',
    })
  );

  const { data: redWinesData } = useQuery('red-wines-count', () =>
    winesAPI.getAll({ type: 'red', status: 'published', limit: 1 })
  );

  const { data: whiteWinesData } = useQuery('white-wines-count', () =>
    winesAPI.getAll({ type: 'white', status: 'published', limit: 1 })
  );

  const { data: sparklingWinesData } = useQuery('sparkling-wines-count', () =>
    winesAPI.getAll({ type: 'sparkling', status: 'published', limit: 1 })
  );

  const allFilteredWines = filteredWinesData?.data?.data || [];
  const redCount = redWinesData?.data?.total || 0;
  const whiteCount = whiteWinesData?.data?.total || 0;
  const sparklingCount = sparklingWinesData?.data?.total || 0;

  // Client-side score filter
  const filteredWines = useMemo(() =>
    allFilteredWines.filter(w => {
      const score = w.score ?? (w.awards?.[0]?.score ?? 0);
      return Number(score) >= Number(minScore);
    }),
    [allFilteredWines, minScore]
  );

  const toGalleryItems = (wines) =>
    wines.map((wine) => ({
      image: wine.bottleImage?.url || BOTTLE_PLACEHOLDER_SVG,
      text: wine.name,
      winery: wine.winery?.name || wine.wineryName || '',
    }));

  const handleCenterChange = useCallback((item) => {
    setCenterItem(item);
  }, []);

  const galleryItems = useMemo(() => toGalleryItems(filteredWines), [filteredWines]);

  return (
    <div className="home">
      <Intro />
      {/* Wine Carousel Section */}
      <section className="wine-carousel-section">
        <div className="container-narrow">
          <div className="nl-form">
            <span className="nl-text">I'm looking for a</span>
            <WineGlassIcon />
            <NlSelect value={wineType} options={WINE_TYPES} onChange={v => { setWineType(v); setCenterItem(null); }} label="Wine type" />
            <span className="nl-text">from</span>
            <GlobeIcon />
            <NlSelect value={country} options={COUNTRIES} onChange={v => { setCountry(v); setCenterItem(null); }} label="Country" />
            <span className="nl-text">with a</span>
            <NlSelect value={minScore} options={SCORES} onChange={v => { setMinScore(v); setCenterItem(null); }} label="Minimum score" />
            <span className="nl-text">score</span>
          </div>
        </div>

        <div className="gallery-wrapper">
          {galleryItems.length > 0 ? (
            <CircularGallery
              key={filterKey}
              items={galleryItems}
              bend={3}
              borderRadius={0.05}
              scrollSpeed={2}
              scrollEase={0.05}
              onCenterChange={handleCenterChange}
            />
          ) : (
            <div className="gallery-empty">No wines match your selection</div>
          )}
        </div>
        <div className="gallery-center-label">
          {centerItem?.winery && (
            <span className="gallery-label-winery">{centerItem.winery}</span>
          )}
          {centerItem?.text && (
            <span className="gallery-label-wine">{centerItem.text}</span>
          )}
        </div>
      </section>

      {/* Explore By Type */}
      <section className="explore-type-section">
        <div className="container-narrow">
          <h2>Explore By Type</h2>

          <Link to="/wines?type=white" className="type-link">
            <span className="type-name">White</span>
            <span className="type-count">{whiteCount}</span>
            <span className="type-arrow">→</span>
          </Link>

          <Link to="/wines?type=red" className="type-link">
            <span className="type-name">Red</span>
            <span className="type-count">{redCount}</span>
            <span className="type-arrow">→</span>
          </Link>

          <Link to="/wines?type=sparkling" className="type-link">
            <span className="type-name">Sparkling</span>
            <span className="type-count">{sparklingCount}</span>
            <span className="type-arrow">→</span>
          </Link>

          <Link to="/wines" className="type-link">
            <span className="type-name">Blends</span>
            <span className="type-count">12</span>
            <span className="type-arrow">→</span>
          </Link>
        </div>
      </section>

      {/* Italy Delivered Section */}
      <section className="region-section">
        <div className="container-narrow">
          <h2>Italy Delivered</h2>
          <p className="region-description">
            Amet tristique nullam placerat arcu posuire facilisi tincidunt at
            rhoncus. Facilisis nunc eget neque malesuada in lorem sed diam in.
          </p>
          <Link to="/wineries" className="btn-view-portfolio">
            View Our Portfolio
          </Link>

          <div className="italy-map">
            <svg width="100%" height="600" viewBox="0 0 400 600" fill="none">
              <g opacity="0.3">
                <path d="M200 50 L250 100 L240 200 L220 350 L200 450 L180 500 L160 550 L140 580 L120 590" stroke="#d4a574" strokeWidth="2" fill="#e8ddd0"/>
                <circle cx="200" cy="150" r="20" fill="#722f37"/>
                <text x="210" y="155" fill="#722f37" fontSize="12" fontWeight="600">Veneto</text>
              </g>
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
