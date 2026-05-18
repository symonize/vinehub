import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { winesAPI, vintagesAPI } from '../utils/api';
import OptimizedImage from '../components/OptimizedImage';
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
  const vintages = (vintagesData?.data?.data || []).sort((a, b) => b.year - a.year);
  const [activeVintage, setActiveVintage] = useState(null);

  // Set default active vintage once loaded
  React.useEffect(() => {
    if (vintages.length > 0 && activeVintage === null) {
      setActiveVintage(vintages[0]._id);
    }
  }, [vintages, activeVintage]);

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
      <Helmet>
        <title>{wine.name} | WineHub</title>
        <meta name="description" content={`${wine.name} by ${wine.winery?.name || ''}. ${wine.type ? wine.type.charAt(0).toUpperCase() + wine.type.slice(1) : ''} wine${wine.region ? ` from ${wine.region}` : ''}.`} />
        {wine.bottleImage?.url && <meta property="og:image" content={wine.bottleImage.url} />}
      </Helmet>
      <div className="container-narrow">
        <div className="wine-detail-grid">
          {/* Left Column - Image */}
          <div className="wine-image-section">
            <div className="wine-image-container">
              {(() => {
                const selectedVintage = vintages.find(v => v._id === activeVintage);
                const bottleUrl = selectedVintage?.assets?.bottleImage?.url || wine.bottleImage?.url;
                return bottleUrl ? (
                  <OptimizedImage src={bottleUrl} alt={wine.name} width={600} />
                ) : (
                  <div className="wine-placeholder">
                    <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
                      <path d="M50 10 L35 40 L20 90 L80 90 L65 40 Z" fill={getWineTypeColor(wine.type)}/>
                      <ellipse cx="50" cy="35" rx="15" ry="8" fill={getWineTypeColor(wine.type)} opacity="0.3"/>
                    </svg>
                  </div>
                );
              })()}
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
                              ? <OptimizedImage src={asset.url} alt={ASSET_LABELS[key]} width={400} />
                              : <div className="wd-asset-tooltip-pdf-wrap"><iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(asset.url)}&embedded=true`} title={ASSET_LABELS[key]} className="wd-asset-tooltip-pdf" /></div>
                            }
                          </div>
                          <div className={`wd-asset-thumb${IMAGE_TYPES.has(key) ? '' : ' wd-asset-thumb-doc'}`}>
                            {IMAGE_TYPES.has(key)
                              ? <OptimizedImage src={asset.url} alt={ASSET_LABELS[key]} width={400} />
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
                    <span className="wine-meta-col-label">Appellation</span>
                    <span className="wine-meta-col-value">{wine.region}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Vintage Tabs */}
        {vintages.length > 0 && (() => {
          const selected = vintages.find(v => v._id === activeVintage) || vintages[0];
          return (
            <div className="vintage-tabs-section">
              <h2 className="vintage-tabs-heading">Vintages</h2>
              <div className="vintage-tabs">
                {vintages.map(v => (
                  <button
                    key={v._id}
                    className={`vintage-tab${v._id === selected._id ? ' vintage-tab--active' : ''}`}
                    onClick={() => setActiveVintage(v._id)}
                  >
                    {v.year}
                  </button>
                ))}
              </div>

              <div className="vintage-tab-content">
                {selected.tastingNotes && (
                  <div className="vintage-detail-block">
                    <h3>Tasting Notes</h3>
                    <p>{selected.tastingNotes}</p>
                  </div>
                )}

                {selected.harvestNotes && (
                  <div className="vintage-detail-block">
                    <h3>Harvest Notes</h3>
                    <p>{selected.harvestNotes}</p>
                  </div>
                )}

                {selected.blendDetails && (
                  <div className="vintage-detail-block">
                    <h3>Blend</h3>
                    <p>{selected.blendDetails}</p>
                  </div>
                )}

                {selected.agingProcess && (
                  <div className="vintage-detail-block">
                    <h3>Aging</h3>
                    <p>{selected.agingProcess}</p>
                  </div>
                )}

                {selected.oakTreatment && (
                  <div className="vintage-detail-block">
                    <h3>Oak Treatment</h3>
                    <p>{selected.oakTreatment}</p>
                  </div>
                )}

                {/* Production & Pricing row */}
                {(selected.productionVolume || selected.production?.cases || selected.production?.bottles || selected.pricing?.retail || selected.pricing?.wholesale) && (
                  <div className="vintage-meta-grid">
                    {selected.productionVolume && (
                      <div className="vintage-meta-item">
                        <span className="vintage-meta-label">Production</span>
                        <span className="vintage-meta-value">{selected.productionVolume.toLocaleString()} bottles</span>
                      </div>
                    )}
                    {selected.production?.cases && (
                      <div className="vintage-meta-item">
                        <span className="vintage-meta-label">Cases</span>
                        <span className="vintage-meta-value">{selected.production.cases.toLocaleString()}</span>
                      </div>
                    )}
                    {selected.pricing?.retail && (
                      <div className="vintage-meta-item">
                        <span className="vintage-meta-label">Retail</span>
                        <span className="vintage-meta-value">${selected.pricing.retail}</span>
                      </div>
                    )}
                    {selected.pricing?.wholesale && (
                      <div className="vintage-meta-item">
                        <span className="vintage-meta-label">Wholesale</span>
                        <span className="vintage-meta-value">${selected.pricing.wholesale}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Vintage Awards */}
                {selected.awards && selected.awards.length > 0 && (
                  <div className="vintage-detail-block">
                    <h3>Awards</h3>
                    <div className="awards-list">
                      {selected.awards.map((award, i) => (
                        <div key={i} className="award-item">
                          <div className="award-circle">
                            <span className="award-score">{award.score}</span>
                          </div>
                          <div className="award-details">
                            <span className="award-name">{award.organization}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selected.notes && (
                  <div className="vintage-detail-block">
                    <h3>Notes</h3>
                    <p>{selected.notes}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default WineDetail;
