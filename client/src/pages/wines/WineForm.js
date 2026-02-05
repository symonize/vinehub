import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { winesAPI, wineriesAPI, vintagesAPI, aiAPI } from '../../utils/api';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Wine, Sparkles, Loader, X, Tag, Droplet, MapPin, Grape, FileText, Utensils } from 'lucide-react';
import { usePageTitle } from '../../context/PageTitleContext';
import AssetSheet from '../../components/AssetSheet';
import './Wines.css';

const WineForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { setCustomTitle, setCustomBreadcrumb } = usePageTitle();

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [awards, setAwards] = useState([]);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [selectedVintage, setSelectedVintage] = useState(null);

  // Watch form fields for image generation
  const watchedFields = watch(['name', 'type', 'variety', 'region', 'winery']);

  // Fetch wineries for dropdown
  const { data: wineriesData } = useQuery('wineries-all', () =>
    wineriesAPI.getAll({ limit: 1000, status: 'published' })
  );

  // Fetch wine data if editing
  const { data: wineData } = useQuery(
    ['wine', id],
    () => winesAPI.getOne(id),
    { enabled: isEdit }
  );

  // Fetch vintages if editing
  const { data: vintagesData, refetch: refetchVintages } = useQuery(
    ['vintages-by-wine', id],
    () => vintagesAPI.getAll({ wine: id }),
    { enabled: isEdit }
  );

  useEffect(() => {
    if (wineData?.data?.data) {
      const wine = wineData.data.data;
      reset({
        ...wine,
        winery: wine.winery?._id || wine.winery
      });
      setAwards(wine.awards || []);
      setGeneratedImageUrl(wine.bottleImage?.url || null);
    }
  }, [wineData, reset]);

  // Set custom title and breadcrumb when wine data changes
  useEffect(() => {
    const wine = wineData?.data?.data;
    const wineries = wineriesData?.data?.data || [];
    const wineryName = wine?.winery?.name || wineries.find(w => w._id === wine?.winery)?.name;

    if (isEdit && wine) {
      setCustomTitle(wine.name);
      setCustomBreadcrumb(
        <>
          <Link to="/wineries" className="breadcrumb-link">Anselmi</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{wineryName || 'Loading...'}</span>
        </>
      );
    } else if (!isEdit) {
      setCustomTitle('New Wine');
      setCustomBreadcrumb(null);
    }

    return () => {
      setCustomTitle(null);
      setCustomBreadcrumb(null);
    };
  }, [wineData, wineriesData, isEdit, setCustomTitle, setCustomBreadcrumb]);

  const handleGenerateImage = async () => {
    const formData = watch();

    if (!formData.name || !formData.type) {
      toast.error('Wine name and type are required to generate image');
      return;
    }

    setGeneratingImage(true);

    try {
      const wineryName = wineries.find(w => w._id === formData.winery)?.name;

      const response = await aiAPI.generateWineImage({
        wineId: isEdit ? id : null,
        wineName: formData.name,
        wineType: formData.type,
        variety: formData.variety,
        region: formData.region,
        wineryName
      });

      setGeneratedImageUrl(response.data.data.imageUrl);
      toast.success('Image generated successfully!');
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate image');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!isEdit) {
      setGeneratedImageUrl(null);
      return;
    }

    try {
      await aiAPI.removeWineImage(id);
      setGeneratedImageUrl(null);
      toast.success('Image removed successfully');
    } catch (error) {
      toast.error('Failed to remove image');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const wineData = {
        ...data,
        awards: awards.filter(a => a.score && a.awardName && a.year)
      };

      if (isEdit) {
        await winesAPI.update(id, wineData);
        toast.success('Wine updated successfully');
      } else {
        await winesAPI.create(wineData);
        toast.success('Wine created successfully');
      }

      navigate('/wines');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save wine');
    } finally {
      setLoading(false);
    }
  };

  const wineries = wineriesData?.data?.data || [];
  const vintages = vintagesData?.data?.data || [];
  const wine = wineData?.data?.data;

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
    <div className="wine-edit-container">
      <div className="wine-edit-layout-3col">
        {/* Left Column - Wine Image */}
        <div className="wine-image-column">
          <div className="wine-image-placeholder">
            {generatingImage ? (
              <Loader size={120} className="animate-spin" />
            ) : generatedImageUrl ? (
              <div className="wine-generated-image">
                <img src={generatedImageUrl} alt="Generated wine bottle" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="btn-remove-image"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <Wine size={120} />
            )}
          </div>
          <button
            type="button"
            onClick={handleGenerateImage}
            disabled={generatingImage || !watchedFields[0] || !watchedFields[1]}
            className="btn-generate-image"
          >
            <Sparkles size={18} />
            {generatingImage ? 'Generating...' : 'Generate Image'}
          </button>
        </div>

        {/* Middle Column - Wine Info Form */}
        <div className="wine-content-column">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Wine Info Card */}
            <div className="wine-info-card">
              <h2 className="section-title">Wine Info</h2>

              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  <Tag size={16} />
                  Wine Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <span className="form-error">{errors.name.message}</span>}
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label htmlFor="type" className="form-label">
                    <Droplet size={16} />
                    Type
                  </label>
                  <div className="wine-type-select-wrapper">
                    <select
                      id="type"
                      className={`form-control wine-type-select ${watch('type') ? 'has-selection' : ''}`}
                      {...register('type', { required: 'Type is required' })}
                    >
                      <option value="">Select type...</option>
                      <option value="red">Red</option>
                      <option value="white">White</option>
                      <option value="sparkling">Sparkling</option>
                      <option value="rosé">Rosé</option>
                      <option value="dessert">Dessert</option>
                      <option value="fortified">Fortified</option>
                    </select>
                    {watch('type') && (
                      <span
                        className="wine-type-badge-inline"
                        style={{
                          backgroundColor: `${getWineTypeColor(watch('type'))}20`,
                          color: getWineTypeColor(watch('type')),
                          border: `1px solid ${getWineTypeColor(watch('type'))}40`
                        }}
                      >
                        {watch('type')}
                      </span>
                    )}
                  </div>
                  {errors.type && <span className="form-error">{errors.type.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="region" className="form-label">
                    <MapPin size={16} />
                    Region
                  </label>
                  <select
                    id="region"
                    className="form-control"
                    {...register('region', { required: 'Region is required' })}
                  >
                    <option value="">Select region...</option>
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
                  {errors.region && <span className="form-error">{errors.region.message}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="variety" className="form-label">
                  <Grape size={16} />
                  Variety
                </label>
                <textarea
                  id="variety"
                  className="form-control"
                  rows="2"
                  {...register('variety', { required: 'Variety is required' })}
                />
                {errors.variety && <span className="form-error">{errors.variety.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  <FileText size={16} />
                  Description
                </label>
                <textarea
                  id="description"
                  className="form-control"
                  rows="4"
                  {...register('description', { required: 'Description is required' })}
                />
                {errors.description && <span className="form-error">{errors.description.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="foodPairing" className="form-label">
                  <Utensils size={16} />
                  Food Pairings
                </label>
                <textarea
                  id="foodPairing"
                  className="form-control"
                  rows="3"
                  {...register('foodPairing', { required: 'Food pairing is required' })}
                />
                {errors.foodPairing && <span className="form-error">{errors.foodPairing.message}</span>}
              </div>
            </div>

            <div className="form-actions-bottom">
              <button
                type="button"
                onClick={() => navigate('/wines')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : (isEdit ? 'Update Wine' : 'Create Wine')}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Vintages */}
        {isEdit && (
          <div className="wine-vintages-column">
            <div className="vintages-assets-card">
              <div className="card-header-with-button">
                <h2 className="section-title">Vintages & Assets</h2>
                <Link
                  to={`/vintages/new?wine=${id}`}
                  className="btn-add-vintage"
                >
                  Add Vintage
                </Link>
              </div>

              <div className="vintages-label">All Vintages</div>

              {vintages.length === 0 ? (
                <p className="no-data">No vintages yet</p>
              ) : (
                <div className="vintages-year-cards">
                  {vintages.map((vintage) => (
                    <button
                      key={vintage._id}
                      onClick={() => setSelectedVintage(vintage)}
                      className="vintage-year-card"
                    >
                      {vintage.year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedVintage && (
        <AssetSheet
          vintage={selectedVintage}
          wineName={wine?.name || ''}
          onClose={() => setSelectedVintage(null)}
          onUpdate={() => {
            refetchVintages();
            setSelectedVintage(null);
          }}
        />
      )}
    </div>
  );
};

export default WineForm;
