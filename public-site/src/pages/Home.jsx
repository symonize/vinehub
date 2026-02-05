import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { wineriesAPI, winesAPI } from '../utils/api';
import './Home.css';

const Home = () => {
  const [activeTab, setActiveTab] = useState('new');

  const { data: newWinesData } = useQuery('new-wines', () =>
    winesAPI.getAll({ limit: 5, status: 'published', sort: '-createdAt' })
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
  const redCount = redWinesData?.data?.total || 0;
  const whiteCount = whiteWinesData?.data?.total || 0;
  const sparklingCount = sparklingWinesData?.data?.total || 0;

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-split">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-image">
              <div className="hero-image-placeholder">
                {/* Placeholder for hero image */}
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
              className={activeTab === 'staples' ? 'tab' : 'tab inactive'}
              onClick={() => setActiveTab('staples')}
            >
              Staples
            </button>
            <button
              className={activeTab === 'new' ? 'tab active' : 'tab inactive'}
              onClick={() => setActiveTab('new')}
            >
              New Arrivals
            </button>
            <button
              className={activeTab === 'best' ? 'tab' : 'tab inactive'}
              onClick={() => setActiveTab('best')}
            >
              Best Sellers
            </button>
          </div>

          <div className="wine-carousel">
            {newWines.map((wine) => (
              <Link
                key={wine._id}
                to={`/wines/${wine._id}`}
                className="carousel-wine-card"
              >
                <div className="carousel-wine-image">
                  {wine.bottleImage?.url ? (
                    <img src={wine.bottleImage.url} alt={wine.name} />
                  ) : (
                    <div className="wine-bottle-placeholder">
                      <svg width="80" height="200" viewBox="0 0 100 250" fill="none">
                        <path d="M50 10 L35 60 L25 240 L75 240 L65 60 Z" fill="#722f37"/>
                        <ellipse cx="50" cy="50" rx="15" ry="8" fill="#722f37" opacity="0.3"/>
                      </svg>
                    </div>
                  )}
                </div>
                {wine.winery?.name && (
                  <div className="carousel-wine-info">
                    <p className="wine-producer">{wine.winery.name}</p>
                    <h4 className="wine-name">{wine.name}</h4>
                  </div>
                )}
              </Link>
            ))}
          </div>

          <div className="carousel-nav">
            <button className="carousel-arrow">←</button>
            <button className="carousel-arrow">→</button>
          </div>
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
