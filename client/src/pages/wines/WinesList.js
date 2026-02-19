import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { winesAPI } from '../../utils/api';
import { Plus, Search, Trash2, Wine as WineIcon, LayoutGrid, List } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import CustomSelect from '../../components/CustomSelect';
import './Wines.css';

const tableVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.14, ease: 'easeIn' } }
};

const gridContainerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
  exit:    { opacity: 0, transition: { duration: 0.14, ease: 'easeIn' } }
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.94, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } }
};

const WinesList = () => {
  const { isEditor } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [region, setRegion] = useState('');
  const [viewMode, setViewMode] = useState('table');

  const { data, isLoading, refetch } = useQuery(
    ['wines', page, search, type, region],
    () => winesAPI.getAll({ page, search, type, region, limit: 10 }),
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
      <div className="filters-bar">
        <div className="search-box" style={{ maxWidth: '250px' }}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search wines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <CustomSelect
          value={type}
          onChange={(value) => setType(value)}
          options={[
            { value: '', label: 'All Types' },
            { value: 'red', label: 'Red' },
            { value: 'white', label: 'White' },
            { value: 'sparkling', label: 'Sparkling' },
            { value: 'rosé', label: 'Rosé' },
            { value: 'dessert', label: 'Dessert' },
            { value: 'fortified', label: 'Fortified' }
          ]}
          placeholder="All Types"
          className="filter-select"
        />

        <CustomSelect
          value={region}
          onChange={(value) => setRegion(value)}
          options={[
            { value: '', label: 'All Regions' },
            { value: 'Napa Valley', label: 'Napa Valley' },
            { value: 'Sonoma County', label: 'Sonoma County' },
            { value: 'Paso Robles', label: 'Paso Robles' },
            { value: 'Santa Barbara', label: 'Santa Barbara' },
            { value: 'Willamette Valley', label: 'Willamette Valley' },
            { value: 'Finger Lakes', label: 'Finger Lakes' },
            { value: 'Columbia Valley', label: 'Columbia Valley' },
            { value: 'Walla Walla', label: 'Walla Walla' },
            { value: 'Russian River Valley', label: 'Russian River Valley' },
            { value: 'Alexander Valley', label: 'Alexander Valley' },
            { value: 'Other', label: 'Other' }
          ]}
          placeholder="All Regions"
          className="filter-select"
        />

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
          <Link to="/wines/new" className="btn btn-primary" style={{ marginLeft: 'auto' }}>
            <Plus size={20} />
            Add Wine
          </Link>
        )}
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
          <AnimatePresence mode="wait">
            {viewMode === 'table' ? (
              <motion.div
                key="table"
                className="table-container"
                variants={tableVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
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
                          <div className="wine-name" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="wine-thumbnail">
                              {wine.bottleImage?.url ? (
                                <img src={wine.bottleImage.url} alt={wine.name} style={{ width: '40px', height: '60px', objectFit: 'contain' }} />
                              ) : (
                                <div style={{ width: '40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: '4px' }}>
                                  <WineIcon size={24} style={{ color: getWineTypeColor(wine.type) }} />
                                </div>
                              )}
                            </div>
                            <strong style={{ fontFamily: 'Grenette, sans-serif' }}>{wine.name}</strong>
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
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                className="items-grid"
                variants={gridContainerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {wines.map((wine) => (
                  <motion.div key={wine._id} className="item-card wine-card-grid" variants={cardVariants}>
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
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

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
