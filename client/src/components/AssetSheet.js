import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, File, Image, FileText, Download, Trash2, FileEdit, FolderOpen, Trophy, Plus, Pencil } from 'lucide-react';
import { toast } from 'react-toastify';
import { vintagesAPI, getFileUrl, getOptimizedImageUrl } from '../utils/api';
import { compressImage, IMAGE_SIZES } from '../utils/imageOptimization';
import ConfirmModal from './ConfirmModal';
import './AssetSheet.css';

const AssetSheet = ({ vintage: initialVintage, wineName, onClose, onUpdate }) => {
  const [uploading, setUploading] = useState({});
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [vintage, setVintage] = useState(initialVintage);
  const [formData, setFormData] = useState({
    productionVolume: '',
    releaseDate: '',
    tastingNotes: '',
    harvestNotes: '',
    agingProcess: '',
    oakTreatment: '',
    blendDetails: ''
  });
  const saveTimeoutRef = useRef(null);

  // Awards state
  const [awards, setAwards] = useState([]);
  const [newAward, setNewAward] = useState({ organization: '', score: '' });
  const [showAwardForm, setShowAwardForm] = useState(false);
  const [editingAwardIndex, setEditingAwardIndex] = useState(null);
  const [editAward, setEditAward] = useState({ organization: '', score: '' });

  useEffect(() => {
    if (initialVintage) {
      setVintage(initialVintage);
      setFormData({
        productionVolume: initialVintage.productionVolume || '',
        releaseDate: initialVintage.releaseDate ? initialVintage.releaseDate.split('T')[0] : '',
        tastingNotes: initialVintage.tastingNotes || '',
        harvestNotes: initialVintage.harvestNotes || '',
        agingProcess: initialVintage.agingProcess || '',
        oakTreatment: initialVintage.oakTreatment || '',
        blendDetails: initialVintage.blendDetails || ''
      });
      setAwards(initialVintage.awards || []);
    }
  }, [initialVintage]);

  const autoSaveVintage = useCallback(async (data) => {
    try {
      const updateData = {
        productionVolume: data.productionVolume ? parseInt(data.productionVolume) : null,
        releaseDate: data.releaseDate || null,
        tastingNotes: data.tastingNotes || null,
        harvestNotes: data.harvestNotes || null,
        agingProcess: data.agingProcess || null,
        oakTreatment: data.oakTreatment || null,
        blendDetails: data.blendDetails || null
      };
      const response = await vintagesAPI.update(vintage._id, updateData);
      if (response.data?.data) {
        setVintage(response.data.data);
      }
    } catch (error) {
      console.error('Autosave vintage error:', error);
    }
  }, [vintage._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => autoSaveVintage(updated), 1000);
  };

  const handleClose = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      autoSaveVintage(formData);
    }
    setIsClosing(true);
    setTimeout(() => {
      onUpdate();
    }, 300);
  };

  const handleDeleteVintage = async () => {
    setDeleteLoading(true);
    try {
      await vintagesAPI.delete(vintage._id);
      toast.success('Vintage deleted successfully');
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete vintage');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Awards handlers
  const handleAddAward = async () => {
    if (!newAward.organization.trim()) {
      toast.error('Organization is required');
      return;
    }

    const awardData = {
      organization: newAward.organization.trim(),
      score: newAward.score ? parseInt(newAward.score) : undefined
    };

    try {
      const updatedAwards = [...awards, awardData];
      await vintagesAPI.update(vintage._id, { awards: updatedAwards });
      setAwards(updatedAwards);
      setNewAward({ organization: '', score: '' });
      setShowAwardForm(false);
      toast.success('Award added');
    } catch (error) {
      toast.error('Failed to add award');
    }
  };

  const handleDeleteAward = async (index) => {
    try {
      const updatedAwards = awards.filter((_, i) => i !== index);
      await vintagesAPI.update(vintage._id, { awards: updatedAwards });
      setAwards(updatedAwards);
      toast.success('Award removed');
    } catch (error) {
      toast.error('Failed to remove award');
    }
  };

  const handleStartEditAward = (index) => {
    setEditingAwardIndex(index);
    setEditAward({ organization: awards[index].organization, score: awards[index].score ?? '' });
  };

  const handleSaveEditAward = async () => {
    if (!editAward.organization.trim()) return;
    try {
      const updatedAwards = awards.map((a, i) =>
        i === editingAwardIndex
          ? { organization: editAward.organization.trim(), ...(editAward.score !== '' ? { score: parseInt(editAward.score) } : {}) }
          : a
      );
      await vintagesAPI.update(vintage._id, { awards: updatedAwards });
      setAwards(updatedAwards);
      setEditingAwardIndex(null);
      toast.success('Award updated');
    } catch (error) {
      toast.error('Failed to update award');
    }
  };

  const assetTypes = [
    { key: 'bottleImage', label: 'Bottle Image', icon: Image, accept: 'image/*,.webp' },
    { key: 'labelImage', label: 'Label', icon: Image, accept: 'image/*,.webp' },
    { key: 'techSheet', label: 'Tech Sheet', icon: FileText, accept: '.pdf' },
    { key: 'tastingCard', label: 'Tasting Card', icon: FileText, accept: '.pdf,image/*,.webp' },
    { key: 'lifestyleImage', label: 'Lifestyle Image', icon: Image, accept: 'image/*,.webp' }
  ];

  const handleFileSelect = async (assetType, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [assetType]: true }));

    try {
      const optimizedFile = await compressImage(file);
      const formData = new FormData();
      formData.append('file', optimizedFile);

      const uploadResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();

      const assetData = {
        filename: file.name,
        url: uploadData.data.url,
        public_id: uploadData.data.public_id,
        mimetype: file.type,
        size: file.size,
        uploadedAt: new Date()
      };

      await vintagesAPI.updateAsset(vintage._id, assetType, assetData);

      toast.success(`${assetTypes.find(t => t.key === assetType)?.label} uploaded successfully`);
      onUpdate();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(prev => ({ ...prev, [assetType]: false }));
    }
  };

  const handleDelete = async (assetType) => {
    if (!window.confirm(`Are you sure you want to delete this ${assetTypes.find(t => t.key === assetType)?.label}?`)) {
      return;
    }

    try {
      await vintagesAPI.deleteAsset(vintage._id, assetType);
      toast.success('Asset deleted successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete asset');
    }
  };

  const renderAssetCard = (assetType) => {
    const asset = vintage.assets?.[assetType.key];
    const Icon = assetType.icon;
    const isUploading = uploading[assetType.key];

    return (
      <div key={assetType.key} className="asset-card">
        <div className="asset-card-header">
          <div className="asset-card-title">
            <Icon size={20} />
            <span>{assetType.label}</span>
          </div>
        </div>

        <div className="asset-card-body">
          {asset ? (
            <div className="asset-preview">
              {assetType.accept.includes('image') && (asset.url || asset.path) ? (
                <img src={getOptimizedImageUrl(asset.url || asset.path, IMAGE_SIZES.preview)} alt={assetType.label} className="asset-image" />
              ) : (
                <div className="asset-file-icon">
                  <File size={48} />
                  <span className="asset-filename">{asset.filename}</span>
                </div>
              )}
              <div className="asset-actions">
                <a
                  href={getFileUrl(asset.url || asset.path)}
                  download={asset.filename}
                  className="btn-icon"
                  title="Download"
                >
                  <Download size={18} />
                </a>
                <button
                  onClick={() => handleDelete(assetType.key)}
                  className="btn-icon btn-icon-danger"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="asset-empty">
              <label className="asset-upload-btn">
                <input
                  type="file"
                  accept={assetType.accept}
                  onChange={(e) => handleFileSelect(assetType.key, e)}
                  style={{ display: 'none' }}
                  disabled={isUploading}
                />
                <Upload size={24} />
                <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
              </label>
            </div>
          )}
        </div>

        {asset && (
          <div className="asset-card-footer">
            <div className="asset-info">
              <span className="asset-date">
                {new Date(asset.uploadedAt).toLocaleDateString()}
              </span>
              <span className="asset-size">
                {(asset.size / 1024).toFixed(1)} KB
              </span>
            </div>
            <label className="btn-replace">
              <input
                type="file"
                accept={assetType.accept}
                onChange={(e) => handleFileSelect(assetType.key, e)}
                style={{ display: 'none' }}
                disabled={isUploading}
              />
              {isUploading ? 'Uploading...' : 'Replace'}
            </label>
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'details', label: 'Details', icon: FileEdit },
    { id: 'assets', label: 'Assets', icon: FolderOpen },
    { id: 'awards', label: 'Awards', icon: Trophy }
  ];

  return createPortal(
    <>
      <div className={`sheet-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose} />
      <div className={`sheet-container ${isClosing ? 'closing' : ''}`}>
        <div className="sheet-header">
          <div className="sheet-title">
            <h2>Vintage {vintage.year}</h2>
            <span className="sheet-subtitle">{wineName}</span>
          </div>
          <button onClick={handleClose} className="btn-close">
            <X size={24} />
          </button>
        </div>

        <div className="sheet-content">
          {/* Tab Bar */}
          <div className="sheet-tab-bar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`sheet-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={15} fill="currentColor" strokeWidth={1.5} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="sheet-tab-content">
            <AnimatePresence mode="wait">
              {/* Details Tab */}
              {activeTab === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <div className="form-group">
                    <label className="form-label">Production Volume (bottles)</label>
                    <input
                      type="number"
                      name="productionVolume"
                      value={formData.productionVolume}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g., 5000"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Release Date</label>
                    <input
                      type="date"
                      name="releaseDate"
                      value={formData.releaseDate}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tasting Notes</label>
                    <textarea
                      name="tastingNotes"
                      value={formData.tastingNotes}
                      onChange={handleChange}
                      className="form-control"
                      rows="3"
                      placeholder="Describe the flavor profile, aromas, and characteristics..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Harvest Notes</label>
                    <textarea
                      name="harvestNotes"
                      value={formData.harvestNotes}
                      onChange={handleChange}
                      className="form-control"
                      rows="3"
                      placeholder="Describe the harvest conditions, weather, etc..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Aging Process</label>
                    <textarea
                      name="agingProcess"
                      value={formData.agingProcess}
                      onChange={handleChange}
                      className="form-control"
                      rows="3"
                      placeholder="Describe the aging method and duration..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Oak Treatment</label>
                    <input
                      type="text"
                      name="oakTreatment"
                      value={formData.oakTreatment}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="e.g., French oak, 12 months"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Blend Details</label>
                    <textarea
                      name="blendDetails"
                      value={formData.blendDetails}
                      onChange={handleChange}
                      className="form-control"
                      rows="3"
                      placeholder="Describe the blend composition..."
                    />
                  </div>

                  {/* Delete Vintage */}
                  <div className="vintage-delete-section">
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="btn-delete-entity"
                    >
                      <Trash2 size={16} />
                      Delete Vintage
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Assets Tab */}
              {activeTab === 'assets' && (
                <motion.div
                  key="assets"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <div className="assets-grid">
                    {assetTypes.map(renderAssetCard)}
                  </div>
                </motion.div>
              )}

              {/* Awards Tab */}
              {activeTab === 'awards' && (
                <motion.div
                  key="awards"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <div className="awards-section">
                    <div className="awards-header">
                      <span className="awards-count">{awards.length} award{awards.length !== 1 ? 's' : ''}</span>
                      <button
                        type="button"
                        className="btn-add-award"
                        onClick={() => setShowAwardForm(true)}
                      >
                        <Plus size={16} />
                        Add Award
                      </button>
                    </div>

                    {showAwardForm && (
                      <div className="award-form">
                        <div className="form-group">
                          <label className="form-label">Organization *</label>
                          <input
                            type="text"
                            value={newAward.organization}
                            onChange={(e) => setNewAward(prev => ({ ...prev, organization: e.target.value }))}
                            className="form-control"
                            placeholder="e.g., Wine Spectator, Decanter"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Score</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={newAward.score}
                            onChange={(e) => setNewAward(prev => ({ ...prev, score: e.target.value }))}
                            className="form-control"
                            placeholder="e.g., 95"
                          />
                        </div>
                        <div className="award-form-actions">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                              setShowAwardForm(false);
                              setNewAward({ organization: '', score: '' });
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleAddAward}
                          >
                            Add Award
                          </button>
                        </div>
                      </div>
                    )}

                    {awards.length === 0 && !showAwardForm ? (
                      <div className="awards-empty">
                        <Trophy size={40} strokeWidth={1.2} />
                        <p>No awards yet</p>
                        <span>Add awards and accolades for this vintage</span>
                      </div>
                    ) : (
                      <div className="awards-list">
                        {awards.map((award, index) => (
                          <div key={index} className="award-card">
                            {editingAwardIndex === index ? (
                              <div className="award-edit-form">
                                <div className="form-group">
                                  <label className="form-label">Organization *</label>
                                  <input
                                    type="text"
                                    value={editAward.organization}
                                    onChange={(e) => setEditAward(prev => ({ ...prev, organization: e.target.value }))}
                                    className="form-control"
                                    autoFocus
                                  />
                                </div>
                                <div className="form-group">
                                  <label className="form-label">Score</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editAward.score}
                                    onChange={(e) => setEditAward(prev => ({ ...prev, score: e.target.value }))}
                                    className="form-control"
                                    placeholder="e.g., 95"
                                  />
                                </div>
                                <div className="award-form-actions">
                                  <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setEditingAwardIndex(null)}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSaveEditAward}
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="award-card-content">
                                  <div className="award-card-main">
                                    <span className="award-name">{award.organization}</span>
                                  </div>
                                  <div className="award-card-meta">
                                    {award.score && (
                                      <span className="award-score">{award.score} pts</span>
                                    )}
                                  </div>
                                </div>
                                <div className="award-card-actions">
                                  <button
                                    type="button"
                                    className="award-edit"
                                    onClick={() => handleStartEditAward(index)}
                                    title="Edit award"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    className="award-delete"
                                    onClick={() => handleDeleteAward(index)}
                                    title="Remove award"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteVintage}
        title={`Delete Vintage ${vintage.year}?`}
        message="This will permanently delete this vintage and all its assets. This action cannot be undone."
        loading={deleteLoading}
      />
    </>,
    document.body
  );
};

export default AssetSheet;
