import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { wineriesAPI, winesAPI } from '../utils/api';
import './WineryDetail.css';

const WineryDetail = () => {
  const { id } = useParams();

  const { data: wineryData, isLoading } = useQuery(
    ['winery', id],
    () => wineriesAPI.getOne(id)
  );

  const { data: winesData } = useQuery(
    ['winery-wines', id],
    () => winesAPI.getByWinery(id),
    { enabled: !!id }
  );

  const winery = wineryData?.data?.data;
  const wines = winesData?.data?.data || [];

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

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!winery) {
    return (
      <div className="container">
        <div className="empty-state">
          <p>Winery not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="winery-detail">
      <section className="winery-hero">
        <div className="container">
          <div className="winery-hero-content">
            {winery.logo?.url && (
              <div className="winery-logo">
                <img src={winery.logo.url} alt={winery.name} />
              </div>
            )}
            <div className="winery-info">
              <h1>{winery.name}</h1>
              <p className="winery-region">{winery.region}</p>
              {winery.website && (
                <a
                  href={winery.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container-narrow">
        <section className="winery-about">
          <h2>About</h2>
          <p>{winery.description}</p>
        </section>

        {wines.length > 0 && (
          <section className="winery-wines">
            <h2>Our Wines</h2>
            <div className="wines-grid">
              {wines.map((wine) => (
                <Link
                  key={wine._id}
                  to={`/wines/${wine._id}`}
                  className="wine-card card"
                >
                  <div className="wine-card-image">
                    {wine.bottleImage?.url ? (
                      <img src={wine.bottleImage.url} alt={wine.name} />
                    ) : (
                      <div className="wine-card-placeholder">
                        <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                          <path d="M50 10 L35 40 L20 90 L80 90 L65 40 Z" fill={getWineTypeColor(wine.type)}/>
                          <ellipse cx="50" cy="35" rx="15" ry="8" fill={getWineTypeColor(wine.type)} opacity="0.3"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="wine-card-content">
                    <h4>{wine.name}</h4>
                    <div className="wine-meta">
                      <span
                        className="wine-type-badge"
                        style={{
                          backgroundColor: `${getWineTypeColor(wine.type)}20`,
                          color: getWineTypeColor(wine.type),
                          border: `1px solid ${getWineTypeColor(wine.type)}40`
                        }}
                      >
                        {wine.type}
                      </span>
                      <span className="wine-region">{wine.region}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default WineryDetail;
