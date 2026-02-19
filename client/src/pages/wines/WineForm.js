import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { winesAPI, wineriesAPI, vintagesAPI, aiAPI, uploadAPI, getFileUrl } from '../../utils/api';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Wine, Sparkles, Loader, X, Tag, Droplet, MapPin, Grape, FileText, Utensils, AlertCircle, Check, ChevronDown, Plus, Upload } from 'lucide-react';
import { usePageTitle } from '../../context/PageTitleContext';
import AssetSheet from '../../components/AssetSheet';
import VintageSheet from '../../components/VintageSheet';
import CustomSelect from '../../components/CustomSelect';
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
  const { setCustomTitle, setCustomBreadcrumb } = usePageTitle();

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
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  const saveTimeoutRef = useRef(null);
  const lastSavedDataRef = useRef(null);

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

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setGeneratingImage(true);

    try {
      // Upload to server
      const uploadResponse = await uploadAPI.single(file);
      const uploadedPath = uploadResponse.data.data.path;
      const imageUrl = getFileUrl(uploadedPath);

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
      ...data,
      awards: awards.filter(a => a.score && a.awardName && a.year),
      nutrition: {
        servingSize: parseFloat(data['nutrition.servingSize']) || 5,
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

    // Remove nutrition fields from top level
    Object.keys(wineData).forEach(key => {
      if (key.startsWith('nutrition.') || key.startsWith('ingredients.')) {
        delete wineData[key];
      }
    });

    // Exclude bottleImage to avoid payload size issues (it's saved separately via AI API)
    if (excludeBottleImage) {
      delete wineData.bottleImage;
    }

    return wineData;
  }, [awards, primaryIngredients, additives, processingAids, allergens]);

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
  }, [isEdit, id, prepareWineData]);

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
  }, [watchedFields, primaryIngredients, additives, processingAids, allergens, isEdit, autoSave, watch]);

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

  const wineries = wineriesData?.data?.data || [];
  const vintages = vintagesData?.data?.data || [];
  const wine = wineData?.data?.data;

  return (
    <div className="wine-edit-container">
      {/* Autosave Status Indicator */}
      {isEdit && (
        <div className={`autosave-indicator autosave-${saveStatus}`}>
          {saveStatus === 'saving' && (
            <>
              <Loader size={14} className="animate-spin" />
              <span>Saving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <Check size={14} />
              <span>All changes saved</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <AlertCircle size={14} />
              <span>Failed to save</span>
            </>
          )}
        </div>
      )}

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
        </div>

        {/* Middle Column - Wine Info Form */}
        <div className="wine-content-column">
          <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}>
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

              <div className="form-group">
                <label className="form-label">
                  <MapPin size={16} />
                  Country
                </label>
                <CustomSelect
                  value={watch('country') || ''}
                  onChange={(val) => setValue('country', val)}
                  placeholder="Select country..."
                  options={WINE_COUNTRIES}
                />
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
                    Region
                  </label>
                  <CustomSelect
                    value={watch('region') || ''}
                    onChange={(val) => setValue('region', val, { shouldValidate: true })}
                    placeholder="Select region..."
                    error={!!errors.region}
                    options={[
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
                      { value: 'Other', label: 'Other' },
                    ]}
                  />
                  <input type="hidden" {...register('region', { required: 'Region is required' })} />
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
        </div>

        {/* Right Column - Vintages & Nutrition */}
        {isEdit && (
          <div className="wine-vintages-column">
            <div className="vintages-assets-card">
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
            </div>

            {/* Nutrition & Ingredients Card */}
            <div className="nutrition-card">
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
    </div>
  );
};

export default WineForm;
