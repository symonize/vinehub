import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { wineriesAPI, winesAPI, getFileUrl } from '../../utils/api';
import { ArrowLeft, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Wineries.css';

const WineryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isEditor } = useAuth();

  const { data: wineryData, isLoading } = useQuery(
    ['winery', id],
    () => wineriesAPI.getOne(id)
  );

  const { data: winesData } = useQuery(
    ['wines-by-winery', id],
    () => winesAPI.getAll({ winery: id })
  );

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const winery = wineryData?.data?.data;
  const wines = winesData?.data?.data || [];

  if (!winery) {
    return <div>Winery not found</div>;
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span className={`badge badge-${winery.status}`}>{winery.status}</span>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isEditor() && (
            <Link to={`/wineries/${id}/edit`} className="btn btn-primary">
              <Edit size={20} />
              Edit
            </Link>
          )}
          <button onClick={() => navigate('/wineries')} className="btn btn-secondary">
            <ArrowLeft size={20} />
            Back
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          {winery.featuredImage && (
            <div className="detail-image">
              <img
                src={getFileUrl(winery.featuredImage.path)}
                alt={winery.name}
              />
            </div>
          )}

          <div className="card">
            <h2>About</h2>
            <p>{winery.description}</p>
          </div>

          <div className="card">
            <h2>Wines ({wines.length})</h2>
            {wines.length === 0 ? (
              <p>No wines added yet</p>
            ) : (
              <div className="wines-grid">
                {wines.map(wine => (
                  <Link key={wine._id} to={`/wines/${wine._id}`} className="wine-card">
                    <h4>{wine.name}</h4>
                    <p>{wine.type} - {wine.region}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="detail-sidebar">
          {winery.logo && (
            <div className="card">
              <h3>Logo</h3>
              <img
                src={getFileUrl(winery.logo.path)}
                alt="Logo"
                style={{ width: '100%', borderRadius: '0.5rem' }}
              />
            </div>
          )}

          <div className="card">
            <h3>Details</h3>
            <dl className="detail-list">
              <dt>Created</dt>
              <dd>{new Date(winery.createdAt).toLocaleDateString()}</dd>

              <dt>Last Updated</dt>
              <dd>{new Date(winery.updatedAt).toLocaleDateString()}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WineryDetail;
