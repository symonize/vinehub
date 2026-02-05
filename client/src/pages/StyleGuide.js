import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Download, Upload, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import './StyleGuide.css';

const StyleGuide = () => {
  const { theme, updateTheme, resetTheme, exportTheme, importTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('colors');

  const handleColorChange = (key, value) => {
    updateTheme({ [key]: value });
  };

  const handleExport = () => {
    const themeJson = exportTheme();
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'winehub-theme.json';
    a.click();
    toast.success('Theme exported successfully');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const success = importTheme(event.target.result);
        if (success) {
          toast.success('Theme imported successfully');
        } else {
          toast.error('Invalid theme file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all styles to default?')) {
      resetTheme();
      toast.success('Theme reset to defaults');
    }
  };

  return (
    <div className="style-guide">
      <div className="style-guide-header">
        <div>
          <h1>Style Guide</h1>
          <p>Design and customize the entire CMS appearance in real-time</p>
        </div>
        <div className="style-guide-actions">
          <button onClick={handleReset} className="btn btn-secondary btn-sm">
            <RotateCcw size={16} />
            Reset
          </button>
          <button onClick={handleExport} className="btn btn-secondary btn-sm">
            <Download size={16} />
            Export
          </button>
          <label className="btn btn-secondary btn-sm">
            <Upload size={16} />
            Import
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div className="style-guide-layout">
        {/* Tabs */}
        <div className="style-guide-tabs">
          <button
            className={`tab ${activeTab === 'colors' ? 'active' : ''}`}
            onClick={() => setActiveTab('colors')}
          >
            Colors
          </button>
          <button
            className={`tab ${activeTab === 'typography' ? 'active' : ''}`}
            onClick={() => setActiveTab('typography')}
          >
            Typography
          </button>
          <button
            className={`tab ${activeTab === 'components' ? 'active' : ''}`}
            onClick={() => setActiveTab('components')}
          >
            Components
          </button>
          <button
            className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
        </div>

        <div className="style-guide-content">
          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="controls-section">
              <h2>Brand Colors</h2>
              <div className="color-grid">
                <ColorControl
                  label="Primary"
                  value={theme.primary}
                  onChange={(val) => handleColorChange('primary', val)}
                />
                <ColorControl
                  label="Primary Dark"
                  value={theme.primaryDark}
                  onChange={(val) => handleColorChange('primaryDark', val)}
                />
                <ColorControl
                  label="Primary Light"
                  value={theme.primaryLight}
                  onChange={(val) => handleColorChange('primaryLight', val)}
                />
                <ColorControl
                  label="Secondary"
                  value={theme.secondary}
                  onChange={(val) => handleColorChange('secondary', val)}
                />
                <ColorControl
                  label="Accent"
                  value={theme.accent}
                  onChange={(val) => handleColorChange('accent', val)}
                />
              </div>

              <h2>Semantic Colors</h2>
              <div className="color-grid">
                <ColorControl
                  label="Success"
                  value={theme.success}
                  onChange={(val) => handleColorChange('success', val)}
                />
                <ColorControl
                  label="Warning"
                  value={theme.warning}
                  onChange={(val) => handleColorChange('warning', val)}
                />
                <ColorControl
                  label="Danger"
                  value={theme.danger}
                  onChange={(val) => handleColorChange('danger', val)}
                />
              </div>

              <h2>UI Colors</h2>
              <div className="color-grid">
                <ColorControl
                  label="Text Dark"
                  value={theme.textDark}
                  onChange={(val) => handleColorChange('textDark', val)}
                />
                <ColorControl
                  label="Text Light"
                  value={theme.textLight}
                  onChange={(val) => handleColorChange('textLight', val)}
                />
                <ColorControl
                  label="Background Light"
                  value={theme.bgLight}
                  onChange={(val) => handleColorChange('bgLight', val)}
                />
                <ColorControl
                  label="Background White"
                  value={theme.bgWhite}
                  onChange={(val) => handleColorChange('bgWhite', val)}
                />
                <ColorControl
                  label="Border"
                  value={theme.border}
                  onChange={(val) => handleColorChange('border', val)}
                />
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === 'typography' && (
            <div className="controls-section">
              <h2>Base Typography</h2>
              <div className="form-group">
                <label>Font Family</label>
                <input
                  type="text"
                  className="form-control"
                  value={theme.fontFamily}
                  onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Font Size</label>
                  <input
                    type="text"
                    className="form-control"
                    value={theme.fontSize}
                    onChange={(e) => updateTheme({ fontSize: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Line Height</label>
                  <input
                    type="text"
                    className="form-control"
                    value={theme.lineHeight}
                    onChange={(e) => updateTheme({ lineHeight: e.target.value })}
                  />
                </div>
              </div>

              <h2>Headings</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>H1 Size</label>
                  <input
                    type="text"
                    className="form-control"
                    value={theme.h1Size}
                    onChange={(e) => updateTheme({ h1Size: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>H2 Size</label>
                  <input
                    type="text"
                    className="form-control"
                    value={theme.h2Size}
                    onChange={(e) => updateTheme({ h2Size: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>H3 Size</label>
                  <input
                    type="text"
                    className="form-control"
                    value={theme.h3Size}
                    onChange={(e) => updateTheme({ h3Size: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>H4 Size</label>
                  <input
                    type="text"
                    className="form-control"
                    value={theme.h4Size}
                    onChange={(e) => updateTheme({ h4Size: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>H5 Size</label>
                  <input
                    type="text"
                    className="form-control"
                    value={theme.h5Size}
                    onChange={(e) => updateTheme({ h5Size: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>H6 Size</label>
                  <input
                    type="text"
                    className="form-control"
                    value={theme.h6Size}
                    onChange={(e) => updateTheme({ h6Size: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Heading Weight</label>
                  <input
                    type="text"
                    className="form-control"
                    value={theme.headingWeight}
                    onChange={(e) => updateTheme({ headingWeight: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Heading Line Height</label>
                  <input
                    type="text"
                    className="form-control"
                    value={theme.headingLineHeight}
                    onChange={(e) => updateTheme({ headingLineHeight: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Components Tab */}
          {activeTab === 'components' && (
            <div className="controls-section">
              <h2>Buttons</h2>
              <div className="form-group">
                <label>Button Padding</label>
                <input
                  type="text"
                  className="form-control"
                  value={theme.btnPadding}
                  onChange={(e) => updateTheme({ btnPadding: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Border Radius</label>
                  <input
                    type="text"
                    className="form-control"
                    value={theme.btnBorderRadius}
                    onChange={(e) => updateTheme({ btnBorderRadius: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Font Size</label>
                  <input
                    type="text"
                    className="form-control"
                    value={theme.btnFontSize}
                    onChange={(e) => updateTheme({ btnFontSize: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Font Weight</label>
                  <input
                    type="text"
                    className="form-control"
                    value={theme.btnFontWeight}
                    onChange={(e) => updateTheme({ btnFontWeight: e.target.value })}
                  />
                </div>
              </div>

              <h2>Cards</h2>
              <div className="form-group">
                <label>Card Padding</label>
                <input
                  type="text"
                  className="form-control"
                  value={theme.cardPadding}
                  onChange={(e) => updateTheme({ cardPadding: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Border Radius</label>
                  <input
                    type="text"
                    className="form-control"
                    value={theme.cardBorderRadius}
                    onChange={(e) => updateTheme({ cardBorderRadius: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Shadow</label>
                  <input
                    type="text"
                    className="form-control"
                    value={theme.cardShadow}
                    onChange={(e) => updateTheme({ cardShadow: e.target.value })}
                  />
                </div>
              </div>

              <h2>Spacing</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Base Spacing</label>
                  <input
                    type="text"
                    className="form-control"
                    value={theme.spacing}
                    onChange={(e) => updateTheme({ spacing: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Border Radius</label>
                  <input
                    type="text"
                    className="form-control"
                    value={theme.borderRadius}
                    onChange={(e) => updateTheme({ borderRadius: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="preview-section">
              <h2>Typography Preview</h2>
              <div className="card">
                <h1>Heading 1</h1>
                <h2>Heading 2</h2>
                <h3>Heading 3</h3>
                <h4>Heading 4</h4>
                <h5>Heading 5</h5>
                <h6>Heading 6</h6>
                <p>This is regular paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </div>

              <h2>Buttons Preview</h2>
              <div className="card">
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary">Primary Button</button>
                  <button className="btn btn-secondary">Secondary Button</button>
                  <button className="btn btn-danger">Danger Button</button>
                  <button className="btn btn-sm btn-primary">Small Button</button>
                </div>
              </div>

              <h2>Badges Preview</h2>
              <div className="card">
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-draft">Draft</span>
                  <span className="badge badge-published">Published</span>
                  <span className="badge badge-archived">Archived</span>
                </div>
              </div>

              <h2>Form Elements Preview</h2>
              <div className="card">
                <div className="form-group">
                  <label className="form-label">Text Input</label>
                  <input type="text" className="form-control" placeholder="Enter text..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Select Dropdown</label>
                  <select className="form-control">
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Textarea</label>
                  <textarea className="form-control" rows="3" placeholder="Enter description..."></textarea>
                </div>
              </div>

              <h2>Cards Preview</h2>
              <div className="card">
                <h3>Card Title</h3>
                <p>This is a card with some content inside. Cards use the theme's card padding, border radius, and shadow settings.</p>
                <button className="btn btn-primary">Action</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ColorControl = ({ label, value, onChange }) => {
  return (
    <div className="color-control">
      <label>{label}</label>
      <div className="color-input-group">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="color-picker"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="color-text"
        />
      </div>
      <div className="color-preview" style={{ backgroundColor: value }}></div>
    </div>
  );
};

export default StyleGuide;
