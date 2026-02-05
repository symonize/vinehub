import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { wineriesAPI, uploadAPI, getFileUrl } from '../../utils/api';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ArrowLeft, Upload } from 'lucide-react';
import './Wineries.css';

const WineryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [logo, setLogo] = useState(null);

  const { data: wineryData } = useQuery(
    ['winery', id],
    () => wineriesAPI.getOne(id),
    { enabled: isEdit }
  );

  useEffect(() => {
    if (wineryData?.data?.data) {
      const winery = wineryData.data.data;
      reset(winery);
      if (winery.featuredImage) setFeaturedImage(winery.featuredImage);
      if (winery.logo) setLogo(winery.logo);
    }
  }, [wineryData, reset]);

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

      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
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

  return (
    <div className="form-container">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button type="button" onClick={() => navigate('/wineries')} className="btn btn-secondary">
          <ArrowLeft size={20} />
          Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-card">
          <h2>Basic Information</h2>

          <div className="form-group">
            <label htmlFor="name" className="form-label">Winery Name *</label>
            <input
              type="text"
              id="name"
              className="form-control"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description *</label>
            <textarea
              id="description"
              className="form-control"
              rows="5"
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && <span className="form-error">{errors.description.message}</span>}
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

        <div className="form-card">
          <h2>Images</h2>

          <div className="form-group">
            <label className="form-label">Featured Image</label>
            {!featuredImage && (
              <div className="file-input-wrapper">
                <label className="file-input-label">
                  <Upload size={20} />
                  <span>Choose Featured Image</span>
                  <input
                    type="file"
                    accept="image/*,.webp"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'featured')}
                  />
                </label>
              </div>
            )}
            {featuredImage && (
              <div className="file-preview">
                <img src={getFileUrl(featuredImage.path)} alt="Featured" />
                <div className="file-preview-info">
                  <p>{featuredImage.filename || featuredImage.originalName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFeaturedImage(null)}
                  className="remove-file-btn"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Logo</label>
            {!logo && (
              <div className="file-input-wrapper">
                <label className="file-input-label">
                  <Upload size={20} />
                  <span>Choose Logo</span>
                  <input
                    type="file"
                    accept="image/*,.webp"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'logo')}
                  />
                </label>
              </div>
            )}
            {logo && (
              <div className="file-preview">
                <img src={getFileUrl(logo.path)} alt="Logo" />
                <div className="file-preview-info">
                  <p>{logo.filename || logo.originalName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLogo(null)}
                  className="remove-file-btn"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

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
            {loading ? 'Saving...' : (isEdit ? 'Update Winery' : 'Create Winery')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WineryForm;
