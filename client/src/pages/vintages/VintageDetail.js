import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { vintagesAPI, getFileUrl } from '../../utils/api';
import { ArrowLeft, Edit, Download, FileText, Image } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Vintages.css';

const VintageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isEditor } = useAuth();

  const { data: vintageData, isLoading } = useQuery(
    ['vintage', id],
    () => vintagesAPI.getOne(id)
  );

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const vintage = vintageData?.data?.data;

  if (!vintage) {
    return <div>Vintage not found</div>;
  }

  const assets = vintage.assets || {};
  const production = vintage.production || {};
  const pricing = vintage.pricing || {};

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span className={`badge badge-${vintage.status}`}>{vintage.status}</span>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isEditor() && (
            <Link to={`/vintages/${id}/edit`} className="btn btn-primary">
              <Edit size={20} />
              Edit
            </Link>
          )}
          <button onClick={() => navigate('/vintages')} className="btn btn-secondary">
            <ArrowLeft size={20} />
            Back
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="card">
            <h2>Vintage Information</h2>
            <dl className="detail-list">
              <dt>Wine</dt>
              <dd>
                <Link to={`/wines/${vintage.wine?._id}`} className="winery-link">
                  {vintage.wine?.name}
                </Link>
              </dd>

              <dt>Winery</dt>
              <dd>
                <Link to={`/wineries/${vintage.wine?.winery?._id}`} className="winery-link">
                  {vintage.wine?.winery?.name}
                </Link>
              </dd>

              <dt>Year</dt>
              <dd><strong>{vintage.year}</strong></dd>

              {vintage.notes && (
                <>
                  <dt>Notes</dt>
                  <dd>{vintage.notes}</dd>
                </>
              )}
            </dl>
          </div>

          {(production.cases || production.bottles) && (
            <div className="card">
              <h2>Production</h2>
              <dl className="detail-list">
                {production.cases && (
                  <>
                    <dt>Cases</dt>
                    <dd>{production.cases.toLocaleString()}</dd>
                  </>
                )}
                {production.bottles && (
                  <>
                    <dt>Bottles</dt>
                    <dd>{production.bottles.toLocaleString()}</dd>
                  </>
                )}
              </dl>
            </div>
          )}

          {(pricing.wholesale || pricing.retail) && (
            <div className="card">
              <h2>Pricing</h2>
              <dl className="detail-list">
                {pricing.wholesale && (
                  <>
                    <dt>Wholesale</dt>
                    <dd>{pricing.currency || 'USD'} {pricing.wholesale.toFixed(2)}</dd>
                  </>
                )}
                {pricing.retail && (
                  <>
                    <dt>Retail</dt>
                    <dd>{pricing.currency || 'USD'} {pricing.retail.toFixed(2)}</dd>
                  </>
                )}
              </dl>
            </div>
          )}

          <div className="card">
            <h2>Assets</h2>
            <div className="assets-grid">
              <AssetDisplay
                label="Bottle Image"
                asset={assets.bottleImage}
                icon={<Image size={24} />}
              />
              <AssetDisplay
                label="Tech Sheet"
                asset={assets.techSheet}
                icon={<FileText size={24} />}
              />
              <AssetDisplay
                label="Shelf Talker"
                asset={assets.shelfTalker}
                icon={<FileText size={24} />}
              />
              <AssetDisplay
                label="Tasting Card"
                asset={assets.tastingCard}
                icon={<FileText size={24} />}
              />
              <AssetDisplay
                label="Label Image"
                asset={assets.labelImage}
                icon={<Image size={24} />}
              />
            </div>
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="card">
            <h3>Metadata</h3>
            <dl className="detail-list">
              <dt>Created</dt>
              <dd>{new Date(vintage.createdAt).toLocaleString()}</dd>

              <dt>Last Updated</dt>
              <dd>{new Date(vintage.updatedAt).toLocaleString()}</dd>

              {vintage.createdBy && (
                <>
                  <dt>Created By</dt>
                  <dd>{vintage.createdBy.firstName} {vintage.createdBy.lastName}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssetDisplay = ({ label, asset, icon }) => {
  if (!asset) {
    return (
      <div className="asset-display-card empty">
        <div className="asset-icon">{icon}</div>
        <h4>{label}</h4>
        <p className="no-data">Not uploaded</p>
      </div>
    );
  }

  const isImage = asset.mimetype?.startsWith('image/');
  const isPDF = asset.mimetype === 'application/pdf';
  const fileUrl = getFileUrl(asset.path);

  return (
    <div className="asset-display-card">
      <div className="asset-icon">{icon}</div>
      <h4>{label}</h4>

      {isImage && (
        <div className="asset-thumbnail">
          <img src={fileUrl} alt={label} />
        </div>
      )}

      {isPDF && (
        <div className="asset-pdf-badge">
          <FileText size={48} />
          <span>PDF Document</span>
        </div>
      )}

      <div className="asset-meta">
        <p className="asset-filename">{asset.filename || asset.originalName}</p>
        <p className="asset-size">{(asset.size / 1024).toFixed(2)} KB</p>
      </div>

      <a
        href={fileUrl}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-sm btn-secondary"
      >
        <Download size={16} />
        Download
      </a>
    </div>
  );
};

export default VintageDetail;
