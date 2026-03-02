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
            </div>

            <div className="wine-details">
              {/* Awards — no subheading */}
              {wine.awards && wine.awards.length > 0 && (
                <div className="detail-section">
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

              {/* Description — no subheading */}
              {wine.description && (
                <div className="detail-section">
                  <p>{wine.description}</p>
                </div>
              )}

              {/* Trade Tools */}
              {(() => {
                const IMAGE_TYPES = new Set(['bottleImage', 'labelImage', 'lifestyleImage']);
                const ASSET_LABELS = {
                  bottleImage:    'Bottle Image',
                  labelImage:     'Label Image',
                  techSheet:      'Tech Sheet',
                  tastingCard:    'Tasting Card',
                  lifestyleImage: 'Lifestyle Image',
                  shelfTalker:    'Shelf Talker',
                };
                const ASSET_ORDER = ['bottleImage', 'labelImage', 'lifestyleImage', 'techSheet', 'tastingCard', 'shelfTalker'];
                const assetEntries = ASSET_ORDER
                  .map(key => ({ key, asset: wine[key] }))
                  .filter(({ asset }) => asset?.url);
                if (assetEntries.length === 0) return null;

                const DocIcon = () => (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                );
                const OpenIcon = () => (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 2H2v12h12v-4M10 2h4v4M14 2L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                );
                const DownloadIcon = () => (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3 3 3-3M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                );

                return (
                  <div className="detail-section">
                    <h3>Trade Tools</h3>
                    <div className="wd-assets-grid">
                      {assetEntries.map(({ key, asset }) => (
                        <div key={key} className="wd-asset-item">
                          <div className="wd-asset-tooltip">
                            {IMAGE_TYPES.has(key)
                              ? <img src={asset.url} alt={ASSET_LABELS[key]} />
                              : <div className="wd-asset-tooltip-pdf-wrap"><iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(asset.url)}&embedded=true`} title={ASSET_LABELS[key]} className="wd-asset-tooltip-pdf" /></div>
                            }
                          </div>
                          <div className={`wd-asset-thumb${IMAGE_TYPES.has(key) ? '' : ' wd-asset-thumb-doc'}`}>
                            {IMAGE_TYPES.has(key)
                              ? <img src={asset.url} alt={ASSET_LABELS[key]} />
                              : <DocIcon />
                            }
                          </div>
                          <div className="wd-asset-info">
                            <span className="wd-asset-name">{ASSET_LABELS[key]}</span>
                            <div className="wd-asset-actions">
                              <a href={asset.url} target="_blank" rel="noopener noreferrer" className="wd-asset-btn" title="Open"><OpenIcon /></a>
                              <a href={asset.url} download className="wd-asset-btn" title="Download"><DownloadIcon /></a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Country / Type / Region — 3 columns */}
              <div className="detail-section wine-meta-cols">
                {wine.country && (
                  <div className="wine-meta-col">
                    <span className="wine-meta-col-label">Country</span>
                    <span className="wine-meta-col-value">{wine.country}</span>
                  </div>
                )}
                {wine.type && (
                  <div className="wine-meta-col">
                    <span className="wine-meta-col-label">Type</span>
                    <span className="wine-meta-col-value" style={{ textTransform: 'capitalize' }}>{wine.type}</span>
                  </div>
                )}
                {wine.region && (
                  <div className="wine-meta-col">
                    <span className="wine-meta-col-label">Region</span>
                    <span className="wine-meta-col-value">{wine.region}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WineDetail;
