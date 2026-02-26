import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { wineriesAPI, winesAPI } from '../utils/api';
import CircularGallery from '../components/CircularGallery';
import './Home.css';

const BOTTLE_PLACEHOLDER_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='400' viewBox='0 0 100 250'><rect width='100' height='250' fill='%23f5efe8'/><path d='M50 10 L35 60 L25 240 L75 240 L65 60 Z' fill='%23722f37'/><ellipse cx='50' cy='50' rx='15' ry='8' fill='%23722f37' opacity='0.3'/></svg>`;

const Home = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [centerItem, setCenterItem] = useState(null);

  const { data: newWinesData } = useQuery('new-wines', () =>
    winesAPI.getAll({ limit: 8, status: 'published', sort: '-createdAt' })
  );

  const { data: staplesData } = useQuery('staples-wines', () =>
    winesAPI.getAll({ limit: 8, status: 'published', sort: 'name' })
  );

  const { data: bestData } = useQuery('best-wines', () =>
    winesAPI.getAll({ limit: 8, status: 'published', sort: '-score' })
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

  const newWines = newWinesData?.data?.data || [];
  const staplesWines = staplesData?.data?.data || [];
  const bestWines = bestData?.data?.data || [];
  const redCount = redWinesData?.data?.total || 0;
  const whiteCount = whiteWinesData?.data?.total || 0;
  const sparklingCount = sparklingWinesData?.data?.total || 0;

  const toGalleryItems = (wines) =>
    wines.map((wine) => ({
      image: wine.bottleImage?.url || BOTTLE_PLACEHOLDER_SVG,
      text: wine.name,
      winery: wine.winery?.name || wine.wineryName || '',
    }));

  const handleCenterChange = useCallback((item) => {
    setCenterItem(item);
  }, []);

  const activeWines =
    activeTab === 'new' ? newWines :
    activeTab === 'staples' ? staplesWines :
    bestWines;

  const galleryItems = useMemo(() => toGalleryItems(activeWines), [activeWines]);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-split">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-image">
              <div className="hero-image-placeholder">
                <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" preserveAspectRatio="xMidYMid slice">
                  <rect width="400" height="400" fill="#d4c5b0"/>
                  <circle cx="200" cy="200" r="100" fill="#a89680" opacity="0.3"/>
                </svg>
              </div>
            </div>
            <div className="hero-content-box">
              <h1>Explore a world of wine.</h1>
              <p>
                Dictum imperdiet ut vivamus eros ante nunc. Proin
                condimentum nibh turpis neque eget amet elementum. Ut
                posuere nisl nam risus aliquet quis sed tellus urna,
                sed malesuada et. Dictique ipsum, laber est lectus
                scelerisque risus ut morbi pretium.
              </p>
              <Link to="/wineries" className="btn-explore">
                Explore Our Portfolio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Wine Carousel Section */}
      <section className="wine-carousel-section">
        <div className="container-narrow">
          <div className="carousel-tabs">
            <button
              className={`tab${activeTab === 'staples' ? ' active' : ' inactive'}`}
                onClick={() => { setActiveTab('staples'); setCenterItem(null); }}
            >
              Staples
            </button>
            <button
              className={`tab${activeTab === 'new' ? ' active' : ' inactive'}`}
                onClick={() => { setActiveTab('new'); setCenterItem(null); }}
            >
              New Arrivals
            </button>
            <button
              className={`tab${activeTab === 'best' ? ' active' : ' inactive'}`}
                onClick={() => { setActiveTab('best'); setCenterItem(null); }}
            >
              Best Sellers
            </button>
          </div>
        </div>

          <div className="gallery-wrapper">
            {galleryItems.length > 0 && (
                  <CircularGallery
                    key={activeTab}
                    items={galleryItems}
                    bend={3}
                    borderRadius={0.05}
                    scrollSpeed={2}
                    scrollEase={0.05}
                    onCenterChange={handleCenterChange}
                  />
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
