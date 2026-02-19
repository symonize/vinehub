import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { vintagesAPI } from '../utils/api';
import './AssetSheet.css';

const VintageSheet = ({ wineId, wineName, onClose, onUpdate }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    productionVolume: '',
    releaseDate: '',
    tastingNotes: '',
    harvestNotes: '',
    agingProcess: '',
    oakTreatment: '',
    blendDetails: ''
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.year) {
      toast.error('Year is required');
      return;
    }

    setLoading(true);

    try {
      const vintageData = {
        wine: wineId,
        year: parseInt(formData.year),
        productionVolume: formData.productionVolume ? parseInt(formData.productionVolume) : undefined,
        releaseDate: formData.releaseDate || undefined,
        tastingNotes: formData.tastingNotes || undefined,
        harvestNotes: formData.harvestNotes || undefined,
        agingProcess: formData.agingProcess || undefined,
        oakTreatment: formData.oakTreatment || undefined,
        blendDetails: formData.blendDetails || undefined
      };

      await vintagesAPI.create(vintageData);
      toast.success('Vintage created successfully');
      onUpdate();
      handleClose();
    } catch (error) {
      console.error('Create vintage error:', error);
      toast.error(error.response?.data?.message || 'Failed to create vintage');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <>
      <div className={`sheet-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose} />
      <div className={`sheet-container ${isClosing ? 'closing' : ''}`}>
        <div className="sheet-header">
          <div className="sheet-title">
            <h2>Add New Vintage</h2>
            <span className="sheet-subtitle">{wineName}</span>
          </div>
          <button onClick={handleClose} className="btn-close">
            <X size={24} />
          </button>
        </div>

        <div className="sheet-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Year *
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="form-control"
                required
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Production Volume (bottles)
              </label>
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
              <label className="form-label">
                Release Date
              </label>
              <input
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Tasting Notes
              </label>
              <textarea
                name="tastingNotes"
                value={formData.tastingNotes}
                onChange={handleChange}
                className="form-control"
                rows="4"
                placeholder="Describe the flavor profile, aromas, and characteristics..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Harvest Notes
              </label>
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
              <label className="form-label">
                Aging Process
              </label>
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
              <label className="form-label">
                Oak Treatment
              </label>
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
              <label className="form-label">
                Blend Details
              </label>
              <textarea
                name="blendDetails"
                value={formData.blendDetails}
                onChange={handleChange}
                className="form-control"
                rows="3"
                placeholder="Describe the blend composition..."
              />
            </div>

            <div className="sheet-actions">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Vintage'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default VintageSheet;
