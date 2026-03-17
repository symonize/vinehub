import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { wineriesAPI, getFileUrl, getOptimizedImageUrl } from '../../utils/api';
import { IMAGE_SIZES } from '../../utils/imageOptimization';
import { Plus, Search, Edit, Trash2, Eye, Building2, LayoutGrid, List } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import CustomSelect from '../../components/CustomSelect';
import ConfirmModal from '../../components/ConfirmModal';
import './Wineries.css';

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

const WineriesList = () => {
  const { isEditor } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, refetch } = useQuery(
    ['wineries', page, search, status],
    () => wineriesAPI.getAll({ page, search, status, limit: 10 }),
    { keepPreviousData: true }
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await wineriesAPI.delete(deleteTarget.id);
      toast.success('Brand deleted successfully');
      setDeleteTarget(null);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete brand');
    } finally {
      setDeleting(false);
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
                            {(winery.logo?.url || winery.logo?.path) && (
                              <img
                                src={getOptimizedImageUrl(winery.logo.url || winery.logo.path, IMAGE_SIZES.logo)}
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
                                  onClick={() => setDeleteTarget({ id: winery._id, name: winery.name })}
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
                {wineries.map((winery) => (
                  <motion.div key={winery._id} variants={cardVariants} className="item-card-wrapper">
                    <Link to={`/wineries/${winery._id}/edit`} className="item-card" style={{ display: 'block' }}>
                      {(winery.featuredImage?.url || winery.featuredImage?.path || winery.logo?.url || winery.logo?.path) ? (
                        <div className="item-card-image">
                          <img
                            src={getOptimizedImageUrl(winery.featuredImage?.url || winery.featuredImage?.path || winery.logo?.url || winery.logo?.path, IMAGE_SIZES.preview)}
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
                    {isEditor() && (
                      <div className="item-card-actions">
                        <button
                          onClick={() => setDeleteTarget({ id: winery._id, name: winery.name })}
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
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.name}"?`}
        message="This will permanently delete this brand and all its data. This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
};

export default WineriesList;
