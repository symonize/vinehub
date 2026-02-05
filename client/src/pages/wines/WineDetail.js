import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { winesAPI, vintagesAPI } from '../../utils/api';
import { ArrowLeft, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Wines.css';

const WineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isEditor } = useAuth();

  const { data: wineData, isLoading } = useQuery(
    ['wine', id],
    () => winesAPI.getOne(id)
  );

  const { data: vintagesData } = useQuery(
    ['vintages-by-wine', id],
    () => vintagesAPI.getAll({ wine: id })
  );

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const wine = wineData?.data?.data;
  const vintages = vintagesData?.data?.data || [];

  if (!wine) {
    return <div>Wine not found</div>;
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span className={`badge badge-${wine.status}`}>{wine.status}</span>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isEditor() && (
            <Link to={`/wines/${id}/edit`} className="btn btn-primary">
              <Edit size={20} />
              Edit
            </Link>
          )}
          <button onClick={() => navigate('/wines')} className="btn btn-secondary">
            <ArrowLeft size={20} />
            Back
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="card">
            <h2>Wine Information</h2>
            <dl className="detail-list">
              <dt>Winery</dt>
              <dd>
                <Link to={`/wineries/${wine.winery._id}`} className="winery-link">
                  {wine.winery.name}
                </Link>
              </dd>

              <dt>Type</dt>
              <dd style={{ textTransform: 'capitalize' }}>{wine.type}</dd>

              <dt>Region</dt>
              <dd>{wine.region}</dd>

              <dt>Variety</dt>
              <dd>{wine.variety}</dd>

              <dt>Description</dt>
              <dd>{wine.description}</dd>

              <dt>Tasting Notes</dt>
              <dd>{wine.tastingNotes}</dd>

              <dt>Food Pairing</dt>
              <dd>{wine.foodPairing}</dd>
            </dl>
          </div>

          {wine.awards && wine.awards.length > 0 && (
            <div className="card">
              <h2>Awards ({wine.awards.length})</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>Score</th>
                    <th>Award</th>
                    <th>Year</th>
                  </tr>
                </thead>
                <tbody>
                  {wine.awards.map((award, index) => (
                    <tr key={index}>
                      <td><strong>{award.score}</strong></td>
                      <td>{award.awardName}</td>
                      <td>{award.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="card">
            <h2>Vintages ({vintages.length})</h2>
            {vintages.length === 0 ? (
              <p className="no-data">No vintages yet</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Notes</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vintages.map(vintage => (
                    <tr key={vintage._id}>
                      <td><strong>{vintage.year}</strong></td>
                      <td>{vintage.notes ? vintage.notes.substring(0, 100) : '-'}</td>
                      <td>
                        <span className={`badge badge-${vintage.status}`}>
                          {vintage.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/vintages/${vintage._id}`} className="btn-icon">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="card">
            <h3>Metadata</h3>
            <dl className="detail-list">
              <dt>Created</dt>
              <dd>{new Date(wine.createdAt).toLocaleString()}</dd>

              <dt>Last Updated</dt>
              <dd>{new Date(wine.updatedAt).toLocaleString()}</dd>

              {wine.createdBy && (
                <>
                  <dt>Created By</dt>
                  <dd>{wine.createdBy.firstName} {wine.createdBy.lastName}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WineDetail;
