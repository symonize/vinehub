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

              {wine.nutrition && (
                <div className="detail-section">
                  <h3>Nutrition Information</h3>
                  <div className="nutrition-grid">
                    {wine.nutrition.servingSize && (
                      <div className="nutrition-item">
                        <span className="nutrition-label">Serving Size</span>
                        <span className="nutrition-value">{wine.nutrition.servingSize}</span>
                      </div>
                    )}
                    {wine.nutrition.calories !== undefined && wine.nutrition.calories !== null && (
                      <div className="nutrition-item">
                        <span className="nutrition-label">Calories</span>
                        <span className="nutrition-value">{wine.nutrition.calories}</span>
                      </div>
                    )}
                    {wine.nutrition.carbohydrates !== undefined && wine.nutrition.carbohydrates !== null && (
                      <div className="nutrition-item">
                        <span className="nutrition-label">Carbohydrates</span>
                        <span className="nutrition-value">{wine.nutrition.carbohydrates}g</span>
                      </div>
                    )}
                    {wine.nutrition.sugars !== undefined && wine.nutrition.sugars !== null && (
                      <div className="nutrition-item">
                        <span className="nutrition-label">Sugars</span>
                        <span className="nutrition-value">{wine.nutrition.sugars}g</span>
                      </div>
                    )}
                    {wine.nutrition.protein !== undefined && wine.nutrition.protein !== null && (
                      <div className="nutrition-item">
                        <span className="nutrition-label">Protein</span>
                        <span className="nutrition-value">{wine.nutrition.protein}g</span>
                      </div>
                    )}
                    {wine.nutrition.fat !== undefined && wine.nutrition.fat !== null && (
                      <div className="nutrition-item">
                        <span className="nutrition-label">Fat</span>
                        <span className="nutrition-value">{wine.nutrition.fat}g</span>
                      </div>
                    )}
                    {wine.nutrition.alcohol !== undefined && wine.nutrition.alcohol !== null && (
                      <div className="nutrition-item">
                        <span className="nutrition-label">Alcohol</span>
                        <span className="nutrition-value">{wine.nutrition.alcohol}%</span>
                      </div>
                    )}
                    {wine.nutrition.sodium !== undefined && wine.nutrition.sodium !== null && (
                      <div className="nutrition-item">
                        <span className="nutrition-label">Sodium</span>
                        <span className="nutrition-value">{wine.nutrition.sodium}mg</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {wine.awards && wine.awards.length > 0 && (
                <div className="detail-section">
                  <h3>Awards & Recognition</h3>
                  <div className="awards-list">
                    {wine.awards.map((award, index) => (
                      <div key={index} className="award-item">
                        <div className="award-circle">
                          <span className="award-score">{award.score}</span>
                        </div>
                        <div className="award-details">
                          <span className="award-name">{award.awardName}</span>
                          <span className="award-year">{award.year}</span>
                        </div>
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

              {(wine.bottleImage?.url || wine.techSheet?.url || wine.shelfTalker?.url) && (
                <div className="detail-section">
                  <h3>Trade Tools</h3>
                  <div className="trade-tools-grid">
                    {wine.bottleImage?.url && (
                      <a
                        href={wine.bottleImage.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="trade-tool-card"
                      >
                        <div className="trade-tool-icon">
                          <svg width="40" height="80" viewBox="0 0 100 200" fill="none">
                            <path d="M50 10 L35 50 L30 190 L70 190 L65 50 Z" fill="#722f37"/>
                            <ellipse cx="50" cy="45" rx="15" ry="8" fill="#722f37" opacity="0.3"/>
                          </svg>
                        </div>
                        <div className="trade-tool-info">
                          <span className="trade-tool-label">Bottle Image</span>
                          <div className="trade-tool-actions">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M2 8L8 2L14 8M8 2V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M8 2V8M8 8L11 5M8 8L5 5M2 12L2 14L14 14L14 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </div>
                        </div>
                      </a>
                    )}

                    {wine.techSheet?.url && (
                      <a
                        href={wine.techSheet.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="trade-tool-card"
                      >
                        <div className="trade-tool-icon trade-tool-icon-text">
                          TS
                        </div>
                        <div className="trade-tool-info">
                          <span className="trade-tool-label">Tech Sheet</span>
                          <div className="trade-tool-actions">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M2 8L8 2L14 8M8 2V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M8 2V8M8 8L11 5M8 8L5 5M2 12L2 14L14 14L14 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </div>
                        </div>
                      </a>
                    )}

                    {wine.shelfTalker?.url && (
                      <a
                        href={wine.shelfTalker.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="trade-tool-card"
                      >
                        <div className="trade-tool-icon trade-tool-icon-text">
                          ST
                        </div>
                        <div className="trade-tool-info">
                          <span className="trade-tool-label">Shelf Talker</span>
                          <div className="trade-tool-actions">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M2 8L8 2L14 8M8 2V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M8 2V8M8 8L11 5M8 8L5 5M2 12L2 14L14 14L14 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </div>
                        </div>
                      </a>
                    )}
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
