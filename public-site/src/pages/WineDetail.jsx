import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { winesAPI, vintagesAPI } from '../utils/api';
import './WineDetail.css';

const WineDetail = () => {
  const { id } = useParams();

  const { data: wineData, isLoading } = useQuery(
    ['wine', id],
    () => winesAPI.getOne(id)
  );

  const { data: vintagesData } = useQuery(
    ['wine-vintages', id],
    () => vintagesAPI.getByWine(id),
    { enabled: !!id }
  );

  const wine = wineData?.data?.data;
  const vintages = vintagesData?.data?.data || [];

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

  if (!wine) {
    return (
      <div className="container">
        <div className="empty-state">
          <p>Wine not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wine-detail">
      <div className="container-narrow">
        <div className="wine-detail-grid">
          {/* Left Column - Image */}
          <div className="wine-image-section">
            <div className="wine-image-container">
              {wine.bottleImage?.url ? (
                <img src={wine.bottleImage.url} alt={wine.name} />
              ) : (
                <div className="wine-placeholder">
                  <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
                    <path d="M50 10 L35 40 L20 90 L80 90 L65 40 Z" fill={getWineTypeColor(wine.type)}/>
                    <ellipse cx="50" cy="35" rx="15" ry="8" fill={getWineTypeColor(wine.type)} opacity="0.3"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="wine-info-section">
            <div className="wine-header">
              {wine.winery?.name && (
                <Link to={`/wineries/${wine.winery._id}`} className="winery-link">
                  {wine.winery.name}
                </Link>
              )}
              <h1>{wine.name}</h1>
              <div className="wine-meta-tags">
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
                <span className="wine-region-badge">{wine.region}</span>
              </div>
            </div>

            <div className="wine-details">
              <div className="detail-section">
                <h3>Variety</h3>
                <p>{wine.variety}</p>
              </div>

              <div className="detail-section">
                <h3>Description</h3>
                <p>{wine.description}</p>
              </div>

              {wine.foodPairing && (
                <div className="detail-section">
                  <h3>Food Pairings</h3>
                  <p>{wine.foodPairing}</p>
                </div>
              )}

              {wine.awards && wine.awards.length > 0 && (
                <div className="detail-section">
                  <h3>Awards & Recognition</h3>
                  <div className="awards-list">
                    {wine.awards.map((award, index) => (
                      <div key={index} className="award-item">
                        <span className="award-score">{award.score} pts</span>
                        <span className="award-name">{award.awardName}</span>
                        <span className="award-year">{award.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {vintages.length > 0 && (
                <div className="detail-section">
                  <h3>Available Vintages</h3>
                  <div className="vintages-list">
                    {vintages.map((vintage) => (
                      <div key={vintage._id} className="vintage-item">
                        <span className="vintage-year">{vintage.year}</span>
                        {vintage.productionNotes && (
                          <p className="vintage-notes">{vintage.productionNotes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WineDetail;
