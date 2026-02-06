import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { wineriesAPI, getFileUrl } from '../../utils/api';
import { Plus, Search, Edit, Trash2, Eye, Building2, LayoutGrid, List } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import CustomSelect from '../../components/CustomSelect';
import './Wineries.css';

const WineriesList = () => {
  const { isEditor } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const { data, isLoading, refetch } = useQuery(
    ['wineries', page, search, status],
    () => wineriesAPI.getAll({ page, search, status, limit: 10 }),
    { keepPreviousData: true }
  );

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await wineriesAPI.delete(id);
      toast.success('Winery deleted successfully');
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete winery');
    }
  };

  const wineries = data?.data?.data || [];
  const totalPages = data?.data?.totalPages || 1;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="view-toggle">
          <button
            onClick={() => setViewMode('table')}
            className={`btn-icon ${viewMode === 'table' ? 'active' : ''}`}
            title="Table View"
          >
            <List size={20} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
            title="Grid View"
          >
            <LayoutGrid size={20} />
          </button>
        </div>
        {isEditor() && (
          <Link to="/wineries/new" className="btn btn-primary">
            <Plus size={20} />
            Add Winery
          </Link>
        )}
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search wineries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <CustomSelect
          value={status}
          onChange={(value) => setStatus(value)}
          options={[
            { value: '', label: 'All Status' },
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
            { value: 'archived', label: 'Archived' }
          ]}
          placeholder="All Status"
          className="filter-select"
        />
      </div>

      {isLoading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : wineries.length === 0 ? (
        <div className="empty-state">
          <p>No wineries found</p>
          {isEditor() && (
            <Link to="/wineries/new" className="btn btn-primary">
              <Plus size={20} />
              Create Your First Winery
            </Link>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'table' ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {wineries.map((winery) => (
                    <tr key={winery._id}>
                      <td>
                        <div className="winery-name">
                          {winery.logo?.path && (
                            <img
                              src={getFileUrl(winery.logo.path)}
                              alt={winery.name}
                              className="winery-logo-thumb"
                            />
                          )}
                          <strong>{winery.name}</strong>
                        </div>
                      </td>
                      <td className="description-cell">
                        {winery.description?.substring(0, 100)}...
                      </td>
                      <td>
                        <span className={`badge badge-${winery.status}`}>
                          {winery.status}
                        </span>
                      </td>
                      <td>{new Date(winery.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <Link
                            to={`/wineries/${winery._id}`}
                            className="btn-icon"
                            title="View"
                          >
                            <Eye size={18} />
                          </Link>
                          {isEditor() && (
                            <>
                              <Link
                                to={`/wineries/${winery._id}/edit`}
                                className="btn-icon"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </Link>
                              <button
                                onClick={() => handleDelete(winery._id, winery.name)}
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
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="items-grid">
              {wineries.map((winery) => (
                <Link key={winery._id} to={`/wineries/${winery._id}/edit`} className="item-card">
                  {winery.featuredImage?.path || winery.logo?.path ? (
                    <div className="item-card-image">
                      <img
                        src={getFileUrl(winery.featuredImage?.path || winery.logo?.path)}
                        alt={winery.name}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    </div>
                  ) : (
                    <div className="item-card-icon">
                      <Building2 size={40} style={{ color: 'var(--primary)' }} />
                    </div>
                  )}
                  <div className="item-card-content">
                    <h3>{winery.name}</h3>
                    <p className="item-card-description">
                      {winery.description?.substring(0, 100)}
                      {winery.description?.length > 100 ? '...' : ''}
                    </p>
                    <p className="item-card-date">
                      Created {new Date(winery.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

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

export default WineriesList;
