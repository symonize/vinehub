import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { winesAPI, wineriesAPI, vintagesAPI, aiAPI, uploadAPI, getOptimizedImageUrl } from '../../utils/api';
import { compressImage, IMAGE_SIZES } from '../../utils/imageOptimization';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, Sparkles, Loader, X, Tag, Droplet, MapPin, Grape, FileText, Utensils, AlertCircle, ChevronDown, Plus, Upload, Building2, Trash2, CalendarRange, FlaskConical } from 'lucide-react';
import { usePageTitle } from '../../context/PageTitleContext';
import AssetSheet from '../../components/AssetSheet';
import VintageSheet from '../../components/VintageSheet';
import CustomSelect from '../../components/CustomSelect';
import ConfirmModal from '../../components/ConfirmModal';
import './Wines.css';

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

const WineForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { setCustomTitle, setCustomBreadcrumb, setSaveStatus } = usePageTitle();

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [awards, setAwards] = useState([]);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [selectedVintage, setSelectedVintage] = useState(null);
  const [showVintageSheet, setShowVintageSheet] = useState(false);
  const [primaryIngredients, setPrimaryIngredients] = useState([]);
  const [additives, setAdditives] = useState([]);
  const [processingAids, setProcessingAids] = useState([]);
  const [lifestyle, setLifestyle] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [allergens, setAllergens] = useState({
    milk: false,
    eggs: false,
    fish: false,
    crustaceanShellfish: false,
    treeNuts: false,
    wheat: false,
    peanuts: false,
    soybeans: false,
    sesame: false
  });

  // Autosave state
  const saveTimeoutRef = useRef(null);
  const lastSavedDataRef = useRef(null);

  const [activeTab, setActiveTab] = useState('info');

  // Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState({
    alcoholFacts: false,
    allergens: false,
    ingredients: false
  });

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Watch all form fields
  const watchedFields = watch();
  const imageGenFields = watch(['name', 'type', 'variety', 'region', 'winery']);

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
        winery: wine.winery?._id || wine.winery,
        // Flatten nutrition fields for form
        'nutrition.servingSize': wine.nutrition?.servingSize || 5,
        'nutrition.servingsPerContainer': wine.nutrition?.servingsPerContainer || '',
        'nutrition.alcoholByVolume': wine.nutrition?.alcoholByVolume || '',
        'nutrition.alcoholPerServing': wine.nutrition?.alcoholPerServing || '',
        'nutrition.caloriesPerServing': wine.nutrition?.caloriesPerServing || '',
        'nutrition.carbohydratesPerServing': wine.nutrition?.carbohydratesPerServing || '',
        'nutrition.fatPerServing': wine.nutrition?.fatPerServing || 0,
        'nutrition.proteinPerServing': wine.nutrition?.proteinPerServing || 0,
        'nutrition.sugarPerServing': wine.nutrition?.sugarPerServing || '',
        'ingredients.notes': wine.ingredients?.notes || ''
      });
      setAwards(wine.awards || []);
      setGeneratedImageUrl(wine.bottleImage?.url || null);
      setPrimaryIngredients(wine.ingredients?.primaryIngredients || []);
      setAdditives(wine.ingredients?.additives || []);
      setProcessingAids(wine.ingredients?.processingAids || []);
      setAllergens(wine.ingredients?.allergens || {
        milk: false,
        eggs: false,
        fish: false,
        crustaceanShellfish: false,
        treeNuts: false,
        wheat: false,
        peanuts: false,
        soybeans: false,
        sesame: false
      });
      const ls = [];
      if (wine.organic) ls.push('organic');
      if (wine.vegan) ls.push('vegan');
      setLifestyle(ls);
    }
  }, [wineData, reset]);

  // Set custom title and breadcrumb when wine data changes
  useEffect(() => {
    const wine = wineData?.data?.data;
    const wineries = wineriesData?.data?.data || [];
    const wineryObj = wine?.winery;
    const wineryId = wineryObj?._id || wineryObj;
    const wineryName = wineryObj?.name || wineries.find(w => w._id === wineryId)?.name;

    if (isEdit && wine) {
      setCustomTitle(wine.name);
      setCustomBreadcrumb(
        <>
          <Link to={`/wineries/${wineryId}/edit`} className="breadcrumb-link">{wineryName || 'Winery'}</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Wines</span>
        </>
      );
    } else if (!isEdit) {
      setCustomTitle('New Wine');
      setCustomBreadcrumb(null);
    }

    return () => {
      setCustomTitle(null);
      setCustomBreadcrumb(null);
      setSaveStatus(null);
    };
  }, [wineData, wineriesData, isEdit, setCustomTitle, setCustomBreadcrumb, setSaveStatus]);

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

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB — compression will reduce it before upload)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setGeneratingImage(true);

    try {
      // Compress before upload
      const optimizedFile = await compressImage(file);
      const uploadResponse = await uploadAPI.single(optimizedFile);
      const imageUrl = uploadResponse.data.data.url;

      // Update wine with uploaded image
      if (isEdit) {
        await aiAPI.uploadWineImage(id, imageUrl);
      }

      setGeneratedImageUrl(imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setGeneratingImage(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  // Ingredient management helpers
  const addIngredient = (type, value) => {
    if (!value.trim()) return;

    switch(type) {
      case 'primary':
        setPrimaryIngredients([...primaryIngredients, value]);
        break;
      case 'additive':
        setAdditives([...additives, value]);
        break;
      case 'processing':
        setProcessingAids([...processingAids, value]);
        break;
      default:
        break;
    }

    // Mark as unsaved when ingredients change
    if (isEdit) setSaveStatus('saving');
  };

  const removeIngredient = (type, index) => {
    switch(type) {
      case 'primary':
        setPrimaryIngredients(primaryIngredients.filter((_, i) => i !== index));
        break;
      case 'additive':
        setAdditives(additives.filter((_, i) => i !== index));
        break;
      case 'processing':
        setProcessingAids(processingAids.filter((_, i) => i !== index));
        break;
      default:
        break;
    }

    // Mark as unsaved when ingredients change
    if (isEdit) setSaveStatus('saving');
  };

  const handleAllergenToggle = (allergen) => {
    setAllergens(prev => ({
      ...prev,
      [allergen]: !prev[allergen]
    }));

    // Mark as unsaved when allergens change
    if (isEdit) setSaveStatus('saving');
  };

  // Prepare wine data for saving
  const prepareWineData = useCallback((data, excludeBottleImage = false) => {
    const wineData = {
      name: data.name,
      winery: data.winery,
      description: data.description,
      country: data.country,
      region: data.region,
      type: data.type,
      variety: data.variety,
      foodPairing: data.foodPairing,
      status: data.status,
      organic: lifestyle.includes('organic'),
      vegan: lifestyle.includes('vegan'),
      awards: awards.filter(a => a.score && a.awardName && a.year),
      nutrition: {
        servingSize: data['nutrition.servingSize'] !== '' && data['nutrition.servingSize'] != null ? parseFloat(data['nutrition.servingSize']) : 5,
        servingsPerContainer: parseFloat(data['nutrition.servingsPerContainer']) || undefined,
        alcoholByVolume: parseFloat(data['nutrition.alcoholByVolume']) || undefined,
        alcoholPerServing: parseFloat(data['nutrition.alcoholPerServing']) || undefined,
        caloriesPerServing: parseFloat(data['nutrition.caloriesPerServing']) || undefined,
        carbohydratesPerServing: parseFloat(data['nutrition.carbohydratesPerServing']) || undefined,
        fatPerServing: parseFloat(data['nutrition.fatPerServing']) || 0,
        proteinPerServing: parseFloat(data['nutrition.proteinPerServing']) || 0,
        sugarPerServing: parseFloat(data['nutrition.sugarPerServing']) || undefined
      },
      ingredients: {
        primaryIngredients: primaryIngredients.filter(i => i.trim()),
        additives: additives.filter(a => a.trim()),
        processingAids: processingAids.filter(p => p.trim()),
        allergens,
        notes: data['ingredients.notes'] || ''
      }
    };

    if (!excludeBottleImage && data.bottleImage) {
      wineData.bottleImage = data.bottleImage;
    }

    return wineData;
  }, [awards, primaryIngredients, additives, processingAids, allergens, lifestyle]);

  // Autosave function
  const autoSave = useCallback(async (data) => {
    if (!isEdit) return; // Only autosave for existing wines

    try {
      setSaveStatus('saving');
      // Exclude bottleImage from autosave to avoid payload size errors
      const wineData = prepareWineData(data, true);

      // Check if data has actually changed
      const currentDataStr = JSON.stringify(wineData);
      if (lastSavedDataRef.current === currentDataStr) {
        setSaveStatus('saved');
        return;
      }

      await winesAPI.update(id, wineData);
      lastSavedDataRef.current = currentDataStr;
      setSaveStatus('saved');
    } catch (error) {
      console.error('Autosave error:', error);
      setSaveStatus('error');
      toast.error('Failed to autosave changes');
    }
  }, [isEdit, id, prepareWineData, setSaveStatus]);

  // Debounced autosave on form changes
  useEffect(() => {
    if (!isEdit) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Trigger autosave after 1 second of no changes
    saveTimeoutRef.current = setTimeout(() => {
      const data = watch();
      if (data.name && data.winery) { // Only save if required fields exist
        autoSave(data);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [watchedFields, primaryIngredients, additives, processingAids, allergens, lifestyle, isEdit, autoSave, watch]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const wineData = prepareWineData(data);

      if (isEdit) {
        await winesAPI.update(id, wineData);
        toast.success('Wine updated successfully');
      } else {
        await winesAPI.create(wineData);
        toast.success('Wine created successfully');
        navigate('/wines');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save wine');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWine = async () => {
    setDeleteLoading(true);
    try {
      await winesAPI.delete(id);
      toast.success('Wine and associated vintages deleted successfully');
      navigate('/wines');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete wine');
    } finally {
      setDeleteLoading(false);
    }
  };

  const wineries = wineriesData?.data?.data || [];
  const vintages = vintagesData?.data?.data || [];
  const wine = wineData?.data?.data;

  const tabs = isEdit
    ? [
        { id: 'info', label: 'Wine Info', icon: Wine },
        { id: 'vintages', label: 'Vintages & Assets', icon: CalendarRange },
        { id: 'nutrition', label: 'Nutrition & Ingredients', icon: FlaskConical },
      ]
    : [{ id: 'info', label: 'Wine Info', icon: Wine }];

  return (
    <div className="wine-edit-container">
      <div className="wine-edit-layout">
        {/* Left Column - Wine Image */}
        <div className="wine-image-column">
          <div className="wine-image-placeholder">
            {generatingImage ? (
              <Loader size={120} className="animate-spin" />
            ) : generatedImageUrl ? (
              <div className="wine-generated-image">
                <img src={getOptimizedImageUrl(generatedImageUrl, IMAGE_SIZES.full)} alt="Generated wine bottle" />
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
            disabled={generatingImage || !imageGenFields[0] || !imageGenFields[1]}
            className="btn-generate-image"
          >
            <Sparkles size={18} />
            {generatingImage ? 'Generating...' : 'Generate Image'}
          </button>

          <div className="upload-button-wrapper">
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              disabled={generatingImage}
              style={{ display: 'none' }}
              id="wine-image-upload"
            />
            <label
              htmlFor="wine-image-upload"
              className={`btn-upload-image ${generatingImage ? 'disabled' : ''}`}
            >
              <Upload size={18} />
              Upload Image
            </label>
          </div>

          {isEdit && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="btn-delete-entity"
            >
              <Trash2 size={16} />
              Delete Wine
            </button>
          )}
        </div>

        {/* Right Area - Tabs + Content */}
        <div className="wine-tabbed-area">
          {/* Tab Bar */}
          <div className="wine-tab-bar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`wine-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={16} fill="currentColor" strokeWidth={1.5} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="wine-tab-content">
            <AnimatePresence mode="wait">
            {/* Wine Info Tab */}
            {activeTab === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
              <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                  e.preventDefault();
                }
              }}>
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

                <div className="form-group">
                  <label className="form-label">
                    <Building2 size={16} />
                    Brand
                  </label>
                  <CustomSelect
                    value={watch('winery') || ''}
                    onChange={(val) => setValue('winery', val, { shouldValidate: true })}
                    placeholder="Select brand..."
                    error={!!errors.winery}
                    options={wineries.map(w => ({ value: w._id, label: w.name }))}
                  />
                  <input type="hidden" {...register('winery', { required: 'Brand is required' })} />
                  {errors.winery && <span className="form-error">{errors.winery.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <MapPin size={16} />
                    Country
                  </label>
                  <CustomSelect
                    value={watch('country') || ''}
                    onChange={(val) => setValue('country', val, { shouldValidate: true })}
                    placeholder="Select country..."
                    error={!!errors.country}
                    options={WINE_COUNTRIES}
                  />
                  <input type="hidden" {...register('country', { required: 'Country is required' })} />
                  {errors.country && <span className="form-error">{errors.country.message}</span>}
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">
                      <Droplet size={16} />
                      Type
                    </label>
                    <CustomSelect
                      value={watch('type') || ''}
                      onChange={(val) => setValue('type', val, { shouldValidate: true })}
                      placeholder="Select type..."
                      error={!!errors.type}
                      options={[
                        { value: 'red', label: 'Red' },
                        { value: 'white', label: 'White' },
                        { value: 'sparkling', label: 'Sparkling' },
                        { value: 'rosé', label: 'Rosé' },
                        { value: 'dessert', label: 'Dessert' },
                        { value: 'fortified', label: 'Fortified' },
                      ]}
                    />
                    <input type="hidden" {...register('type', { required: 'Type is required' })} />
                    {errors.type && <span className="form-error">{errors.type.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <MapPin size={16} />
                      Appellation
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.region ? 'is-invalid' : ''}`}
                      placeholder="e.g., Napa Valley, Sonoma County"
                      {...register('region')}
                    />
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
                    {...register('variety')}
                  />
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
                    {...register('description')}
                  />
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
                    {...register('foodPairing')}
                  />
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">
                      <Grape size={16} />
                      Lifestyle
                    </label>
                    <CustomSelect
                      value={lifestyle}
                      onChange={(val) => {
                        setLifestyle(val);
                        if (isEdit) setSaveStatus('saving');
                      }}
                      placeholder="Select lifestyle attributes..."
                      multi
                      options={[
                        { value: 'organic', label: 'Organic' },
                        { value: 'vegan', label: 'Vegan' },
                      ]}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Tag size={16} />
                      Status
                    </label>
                    <CustomSelect
                      value={watch('status') || 'draft'}
                      onChange={(val) => setValue('status', val)}
                      options={[
                        { value: 'draft', label: 'Draft' },
                        { value: 'published', label: 'Published' },
                        { value: 'archived', label: 'Archived' },
                      ]}
                      placeholder="Select status"
                    />
                  </div>
                </div>

                {!isEdit && (
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
                      {loading ? 'Creating...' : 'Create Wine'}
                    </button>
                  </div>
                )}
              </form>
              </motion.div>
            )}

            {/* Vintages & Assets Tab */}
            {activeTab === 'vintages' && isEdit && (
              <motion.div
                key="vintages"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <div className="vintages-header">
                  <h2 className="section-title">Vintages & Assets</h2>
                  <button
                    onClick={() => setShowVintageSheet(true)}
                    className="btn-add-vintage-circle"
                    title="Add Vintage"
                    type="button"
                  >
                    <Plus size={18} />
                  </button>
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
              </motion.div>
            )}

            {/* Nutrition & Ingredients Tab */}
            {activeTab === 'nutrition' && isEdit && (
              <motion.div
                key="nutrition"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <div className="card-header-with-info">
                  <h2 className="section-title">
                    Nutrition & Ingredients
                  </h2>
                  <span className="info-badge" title="TTB proposed regulations 2025">
                    <AlertCircle size={14} />
                    TTB 2025
                  </span>
                </div>

                <form onSubmit={(e) => e.preventDefault()} onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                  }
                }}>
                  {/* Alcohol Facts Section */}
                  <div className="nutrition-section">
                    <h3
                      className="nutrition-section-title collapsible"
                      onClick={() => toggleSection('alcoholFacts')}
                    >
                      <span>Alcohol Facts</span>
                      <ChevronDown
                        size={18}
                        className={`collapse-icon ${collapsedSections.alcoholFacts ? 'collapsed' : ''}`}
                      />
                    </h3>

                    {!collapsedSections.alcoholFacts && (
                    <>
                    <div className="form-group">
                      <label className="form-label-small">Serving Size (oz)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control form-control-sm"
                        defaultValue="5"
                        {...register('nutrition.servingSize')}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label-small">Servings/Container</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control form-control-sm"
                        {...register('nutrition.servingsPerContainer')}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label-small">ABV (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control form-control-sm"
                        {...register('nutrition.alcoholByVolume')}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label-small">Alcohol/Serving (oz)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control form-control-sm"
                        {...register('nutrition.alcoholPerServing')}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label-small">Calories</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        {...register('nutrition.caloriesPerServing')}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label-small">Carbs (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control form-control-sm"
                        {...register('nutrition.carbohydratesPerServing')}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label-small">Sugar (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control form-control-sm"
                        {...register('nutrition.sugarPerServing')}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label-small">Protein (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control form-control-sm"
                        defaultValue="0"
                        {...register('nutrition.proteinPerServing')}
                      />
                    </div>
                    </>
                    )}
                  </div>

                  {/* Allergens Section */}
                  <div className="nutrition-section">
                    <h3
                      className="nutrition-section-title collapsible"
                      onClick={() => toggleSection('allergens')}
                    >
                      <span>Major Food Allergens</span>
                      <ChevronDown
                        size={18}
                        className={`collapse-icon ${collapsedSections.allergens ? 'collapsed' : ''}`}
                      />
                    </h3>

                    {!collapsedSections.allergens && (
                    <div className="allergens-grid">
                      {Object.keys(allergens).map((allergen) => (
                        <label key={allergen} className="allergen-checkbox">
                          <input
                            type="checkbox"
                            checked={allergens[allergen]}
                            onChange={() => handleAllergenToggle(allergen)}
                          />
                          <span className="allergen-label">
                            {allergen === 'crustaceanShellfish' ? 'Shellfish' :
                             allergen === 'treeNuts' ? 'Tree Nuts' :
                             allergen.charAt(0).toUpperCase() + allergen.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                    )}
                  </div>

                  {/* Ingredients Section */}
                  <div className="nutrition-section">
                    <h3
                      className="nutrition-section-title collapsible"
                      onClick={() => toggleSection('ingredients')}
                    >
                      <span>Ingredients</span>
                      <ChevronDown
                        size={18}
                        className={`collapse-icon ${collapsedSections.ingredients ? 'collapsed' : ''}`}
                      />
                    </h3>

                    {!collapsedSections.ingredients && (
                    <>
                    <div className="form-group">
                      <label className="form-label-small">Primary Ingredients</label>
                      <div className="ingredient-input-group">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g., Grapes (Cabernet Sauvignon)"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addIngredient('primary', e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                      <div className="ingredient-tags">
                        {primaryIngredients.map((ingredient, idx) => (
                          <span key={idx} className="ingredient-tag">
                            {ingredient}
                            <button
                              type="button"
                              onClick={() => removeIngredient('primary', idx)}
                              className="remove-tag"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label-small">Additives</label>
                      <div className="ingredient-input-group">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g., Sulfites"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addIngredient('additive', e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                      <div className="ingredient-tags">
                        {additives.map((additive, idx) => (
                          <span key={idx} className="ingredient-tag">
                            {additive}
                            <button
                              type="button"
                              onClick={() => removeIngredient('additive', idx)}
                              className="remove-tag"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label-small">Processing Aids</label>
                      <div className="ingredient-input-group">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g., Bentonite, Egg whites"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addIngredient('processing', e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                      <div className="ingredient-tags">
                        {processingAids.map((aid, idx) => (
                          <span key={idx} className="ingredient-tag">
                            {aid}
                            <button
                              type="button"
                              onClick={() => removeIngredient('processing', idx)}
                              className="remove-tag"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label-small">Notes</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="2"
                        placeholder="Additional ingredient notes..."
                        {...register('ingredients.notes')}
                      />
                    </div>
                    </>
                    )}
                  </div>
                </form>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
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

      {showVintageSheet && (
        <VintageSheet
          wineId={id}
          wineName={wine?.name || ''}
          onClose={() => setShowVintageSheet(false)}
          onUpdate={() => {
            refetchVintages();
            setShowVintageSheet(false);
          }}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteWine}
        title={`Delete "${wine?.name}"?`}
        message="This will permanently delete this wine and all associated vintages. This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
};

export default WineForm;
