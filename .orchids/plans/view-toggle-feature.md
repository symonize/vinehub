# View Toggle Feature (Grid, Table, Map)

## Requirements
Add an icon button group to the left of the Sort button in the Portfolio page that allows users to switch between three view modes:
1. **Grid View** (current default) - Wine/brand cards in a grid layout
2. **Table View** - Wines/brands displayed in a data table format
3. **Map View** - Interactive SVG map showing winery locations by region

## Current State Analysis

### File Structure
- `src/pages/Wineries.jsx` - Main Portfolio page component with wines/brands tabs
- `src/pages/Wineries.css` - Styling for the portfolio page
- Controls bar at line 153-161 contains results count and Sort button

### Data Available
- **Wines**: name, type, region, winery info, bottleImage
- **Brands (Wineries)**: name, region, logo
- Regions available: Napa Valley, Sonoma County, Paso Robles, Santa Barbara, Willamette Valley, Finger Lakes, Columbia Valley, Walla Walla, Russian River Valley, Alexander Valley, Other

### Design Variables (from index.css)
- Primary color: `#722f37`
- Background cream: `#FAF6ED`
- Font heading: `moret`
- Font base: `Geist`

## Implementation Plan

### Phase 1: View Toggle Button Group

**1.1 Add state for view mode**
```jsx
const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table' | 'map'
```

**1.2 Create icon button group in controls bar**
Add to the left of the Sort button with three icon buttons:
- Grid icon (4 squares)
- Table/list icon (horizontal lines)
- Map pin icon

**1.3 Style the button group**
- Bordered button group matching the existing tab style
- Active state with wine color fill
- Subtle hover effects

### Phase 2: Table View Component

**2.1 Create table structure for wines**
Columns:
- Image (thumbnail)
- Name
- Producer/Winery
- Type
- Region

**2.2 Create table structure for brands**
Columns:
- Logo (thumbnail)
- Name
- Region
- Wine Count (if available)

**2.3 Style the table**
- Clean, minimal design matching the site aesthetic
- Hover rows
- Sortable headers (visual only for now)
- Responsive behavior

### Phase 3: Map View Component

**3.1 Create SVG map of US wine regions**
- Simplified US West Coast map focusing on California, Oregon, Washington
- Interactive region paths/areas
- Region boundaries styled to match site theme

**3.2 Map region coordinates**
Create coordinate data mapping regions to SVG positions:
```javascript
const regionCoordinates = {
  'Napa Valley': { x: 120, y: 180 },
  'Sonoma County': { x: 100, y: 170 },
  'Paso Robles': { x: 110, y: 280 },
  'Santa Barbara': { x: 130, y: 320 },
  'Willamette Valley': { x: 90, y: 80 },
  'Columbia Valley': { x: 150, y: 50 },
  'Walla Walla': { x: 170, y: 60 },
  'Russian River Valley': { x: 95, y: 175 },
  'Alexander Valley': { x: 105, y: 165 },
  'Finger Lakes': { x: 420, y: 120 },
};
```

**3.3 Add winery markers**
- Pin/dot markers for each winery location
- Cluster markers when multiple wineries in same region
- Click to show winery details in tooltip/popup

**3.4 Interactive features**
- Hover regions to highlight
- Click regions to filter the data
- Tooltips showing region name and count of wines/wineries
- Zoom controls (optional)

**3.5 Style the map**
- Cream background matching site
- Wine-colored region fills with varying opacity based on count
- Clean stroke lines for boundaries
- Elegant pin markers

### Phase 4: View Transitions

**4.1 Add smooth transitions between views**
- Fade out current view
- Fade in new view
- Match existing animation timing (0.4s ease-out)

### CSS Structure

```css
/* View Toggle Button Group */
.view-toggle-group {
  display: flex;
  border: 1px solid #722f37;
  border-radius: 4px;
  overflow: hidden;
}

.view-toggle-btn {
  padding: 8px 12px;
  background: white;
  border: none;
  border-right: 1px solid #722f37;
  cursor: pointer;
  transition: all 0.2s;
}

.view-toggle-btn:last-child {
  border-right: none;
}

.view-toggle-btn.active {
  background: #722f37;
  color: white;
}

.view-toggle-btn svg {
  width: 18px;
  height: 18px;
}

/* Table View */
.portfolio-table { ... }

/* Map View */
.portfolio-map { ... }
.map-region { ... }
.map-marker { ... }
```

## File Changes Required

1. **`src/pages/Wineries.jsx`**
   - Add `viewMode` state
   - Add view toggle button group JSX
   - Add conditional rendering for grid/table/map
   - Add TableView inline component
   - Add MapView inline component with SVG

2. **`src/pages/Wineries.css`**
   - Add `.view-toggle-group` styles
   - Add `.view-toggle-btn` styles
   - Add `.portfolio-table` styles
   - Add `.portfolio-map` styles
   - Add `.map-region` and `.map-marker` styles
   - Add transition animations

## Technical Considerations

1. **SVG Map**: Create a simplified inline SVG map rather than using external libraries to keep bundle size small and maintain full styling control

2. **Region Grouping**: For map view, group wines/brands by region to place markers appropriately

3. **Responsive Design**: 
   - Table should be horizontally scrollable on mobile
   - Map should scale proportionally
   - Button group should remain visible

4. **Performance**: Map markers should only render for visible/filtered data

## Visual Design Notes

- Button group should match the existing tab toggle style (bordered, wine color active state)
- Table should feel lightweight, not heavy enterprise-style
- Map should be elegant and artistic, not utilitarian
- All views maintain the wine-themed color palette
