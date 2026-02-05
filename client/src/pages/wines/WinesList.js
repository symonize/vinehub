import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { winesAPI } from '../../utils/api';
import { Plus, Search, Trash2, Wine as WineIcon, LayoutGrid, List } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Wines.css';

const WinesList = () => {
  const { isEditor } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [region, setRegion] = useState('');
  const [viewMode, setViewMode] = useState('table');

  const { data, isLoading, refetch } = useQuery(
    ['wines', page, search, status, type, region],
    () => winesAPI.getAll({ page, search, status, type, region, limit: 10 }),
    { keepPreviousData: true }
  );

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will also delete all associated vintages.`)) {
      return;
    }

    try {
      await winesAPI.delete(id);
      toast.success('Wine and associated vintages deleted successfully');
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete wine');
    }
  };

  const wines = data?.data?.data || [];
  const totalPages = data?.data?.totalPages || 1;

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
          <Link to="/wines/new" className="btn btn-primary">
            <Plus size={20} />
            Add Wine
          </Link>
        )}
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search wines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="filter-select"
        >
          <option value="">All Types</option>
          <option value="red">Red</option>
          <option value="white">White</option>
          <option value="sparkling">Sparkling</option>
          <option value="rosé">Rosé</option>
          <option value="dessert">Dessert</option>
          <option value="fortified">Fortified</option>
        </select>

        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="filter-select"
        >
          <option value="">All Regions</option>
          <option value="Napa Valley">Napa Valley</option>
          <option value="Sonoma County">Sonoma County</option>
          <option value="Paso Robles">Paso Robles</option>
          <option value="Santa Barbara">Santa Barbara</option>
          <option value="Willamette Valley">Willamette Valley</option>
          <option value="Finger Lakes">Finger Lakes</option>
          <option value="Columbia Valley">Columbia Valley</option>
          <option value="Walla Walla">Walla Walla</option>
          <option value="Russian River Valley">Russian River Valley</option>
          <option value="Alexander Valley">Alexander Valley</option>
          <option value="Other">Other</option>
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
      ) : wines.length === 0 ? (
        <div className="empty-state">
          <WineIcon size={64} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
          <p>No wines found</p>
          {isEditor() && (
            <Link to="/wines/new" className="btn btn-primary">
              <Plus size={20} />
              Create Your First Wine
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
                    <th>Wine Name</th>
                    <th>Winery</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {wines.map((wine) => (
                    <tr
                      key={wine._id}
                      onClick={() => window.location.href = `/wines/${wine._id}/edit`}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div className="wine-name">
                          <strong>{wine.name}</strong>
                        </div>
                      </td>
                      <td>
                        {wine.winery?.name || '-'}
                      </td>
                      <td>
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="items-grid">
              {wines.map((wine) => (
                <div key={wine._id} className="item-card wine-card-grid">
                  <Link to={`/wines/${wine._id}/edit`} className="item-card-link">
                    <div className="wine-card-image">
                      {wine.bottleImage?.url ? (
                        <img src={wine.bottleImage.url} alt={wine.name} />
                      ) : (
                        <div className="wine-card-placeholder">
                          <WineIcon size={60} style={{ color: getWineTypeColor(wine.type) }} />
                        </div>
                      )}
                    </div>
                    <div className="item-card-content">
                      <h3>{wine.name}</h3>
                      {wine.winery?.name && (
                        <p className="wine-card-winery">
                          {wine.winery.name}
                        </p>
                      )}
                    </div>
                  </Link>
                  {isEditor() && (
                    <div className="item-card-actions">
                      <button
                        onClick={() => handleDelete(wine._id, wine.name)}
                        className="btn-icon btn-icon-danger"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
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

export default WinesList;
