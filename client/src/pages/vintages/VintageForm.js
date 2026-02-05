import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { vintagesAPI, winesAPI, uploadAPI, getFileUrl } from '../../utils/api';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ArrowLeft, Upload, X } from 'lucide-react';
import './Vintages.css';

const VintageForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedWine = searchParams.get('wine');
  const isEdit = !!id;

  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState({
    bottleImage: null,
    techSheet: null,
    shelfTalker: null,
    tastingCard: null,
    labelImage: null
  });
  const [uploadingAsset, setUploadingAsset] = useState(null);

  // const selectedWineryId = watch('wine');

  // Fetch wines for dropdown
  const { data: winesData } = useQuery('wines-all', () =>
    winesAPI.getAll({ limit: 1000, status: 'published' })
  );

  // Fetch vintage data if editing
  const { data: vintageData } = useQuery(
    ['vintage', id],
    () => vintagesAPI.getOne(id),
    { enabled: isEdit }
  );

  useEffect(() => {
    if (vintageData?.data?.data) {
      const vintage = vintageData.data.data;
      reset({
        ...vintage,
        wine: vintage.wine?._id || vintage.wine,
        'production.cases': vintage.production?.cases || '',
        'production.bottles': vintage.production?.bottles || '',
        'pricing.wholesale': vintage.pricing?.wholesale || '',
        'pricing.retail': vintage.pricing?.retail || '',
        'pricing.currency': vintage.pricing?.currency || 'USD'
      });
      setAssets(vintage.assets || {
        bottleImage: null,
        techSheet: null,
        shelfTalker: null,
        tastingCard: null,
        labelImage: null
      });
    } else if (preselectedWine) {
      reset({ wine: preselectedWine });
    }
  }, [vintageData, reset, preselectedWine]);

  const handleFileUpload = async (file, assetType) => {
    setUploadingAsset(assetType);
    try {
      const response = await uploadAPI.single(file);
      const fileData = response.data.data;

      setAssets(prev => ({
        ...prev,
        [assetType]: fileData
      }));

      toast.success(`${assetType} uploaded successfully`);
    } catch (error) {
      toast.error(`Failed to upload ${assetType}`);
    } finally {
      setUploadingAsset(null);
    }
  };

  const removeAsset = (assetType) => {
    setAssets(prev => ({
      ...prev,
      [assetType]: null
    }));
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const payload = {
        wine: data.wine,
        year: parseInt(data.year),
        notes: data.notes,
        production: {
          cases: data['production.cases'] ? parseInt(data['production.cases']) : undefined,
          bottles: data['production.bottles'] ? parseInt(data['production.bottles']) : undefined
        },
        pricing: {
          wholesale: data['pricing.wholesale'] ? parseFloat(data['pricing.wholesale']) : undefined,
          retail: data['pricing.retail'] ? parseFloat(data['pricing.retail']) : undefined,
          currency: data['pricing.currency'] || 'USD'
        },
        assets,
        status: data.status
      };

      if (isEdit) {
        await vintagesAPI.update(id, payload);
        toast.success('Vintage updated successfully');
      } else {
        await vintagesAPI.create(payload);
        toast.success('Vintage created successfully');
      }

      navigate('/vintages');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save vintage');
    } finally {
      setLoading(false);
    }
  };

  const wines = winesData?.data?.data || [];
  const currentYear = new Date().getFullYear();

  return (
    <div className="form-container">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button type="button" onClick={() => navigate('/vintages')} className="btn btn-secondary">
          <ArrowLeft size={20} />
          Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-card">
          <h2>Basic Information</h2>

          <div className="form-group">
            <label htmlFor="wine" className="form-label">Wine *</label>
            <select
              id="wine"
              className="form-control"
              {...register('wine', { required: 'Wine is required' })}
            >
              <option value="">Select a wine...</option>
              {wines.map((wine) => (
                <option key={wine._id} value={wine._id}>
                  {wine.name} - {wine.winery?.name}
                </option>
              ))}
            </select>
            {errors.wine && <span className="form-error">{errors.wine.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year" className="form-label">Year *</label>
              <input
                type="number"
                id="year"
                className="form-control"
                min="1900"
                max={currentYear + 1}
                placeholder={currentYear.toString()}
                {...register('year', {
                  required: 'Year is required',
                  min: { value: 1900, message: 'Year must be after 1900' },
                  max: { value: currentYear + 1, message: `Year cannot be after ${currentYear + 1}` }
                })}
              />
              {errors.year && <span className="form-error">{errors.year.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="status" className="form-label">Status</label>
              <select
                id="status"
                className="form-control"
                {...register('status')}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes" className="form-label">Notes</label>
            <textarea
              id="notes"
              className="form-control"
              rows="3"
              placeholder="Add any notes about this vintage..."
              {...register('notes')}
            />
          </div>
        </div>

        <div className="form-card">
          <h2>Production & Pricing</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="production.cases" className="form-label">Cases Produced</label>
              <input
                type="number"
                id="production.cases"
                className="form-control"
                min="0"
                placeholder="Number of cases"
                {...register('production.cases')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="production.bottles" className="form-label">Bottles Produced</label>
              <input
                type="number"
                id="production.bottles"
                className="form-control"
                min="0"
                placeholder="Number of bottles"
                {...register('production.bottles')}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pricing.wholesale" className="form-label">Wholesale Price</label>
              <input
                type="number"
                id="pricing.wholesale"
                className="form-control"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...register('pricing.wholesale')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="pricing.retail" className="form-label">Retail Price</label>
              <input
                type="number"
                id="pricing.retail"
                className="form-control"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...register('pricing.retail')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="pricing.currency" className="form-label">Currency</label>
              <select
                id="pricing.currency"
                className="form-control"
                {...register('pricing.currency')}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-card">
          <h2>Assets</h2>
          <p className="form-help">Upload images and documents for this vintage</p>

          <AssetUpload
            label="Bottle Image"
            assetType="bottleImage"
            accept="image/*"
            asset={assets.bottleImage}
            uploading={uploadingAsset === 'bottleImage'}
            onUpload={handleFileUpload}
            onRemove={removeAsset}
          />

          <AssetUpload
            label="Tech Sheet"
            assetType="techSheet"
            accept=".pdf,application/pdf"
            asset={assets.techSheet}
            uploading={uploadingAsset === 'techSheet'}
            onUpload={handleFileUpload}
            onRemove={removeAsset}
          />

          <AssetUpload
            label="Shelf Talker"
            assetType="shelfTalker"
            accept="image/*,.pdf"
            asset={assets.shelfTalker}
            uploading={uploadingAsset === 'shelfTalker'}
            onUpload={handleFileUpload}
            onRemove={removeAsset}
          />

          <AssetUpload
            label="Tasting Card"
            assetType="tastingCard"
            accept="image/*,.pdf"
            asset={assets.tastingCard}
            uploading={uploadingAsset === 'tastingCard'}
            onUpload={handleFileUpload}
            onRemove={removeAsset}
          />

          <AssetUpload
            label="Label Image"
            assetType="labelImage"
            accept="image/*"
            asset={assets.labelImage}
            uploading={uploadingAsset === 'labelImage'}
            onUpload={handleFileUpload}
            onRemove={removeAsset}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/vintages')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Vintage' : 'Create Vintage')}
          </button>
        </div>
      </form>
    </div>
  );
};

const AssetUpload = ({ label, assetType, accept, asset, uploading, onUpload, onRemove }) => {
  const isImage = asset?.mimetype?.startsWith('image/');
  const isPDF = asset?.mimetype === 'application/pdf';

  return (
    <div className="asset-upload-group">
      <label className="form-label">{label}</label>

      {!asset ? (
        <label className="file-input-label">
          <Upload size={20} />
          <span>{uploading ? 'Uploading...' : `Choose ${label}`}</span>
          <input
            type="file"
            accept={accept}
            onChange={(e) => e.target.files[0] && onUpload(e.target.files[0], assetType)}
            disabled={uploading}
          />
        </label>
      ) : (
        <div className="asset-preview">
          {isImage && (
            <img src={getFileUrl(asset.path)} alt={label} className="asset-preview-image" />
          )}
          {isPDF && (
            <div className="asset-pdf-indicator">
              <span>📄 PDF Document</span>
            </div>
          )}
          <div className="asset-info">
            <p className="asset-filename">{asset.filename || asset.originalName}</p>
            <p className="asset-size">{(asset.size / 1024).toFixed(2)} KB</p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(assetType)}
            className="btn btn-sm btn-danger"
          >
            <X size={16} />
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default VintageForm;
