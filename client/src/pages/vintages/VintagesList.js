import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { vintagesAPI, winesAPI } from '../../utils/api';
import { Plus, Search, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Vintages.css';

const VintagesList = () => {
  const { isEditor } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedWine = searchParams.get('wine');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [wine, setWine] = useState(preselectedWine || '');

  const { data, isLoading, refetch } = useQuery(
    ['vintages', page, search, status, wine],
    () => vintagesAPI.getAll({ page, search, status, wine, limit: 10 }),
    { keepPreviousData: true }
  );

  const { data: winesData } = useQuery('wines-all', () =>
    winesAPI.getAll({ limit: 1000, status: 'published' })
  );

  const handleDelete = async (id, year) => {
    if (!window.confirm(`Are you sure you want to delete the ${year} vintage?`)) {
      return;
    }

    try {
      await vintagesAPI.delete(id);
      toast.success('Vintage deleted successfully');
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete vintage');
    }
  };

  const vintages = data?.data?.data || [];
  const totalPages = data?.data?.totalPages || 1;
  const wines = winesData?.data?.data || [];

  return (
    <div className="page-container">
      {isEditor() && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <Link to={wine ? `/vintages/new?wine=${wine}` : '/vintages/new'} className="btn btn-primary">
            <Plus size={20} />
            Add Vintage
          </Link>
        </div>
      )}

      <div className="filters-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search vintages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={wine}
          onChange={(e) => setWine(e.target.value)}
          className="filter-select"
        >
          <option value="">All Wines</option>
          {wines.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name} ({w.winery?.name})
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {isLoading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : vintages.length === 0 ? (
        <div className="empty-state">
          <Calendar size={64} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
          <p>No vintages found</p>
          {isEditor() && (
            <Link to="/vintages/new" className="btn btn-primary">
              <Plus size={20} />
              Create Your First Vintage
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Wine</th>
                  <th>Winery</th>
                  <th>Assets</th>
                  <th>Production</th>
                  <th>Pricing</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vintages.map((vintage) => {
                  const assetCount = Object.values(vintage.assets || {}).filter(a => a?.path).length;

                  return (
                    <tr key={vintage._id}>
                      <td>
                        <strong style={{ fontSize: '1.125rem' }}>{vintage.year}</strong>
                      </td>
                      <td>
                        {vintage.wine?.name && (
                          <Link to={`/wines/${vintage.wine._id}`} className="wine-link">
                            {vintage.wine.name}
                          </Link>
                        )}
                      </td>
                      <td>
                        {vintage.wine?.winery?.name && (
                          <Link to={`/wineries/${vintage.wine.winery._id}`} className="winery-link">
                            {vintage.wine.winery.name}
                          </Link>
                        )}
                      </td>
                      <td>
                        <span className="asset-count">
                          {assetCount}/5 assets
                        </span>
                      </td>
                      <td>
                        {vintage.production?.cases ? (
                          <span>{vintage.production.cases} cases</span>
                        ) : (
                          <span className="no-data">-</span>
                        )}
                      </td>
                      <td>
                        {vintage.pricing?.retail ? (
                          <span>${vintage.pricing.retail}</span>
                        ) : (
                          <span className="no-data">-</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${vintage.status}`}>
                          {vintage.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link
                            to={`/vintages/${vintage._id}`}
                            className="btn-icon"
                            title="View"
                          >
                            <Eye size={18} />
                          </Link>
                          {isEditor() && (
                            <>
                              <Link
                                to={`/vintages/${vintage._id}/edit`}
                                className="btn-icon"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </Link>
                              <button
                                onClick={() => handleDelete(vintage._id, vintage.year)}
                                className="btn-icon btn-icon-danger"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VintagesList;
