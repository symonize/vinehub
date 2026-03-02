import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from 'react-query';
import { winesAPI, wineriesAPI, vintagesAPI } from '../utils/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import createGlobe from 'cobe';
import './TradeTools.css';

// Lat/lng for wine regions
const regionLatLng = {
  'Napa Valley': { lat: 38.5025, lng: -122.2654 },
  'Sonoma County': { lat: 38.4810, lng: -122.7467 },
  'Paso Robles': { lat: 35.6266, lng: -120.6910 },
  'Santa Barbara': { lat: 34.7136, lng: -119.9858 },
  'Willamette Valley': { lat: 45.0790, lng: -123.0980 },
  'Finger Lakes': { lat: 42.6681, lng: -76.7919 },
  'Columbia Valley': { lat: 46.2400, lng: -119.7300 },
  'Walla Walla': { lat: 46.0646, lng: -118.3430 },
  'Russian River Valley': { lat: 38.5120, lng: -122.8960 },
  'Alexander Valley': { lat: 38.7156, lng: -122.8477 },
  'Other': { lat: 39.8283, lng: -98.5795 },
};

const TradeMapView = ({ items, activeTab, getWineTypeColor, onWineClick }) => {
  const canvasRef = useRef(null);
  const globeRef = useRef(null);
  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(0);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const phiRef = useRef(0);

  // Group items by region
  const regionGroups = {};
  items.forEach((item) => {
    const region = item.region || 'Other';
    if (!regionGroups[region]) regionGroups[region] = [];
    regionGroups[region].push(item);
  });

  const maxCount = Math.max(...Object.values(regionGroups).map(g => g.length), 1);

  // Build markers array for cobe
  const markers = Object.entries(regionLatLng)
    .filter(([region]) => regionGroups[region]?.length > 0)
    .map(([region, coords]) => {
      const count = regionGroups[region].length;
      const size = 0.04 + (count / maxCount) * 0.12;
      return { location: [coords.lat, coords.lng], size };
    });

  useEffect(() => {
    if (!canvasRef.current) return;

    let phi = 1.8; // Start facing US west coast
    let width = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 1.8,
      theta: 0.35,
      dark: 0,
      diffuse: 1.8,
      mapSamples: 24000,
      mapBrightness: 3.5,
      baseColor: [0.98, 0.96, 0.93],      // cream (#FAF6ED)
      markerColor: [0.447, 0.184, 0.216],  // wine (#722f37)
      glowColor: [0.92, 0.88, 0.82],       // warm glow
      markers,
      onRender: (state) => {
        if (!pointerInteracting.current) {
          phi += 0.002;
        }
        state.phi = phi + pointerInteractionMovement.current;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    globeRef.current = globe;

    // Fade in
    if (canvasRef.current) {
      canvasRef.current.style.opacity = '0';
      requestAnimationFrame(() => {
        if (canvasRef.current) {
          canvasRef.current.style.opacity = '1';
        }
      });
    }

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [items]);

  const onPointerDown = useCallback((e) => {
    pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
  }, []);

  const onPointerUp = useCallback(() => {
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
  }, []);

  const onPointerOut = useCallback(() => {
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
  }, []);

  const onMouseMove = useCallback((e) => {
    if (pointerInteracting.current !== null) {
      const delta = e.clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta / 200;
    }
  }, []);

  const onTouchMove = useCallback((e) => {
    if (pointerInteracting.current !== null && e.touches[0]) {
      const delta = e.touches[0].clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta / 200;
    }
  }, []);

  // Region list sorted by count
  const sortedRegions = Object.entries(regionGroups)
    .sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="trade-globe-view">
      <div className="trade-globe-container">
        <canvas
          ref={canvasRef}
          className="trade-globe-canvas"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerOut={onPointerOut}
          onMouseMove={onMouseMove}
          onTouchMove={onTouchMove}
        />
        <div className="trade-globe-overlay">
          <h3 className="trade-globe-title">Wine Regions</h3>
          <p className="trade-globe-subtitle">
            {items.length} {activeTab === 'wines' ? 'wines' : 'brands'} across {sortedRegions.length} regions
          </p>
        </div>
      </div>

      {/* Region cards */}
      <div className="trade-globe-regions">
        {sortedRegions.map(([region, regionItems]) => (
          <button
            key={region}
            className={`trade-globe-region-card${selectedRegion === region ? ' active' : ''}`}
            onClick={() => setSelectedRegion(selectedRegion === region ? null : region)}
          >
            <span className="trade-globe-region-dot" style={{
              opacity: 0.4 + (regionItems.length / maxCount) * 0.6,
              transform: `scale(${0.6 + (regionItems.length / maxCount) * 0.4})`
            }} />
            <span className="trade-globe-region-name">{region}</span>
            <span className="trade-globe-region-count">{regionItems.length}</span>
          </button>
        ))}
      </div>

      {/* Region detail panel */}
      {selectedRegion && regionGroups[selectedRegion] && (
        <div className="trade-map-detail-panel">
          <div className="trade-map-detail-header">
            <h3>{selectedRegion}</h3>
            <span className="trade-map-detail-count">
              {regionGroups[selectedRegion].length} {activeTab === 'wines' ? 'wine' : 'brand'}{regionGroups[selectedRegion].length !== 1 ? 's' : ''}
            </span>
            <button className="trade-map-detail-close" onClick={() => setSelectedRegion(null)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="trade-map-detail-list">
            {regionGroups[selectedRegion].map((item) => (
              <div
                key={item._id}
                className="trade-map-detail-item"
                onClick={() => {
                  if (activeTab === 'wines') {
                    onWineClick(item);
                  } else {
                    window.location.href = `/wineries/${item._id}`;
                  }
                }}
              >
                <div className="trade-map-detail-thumb">
                  {activeTab === 'wines' ? (
                    item.bottleImage?.url ? (
                      <img src={item.bottleImage.url} alt={item.name} />
                    ) : (
                      <svg width="16" height="32" viewBox="0 0 100 250" fill="none">
                        <path d="M50 10 L35 60 L25 240 L75 240 L65 60 Z" fill={getWineTypeColor(item.type)}/>
                      </svg>
                    )
                  ) : (
                    item.logo?.url ? (
                      <img src={item.logo.url} alt={item.name} />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 120 120" fill="none">
                        <circle cx="60" cy="60" r="50" stroke="#722f37" strokeWidth="4" fill="none"/>
                        <text x="60" y="75" textAnchor="middle" fill="#722f37" fontSize="50" fontFamily="moret">W</text>
                      </svg>
                    )
                  )}
                </div>
                <div className="trade-map-detail-info">
                  <span className="trade-map-detail-name">{item.name}</span>
                  {activeTab === 'wines' && item.type && (
                    <span className="trade-map-detail-type" style={{ color: getWineTypeColor(item.type) }}>
                      {item.type}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TradeTools = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [generatorAnimationKey, setGeneratorAnimationKey] = useState(0);
  const [selectedWine, setSelectedWine] = useState(null);
  const [selectedVintage, setSelectedVintage] = useState(null);
  const [activeWinesTab, setActiveWinesTab] = useState('wines');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [browseSearch, setBrowseSearch] = useState('');
  const [scoreMin, setScoreMin] = useState(85);
  const [scoreMax, setScoreMax] = useState(100);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name-asc');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  // Generator type selector
  const [activeGenerator, setActiveGenerator] = useState('sales-sheet');
  const [toolSelectorOpen, setToolSelectorOpen] = useState(false);
  const toolSelectorRef = useRef(null);

  // Sales Sheet Generator State
  const [selectedWinesForSheet, setSelectedWinesForSheet] = useState([]);
  const [wineNotes, setWineNotes] = useState({});
  const [sheetTitle, setSheetTitle] = useState('Custom Sales Sheet Title...');
  const [sheetSettings, setSheetSettings] = useState({
    grapes: true,
    region: true,
    caseSize: true,
    ratings: true
  });
  const [wineSearchQuery, setWineSearchQuery] = useState('');
  const [isWineDropdownOpen, setIsWineDropdownOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareForm, setShareForm] = useState({
    senderName: '',
    senderEmail: '',
    recipientName: '',
    recipientEmail: '',
    personalNote: ''
  });

  // Shelf Talker Generator State
  const [selectedWineForCard, setSelectedWineForCard] = useState(null);
  const [cardWineSearchQuery, setCardWineSearchQuery] = useState('');
  const [isCardWineDropdownOpen, setIsCardWineDropdownOpen] = useState(false);
  const [isGeneratingCardPDF, setIsGeneratingCardPDF] = useState(false);
  const [shelfTalkerAnimState, setShelfTalkerAnimState] = useState('idle'); // 'idle' | 'in' | 'out'

  const selectWineForCard = (wine) => {
    if (selectedWineForCard) {
      // animate out first, then swap in
      setShelfTalkerAnimState('out');
      setTimeout(() => {
        setSelectedWineForCard(wine);
        setShelfTalkerAnimState('in');
        setTimeout(() => setShelfTalkerAnimState('idle'), 400);
      }, 280);
    } else {
      setSelectedWineForCard(wine);
      setShelfTalkerAnimState('in');
      setTimeout(() => setShelfTalkerAnimState('idle'), 400);
    }
  };

  const removeWineForCard = () => {
    setShelfTalkerAnimState('out');
    setTimeout(() => {
      setSelectedWineForCard(null);
      setShelfTalkerAnimState('idle');
    }, 280);
  };

  // Refs for PDF previews
  const pdfPreviewRef = useRef(null);
  const tastingCardRef = useRef(null);
  const wineEntriesRef = useRef([]);

  // Page layout: array of arrays of wine indices (computed after render)
  const [pdfPages, setPdfPages] = useState([]);

  useEffect(() => {
    // A4 at 595px wide: page height = 595 * (297/210) ≈ 841.4px
    // Reserve space for header+title on first page (~100px) and margin padding (48px total)
    const PAGE_H = Math.round(595 * 297 / 210);
    const HEADER_H = 100; // approx header + title height on first page
    const PADDING = 48;   // .pdf-paper padding (1.5rem * 2 = 48px)
    const firstPageContent = PAGE_H - PADDING - HEADER_H;
    const otherPageContent = PAGE_H - PADDING;

    if (selectedWinesForSheet.length === 0) {
      setPdfPages([]);
      return;
    }

    // Build pages using measured heights
    const pages = [];
    let currentPage = [];
    let remaining = firstPageContent;

    selectedWinesForSheet.forEach((wine, i) => {
      const el = wineEntriesRef.current[i];
      const h = el ? el.getBoundingClientRect().height : 120;
      if (currentPage.length > 0 && h > remaining) {
        pages.push(currentPage);
        currentPage = [i];
        remaining = otherPageContent - h;
      } else {
        currentPage.push(i);
        remaining -= h;
      }
    });
    if (currentPage.length > 0) pages.push(currentPage);
    setPdfPages(pages);
  }, [selectedWinesForSheet, sheetSettings]);

  // Collapse state for filter sections
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    region: true,
    market: true,
    award: true,
    score: true
  });

  // Fetch wines for Browse tab
  const { data: winesData, isLoading: winesLoading } = useQuery(
    ['trade-wines', selectedTypes, selectedRegions, selectedMarkets, browseSearch],
    () => {
      const params = {
        limit: 100
      };

      if (browseSearch) {
        params.search = browseSearch;
      }

      if (selectedTypes.length > 0) {
        params.type = selectedTypes[0];
      }

      if (selectedRegions.length > 0) {
        params.region = selectedRegions[0];
      }

      if (selectedMarkets.length > 0) {
        params.market = selectedMarkets[0];
      }

      return winesAPI.getAll(params);
    },
    {
      keepPreviousData: true,
      enabled: activeTab === 'browse'
    }
  );

  // Fetch brands (wineries) for Browse tab
  const { data: brandsData, isLoading: brandsLoading } = useQuery(
    ['trade-brands', browseSearch],
    () => wineriesAPI.getAll({ limit: 100, ...(browseSearch ? { search: browseSearch } : {}) }),
    {
      keepPreviousData: true,
      enabled: activeTab === 'browse' && activeWinesTab === 'brands'
    }
  );

  // Fetch all wines for Generators tab
  const { data: allWinesData } = useQuery(
    'all-wines',
    () => winesAPI.getAll({ limit: 200 }),
    {
      enabled: activeTab === 'generators'
    }
  );

  const wines = activeTab === 'browse' ? (winesData?.data?.data || []) : (allWinesData?.data?.data || []);
  const brands = brandsData?.data?.data || [];

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleRegion = (region) => {
    setSelectedRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  };

  const toggleMarket = (market) => {
    setSelectedMarkets(prev =>
      prev.includes(market) ? prev.filter(m => m !== market) : [...prev, market]
    );
  };

  const regions = [
    'Napa Valley',
    'Sonoma County',
    'Paso Robles',
    'Santa Barbara',
    'Willamette Valley',
    'Finger Lakes',
    'Columbia Valley',
    'Walla Walla',
    'Russian River Valley',
    'Alexander Valley',
    'Other'
  ];
  const markets = ['On-Premise', 'Off-Premise', 'E-Commerce', 'Export'];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!sortOpen) return;
    function handleClick(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sortOpen]);

  const SORT_OPTIONS = [
    { value: 'name-asc',  label: 'Name A–Z' },
    { value: 'name-desc', label: 'Name Z–A' },
    { value: 'type',      label: 'Type' },
    { value: 'region',    label: 'Region' },
    { value: 'producer',  label: 'Producer' },
  ];

  function applySortWines(list) {
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'name-desc': return (b.name || '').localeCompare(a.name || '');
        case 'type':      return (a.type || '').localeCompare(b.type || '');
        case 'region':    return (a.region || '').localeCompare(b.region || '');
        case 'producer':  return (a.winery?.name || '').localeCompare(b.winery?.name || '');
        default:          return (a.name || '').localeCompare(b.name || '');
      }
    });
  }

  function applySortBrands(list) {
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'name-desc': return (b.name || '').localeCompare(a.name || '');
        case 'region':    return (a.region || '').localeCompare(b.region || '');
        default:          return (a.name || '').localeCompare(b.name || '');
      }
    });
  }

  const sortedWines = applySortWines(wines);
  const sortedBrands = applySortBrands(brands);

  const { data: vintagesData } = useQuery(
    ['vintages', selectedWine?._id],
    () => vintagesAPI.getByWine(selectedWine._id),
    { enabled: !!selectedWine }
  );
  const vintages = vintagesData?.data?.data || [];

  const handleWineClick = (wine) => {
    setSelectedWine(wine);
    setSelectedVintage(null);
  };

  const closeSheet = () => {
    setSelectedWine(null);
    setSelectedVintage(null);
  };

  const handleGeneratePDF = async () => {
    if (!pdfPreviewRef.current || selectedWinesForSheet.length === 0) {
      alert('Please add at least one wine to generate a sales sheet.');
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - (2 * margin);
      const contentHeight = pageHeight - (2 * margin);

      // Add class to hide empty note areas during capture
      pdfPreviewRef.current.classList.add('pdf-generating');

      // Capture each visible .pdf-paper page directly — one canvas per PDF page
      const paperPages = pdfPreviewRef.current.querySelectorAll('.pdf-paper');

      for (let i = 0; i < paperPages.length; i++) {
        if (i > 0) pdf.addPage();

        const canvas = await html2canvas(paperPages[i], {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: paperPages[i].scrollWidth,
          windowHeight: paperPages[i].scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        // Scale to fill the content area, preserving aspect ratio
        const canvasAspect = canvas.height / canvas.width;
        const imgHeightMm = contentWidth * canvasAspect;
        const fitsOnPage = imgHeightMm <= contentHeight;

        pdf.addImage(
          imgData, 'PNG',
          margin, margin,
          contentWidth,
          fitsOnPage ? imgHeightMm : contentHeight
        );
      }

      // Generate filename from title or use default
      const filename = sheetTitle && sheetTitle !== 'Custom Sales Sheet Title...'
        ? `${sheetTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
        : 'sales_sheet.pdf';

      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      pdfPreviewRef.current?.classList.remove('pdf-generating');
      setIsGeneratingPDF(false);
    }
  };

  const handleShareClick = () => {
    if (selectedWinesForSheet.length === 0) {
      alert('Please add at least one wine to share a sales sheet.');
      return;
    }
    setIsShareDialogOpen(true);
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!shareForm.senderName || !shareForm.senderEmail || !shareForm.recipientName || !shareForm.recipientEmail) {
      alert('Please fill in all required fields.');
      return;
    }

    // Here you would typically send this to your backend API
    // For now, we'll just show a success message
    console.log('Sharing sales sheet:', shareForm);
    alert('Sales sheet shared successfully!');

    // Reset form and close dialog
    setShareForm({
      senderName: '',
      senderEmail: '',
      recipientName: '',
      recipientEmail: '',
      personalNote: ''
    });
    setIsShareDialogOpen(false);
  };

  const handleShareFormChange = (field, value) => {
    setShareForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateTastingCardPDF = async () => {
    if (!tastingCardRef.current || !selectedWineForCard) {
      alert('Please select a wine to generate a shelf talker.');
      return;
    }

    setIsGeneratingCardPDF(true);

    try {
      // Capture the single card preview
      const canvas = await html2canvas(tastingCardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#faf8f3'
      });

      const imgData = canvas.toDataURL('image/png');

      // A4 portrait: 210mm x 297mm
      // Layout: 2 columns x 3 rows = 6 cards, preserving card's natural aspect ratio
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;

      const cols = 2;
      const rows = 3;
      const margin = 8;
      const gutterX = 5;
      const gutterY = 5;

      // Derive card height from the actual captured pixel ratio — no stretching
      const cardWidth = (pageWidth - margin * 2 - gutterX * (cols - 1)) / cols;
      const cardHeight = cardWidth * (canvas.height / canvas.width);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = margin + col * (cardWidth + gutterX);
          const y = margin + row * (cardHeight + gutterY);
          pdf.addImage(imgData, 'PNG', x, y, cardWidth, cardHeight);
        }
      }

      const filename = selectedWineForCard.name
        ? `tasting_cards_${selectedWineForCard.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
        : 'tasting_cards.pdf';

      pdf.save(filename);
    } catch (error) {
      console.error('Error generating shelf talker PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingCardPDF(false);
    }
  };

  return (
    <div className="trade-tools-page">
      {/* Trade Tools Header */}
      <div className="trade-tools-header">
        <div className="container">
          <div className="trade-tools-header-content">
            <h1>Trade Tools</h1>
            <div
              className={`tool-selector${toolSelectorOpen ? ' is-open' : ''}`}
              ref={toolSelectorRef}
              onMouseLeave={() => setToolSelectorOpen(false)}
            >
              <button
                className="tool-selector-trigger"
                onMouseEnter={() => setToolSelectorOpen(true)}
                onClick={() => setToolSelectorOpen(v => !v)}
              >
                <span className="tool-selector-label">
                  {activeTab === 'browse'
                    ? 'Browse'
                    : activeGenerator === 'sales-sheet'
                      ? 'Sales Sheet Generator'
                      : 'Shelf Talker Generator'}
                </span>
                <svg className="tool-selector-chevron" width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="tool-selector-menu">
                {[
                  { label: 'Browse', tab: 'browse', gen: null },
                  { label: 'Sales Sheet Generator', tab: 'generators', gen: 'sales-sheet' },
                  { label: 'Shelf Talker Generator', tab: 'generators', gen: 'shelf-talker' },
                ].map((item, i) => {
                  const isActive = item.tab === 'browse'
                    ? activeTab === 'browse'
                    : activeTab === 'generators' && activeGenerator === item.gen;
                  return (
                    <button
                      key={item.label}
                      className={`tool-selector-item${isActive ? ' active' : ''}`}
                      style={{ '--i': i }}
                      onClick={() => {
                        setActiveTab(item.tab);
                        if (item.gen) { setActiveGenerator(item.gen); setGeneratorAnimationKey(k => k + 1); }
                        setToolSelectorOpen(false);
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'browse' ? (
        <div className="trade-tools-content">
          <div className="container">
              {/* Secondary Tabs + Search Row */}
                <div className="trade-tools-tab-row">
                  <div className="trade-tools-secondary-tabs">
                    <button
                      className={activeWinesTab === 'wines' ? 'tab active' : 'tab'}
                      onClick={() => setActiveWinesTab('wines')}
                    >
                      Wines
                    </button>
                    <button
                      className={activeWinesTab === 'brands' ? 'tab active' : 'tab'}
                      onClick={() => setActiveWinesTab('brands')}
                    >
                      Brands
                    </button>
                  </div>
                  <div className={`trade-header-search-wrapper${searchOpen ? ' search-expanded' : ''}`}>
                    <button
                      className="search-toggle-btn"
                      onClick={() => setSearchOpen(true)}
                      aria-label="Open search"
                    >
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                        <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
                        <line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <svg className="search-bar-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
                      <line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <input
                      type="text"
                      className="search-bar-input"
                      placeholder={activeWinesTab === 'wines' ? 'Search wines...' : 'Search brands...'}
                      value={browseSearch}
                      onChange={e => setBrowseSearch(e.target.value)}
                    />
                    <button className="search-bar-clear" onClick={() => { setBrowseSearch(''); setSearchOpen(false); }} aria-label="Close search">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

              {/* Controls Bar */}
                <div className="trade-tools-controls-bar">
                  <div className="results-count">
                    Showing <span className="count-badge">
                      {activeWinesTab === 'wines' ? sortedWines.length : sortedBrands.length}
                    </span>
                  </div>
                  <div className="controls-right">
                  <div className="view-toggle-group">
                    <button
                      className={`view-toggle-btn${viewMode === 'grid' ? ' active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      title="Grid view"
                    >
                      {viewMode === 'grid' ? (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                          <rect x="1" y="1" width="7" height="7" rx="1"/>
                          <rect x="10" y="1" width="7" height="7" rx="1"/>
                          <rect x="1" y="10" width="7" height="7" rx="1"/>
                          <rect x="10" y="10" width="7" height="7" rx="1"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <rect x="1" y="1" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                          <rect x="10" y="1" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                          <rect x="1" y="10" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                          <rect x="10" y="10" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                      )}
                    </button>
                    <button
                      className={`view-toggle-btn${viewMode === 'table' ? ' active' : ''}`}
                      onClick={() => setViewMode('table')}
                      title="Table view"
                    >
                      {viewMode === 'table' ? (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                          <rect x="1" y="1.25" width="16" height="2.5" rx="1.25"/>
                          <rect x="1" y="5.25" width="16" height="2.5" rx="1.25"/>
                          <rect x="1" y="9.25" width="16" height="2.5" rx="1.25"/>
                          <rect x="1" y="13.25" width="16" height="2.5" rx="1.25"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <line x1="1" y1="3" x2="17" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="1" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="1" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="1" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  <div ref={sortRef} style={{ position: 'relative' }}>
                    <button
                      className={`sort-button${sortOpen ? ' sort-open' : ''}`}
                      onClick={() => setSortOpen(o => !o)}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <line x1="1" y1="3" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="5" y1="11" x2="9" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      Sort
                    </button>
                    {sortOpen && (
                      <div className="sort-dropdown">
                        {SORT_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            className={`sort-option${sortBy === opt.value ? ' active' : ''}`}
                            onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="filter-sheet-btn" onClick={() => setFilterSheetOpen(true)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <line x1="6" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Filters
                    {(selectedTypes.length + selectedRegions.length + selectedMarkets.length) > 0 && (
                      <span className="filter-sheet-btn-badge">
                        {selectedTypes.length + selectedRegions.length + selectedMarkets.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

            <div className="trade-tools-layout">
              {/* Sidebar Filters */}
              <aside className="trade-tools-sidebar">
                <h3>Filters</h3>

                <div className="filter-group">
                  <h4 className="filter-header" onClick={() => toggleSection('type')}>
                    <span>Type</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className={expandedSections.type ? 'chevron expanded' : 'chevron'}
                    >
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </h4>
                  {expandedSections.type && (
                    <div className="filter-pills">
                      <button
                        className={selectedTypes.includes('red') ? 'pill active' : 'pill'}
                        onClick={() => toggleType('red')}
                      >
                        Red
                      </button>
                      <button
                        className={selectedTypes.includes('white') ? 'pill active' : 'pill'}
                        onClick={() => toggleType('white')}
                      >
                        White
                      </button>
                      <button
                        className={selectedTypes.includes('sparkling') ? 'pill active' : 'pill'}
                        onClick={() => toggleType('sparkling')}
                      >
                        Sparkling
                      </button>
                      <button
                        className={selectedTypes.includes('rosé') ? 'pill active' : 'pill'}
                        onClick={() => toggleType('rosé')}
                      >
                        Rosé
                      </button>
                      <button
                        className={selectedTypes.includes('dessert') ? 'pill active' : 'pill'}
                        onClick={() => toggleType('dessert')}
                      >
                        Dessert
                      </button>
                    </div>
                  )}
                </div>

                <div className="filter-group">
                  <h4 className="filter-header" onClick={() => toggleSection('region')}>
                    <span>Region</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className={expandedSections.region ? 'chevron expanded' : 'chevron'}
                    >
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </h4>
                  {expandedSections.region && (
                    <div className="filter-checkboxes">
                      {regions.map((region) => (
                        <label key={region} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedRegions.includes(region)}
                            onChange={() => toggleRegion(region)}
                          />
                          <span className="checkbox-text">{region}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="filter-group">
                  <h4 className="filter-header" onClick={() => toggleSection('market')}>
                    <span>Market</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className={expandedSections.market ? 'chevron expanded' : 'chevron'}
                    >
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </h4>
                  {expandedSections.market && (
                    <div className="filter-checkboxes">
                      {markets.map((market) => (
                        <label key={market} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedMarkets.includes(market)}
                            onChange={() => toggleMarket(market)}
                          />
                          <span className="checkbox-text">{market}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="filter-group">
                  <h4 className="filter-header" onClick={() => toggleSection('award')}>
                    <span>Award</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className={expandedSections.award ? 'chevron expanded' : 'chevron'}
                    >
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </h4>
                  {expandedSections.award && (
                    <div className="filter-content">
                      {/* Add award filters here if needed */}
                    </div>
                  )}
                </div>

                <div className="filter-group">
                  <h4 className="filter-header" onClick={() => toggleSection('score')}>
                    <span>Score</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className={expandedSections.score ? 'chevron expanded' : 'chevron'}
                    >
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </h4>
                    {expandedSections.score && (
                      <div className="score-slider">
                        <div className="score-range-track-wrapper">
                          <div
                            className="score-range-fill"
                            style={{
                              left: `${((scoreMin - 80) / 20) * 100}%`,
                              right: `${100 - ((scoreMax - 80) / 20) * 100}%`
                            }}
                          />
                          <input
                            type="range"
                            className="score-range-input"
                            min="80" max="100"
                            value={scoreMin}
                            onChange={e => {
                              const v = Math.min(Number(e.target.value), scoreMax - 1);
                              setScoreMin(v);
                            }}
                          />
                          <input
                            type="range"
                            className="score-range-input"
                            min="80" max="100"
                            value={scoreMax}
                            onChange={e => {
                              const v = Math.max(Number(e.target.value), scoreMin + 1);
                              setScoreMax(v);
                            }}
                          />
                        </div>
                        <div className="score-labels">
                          <span>{scoreMin}</span>
                          <span>{scoreMax}</span>
                        </div>
                      </div>
                    )}
                </div>
              </aside>

                {/* Main Content */}
                <div className="trade-tools-main">
                  {(activeWinesTab === 'wines' ? winesLoading : brandsLoading) ? (
                    <div className="loading">
                      <div className="spinner"></div>
                    </div>
                  ) : viewMode === 'grid' ? (
                    /* Grid View */
                    activeWinesTab === 'wines' ? (
                      sortedWines.length === 0 ? (
                        <div className="empty-state"><p>No wines found</p></div>
                      ) : (
                            <div className="trade-wines-grid">
                              {sortedWines.map((wine) => (
                                <div
                                  key={wine._id}
                                  className="trade-wine-card"
                                  onClick={() => handleWineClick(wine)}
                                >
                                  <div className="trade-wine-producer">
                                    {wine.winery?.name || 'L\'ANTICA QUERCIA'}
                                  </div>
                                  <h3 className="trade-wine-name">{wine.name}</h3>
                                  <div className="trade-wine-image">
                                    {wine.bottleImage?.url ? (
                                      <img src={wine.bottleImage.url} alt={wine.name} />
                                    ) : (
                                      <div className="trade-wine-placeholder">
                                        <svg width="60" height="150" viewBox="0 0 100 250" fill="none">
                                          <path d="M50 10 L35 60 L25 240 L75 240 L65 60 Z" fill={getWineTypeColor(wine.type)}/>
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                      )
                    ) : (
                      sortedBrands.length === 0 ? (
                        <div className="empty-state"><p>No brands found</p></div>
                      ) : (
                            <div className="trade-wines-grid">
                              {sortedBrands.map((brand) => (
                                  <div
                                    key={brand._id}
                                    className="trade-wine-card brand-card"
                                    onClick={() => window.location.href = `/wineries/${brand._id}`}
                                  >
                                    <div 
                                      className="brand-card-bg" 
                                      style={{
                                        backgroundImage: brand.featuredImage?.url ? `url(${brand.featuredImage.url})` : 'none'
                                      }}
                                    />
                                    <div className="trade-wine-card-overlay"></div>
                                  <div className="trade-wine-producer">
                                    {brand.region || brand.country || '—'}
                                  </div>
                                  <h3 className="trade-wine-name">{brand.name}</h3>
                                  <div className="trade-wine-image">
                                    {brand.logo?.url ? (
                                      <img src={brand.logo.url} alt={brand.name} className="trade-wine-card-logo" />
                                    ) : (
                                      <div className="trade-wine-placeholder">
                                        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                                          <circle cx="60" cy="60" r="50" stroke="white" strokeWidth="2" fill="none"/>
                                          <text x="60" y="70" textAnchor="middle" fill="white" fontSize="40" fontFamily="moret">W</text>
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                      )
                    )
                  ) : viewMode === 'table' ? (
                    /* Table View */
                    activeWinesTab === 'wines' ? (
                      sortedWines.length === 0 ? (
                        <div className="empty-state"><p>No wines found</p></div>
                      ) : (
                        <div className="trade-table-wrapper">
                          <table className="trade-table">
                            <thead>
                              <tr>
                                <th></th>
                                <th>Name</th>
                                <th>Producer</th>
                                <th>Type</th>
                                <th>Region</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sortedWines.map((wine) => (
                                <tr key={wine._id} onClick={() => handleWineClick(wine)}>
                                  <td className="table-thumb">
                                    {wine.bottleImage?.url ? (
                                      <img src={wine.bottleImage.url} alt={wine.name} />
                                    ) : (
                                      <div className="table-thumb-placeholder">
                                        <svg width="20" height="40" viewBox="0 0 100 250" fill="none">
                                          <path d="M50 10 L35 60 L25 240 L75 240 L65 60 Z" fill={getWineTypeColor(wine.type)}/>
                                        </svg>
                                      </div>
                                    )}
                                  </td>
                                  <td className="table-name">{wine.name}</td>
                                  <td>{wine.winery?.name || '—'}</td>
                                  <td>
                                    <span className="table-type-badge" style={{ background: getWineTypeColor(wine.type) }}>
                                      {wine.type}
                                    </span>
                                  </td>
                                  <td>{wine.region || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    ) : (
                      sortedBrands.length === 0 ? (
                        <div className="empty-state"><p>No brands found</p></div>
                      ) : (
                        <div className="trade-table-wrapper">
                          <table className="trade-table">
                            <thead>
                              <tr>
                                <th></th>
                                <th>Name</th>
                                <th>Region</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sortedBrands.map((brand) => (
                                <tr key={brand._id} onClick={() => window.location.href = `/wineries/${brand._id}`}>
                                  <td className="table-thumb">
                                    {brand.logo?.url ? (
                                      <img src={brand.logo.url} alt={brand.name} />
                                    ) : (
                                      <div className="table-thumb-placeholder">
                                        <svg width="30" height="30" viewBox="0 0 120 120" fill="none">
                                          <circle cx="60" cy="60" r="50" stroke="#722f37" strokeWidth="4" fill="none"/>
                                          <text x="60" y="75" textAnchor="middle" fill="#722f37" fontSize="50" fontFamily="moret">W</text>
                                        </svg>
                                      </div>
                                    )}
                                  </td>
                                  <td className="table-name">{brand.name}</td>
                                  <td>{brand.region || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    )
                  ) : (
                    /* Map View */
                    <TradeMapView
                      items={activeWinesTab === 'wines' ? sortedWines : sortedBrands}
                      activeTab={activeWinesTab}
                      getWineTypeColor={getWineTypeColor}
                      onWineClick={handleWineClick}
                    />
                  )}
                </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="trade-tools-content">
          <div className="container">

              <div className="generator-layout" key={generatorAnimationKey}>
                {activeGenerator === 'shelf-talker' ? (
                  <>
                    {/* Shelf Talker - Left Controls */}
                    <div className="generator-controls generator-animate generator-animate-1">
                      <h2 className="generator-subhead">Create A Shelf Talker</h2>

                      {/* Single Wine Selector */}
                      <div className="wine-selector">
                        <label htmlFor="card-wine-search">Select Wine</label>
                        <div className="wine-combobox">
                          <input
                            id="card-wine-search"
                            type="text"
                            className="wine-search-input"
                            placeholder="Search wines..."
                            value={cardWineSearchQuery}
                            onChange={(e) => setCardWineSearchQuery(e.target.value)}
                            onFocus={() => setIsCardWineDropdownOpen(true)}
                          />
                          {isCardWineDropdownOpen && (
                            <>
                              <div
                                className="combobox-backdrop"
                                onClick={() => { setIsCardWineDropdownOpen(false); setCardWineSearchQuery(''); }}
                              />
                              <div className="wine-dropdown">
                                {wines
                                  .filter(wine => {
                                    const s = cardWineSearchQuery.toLowerCase();
                                    return wine.name.toLowerCase().includes(s) || (wine.winery?.name || '').toLowerCase().includes(s);
                                  })
                                  .slice(0, 50)
                                  .map((wine) => (
                                    <div
                                      key={wine._id}
                                      className="wine-dropdown-item"
                                      onClick={() => {
                                        selectWineForCard(wine);
                                          setCardWineSearchQuery('');
                                          setIsCardWineDropdownOpen(false);
                                      }}
                                    >
                                      <div className="wine-dropdown-name">{wine.name}</div>
                                      <div className="wine-dropdown-winery">{wine.winery?.name || 'Unknown'}</div>
                                    </div>
                                  ))}
                                {wines.filter(wine => {
                                  const s = cardWineSearchQuery.toLowerCase();
                                  return wine.name.toLowerCase().includes(s) || (wine.winery?.name || '').toLowerCase().includes(s);
                                }).length === 0 && (
                                  <div className="wine-dropdown-empty">No wines found</div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Selected Wine Pill */}
                      {selectedWineForCard && (
                        <div className="added-wines-section">
                          <div className="added-wines-label">SELECTED WINE</div>
                          <div className="wine-pills">
                              <div className="wine-pill">
                                <div className="wine-pill-text">
                                  <span className="wine-pill-name">{selectedWineForCard.name}</span>
                                  <span className="wine-pill-winery">{selectedWineForCard.winery?.name}</span>
                                </div>
                                <button className="remove-wine" onClick={removeWineForCard}>×</button>
                              </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="generator-actions">
                        <div className="action-divider"></div>
                        <button
                          className="btn-generate"
                          onClick={handleGenerateTastingCardPDF}
                          disabled={isGeneratingCardPDF || !selectedWineForCard}
                        >
                          {isGeneratingCardPDF ? 'Generating...' : 'Generate Shelf Talker'}
                        </button>
                      </div>
                    </div>

                    {/* Shelf Talker - Preview */}
                    <div className="pdf-preview generator-animate generator-animate-2">
                        <div className={`shelf-talker-paper${shelfTalkerAnimState === 'in' ? ' st-anim-in' : shelfTalkerAnimState === 'out' ? ' st-anim-out' : ''}`} ref={tastingCardRef}>
                        {selectedWineForCard ? (
                          <>
                            {/* Left: Bottle Image */}
                            <div className="tc-bottle-col">
                              {selectedWineForCard.bottleImage?.url ? (
                                <img className="tc-bottle-img" src={selectedWineForCard.bottleImage.url} alt={selectedWineForCard.name} />
                              ) : (
                                <div className="tc-bottle-placeholder">
                                  <svg width="60" height="160" viewBox="0 0 100 250" fill="none">
                                    <path d="M50 10 L35 60 L25 240 L75 240 L65 60 Z" fill={getWineTypeColor(selectedWineForCard.type)}/>
                                    <ellipse cx="50" cy="50" rx="15" ry="8" fill={getWineTypeColor(selectedWineForCard.type)} opacity="0.3"/>
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Right: Info */}
                            <div className="tc-info-col">
                              {/* Winery logo or name */}
                              {selectedWineForCard.winery?.logo?.url ? (
                                <img className="tc-winery-logo" src={selectedWineForCard.winery.logo.url} alt={selectedWineForCard.winery.name} />
                              ) : (
                                <div className="tc-winery-name">{selectedWineForCard.winery?.name || ''}</div>
                              )}

                              {/* Divider */}
                              <div className="tc-divider"></div>

                              {/* Region / Location */}
                              {selectedWineForCard.region && (
                                <div className="tc-region">{selectedWineForCard.region}</div>
                              )}

                              {/* Wine name */}
                              <div className="tc-wine-name">{selectedWineForCard.name}</div>

                              {/* Wine type */}
                              {selectedWineForCard.type && (
                                <div className="tc-wine-type">{selectedWineForCard.type.charAt(0).toUpperCase() + selectedWineForCard.type.slice(1)}</div>
                              )}

                              {/* Award badge */}
                              {selectedWineForCard.awards?.length > 0 && (
                                  <div className="tc-award-wrapper">
                                    <div className="tc-award-badge" style={{ background: getWineTypeColor(selectedWineForCard.type) }}>
                                      <div className="tc-award-score">{selectedWineForCard.awards[0].score}</div>
                                      <div className="tc-award-label">POINTS</div>
                                    </div>
                                    {selectedWineForCard.awards[0].awardName && (
                                      <div className="tc-award-source">{selectedWineForCard.awards[0].awardName}</div>
                                    )}
                                  </div>
                              )}

                              {/* Description */}
                              {selectedWineForCard.description && (
                                <p className="tc-description">{selectedWineForCard.description}</p>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="tc-empty-state">
                            <div className="tc-empty-icon">
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" fill="#d4a574" opacity="0.4"/>
                              </svg>
                            </div>
                            <p>Select a wine to preview your shelf talker</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                {/* Left Panel - Controls */}
                <div className="generator-controls generator-animate generator-animate-1">
                <h2 className="generator-subhead">Create Your Sales Sheet</h2>

                {/* Wine Selector - Searchable Combobox */}
                <div className="wine-selector">
                  <label htmlFor="wine-search">Add A Wine</label>
                  <div className="wine-combobox">
                    <input
                      id="wine-search"
                      type="text"
                      className="wine-search-input"
                      placeholder="Search wines..."
                      value={wineSearchQuery}
                      onChange={(e) => setWineSearchQuery(e.target.value)}
                      onFocus={() => setIsWineDropdownOpen(true)}
                    />
                    {isWineDropdownOpen && (
                      <>
                        <div
                          className="combobox-backdrop"
                          onClick={() => {
                            setIsWineDropdownOpen(false);
                            setWineSearchQuery('');
                          }}
                        />
                        <div className="wine-dropdown">
                          {wines
                            .filter(wine => {
                              const searchLower = wineSearchQuery.toLowerCase();
                              const wineName = wine.name.toLowerCase();
                              const wineryName = (wine.winery?.name || '').toLowerCase();
                              return wineName.includes(searchLower) || wineryName.includes(searchLower);
                            })
                            .slice(0, 50)
                            .map((wine) => {
                              const isAlreadyAdded = selectedWinesForSheet.find(w => w._id === wine._id);
                              return (
                                <div
                                  key={wine._id}
                                  className={isAlreadyAdded ? 'wine-dropdown-item disabled' : 'wine-dropdown-item'}
                                  onClick={() => {
                                    if (!isAlreadyAdded) {
                                      setSelectedWinesForSheet([...selectedWinesForSheet, wine]);
                                      setWineSearchQuery('');
                                      setIsWineDropdownOpen(false);
                                    }
                                  }}
                                >
                                  <div className="wine-dropdown-name">{wine.name}</div>
                                  <div className="wine-dropdown-winery">{wine.winery?.name || 'Unknown'}</div>
                                </div>
                              );
                            })}
                          {wines.filter(wine => {
                            const searchLower = wineSearchQuery.toLowerCase();
                            const wineName = wine.name.toLowerCase();
                            const wineryName = (wine.winery?.name || '').toLowerCase();
                            return wineName.includes(searchLower) || wineryName.includes(searchLower);
                          }).length === 0 && (
                            <div className="wine-dropdown-empty">No wines found</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Added Wines */}
                {selectedWinesForSheet.length > 0 && (
                  <div className="added-wines-section">
                    <div className="added-wines-label">ADDED WINES</div>
                    <div className="wine-pills">
                      {selectedWinesForSheet.map((wine) => (
                          <div key={wine._id} className="wine-pill">
                            <div className="wine-pill-text">
                              <span className="wine-pill-name">{wine.name}</span>
                              <span className="wine-pill-winery">{wine.winery?.name}</span>
                            </div>
                            <button
                              className="remove-wine"
                              onClick={() => setSelectedWinesForSheet(selectedWinesForSheet.filter(w => w._id !== wine._id))}
                            >
                              ×
                            </button>
                          </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sales Sheet Settings */}
                <div className="sheet-settings">
                  <div className="sheet-settings-label">SALES SHEET SETTINGS</div>
                  <div className="settings-toggles">
                    <label className="toggle-label">
                      <span>Grapes</span>
                      <input
                        type="checkbox"
                        checked={sheetSettings.grapes}
                        onChange={() =>
                          setSheetSettings(prev => ({
                            ...prev,
                            grapes: !prev.grapes
                          }))
                        }
                      />
                    </label>
                    <label className="toggle-label">
                      <span>Region</span>
                      <input
                        type="checkbox"
                        checked={sheetSettings.region}
                        onChange={() =>
                          setSheetSettings(prev => ({
                            ...prev,
                            region: !prev.region
                          }))
                        }
                      />
                    </label>
                    <label className="toggle-label">
                      <span>Case Size</span>
                      <input
                        type="checkbox"
                        checked={sheetSettings.caseSize}
                        onChange={() =>
                          setSheetSettings(prev => ({
                            ...prev,
                            caseSize: !prev.caseSize
                          }))
                        }
                      />
                    </label>
                    <label className="toggle-label">
                      <span>Ratings</span>
                      <input
                        type="checkbox"
                        checked={sheetSettings.ratings}
                        onChange={() =>
                          setSheetSettings(prev => ({
                            ...prev,
                            ratings: !prev.ratings
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="generator-actions">
                  <div className="action-divider"></div>
                  <button
                    className="btn-generate"
                    onClick={handleGeneratePDF}
                    disabled={isGeneratingPDF || selectedWinesForSheet.length === 0}
                  >
                    {isGeneratingPDF ? 'Generating...' : 'Generate Sales Sheet'}
                  </button>
                  <button
                    className="btn-share"
                    onClick={handleShareClick}
                    disabled={selectedWinesForSheet.length === 0}
                  >
                    Share Sales Sheet
                  </button>
                </div>
              </div>

                {/* Right Panel - PDF Preview */}
                <div className="pdf-preview generator-animate generator-animate-2">
                {/* Hidden measurement layer — renders all entries off-screen so we can measure heights */}
                <div style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', width: 595, left: -9999 }}>
                  {selectedWinesForSheet.map((wine, index) => (
                    <div key={wine._id} className="pdf-wine-entry" ref={el => { wineEntriesRef.current[index] = el; }}>
                        <div className="pdf-wine-image">
                          {wine.bottleImage?.url ? (
                            <img src={wine.bottleImage.url} alt={wine.name} />
                          ) : (
                            <div className="pdf-wine-placeholder">
                              <svg width="40" height="100" viewBox="0 0 100 250" fill="none">
                                <path d="M50 10 L35 60 L25 240 L75 240 L65 60 Z" fill={getWineTypeColor(wine.type)}/>
                                <ellipse cx="50" cy="50" rx="15" ry="8" fill={getWineTypeColor(wine.type)} opacity="0.3"/>
                              </svg>
                            </div>
                          )}
                        </div>

                        <div className="pdf-wine-info">
                          <div className="pdf-wine-title">
                            <div className="pdf-wine-producer">{wine.winery?.name || 'L\'ANTICA QUERCIA'}</div>
                            <div className="pdf-wine-name">{wine.name}</div>
                          </div>

                          <div className="pdf-wine-details-horizontal">
                            {wine.region && (
                              <div
                                className={`pdf-detail pdf-detail-toggle${sheetSettings.region ? ' is-visible' : ''}`}
                                aria-hidden={!sheetSettings.region}
                              >
                                <div className="pdf-detail-header">
                                  <svg width="16" height="16" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.9414 2.39093C14.1542 2.39093 12.7002 3.84496 12.7002 5.63213C12.7002 7.41931 14.1542 8.87334 15.9414 8.87334C17.7286 8.87334 19.1826 7.41931 19.1826 5.63213C19.1826 3.84532 17.7286 2.39093 15.9414 2.39093ZM15.9414 8.31451C14.4626 8.31451 13.2594 7.11132 13.2594 5.63249C13.2594 4.15366 14.4626 2.95048 15.9414 2.95048C17.4202 2.95048 18.6234 4.15366 18.6234 5.63249C18.6234 7.11132 17.4202 8.31451 15.9414 8.31451Z" fill="#7F3332"/>
                                <path d="M18.5892 6.062C18.8265 4.59987 17.8336 3.22222 16.3715 2.98492C14.9094 2.74763 13.5317 3.74055 13.2944 5.20268C13.0571 6.66481 14.05 8.04246 15.5122 8.27976C16.9743 8.51705 18.3519 7.52413 18.5892 6.062Z" fill="#7F3232" fill-opacity="0.68"/>
                                <path d="M16.2208 0H15.6616V1.45547H16.2208V0Z" fill="#7F3332"/>
                                <path d="M16.2208 9.75342H15.6616V11.2089H16.2208V9.75342Z" fill="#7F3332"/>
                                <path d="M21.5458 5.32483H20.0903V5.88402H21.5458V5.32483Z" fill="#7F3332"/>
                                <path d="M11.7924 5.32483H10.3369V5.88402H11.7924V5.32483Z" fill="#7F3332"/>
                                <path d="M19.7064 1.44423L18.6772 2.47339L19.0724 2.86854L20.1016 1.83937L19.7064 1.44423Z" fill="#7F3332"/>
                                <path d="M12.8102 8.3404L11.7808 9.36981L12.1759 9.76496L13.2053 8.73554L12.8102 8.3404Z" fill="#7F3332"/>
                                <path d="M19.0724 8.34069L18.6772 8.73584L19.7067 9.76526L20.1018 9.37011L19.0724 8.34069Z" fill="#7F3332"/>
                                <path d="M12.1764 1.4436L11.7812 1.83881L12.8106 2.86797L13.2057 2.47276L12.1764 1.4436Z" fill="#7F3332"/>
                                <path d="M11.9151 23L11.3584 22.9508C11.5359 20.944 12.9946 18.8891 15.6935 16.8432C17.6776 15.3392 19.5791 14.4239 19.6589 14.3858L19.9 14.8904C19.8238 14.9263 12.3075 18.5707 11.9151 23Z" fill="#7F3332"/>
                                <path d="M14.8816 22.986L14.3228 22.9648C14.3856 21.308 15.5011 19.7635 17.5489 18.4977C19.0636 17.5612 20.5374 17.1073 20.5996 17.0886L20.7624 17.6234C20.7045 17.6406 15.0171 19.4167 14.8816 22.986Z" fill="#7F3332"/>
                                <path d="M8.98578 22.7491C8.81112 19.4601 11.7885 16.0083 17.8347 12.489C18.014 12.3844 18.1833 12.2859 18.2185 12.2597L18.3403 12.4214L18.6264 12.636C18.5764 12.7025 18.5293 12.7312 18.1157 12.972C14.0939 15.313 9.34156 18.9045 9.54424 22.7193L8.98578 22.7491Z" fill="#7F3332"/>
                                <path d="M9.04759 21.7131C9.02279 21.6854 6.52765 18.9416 1.77923 19.6337L1.69873 19.0803C6.75873 18.3443 9.35845 21.2204 9.46662 21.3433L9.04759 21.7131Z" fill="#7F3332"/>
                                <path d="M10.2442 19.0976C10.228 19.0702 8.53536 16.4004 1.4855 16.7896L1.45459 16.2315C8.89257 15.819 10.6546 18.6918 10.7261 18.8144L10.2442 19.0976Z" fill="#7F3332"/>
                                <path d="M12.5605 16.5194C12.54 16.487 10.4366 13.3041 1.75477 13.7986L1.72314 13.2405C10.7916 12.7273 12.9489 16.0838 13.0366 16.2269L12.5605 16.5194Z" fill="#7F3332"/>
                                <path d="M16.1098 14.0109L15.703 14.394C15.6954 14.3865 15.5729 14.2593 15.3396 14.0562C14.0394 12.9206 9.29316 9.38758 1.78546 10.6594L1.69238 10.1078C1.9824 10.0585 2.26882 10.0161 2.55021 9.98163C2.73888 9.95791 2.92504 9.93707 3.10868 9.91838C5.00366 9.73366 6.70926 9.84543 8.21432 10.1293C8.40371 10.1638 8.58987 10.2023 8.77279 10.2433C12.5973 11.0943 15.0202 13.0176 15.8187 13.7353C16.0052 13.9024 16.1026 14.0041 16.1098 14.0109Z" fill="#7F3332"/>
                                <path d="M8.21453 6.35947V10.1293C6.70947 9.84541 5.00387 9.734 3.10889 9.91836V6.35911L5.66153 3.90027L8.21453 6.35947Z" fill="#7F3232" fill-opacity="0.68"/>
                                <path d="M8.77323 6.12159V10.5239H8.2144V6.3595L5.66176 3.90065L3.10876 6.3595V10.1049H2.55029V6.12159L5.66176 3.12512L8.77323 6.12159Z" fill="#7F3332"/>
                                </svg>
                                  <span>Region</span>
                                </div>
                                <span className="pdf-detail-value">{wine.region}</span>
                              </div>
                            )}
                            <div
                              className={`pdf-detail pdf-detail-toggle${sheetSettings.caseSize ? ' is-visible' : ''}`}
                              aria-hidden={!sheetSettings.caseSize}
                            >
                                <div className="pdf-detail-header">
                                  <svg width="16" height="16" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.82493 7.80166V2.23243C8.82493 2.07143 8.69376 1.94061 8.53312 1.94061H5.96718C5.80618 1.94061 5.67537 2.07178 5.67537 2.23243V7.80166C4.52537 7.94649 3.63232 8.9301 3.63232 10.1189V22.1231C3.63232 22.6065 4.02548 23 4.5092 23H9.99146C10.4748 23 10.8683 22.6068 10.8683 22.1231V10.1189C10.868 8.9301 9.97529 7.94649 8.82493 7.80166ZM10.2833 22.1231C10.2833 22.2841 10.1521 22.4149 9.99146 22.4149H4.5092C4.3482 22.4149 4.21739 22.2838 4.21739 22.1231V10.1189C4.21739 9.15363 5.00226 8.36803 5.96754 8.36803C6.12926 8.36803 6.26043 8.23758 6.26043 8.07622V2.5246H8.24131V8.07586C8.24131 8.23758 8.37176 8.36768 8.53312 8.36768C9.4984 8.36768 10.2833 9.15363 10.2833 10.1186V22.1231Z" fill="#7F3332"/>
                                <path d="M6.95824 12.47V19.7304C6.95824 19.8921 7.08869 20.0233 7.25005 20.0233H10.2832V22.1235C10.2832 22.2845 10.152 22.4153 9.99136 22.4153H4.5091C4.3481 22.4153 4.21729 22.2841 4.21729 22.1235V10.1189C4.21729 9.15365 5.00216 8.36805 5.96744 8.36805C6.12916 8.36805 6.26033 8.2376 6.26033 8.07624V5.42297H8.24121V8.07624C8.24121 8.23796 8.37166 8.36805 8.53302 8.36805C9.4983 8.36805 10.2832 9.154 10.2832 10.1189V12.1781H7.25005C7.08833 12.1778 6.95824 12.309 6.95824 12.47Z" fill="#7F3232" fill-opacity="0.68"/>
                                <path d="M8.17649 2.52497H6.32391C6.16255 2.52497 6.03174 2.39416 6.03174 2.2328V0.292172C6.03138 0.130813 6.16219 0 6.32355 0H8.17613C8.33749 0 8.4683 0.130813 8.4683 0.292172V2.2328C8.46866 2.39416 8.33785 2.52497 8.17649 2.52497ZM6.61572 1.94063H7.88396V0.584344H6.61572V1.94063Z" fill="#7F3332"/>
                                <path d="M8.77041 4.83862H5.96729V5.42261H8.77041V4.83862Z" fill="#7F3332"/>
                                <path d="M7.54212 12.7629V19.4386H10.2906V20.0233H7.25031C7.08859 20.0233 6.9585 19.8921 6.9585 19.7304V12.47C6.9585 12.309 7.08895 12.1782 7.25031 12.1782H10.5763V12.7629H7.54212Z" fill="#7F3332"/>
                                <path d="M18.7794 11.7412C18.7273 11.6495 18.6306 11.5938 18.5253 11.5938H13.7277C13.6224 11.5938 13.5257 11.6492 13.4736 11.7412C13.4341 11.8102 12.5133 13.4568 13.0571 15.3342C13.4222 16.597 14.3562 17.6442 15.8343 18.45C15.8609 18.4636 15.8875 18.478 15.9141 18.4927C15.9558 18.5154 16.0032 18.5272 16.0507 18.5272H16.2027C16.2501 18.5272 16.2976 18.515 16.3392 18.4927C16.3658 18.4784 16.3924 18.4636 16.419 18.45C17.8975 17.6439 18.8312 16.5967 19.1963 15.3342C19.7397 13.4568 18.8189 11.8105 18.7794 11.7412ZM18.6331 15.1782C18.3108 16.2858 17.4684 17.2155 16.1287 17.9425H16.1247C14.7857 17.2155 13.9426 16.2858 13.6202 15.1782C13.5616 14.9755 13.5221 14.7754 13.4995 14.5799C13.4754 14.3786 13.4689 14.1835 13.4736 13.9952C13.4995 13.1546 13.7737 12.4678 13.9081 12.1782H18.3456C18.48 12.4678 18.7542 13.1546 18.7801 13.9952C18.7848 14.1835 18.7787 14.379 18.7542 14.5799C18.7312 14.775 18.6917 14.9755 18.6331 15.1782Z" fill="#7F3332"/>
                                <path d="M18.7534 14.5795C18.7308 14.775 18.6916 14.9751 18.6327 15.1778C18.3103 16.2854 17.468 17.2151 16.1282 17.9421H16.1243C14.7852 17.2151 13.9421 16.2854 13.6198 15.1778C13.5612 14.9751 13.5217 14.775 13.499 14.5795H18.7534Z" fill="#7F3232" fill-opacity="0.68"/>
                                <path d="M16.4183 18.0377H15.834V22.8846H16.4183V18.0377Z" fill="#7F3332"/>
                                <path d="M17.8365 22.4156H14.416V23H17.8365V22.4156Z" fill="#7F3332"/>
                                <path d="M19.0736 13.9948H13.2334V14.5795H19.0736V13.9948Z" fill="#7F3332"/>
                                </svg>
                                  <span>Case</span>
                                </div>
                                <span className="pdf-detail-value">12/750 ml</span>
                              </div>
                            {wine.varietal && (
                              <div
                                className={`pdf-detail pdf-detail-toggle${sheetSettings.grapes ? ' is-visible' : ''}`}
                                aria-hidden={!sheetSettings.grapes}
                              >
                                <div className="pdf-detail-header">
                                  <svg width="16" height="16" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_105_1724)">
                                <path d="M9.49957 5.89552C9.11936 5.16419 8.35461 4.66394 7.47593 4.66394C6.21956 4.66394 5.19678 5.68672 5.19678 6.9431C5.19678 7.37147 5.31573 7.77361 5.52309 8.11646C5.90762 8.75399 6.59475 9.18919 7.38357 9.21974C7.41448 9.22153 7.44503 9.22225 7.47593 9.22225C7.49175 9.22225 7.50756 9.22225 7.52337 9.22046C8.33125 9.20464 9.03778 8.76513 9.42986 8.11538C9.45465 8.07477 9.47801 8.03308 9.49993 7.99068C9.66309 7.67694 9.75545 7.3208 9.75545 6.9431C9.75509 6.56539 9.66273 6.20925 9.49957 5.89552ZM7.47593 8.61742C6.55306 8.61742 5.80161 7.86669 5.80161 6.9431C5.80161 6.02022 6.55306 5.26877 7.47593 5.26877C8.39953 5.26877 9.15026 6.02022 9.15026 6.9431C9.1499 7.86669 8.39953 8.61742 7.47593 8.61742Z" fill="#7F3332"/>
                                <path d="M7.4756 8.61746C8.4003 8.61746 9.14993 7.86783 9.14993 6.94313C9.14993 6.01842 8.4003 5.2688 7.4756 5.2688C6.55089 5.2688 5.80127 6.01842 5.80127 6.94313C5.80127 7.86783 6.55089 8.61746 7.4756 8.61746Z" fill="#7F3232" fill-opacity="0.68"/>
                                <path d="M13.546 5.89552C13.2107 5.25044 12.5756 4.78469 11.8267 4.68478C11.7268 4.67077 11.6255 4.66394 11.5223 4.66394C11.421 4.66394 11.32 4.67077 11.2219 4.68478C10.4711 4.78289 9.83541 5.249 9.4994 5.8948C9.4994 5.8948 9.49868 5.8948 9.4994 5.89552C9.33552 6.20925 9.24316 6.56539 9.24316 6.9431C9.24316 7.3208 9.33552 7.67694 9.4994 7.99068C9.49868 7.99139 9.4994 7.99139 9.4994 7.99139C9.52096 8.0338 9.54432 8.07549 9.56912 8.1161C9.95365 8.75363 10.6408 9.18883 11.4296 9.21938C11.4605 9.22117 11.4911 9.22189 11.522 9.22189C11.5378 9.22189 11.5536 9.22189 11.5694 9.2201C12.3773 9.20428 13.0838 8.76477 13.4759 8.11502C13.5007 8.07441 13.524 8.03272 13.546 7.99032C13.7091 7.67658 13.8015 7.32044 13.8015 6.94274C13.8015 6.56539 13.7091 6.20925 13.546 5.89552ZM11.5223 8.61742C10.5987 8.61742 9.84799 7.86669 9.84799 6.9431C9.84799 6.02022 10.5987 5.26877 11.5223 5.26877C12.4452 5.26877 13.1966 6.02022 13.1966 6.9431C13.1966 7.86669 12.4452 8.61742 11.5223 8.61742Z" fill="#7F3332"/>
                                <path d="M11.5225 8.61746C12.4472 8.61746 13.1968 7.86783 13.1968 6.94313C13.1968 6.01842 12.4472 5.2688 11.5225 5.2688C10.5978 5.2688 9.84814 6.01842 9.84814 6.94313C9.84814 7.86783 10.5978 8.61746 11.5225 8.61746Z" fill="#7F3232" fill-opacity="0.68"/>
                                <path d="M15.568 4.66394C14.6893 4.66394 13.9253 5.16419 13.5458 5.8948C13.5458 5.8948 13.5451 5.8948 13.5458 5.89552C13.3819 6.20925 13.2896 6.56539 13.2896 6.9431C13.2896 7.3208 13.3819 7.67694 13.5458 7.99068C13.5451 7.99139 13.5458 7.99139 13.5458 7.99139C13.5673 8.0338 13.5907 8.07549 13.6155 8.1161C13.999 8.75363 14.6864 9.18883 15.4753 9.21938C15.5062 9.22117 15.5367 9.22189 15.5676 9.22189C15.5834 9.22189 15.5993 9.22189 15.6151 9.2201C16.424 9.20428 17.1306 8.76477 17.5216 8.11502C17.7278 7.77217 17.8468 7.37111 17.8468 6.94238C17.8471 5.68672 16.8254 4.66394 15.568 4.66394ZM15.568 8.61742C14.6451 8.61742 13.8937 7.86669 13.8937 6.9431C13.8937 6.02022 14.6451 5.26877 15.568 5.26877C16.4916 5.26877 17.243 6.02022 17.243 6.9431C17.243 7.86669 16.4916 8.61742 15.568 8.61742Z" fill="#7F3332"/>
                                <path d="M17.2434 6.94313C17.2434 7.86672 16.492 8.61746 15.5684 8.61746C14.6455 8.61746 13.894 7.86672 13.894 6.94313C13.894 6.02025 14.6455 5.2688 15.5684 5.2688C16.492 5.2688 17.2434 6.02025 17.2434 6.94313Z" fill="#7F3232" fill-opacity="0.68"/>
                                <path d="M9.4305 12.7873C9.40965 12.7467 9.38809 12.7064 9.36473 12.6683C8.98451 12.0319 8.30278 11.5956 7.51898 11.5582C7.48161 11.5557 7.44495 11.555 7.40757 11.555C7.40182 11.555 7.395 11.555 7.38925 11.5557C6.56448 11.5615 5.84321 12.0074 5.44862 12.6709C5.24486 13.0112 5.12842 13.4097 5.12842 13.8341C5.12842 15.0905 6.15012 16.1126 7.40757 16.1126H7.41081C8.24779 16.1119 8.9802 15.6565 9.37479 14.9816C9.39492 14.9482 9.41325 14.9151 9.4305 14.881C9.59365 14.5673 9.68601 14.2111 9.68601 13.8341C9.68601 13.4572 9.59365 13.101 9.4305 12.7873ZM7.40757 15.5085C6.48398 15.5085 5.73253 14.757 5.73253 13.8341C5.73253 12.9106 6.48398 12.1591 7.40757 12.1591C8.33045 12.1591 9.0819 12.9106 9.0819 13.8341C9.0819 14.757 8.33045 15.5085 7.40757 15.5085Z" fill="#7F3332"/>
                                <path d="M9.0818 13.8342C9.0818 14.757 8.33034 15.5085 7.40747 15.5085C6.48387 15.5085 5.73242 14.757 5.73242 13.8342C5.73242 12.9106 6.48387 12.1591 7.40747 12.1591C8.33034 12.1591 9.0818 12.9106 9.0818 13.8342Z" fill="#7F3232" fill-opacity="0.68"/>
                                <path d="M13.4771 12.7866C13.4563 12.7467 13.4347 12.7068 13.4113 12.6683C13.0311 12.0319 12.3494 11.5956 11.5656 11.5582C11.5282 11.5557 11.4908 11.555 11.4531 11.555C11.4474 11.555 11.4416 11.555 11.4355 11.5557C10.6107 11.5615 9.88947 12.0074 9.49488 12.6709C9.47152 12.7082 9.44996 12.7474 9.42983 12.7873C9.26668 13.101 9.17432 13.4572 9.17432 13.8341C9.17432 14.2111 9.26668 14.5673 9.42983 14.881C9.44816 14.9159 9.46721 14.9507 9.48805 14.9849C9.86575 15.6299 10.5525 16.0723 11.3428 16.109C11.3794 16.1115 11.4161 16.1122 11.4528 16.1122H11.4628C12.2973 16.109 13.0272 15.6544 13.42 14.9813C13.4408 14.9489 13.4591 14.9155 13.4764 14.8814C13.6396 14.5676 13.7319 14.2115 13.7319 13.8338C13.7319 13.4561 13.6403 13.1003 13.4771 12.7866ZM11.4535 15.5085C10.5306 15.5085 9.77914 14.757 9.77914 13.8341C9.77914 12.9106 10.5306 12.1591 11.4535 12.1591C12.3771 12.1591 13.1285 12.9106 13.1285 13.8341C13.1285 14.757 12.3771 15.5085 11.4535 15.5085Z" fill="#7F3332"/>
                                <path d="M13.1282 13.8342C13.1282 14.757 12.3767 15.5085 11.4531 15.5085C10.5303 15.5085 9.77881 14.757 9.77881 13.8342C9.77881 12.9106 10.5303 12.1591 11.4531 12.1591C12.3767 12.1591 13.1282 12.9106 13.1282 13.8342Z" fill="#7F3232" fill-opacity="0.68"/>
                                <path d="M17.4577 12.6683C17.0764 12.0319 16.3951 11.5956 15.6113 11.5582C15.5739 11.5557 15.5372 11.555 15.4999 11.555C15.4941 11.555 15.4873 11.555 15.4815 11.5557C14.6568 11.5615 13.9355 12.0074 13.5409 12.6709C13.5175 12.7082 13.4967 12.7467 13.4769 12.7859C13.4769 12.7859 13.4762 12.7859 13.4769 12.7866C13.3131 13.1003 13.2207 13.4564 13.2207 13.8341C13.2207 14.2119 13.3131 14.568 13.4769 14.8817C13.4945 14.9166 13.5136 14.9507 13.5334 14.9849C13.9136 15.6314 14.6025 16.0749 15.3964 16.109C15.4305 16.1115 15.4654 16.1122 15.4995 16.1122C16.7559 16.1122 17.7787 15.0905 17.7787 13.8338C17.779 13.4079 17.6619 13.0094 17.4577 12.6683ZM15.4999 15.5085C14.577 15.5085 13.8255 14.757 13.8255 13.8341C13.8255 12.9106 14.577 12.1591 15.4999 12.1591C16.4235 12.1591 17.1742 12.9106 17.1742 13.8341C17.1742 14.757 16.4235 15.5085 15.4999 15.5085Z" fill="#7F3332"/>
                                <path d="M17.1743 13.8342C17.1743 14.757 16.4236 15.5085 15.5 15.5085C14.5771 15.5085 13.8257 14.757 13.8257 13.8342C13.8257 12.9106 14.5771 12.1591 15.5 12.1591C16.4236 12.1591 17.1743 12.9106 17.1743 13.8342Z" fill="#7F3232" fill-opacity="0.68"/>
                                <path d="M9.37828 19.5396C8.12154 19.5396 7.09912 18.5172 7.09912 17.2604C7.09912 16.0037 8.12154 14.9813 9.37828 14.9813C10.635 14.9813 11.6574 16.0037 11.6574 17.2604C11.6571 18.5172 10.635 19.5396 9.37828 19.5396ZM9.37828 15.5861C8.45504 15.5861 7.70359 16.3372 7.70359 17.2608C7.70359 18.184 8.45468 18.9351 9.37828 18.9351C10.3019 18.9351 11.0526 18.184 11.0526 17.2608C11.0526 16.3375 10.3015 15.5861 9.37828 15.5861Z" fill="#7F3332"/>
                                <path d="M13.43 19.5396C12.1733 19.5396 11.1509 18.5172 11.1509 17.2604C11.1509 16.0037 12.1733 14.9813 13.43 14.9813C14.6868 14.9813 15.7092 16.0037 15.7092 17.2604C15.7092 18.5172 14.6868 19.5396 13.43 19.5396ZM13.43 15.5861C12.5068 15.5861 11.7553 16.3372 11.7553 17.2608C11.7553 18.184 12.5064 18.9351 13.43 18.9351C14.3536 18.9351 15.1044 18.184 15.1044 17.2608C15.1044 16.3375 14.3536 15.5861 13.43 15.5861Z" fill="#7F3332"/>
                                <path d="M13.4009 19.5392C13.0056 18.8902 12.2941 18.4532 11.4819 18.4431C11.4718 18.4424 11.4628 18.4424 11.4528 18.4424C11.4096 18.4424 11.3661 18.4431 11.323 18.4467C10.555 18.4891 9.88768 18.9153 9.50818 19.536C9.29686 19.8813 9.17432 20.2874 9.17432 20.7219C9.17432 21.9783 10.196 23.0003 11.4528 23.0003C12.7102 23.0003 13.7319 21.9786 13.7319 20.7219C13.7323 20.2889 13.6108 19.8835 13.4009 19.5392ZM11.4531 22.3959C10.5302 22.3959 9.77879 21.6444 9.77879 20.7215C9.77879 19.7979 10.5302 19.0472 11.4531 19.0472C12.3767 19.0472 13.1282 19.7979 13.1282 20.7215C13.1282 21.6444 12.3767 22.3959 11.4531 22.3959Z" fill="#7F3332"/>
                                <path d="M13.1282 20.7216C13.1282 21.6444 12.3767 22.3959 11.4531 22.3959C10.5303 22.3959 9.77881 21.6444 9.77881 20.7216C9.77881 19.798 10.5303 19.0472 11.4531 19.0472C12.3767 19.0472 13.1282 19.798 13.1282 20.7216Z" fill="#7F3232" fill-opacity="0.68"/>
                                <path d="M17.5697 12.6719C16.3129 12.6719 15.2905 11.6495 15.2905 10.3927C15.2905 9.13601 16.3129 8.11359 17.5697 8.11359C18.8264 8.11359 19.8488 9.13601 19.8488 10.3927C19.8488 11.6495 18.8264 12.6719 17.5697 12.6719ZM17.5697 8.71841C16.6464 8.71841 15.895 9.46951 15.895 10.3927C15.895 11.316 16.6461 12.0674 17.5697 12.0674C18.4929 12.0674 19.244 11.3163 19.244 10.3927C19.244 9.46915 18.4933 8.71841 17.5697 8.71841Z" fill="#7F3332"/>
                                <path d="M13.5233 12.6719C12.2666 12.6719 11.2441 11.6495 11.2441 10.3927C11.2441 9.13601 12.2666 8.11359 13.5233 8.11359C14.78 8.11359 15.8025 9.13601 15.8025 10.3927C15.8025 11.6495 14.78 12.6719 13.5233 12.6719ZM13.5233 8.71841C12.6001 8.71841 11.849 9.46951 11.849 10.3927C11.849 11.316 12.6001 12.0674 13.5233 12.0674C14.4465 12.0674 15.198 11.3163 15.198 10.3927C15.198 9.46915 14.4465 8.71841 13.5233 8.71841Z" fill="#7F3332"/>
                                <path d="M9.47691 12.6719C8.22018 12.6719 7.19775 11.6495 7.19775 10.3927C7.19775 9.13601 8.22018 8.11359 9.47691 8.11359C10.7336 8.11359 11.7561 9.13601 11.7561 10.3927C11.7561 11.6495 10.7336 12.6719 9.47691 12.6719ZM9.47691 8.71841C8.55368 8.71841 7.80222 9.46951 7.80222 10.3927C7.80222 11.316 8.55332 12.0674 9.47691 12.0674C10.4005 12.0674 11.1512 11.3163 11.1512 10.3927C11.1512 9.46915 10.4005 8.71841 9.47691 8.71841Z" fill="#7F3332"/>
                                <path d="M5.43052 12.6719C4.17379 12.6719 3.15137 11.6495 3.15137 10.3927C3.15137 9.13601 4.17379 8.11359 5.43052 8.11359C6.68726 8.11359 7.70968 9.13601 7.70968 10.3927C7.70932 11.6495 6.68726 12.6719 5.43052 12.6719ZM5.43052 8.71841C4.50729 8.71841 3.7562 9.46951 3.7562 10.3927C3.7562 11.316 4.50729 12.0674 5.43052 12.0674C6.35376 12.0674 7.10521 11.3163 7.10521 10.3927C7.10521 9.46915 6.35376 8.71841 5.43052 8.71841Z" fill="#7F3332"/>
                                <path d="M11.8247 4.78867L11.2202 4.78436C11.2454 1.09358 14.4478 0.0104219 14.4801 0L14.667 0.575L14.5735 0.2875L14.6677 0.574641C14.5523 0.612734 11.847 1.54244 11.8247 4.78867Z" fill="#7F3332"/>
                                </g>
                                <defs>
                                <clipPath id="clip0_105_1724">
                                <rect width="23" height="23" fill="white"/>
                                </clipPath>
                                </defs>
                              </svg>
                                  <span>Grapes</span>
                                </div>
                                <span className="pdf-detail-value">{wine.varietal}</span>
                              </div>
                            )}
                            {wine.awards?.length > 0 && (
                              <div
                                className={`pdf-detail pdf-detail-toggle${sheetSettings.ratings ? ' is-visible' : ''}`}
                                aria-hidden={!sheetSettings.ratings}
                              >
                                <div className="pdf-detail-header">
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 1.5L9.85 5.26L14 5.88L10.9 8.86L11.7 13L8 10.98L4.3 13L5.1 8.86L2 5.88L6.15 5.26L8 1.5Z" stroke="#7F3332" strokeWidth="1.2" fill="none"/>
                                  </svg>
                                  <span>Rating</span>
                                </div>
                                <span className="pdf-detail-value">
                                  {wine.awards[0].score}
                                  {wine.awards[0].awardName ? ` pts · ${wine.awards[0].awardName}` : ' pts'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <textarea
                          className="pdf-custom-notes"
                          placeholder="Add notes or custom offer"
                          value={wineNotes[wine._id] || ''}
                          onChange={(e) => setWineNotes(prev => ({ ...prev, [wine._id]: e.target.value }))}
                        />
                      </div>
                    ))}
                </div>

                {/* Visible multi-page preview */}
                <div className="pdf-pages-stack" ref={pdfPreviewRef}>
                  {(pdfPages.length > 0 ? pdfPages : [selectedWinesForSheet.map((_, i) => i)]).map((pageIndices, pageNum) => (
                    <div key={pageNum} className="pdf-paper">
                      {/* Header only on first page */}
                      {pageNum === 0 && (
                        <>
                          <div className="pdf-header">
                            <div className="pdf-logo">VinoHub</div>
                            <div className="pdf-website">vinehub.com</div>
                          </div>
                          <input
                            type="text"
                            className="pdf-title-input"
                            value={sheetTitle}
                            onChange={(e) => setSheetTitle(e.target.value)}
                            placeholder="Custom Sales Sheet Title..."
                          />
                        </>
                      )}
                      <div className="pdf-wines">
                        {pageIndices.map((wineIndex) => {
                          const wine = selectedWinesForSheet[wineIndex];
                          if (!wine) return null;
                          return (
                            <div key={wine._id} className="pdf-wine-entry">
                              <div className="pdf-wine-image">
                                {wine.bottleImage?.url ? (
                                  <img src={wine.bottleImage.url} alt={wine.name} />
                                ) : (
                                  <div className="pdf-wine-placeholder">
                                    <svg width="40" height="100" viewBox="0 0 100 250" fill="none">
                                      <path d="M50 10 L35 60 L25 240 L75 240 L65 60 Z" fill={getWineTypeColor(wine.type)}/>
                                      <ellipse cx="50" cy="50" rx="15" ry="8" fill={getWineTypeColor(wine.type)} opacity="0.3"/>
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="pdf-wine-info">
                                <div className="pdf-wine-title">
                                  <div className="pdf-wine-producer">{wine.winery?.name || 'Unknown Producer'}</div>
                                  <div className="pdf-wine-name">{wine.name}</div>
                                </div>
                                <div className="pdf-wine-details-horizontal">
                                  {wine.region && (
                                    <div className={`pdf-detail pdf-detail-toggle${sheetSettings.region ? ' is-visible' : ''}`} aria-hidden={!sheetSettings.region}>
                                      <div className="pdf-detail-header"><span>Region</span></div>
                                      <span className="pdf-detail-value">{wine.region}</span>
                                    </div>
                                  )}
                                  <div className={`pdf-detail pdf-detail-toggle${sheetSettings.caseSize ? ' is-visible' : ''}`} aria-hidden={!sheetSettings.caseSize}>
                                    <div className="pdf-detail-header"><span>Case</span></div>
                                    <span className="pdf-detail-value">12/750 ml</span>
                                  </div>
                                  {wine.varietal && (
                                    <div className={`pdf-detail pdf-detail-toggle${sheetSettings.grapes ? ' is-visible' : ''}`} aria-hidden={!sheetSettings.grapes}>
                                      <div className="pdf-detail-header"><span>Grapes</span></div>
                                      <span className="pdf-detail-value">{wine.varietal}</span>
                                    </div>
                                  )}
                                  {wine.awards?.length > 0 && (
                                    <div className={`pdf-detail pdf-detail-toggle${sheetSettings.ratings ? ' is-visible' : ''}`} aria-hidden={!sheetSettings.ratings}>
                                      <div className="pdf-detail-header"><span>Rating</span></div>
                                      <span className="pdf-detail-value">
                                        {wine.awards[0].score}
                                        {wine.awards[0].awardName ? ` pts · ${wine.awards[0].awardName}` : ' pts'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <textarea
                                className="pdf-custom-notes"
                                placeholder="Add notes or custom offer"
                                value={wineNotes[wine._id] || ''}
                                onChange={(e) => setWineNotes(prev => ({ ...prev, [wine._id]: e.target.value }))}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
                </>
                )}
              </div>
          </div>
        </div>
      )}

      {/* Share Dialog */}
      {isShareDialogOpen && (
        <>
          <div className="share-overlay" onClick={() => setIsShareDialogOpen(false)}></div>
          <div className="share-dialog">
            <button className="close-dialog" onClick={() => setIsShareDialogOpen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <h2 className="dialog-title">Share Sales Sheet</h2>

            <form onSubmit={handleShareSubmit} className="share-form">
              <div className="form-section">
                <h3 className="form-section-title">Your Information</h3>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="sender-name">Your Name *</label>
                    <input
                      type="text"
                      id="sender-name"
                      value={shareForm.senderName}
                      onChange={(e) => handleShareFormChange('senderName', e.target.value)}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="sender-email">Your Email *</label>
                    <input
                      type="email"
                      id="sender-email"
                      value={shareForm.senderEmail}
                      onChange={(e) => handleShareFormChange('senderEmail', e.target.value)}
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Recipient Information</h3>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="recipient-name">Recipient Name *</label>
                    <input
                      type="text"
                      id="recipient-name"
                      value={shareForm.recipientName}
                      onChange={(e) => handleShareFormChange('recipientName', e.target.value)}
                      required
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="recipient-email">Recipient Email *</label>
                    <input
                      type="email"
                      id="recipient-email"
                      value={shareForm.recipientEmail}
                      onChange={(e) => handleShareFormChange('recipientEmail', e.target.value)}
                      required
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Personal Note (Optional)</h3>
                <div className="form-field">
                  <textarea
                    id="personal-note"
                    value={shareForm.personalNote}
                    onChange={(e) => handleShareFormChange('personalNote', e.target.value)}
                    placeholder="Add a personal message to your recipient..."
                    rows="4"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsShareDialogOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-send">
                  Send Sales Sheet
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Wine Detail Sheet */}
      {selectedWine && (
        <>
          <div className="sheet-overlay" onClick={closeSheet}></div>
          <div className="wine-detail-sheet">
            <button className="close-sheet" onClick={closeSheet}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            <div className="sheet-content">
              {/* Bottle image */}
              <div className="sheet-image">
                {selectedWine.bottleImage?.url ? (
                  <img src={selectedWine.bottleImage.url} alt={selectedWine.name} />
                ) : (
                  <div className="sheet-placeholder">
                    <svg width="100" height="250" viewBox="0 0 100 250" fill="none">
                      <path d="M50 10 L35 60 L25 240 L75 240 L65 60 Z" fill={getWineTypeColor(selectedWine.type)}/>
                      <ellipse cx="50" cy="50" rx="15" ry="8" fill={getWineTypeColor(selectedWine.type)} opacity="0.3"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Name + producer */}
              <h2 className="sheet-wine-name">{selectedWine.name}</h2>
              <div className="sheet-producer">{selectedWine.winery?.name}</div>

              {/* Divider */}
              <div className="sheet-divider" />

              {/* Vintages */}
              {vintages.length > 0 && (
                <div className="sheet-vintages">
                  {vintages.map((v) => (
                    <button
                      key={v._id}
                      className={`sheet-vintage-btn${selectedVintage?._id === v._id ? ' active' : ''}`}
                      onClick={() => setSelectedVintage(selectedVintage?._id === v._id ? null : v)}
                    >
                      {v.year}
                    </button>
                  ))}
                </div>
              )}

              {/* Scores */}
              {selectedWine.awards?.length > 0 && (
                <div className="sheet-scores">
                  {selectedWine.awards.map((award, i) => (
                    <div key={i} className="sheet-score-pill">
                      <div className="sheet-score-circle">{award.score}</div>
                      <span className="sheet-score-pub">{award.awardName}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Wine Assets — vintage-specific when selected, wine-level fallback */}
              {(() => {
                const IMAGE_TYPES = new Set(['bottleImage', 'labelImage', 'lifestyleImage']);
                const ASSET_LABELS = {
                  bottleImage:    'Bottle Image',
                  labelImage:     'Label Image',
                  techSheet:      'Tech Sheet',
                  tastingCard:    'Tasting Card',
                  lifestyleImage: 'Lifestyle Image',
                  shelfTalker:    'Shelf Talker',
                };
                const ASSET_ORDER = ['bottleImage', 'labelImage', 'lifestyleImage', 'techSheet', 'tastingCard', 'shelfTalker'];

                // Build asset list from vintage.assets if selected, else wine-level fields
                let assetEntries = [];
                if (selectedVintage?.assets) {
                  assetEntries = ASSET_ORDER
                    .map(key => ({ key, asset: selectedVintage.assets[key] }))
                    .filter(({ asset }) => asset?.url);
                } else {
                  assetEntries = ASSET_ORDER
                    .map(key => ({ key, asset: selectedWine[key] }))
                    .filter(({ asset }) => asset?.url);
                }

                if (assetEntries.length === 0) return null;

                const DocIcon = () => (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                );
                const OpenIcon = () => (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 2H2v12h12v-4M10 2h4v4M14 2L8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                );
                const DownloadIcon = () => (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3 3 3-3M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                );

                return (
                  <div className="sheet-assets">
                    <div className="sheet-assets-title">
                      {selectedVintage ? `${selectedVintage.year} Assets` : 'Wine Assets'}
                    </div>
                    <div className="sheet-assets-grid">
                      {assetEntries.map(({ key, asset }) => (
                        <div key={key} className="sheet-asset-item">
                          <div className="sheet-asset-tooltip">
                            {IMAGE_TYPES.has(key)
                              ? <img src={asset.url} alt={ASSET_LABELS[key]} />
                              : <div className="sheet-asset-tooltip-pdf-wrap"><iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(asset.url)}&embedded=true`} title={ASSET_LABELS[key]} className="sheet-asset-tooltip-pdf" /></div>
                            }
                          </div>
                          <div className={`sheet-asset-thumb${IMAGE_TYPES.has(key) ? '' : ' sheet-asset-thumb-doc'}`}>
                            {IMAGE_TYPES.has(key)
                              ? <img src={asset.url} alt={ASSET_LABELS[key]} />
                              : <DocIcon />
                            }
                          </div>
                          <div className="sheet-asset-info">
                            <span className="sheet-asset-name">{ASSET_LABELS[key]}</span>
                            <div className="sheet-asset-actions">
                              <a href={asset.url} target="_blank" rel="noopener noreferrer" className="sheet-asset-btn" title="Open"><OpenIcon /></a>
                              <a href={asset.url} download className="sheet-asset-btn" title="Download"><DownloadIcon /></a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </>
      )}

      {/* Mobile Filter Sheet */}
      {filterSheetOpen && (
        <div className="filter-sheet-overlay" onClick={() => setFilterSheetOpen(false)} />
      )}
      <div className={`filter-sheet${filterSheetOpen ? ' open' : ''}`}>
        <div className="filter-sheet-handle" />
        <div className="filter-sheet-header">
          <span className="filter-sheet-title">Filters</span>
          <button className="filter-sheet-clear" onClick={() => { setSelectedTypes([]); setSelectedRegions([]); setSelectedMarkets([]); }}>
            Clear all
          </button>
        </div>
        <div className="filter-sheet-body">
          <div className="filter-group">
            <h4 className="filter-header" onClick={() => toggleSection('type')}>
              <span>Type</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={expandedSections.type ? 'chevron expanded' : 'chevron'}>
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </h4>
            {expandedSections.type && (
              <div className="filter-pills">
                {['red','white','sparkling','rosé','dessert'].map(t => (
                  <button key={t} className={selectedTypes.includes(t) ? 'pill active' : 'pill'} onClick={() => toggleType(t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="filter-group">
            <h4 className="filter-header" onClick={() => toggleSection('region')}>
              <span>Region</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={expandedSections.region ? 'chevron expanded' : 'chevron'}>
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </h4>
            {expandedSections.region && (
              <div className="filter-checkboxes">
                {regions.map(region => (
                  <label key={region} className="checkbox-label">
                    <input type="checkbox" checked={selectedRegions.includes(region)} onChange={() => toggleRegion(region)} />
                    <span className="checkbox-text">{region}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="filter-group">
            <h4 className="filter-header" onClick={() => toggleSection('market')}>
              <span>Market</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={expandedSections.market ? 'chevron expanded' : 'chevron'}>
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </h4>
            {expandedSections.market && (
              <div className="filter-checkboxes">
                {markets.map(market => (
                  <label key={market} className="checkbox-label">
                    <input type="checkbox" checked={selectedMarkets.includes(market)} onChange={() => toggleMarket(market)} />
                    <span className="checkbox-text">{market}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="filter-group">
            <h4 className="filter-header" onClick={() => toggleSection('score')}>
              <span>Score</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={expandedSections.score ? 'chevron expanded' : 'chevron'}>
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </h4>
            {expandedSections.score && (
              <div className="score-slider">
                <div className="score-range-track-wrapper">
                  <div className="score-range-fill" style={{ left: `${((scoreMin - 80) / 20) * 100}%`, right: `${100 - ((scoreMax - 80) / 20) * 100}%` }} />
                  <input type="range" className="score-range-input" min="80" max="100" value={scoreMin} onChange={e => setScoreMin(Math.min(Number(e.target.value), scoreMax - 1))} />
                  <input type="range" className="score-range-input" min="80" max="100" value={scoreMax} onChange={e => setScoreMax(Math.max(Number(e.target.value), scoreMin + 1))} />
                </div>
                <div className="score-labels"><span>{scoreMin}</span><span>{scoreMax}</span></div>
              </div>
            )}
          </div>
        </div>
        <div className="filter-sheet-footer">
          <button className="filter-sheet-done" onClick={() => setFilterSheetOpen(false)}>
            Show {activeWinesTab === 'wines' ? sortedWines.length : sortedBrands.length} results
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeTools;
