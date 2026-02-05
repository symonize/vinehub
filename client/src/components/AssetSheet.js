import React, { useState } from 'react';
import { X, Upload, File, Image, FileText, Download, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { vintagesAPI, getFileUrl } from '../utils/api';
import './AssetSheet.css';

const AssetSheet = ({ vintage, wineName, onClose, onUpdate }) => {
  const [uploading, setUploading] = useState({});

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
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload file (you'll need to implement this endpoint)
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

      // Update vintage with asset info
      const assetData = {
        filename: file.name,
        path: uploadData.data.path,
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
              {assetType.accept.includes('image') && asset.path ? (
                <img src={getFileUrl(asset.path)} alt={assetType.label} className="asset-image" />
              ) : (
                <div className="asset-file-icon">
                  <File size={48} />
                  <span className="asset-filename">{asset.filename}</span>
                </div>
              )}
              <div className="asset-actions">
                <a
                  href={getFileUrl(asset.path)}
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

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-container">
        <div className="sheet-header">
          <div className="sheet-title">
            <h2>{wineName}</h2>
            <span className="sheet-subtitle">Vintage {vintage.year}</span>
          </div>
          <button onClick={onClose} className="btn-close">
            <X size={24} />
          </button>
        </div>

        <div className="sheet-content">
          <div className="assets-grid">
            {assetTypes.map(renderAssetCard)}
          </div>
        </div>
      </div>
    </>
  );
};

export default AssetSheet;
