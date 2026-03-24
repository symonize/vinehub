import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { wineriesAPI, winesAPI } from '../utils/api';
import OptimizedImage from '../components/OptimizedImage';
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

  const heroImage = winery.featuredImage?.url || winery.featuredImage?.path;

  return (
    <div className="winery-detail">
      <Helmet>
        <title>{winery.name} | VineHub</title>
        <meta name="description" content={`${winery.name}${winery.region ? ` — ${winery.region}` : ''}. ${winery.description?.slice(0, 150) || ''}`} />
        {heroImage && <meta property="og:image" content={heroImage} />}
      </Helmet>

      {/* Hero */}
      <section className={`winery-detail-hero ${!heroImage ? 'winery-detail-hero--no-image' : ''}`}>
        {heroImage && (
          <>
            <OptimizedImage
              src={heroImage}
              alt={winery.name}
              width={1512}
              className="winery-detail-hero-img"
            />
            <div className="winery-detail-hero-overlay" />
          </>
        )}

        <div className="winery-detail-hero-content">
          <h1 className="winery-detail-hero-name">{winery.name}</h1>
          {winery.description && (
            <p className="winery-detail-hero-desc">{winery.description}</p>
          )}

          {(winery.country || winery.region) && (
            <div className="winery-detail-hero-meta">
              {winery.country && (
                <div className="winery-detail-meta-item">
                  <span className="winery-detail-meta-label">Country</span>
                  <span className="winery-detail-meta-value">{winery.country}</span>
                </div>
              )}
              {winery.country && winery.region && (
                <div className="winery-detail-meta-divider" />
              )}
              {winery.region && (
                <div className="winery-detail-meta-item">
                  <span className="winery-detail-meta-label">Appellation</span>
                  <span className="winery-detail-meta-value">{winery.region}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Wines Grid */}
      {wines.length > 0 && (
        <section className="winery-wines-section">
          <h2 className="winery-wines-title">{winery.name} Wines</h2>

          <div className="winery-wines-grid">
            {wines.map((wine) => (
              <Link
                key={wine._id}
                to={`/wines/${wine._id}`}
                className="winery-wine-card"
              >
                <div className="winery-wine-card-info">
                  <p className="winery-wine-card-brand">{winery.name}</p>
                  <p className="winery-wine-card-name">{wine.name}</p>
                </div>
                <div className="winery-wine-card-image">
                  {wine.bottleImage?.url ? (
                    <OptimizedImage src={wine.bottleImage.url} alt={wine.name} width={200} />
                  ) : (
                    <div className="winery-wine-card-placeholder">
                      <svg width="60" height="200" viewBox="0 0 60 200" fill="none">
                        <path d="M30 10 L20 50 L12 180 L48 180 L40 50 Z" fill="var(--primary)" opacity="0.15"/>
                        <ellipse cx="30" cy="45" rx="10" ry="6" fill="var(--primary)" opacity="0.1"/>
                      </svg>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default WineryDetail;
