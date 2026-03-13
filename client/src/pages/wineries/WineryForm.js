import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { wineriesAPI, winesAPI, uploadAPI, getFileUrl } from '../../utils/api';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Tag, FileText, MapPin, Image, Wine, Trash2 } from 'lucide-react';
import { usePageTitle } from '../../context/PageTitleContext';
import CustomSelect from '../../components/CustomSelect';
import ConfirmModal from '../../components/ConfirmModal';
import './Wineries.css';

const WINE_COUNTRIES = [
  { value: 'Argentina', label: 'Argentina' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Austria', label: 'Austria' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Chile', label: 'Chile' },
  { value: 'France', label: 'France' },
  { value: 'Germany', label: 'Germany' },
  { value: 'Greece', label: 'Greece' },
  { value: 'Hungary', label: 'Hungary' },
  { value: 'Italy', label: 'Italy' },
  { value: 'New Zealand', label: 'New Zealand' },
  { value: 'Portugal', label: 'Portugal' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'Spain', label: 'Spain' },
  { value: 'United States', label: 'United States' },
  { value: 'Other', label: 'Other' },
];

const WineryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { setSaveStatus } = usePageTitle();

  const { register, handleSubmit, formState: { errors }, reset, setValue, control, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [logo, setLogo] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Autosave state
  const saveTimeoutRef = useRef(null);
  const lastSavedDataRef = useRef(null);

  // Watch all form fields for autosave
  const watchedFields = watch();

  const { data: wineryData } = useQuery(
    ['winery', id],
    () => wineriesAPI.getOne(id),
    { enabled: isEdit }
  );

  const { data: winesData } = useQuery(
    ['winery-wines', id],
    () => winesAPI.getAll({ winery: id, limit: 100 }),
    { enabled: isEdit }
  );

  const wines = winesData?.data?.data || [];

  useEffect(() => {
    if (wineryData?.data?.data) {
      const winery = wineryData.data.data;
      reset(winery);
      if (winery.featuredImage) setFeaturedImage(winery.featuredImage);
      if (winery.logo) setLogo(winery.logo);
    }
  }, [wineryData, reset]);

  // Autosave function
  const autoSave = useCallback(async (data) => {
    if (!isEdit) return;

    try {
      setSaveStatus('saving');
      const payload = {
        ...data,
        featuredImage,
        logo
      };

      const currentDataStr = JSON.stringify(payload);
      if (lastSavedDataRef.current === currentDataStr) {
        setSaveStatus('saved');
        return;
      }

      await wineriesAPI.update(id, payload);
      lastSavedDataRef.current = currentDataStr;
      setSaveStatus('saved');
    } catch (error) {
      console.error('Autosave error:', error);
      setSaveStatus('error');
      toast.error('Failed to autosave changes');
    }
  }, [isEdit, id, featuredImage, logo, setSaveStatus]);

  // Debounced autosave on form changes
  useEffect(() => {
    if (!isEdit) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const data = watch();
      if (data.name) {
        autoSave(data);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [watchedFields, featuredImage, logo, isEdit, autoSave, watch]);

  const handleFileUpload = async (file, type) => {
    try {
      const response = await uploadAPI.single(file);
      const fileData = response.data.data;

      if (type === 'featured') {
        setFeaturedImage(fileData);
        setValue('featuredImage', fileData);
      } else if (type === 'logo') {
        setLogo(fileData);
        setValue('logo', fileData);
      }
    } catch (error) {
      console.error('Upload error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const payload = {
        ...data,
        featuredImage,
        logo
      };

      if (isEdit) {
        await wineriesAPI.update(id, payload);
        toast.success('Winery updated successfully');
      } else {
        await wineriesAPI.create(payload);
        toast.success('Winery created successfully');
      }

      navigate('/wineries');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save winery');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWinery = async () => {
    setDeleteLoading(true);
    try {
      await wineriesAPI.delete(id);
      toast.success('Brand deleted successfully');
      navigate('/wineries');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete brand');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Clear save status on unmount
  useEffect(() => {
    return () => setSaveStatus(null);
  }, [setSaveStatus]);

  return (
    <div className="winery-form-page">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Top section: featured image left, fields right */}
        <div className="winery-form-top">
          <div className="winery-form-image-col">
            <label className="form-label">
              <Image size={16} />
              Featured Image
            </label>
            {!featuredImage ? (
              <div className="winery-featured-upload">
                <label className="winery-featured-upload-label">
                  <Image size={32} />
                  <span>Add Image</span>
                  <input
                    type="file"
                    accept="image/*,.webp"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'featured')}
                  />
                </label>
              </div>
            ) : (
              <div className="winery-featured-preview">
                <img src={getFileUrl(featuredImage.url)} alt="Featured" />
                <button
                  type="button"
                  onClick={() => setFeaturedImage(null)}
                  className="winery-featured-remove"
                >
                  Remove
                </button>
              </div>
            )}

            {isEdit && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="btn-delete-entity"
              >
                <Trash2 size={16} />
                Delete Brand
              </button>
            )}
          </div>

          <div className="winery-form-fields-col">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <Tag size={16} />
                Brand Name
              </label>
              <input
                type="text"
                id="name"
                className="form-control"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                <FileText size={16} />
                Description
              </label>
              <textarea
                id="description"
                className="form-control"
                rows="5"
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && <span className="form-error">{errors.description.message}</span>}
            </div>

            <div className="winery-form-row-2col">
              <div className="form-group">
                <label className="form-label">
                  <MapPin size={16} />
                  Country
                </label>
                <Controller
                  name="country"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select country..."
                      options={WINE_COUNTRIES}
                    />
                  )}
                />
              </div>
              <div className="form-group">
                <label htmlFor="region" className="form-label">
                  <MapPin size={16} />
                  Region
                </label>
                <input
                  type="text"
                  id="region"
                  className="form-control"
                  {...register('region')}
                />
              </div>
            </div>

            <div className="winery-form-row-2col">
              <div className="form-group">
                <label className="form-label">
                  <Image size={16} />
                  Brand Logo
                </label>
                {!logo ? (
                  <div className="winery-small-upload">
                    <label className="winery-small-upload-label">
                      <span>Add Logo</span>
                      <input
                        type="file"
                        accept="image/*,.webp,.svg"
                        onChange={(e) => handleFileUpload(e.target.files[0], 'logo')}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="winery-small-preview">
                    <img src={getFileUrl(logo.url)} alt="Logo" />
                    <button
                      type="button"
                      onClick={() => setLogo(null)}
                      className="winery-small-remove"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <Controller
                  name="status"
                  control={control}
                  defaultValue="draft"
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: 'draft', label: 'Draft' },
                        { value: 'published', label: 'Published' },
                        { value: 'archived', label: 'Archived' }
                      ]}
                      placeholder="Select status"
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {!isEdit && (
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/wineries')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Winery'}
            </button>
          </div>
        )}
      </form>

      {/* Wines section */}
      {isEdit && (
        <div className="winery-wines-section">
          <div className="winery-wines-header">
            <h2>{wineryData?.data?.data?.name} Wines</h2>
            <Link to={`/wines/new?winery=${id}`} className="btn btn-primary btn-sm">
              + Add Wine
            </Link>
          </div>
          {wines.length > 0 ? (
            <div className="winery-wines-grid">
              {wines.map((wine) => (
                <Link to={`/wines/${wine._id}`} key={wine._id} className="winery-wine-card">
                  <div className="winery-wine-card-image">
                    {wine.bottleImage?.url ? (
                      <img src={getFileUrl(wine.bottleImage.url)} alt={wine.name} />
                    ) : (
                      <div className="winery-wine-card-placeholder">
                        <Wine size={28} />
                      </div>
                    )}
                  </div>
                  <div className="winery-wine-card-info">
                    <h4>{wine.name}</h4>
                    {wine.type && <span className="winery-wine-card-type">{wine.type}</span>}
                    {wine.region && <span className="winery-wine-card-region">{wine.region}</span>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="winery-wines-empty">
              <Wine size={32} />
              <p>No wines added yet</p>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteWinery}
        title={`Delete "${wineryData?.data?.data?.name}"?`}
        message="This will permanently delete this brand and all its data. This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
};

export default WineryForm;
