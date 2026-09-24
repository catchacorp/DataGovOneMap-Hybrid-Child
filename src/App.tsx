import React, { useState, useMemo, useEffect } from 'react';
import {
  HDB_TRANSACTIONS_DATA,
  AMENITIES_CATALOG,
  HDBTransaction,
  Amenity,
  AmenityCategory,
  formatCurrencySGD,
  getDistanceMeters,
} from './data/hdbData';
import { MapComponent } from './components/MapComponent';
import { SchoolProximityAnalyzer } from './components/SchoolProximityAnalyzer';
import { FinancialCalculatorModal } from './components/FinancialCalculatorModal';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { VercelProxyArchitectureModal } from './components/VercelProxyArchitectureModal';
import {
  Building2,
  Search,
  SlidersHorizontal,
  MapPin,
  School,
  ShoppingBag,
  Utensils,
  Train,
  TreePine,
  Download,
  Calculator,
  Server,
  Layers,
  Info,
  PenTool,
  Check,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Map as MapIcon,
  Compass,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';

export default function App() {
  // Navigation & View Mode
  const [activeMainTab, setActiveMainTab] = useState<'map' | 'schools' | 'analytics'>('map');

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTown, setSelectedTown] = useState<string>('ALL');
  const [selectedFlatType, setSelectedFlatType] = useState<string>('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(1300000);
  const [minLease, setMinLease] = useState<number>(0);
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'date_newest' | 'lease_desc'>('date_newest');

  // Selection & Proximity State
  const [selectedProperty, setSelectedProperty] = useState<HDBTransaction>(HDB_TRANSACTIONS_DATA[0]);
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(5);
  const [showSchoolZones, setShowSchoolZones] = useState<boolean>(true);

  // Amenity category toggles
  const [activeAmenities, setActiveAmenities] = useState<Record<AmenityCategory, boolean>>({
    school: true,
    mall: true,
    hawker: true,
    transport: true,
    park: true,
    healthcare: false,
  });

  // Map Polygon Drawing Filter ("What Does My Budget Buy" Zone)
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [drawnPolygonPoints, setDrawnPolygonPoints] = useState<[number, number][]>([]);

  // Modals
  const [showCalcModal, setShowCalcModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showArchModal, setShowArchModal] = useState<boolean>(false);

  // Polygon containment helper
  const isPointInPolygon = (lat: number, lng: number, polygon: [number, number][]): boolean => {
    if (polygon.length < 3) return true;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0],
        yi = polygon[i][1];
      const xj = polygon[j][0],
        yj = polygon[j][1];

      const intersect =
        yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    let result = HDB_TRANSACTIONS_DATA.filter((item) => {
      // 1. Text Search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchStreet = item.street.toLowerCase().includes(q);
        const matchPostal = item.postal.includes(q);
        const matchBlock = item.block.toLowerCase().includes(q);
        const matchTown = item.town.toLowerCase().includes(q);
        if (!matchStreet && !matchPostal && !matchBlock && !matchTown) return false;
      }

      // 2. Town
      if (selectedTown !== 'ALL' && item.town !== selectedTown) return false;

      // 3. Flat Type
      if (selectedFlatType !== 'ALL' && item.flat_type !== selectedFlatType) return false;

      // 4. Max Price
      if (item.price > maxPrice) return false;

      // 5. Min Lease
      if (item.lease_remain < minLease) return false;

      // 6. Floor Level
      if (selectedFloor !== 'ALL') {
        if (selectedFloor === 'LOW' && item.floor_category !== 'LOW') return false;
        if (selectedFloor === 'MID' && item.floor_category !== 'MID') return false;
        if (
          selectedFloor === 'HIGH' &&
          item.floor_category !== 'HIGH' &&
          item.floor_category !== 'SUPER_HIGH'
        )
          return false;
      }

      // 7. Spatial Budget Boundary Check
      if (drawnPolygonPoints.length >= 3) {
        if (!isPointInPolygon(item.lat, item.lng, drawnPolygonPoints)) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'lease_desc') return b.lease_remain - a.lease_remain;
      // Default: date_newest
      return b.month.localeCompare(a.month);
    });

    return result;
  }, [
    searchQuery,
    selectedTown,
    selectedFlatType,
    maxPrice,
    minLease,
    selectedFloor,
    sortBy,
    drawnPolygonPoints,
  ]);

  // Keep selectedProperty valid if current one is filtered out
  useEffect(() => {
    if (filteredTransactions.length > 0) {
      const exists = filteredTransactions.some((tx) => tx.id === selectedProperty?.id);
      if (!exists) {
        setSelectedProperty(filteredTransactions[0]);
      }
    }
  }, [filteredTransactions]);

  // Export CSV of currently filtered transactions
  const handleExportCSV = () => {
    const headers = [
      'Block',
      'Street',
      'Town',
      'Flat Type',
      'Floor',
      'Area Sqm',
      'Price SGD',
      'Lease Remain Yrs',
      'Postal',
      'Month',
    ];
    const rows = filteredTransactions.map((tx) => [
      `"${tx.block}"`,
      `"${tx.street}"`,
      `"${tx.town}"`,
      `"${tx.flat_type}"`,
      `"${tx.floor}"`,
      tx.floor_area_sqm,
      tx.price,
      tx.lease_remain,
      `"${tx.postal}"`,
      `"${tx.month}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HDB_Resale_Filtered_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Polygon Drawing Handlers
  const handleAddPolygonPoint = (point: [number, number]) => {
    setDrawnPolygonPoints((prev) => [...prev, point]);
  };

  const handleClearPolygon = () => {
    setDrawnPolygonPoints([]);
    setIsDrawingMode(false);
  };

  const handleFinishPolygon = () => {
    setIsDrawingMode(false);
  };

  // Quick Preset Sample Budget Perimeter (e.g. Central SG Corridor)
  const handleLoadSampleBudgetPerimeter = () => {
    setDrawnPolygonPoints([
      [1.375, 103.825],
      [1.375, 103.875],
      [1.325, 103.875],
      [1.325, 103.825],
    ]);
  };

  // Amenity filters toggle
  const toggleAmenity = (cat: AmenityCategory) => {
    setActiveAmenities((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Extract primary schools list
  const schoolsList = useMemo(() => {
    return AMENITIES_CATALOG.filter((a) => a.category === 'school');
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-800 overflow-hidden font-sans">
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center shadow-lg z-30 gap-3 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2 rounded-xl shadow-md">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight leading-none text-white">
                SG HDB Resale & Amenities Hub
              </h1>
              <span className="bg-indigo-900/90 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-700/60 hidden sm:inline">
                SLA OneMap &amp; Data.gov.sg
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Strict past 6-month transactions • 5km proximity engine • MOE P1 priority zones
            </p>
          </div>
        </div>

        {/* API Health & Quick Action Toolbar */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Status Badges */}
          <div className="hidden lg:flex items-center space-x-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-slate-400 text-[11px]">OneMap Proxy:</span>
            <span className="flex items-center space-x-1 text-emerald-400 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Active</span>
            </span>
            <span className="text-slate-600 px-1">|</span>
            <span className="text-slate-400 text-[11px]">Data.gov.sg:</span>
            <span className="flex items-center space-x-1 text-emerald-400 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Past 6M Sync</span>
            </span>
          </div>

          {/* Vercel Architecture Button */}
          <button
            onClick={() => setShowArchModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
            title="Inspect Vercel Serverless Proxy Architecture"
          >
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Backend Proxy Code</span>
          </button>

          {/* Financial Calculator Button */}
          {selectedProperty && (
            <button
              onClick={() => setShowCalcModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Grants &amp; Loan</span>
            </button>
          )}

          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition"
            title="Export filtered records as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export CSV</span>
          </button>
        </div>
      </header>

      {/* 2. DISCLAIMER BANNER */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-1.5 text-[11px] text-amber-900 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2 truncate">
          <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span className="truncate">
            Official Data sourced via SLA OneMap REST APIs and Data.gov.sg (HDB Resale Dataset). Independent analytical platform.
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-[11px] font-semibold text-amber-800 flex-shrink-0 pl-2">
          <span>Active Filter: Verified Past 6-Month Records</span>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE AREA */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* LEFT PANEL: Filters & Resale Transactions List */}
        <div className="w-full md:w-96 lg:w-[410px] bg-white border-r border-slate-200 flex flex-col h-full z-20 shadow-md flex-shrink-0">
          
          {/* Search & Filter Header Card */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 space-y-3 flex-shrink-0">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search Block, Street, Town or 6-digit Postal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Town & Flat Type Dropdowns */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  HDB Town
                </label>
                <select
                  value={selectedTown}
                  onChange={(e) => setSelectedTown(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium text-xs text-slate-800"
                >
                  <option value="ALL">All Towns (Whole SG)</option>
                  <option value="BISHAN">Bishan</option>
                  <option value="TAMPINES">Tampines</option>
                  <option value="JURONG EAST">Jurong East</option>
                  <option value="BEDOK">Bedok</option>
                  <option value="TOA PAYOH">Toa Payoh</option>
                  <option value="ANG MO KIO">Ang Mo Kio</option>
                  <option value="WOODLANDS">Woodlands</option>
                  <option value="CHOA CHU KANG">Choa Chu Kang</option>
                  <option value="QUEENSTOWN">Queenstown</option>
                  <option value="BUKIT MERAH">Bukit Merah</option>
                  <option value="PUNGGOL">Punggol</option>
                  <option value="SENGKANG">Sengkang</option>
                  <option value="SERANGOON">Serangoon</option>
                  <option value="JURONG WEST">Jurong West</option>
                  <option value="CENTRAL AREA">Central Area</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Flat Type
                </label>
                <select
                  value={selectedFlatType}
                  onChange={(e) => setSelectedFlatType(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium text-xs text-slate-800"
                >
                  <option value="ALL">All Flat Types</option>
                  <option value="3 ROOM">3-Room</option>
                  <option value="4 ROOM">4-Room</option>
                  <option value="5 ROOM">5-Room</option>
                  <option value="EXECUTIVE">Executive / Maisonette</option>
                </select>
              </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Maximum Budget:</span>
                <span className="text-indigo-600 font-bold">
                  ${(maxPrice / 1000).toFixed(0)}k SGD
                </span>
              </div>
              <input
                type="range"
                min="350000"
                max="1500000"
                step="25000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Secondary Filters: Floor & Remaining Lease */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                  Storey Level
                </label>
                <select
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(e.target.value)}
                  className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                >
                  <option value="ALL">Any Storey</option>
                  <option value="LOW">Low Floor (01-06)</option>
                  <option value="MID">Mid Floor (07-12)</option>
                  <option value="HIGH">High Floor (13+)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                  Min Remaining Lease
                </label>
                <select
                  value={minLease}
                  onChange={(e) => setMinLease(Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                >
                  <option value={0}>Any Lease</option>
                  <option value={60}>&gt; 60 Years</option>
                  <option value={70}>&gt; 70 Years</option>
                  <option value={80}>&gt; 80 Years</option>
                  <option value={90}>&gt; 90 Years</option>
                </select>
              </div>
            </div>

            {/* Sort & Quick Polygon Status */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-[11px]">
              <div className="flex items-center space-x-1 text-slate-500">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="date_newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="lease_desc">Lease Remaining</option>
                </select>
              </div>

              {drawnPolygonPoints.length >= 3 && (
                <div className="flex items-center space-x-1 text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200 font-semibold">
                  <span>Zone Filter Active</span>
                  <button
                    onClick={handleClearPolygon}
                    className="ml-1 text-red-500 hover:text-red-700"
                    title="Clear spatial polygon"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Results Count Bar */}
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex justify-between items-center text-xs font-semibold text-slate-600 flex-shrink-0">
            <span>RESULTS ({filteredTransactions.length} BLOCKS)</span>
            <span className="text-[11px] text-slate-400 font-normal">Past 6 Months</span>
          </div>

          {/* Scrollable Transactions Cards List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-500">
                  No matching HDB transactions for your selected criteria.
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTown('ALL');
                    setSelectedFlatType('ALL');
                    setMaxPrice(1500000);
                    setMinLease(0);
                    setSelectedFloor('ALL');
                    handleClearPolygon();
                  }}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const isSelected = selectedProperty?.id === tx.id;
                const psf = Math.round(tx.price / (tx.floor_area_sqm * 10.7639));

                return (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedProperty(tx)}
                    className={`p-3 rounded-2xl border transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-500 shadow-sm ring-2 ring-indigo-500/50'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                            Blk {tx.block} {tx.street}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {tx.town} • Postal {tx.postal}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-black text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-lg">
                          ${(tx.price / 1000).toFixed(0)}k
                        </span>
                        <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                          ~${psf} psf
                        </div>
                      </div>
                    </div>

                    {/* Meta Tags */}
                    <div className="mt-2.5 flex flex-wrap gap-1 text-[11px]">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                        {tx.flat_type}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        Flr {tx.floor}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {tx.lease_remain}y lease
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {tx.floor_area_sqm} sqm
                      </span>
                      <span className="text-slate-400 ml-auto font-mono text-[10px] pt-0.5">
                        {tx.month}
                      </span>
                    </div>

                    {/* Selected Card Quick Action Bar */}
                    {isSelected && (
                      <div className="mt-2.5 pt-2 border-t border-indigo-200/80 flex items-center justify-between text-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDetailModal(true);
                          }}
                          className="text-indigo-700 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>Full Dossier</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCalcModal(true);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg font-medium text-[11px] shadow-2xs flex items-center gap-1"
                        >
                          <Calculator className="w-3 h-3" />
                          <span>Check CPF Grants</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Interactive Leaflet Map & Proximity Engine */}
        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
          
          {/* Top Floating Overlay: View Tabs & Amenities Toggles */}
          <div className="absolute top-3 left-3 right-3 z-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pointer-events-none">
            
            {/* View Mode Switcher */}
            <div className="bg-white/95 backdrop-blur-md shadow-md rounded-2xl p-1 border border-slate-200/80 flex items-center space-x-1 text-xs pointer-events-auto">
              <button
                onClick={() => setActiveMainTab('map')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
                  activeMainTab === 'map'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Spatial Map View</span>
              </button>

              <button
                onClick={() => setActiveMainTab('schools')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
                  activeMainTab === 'schools'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>MOE P1 Priority Matrix</span>
              </button>
            </div>

            {/* Spatial Budget Perimeter Tool ("What Does My Budget Buy?") */}
            <div className="bg-slate-900/95 text-white backdrop-blur-md shadow-md rounded-2xl p-1.5 border border-slate-700 flex items-center space-x-2 text-xs pointer-events-auto">
              <div className="flex items-center space-x-1 text-indigo-300 font-bold px-1.5">
                <PenTool className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Budget Zone:</span>
              </div>

              {!isDrawingMode && drawnPolygonPoints.length === 0 ? (
                <>
                  <button
                    onClick={() => {
                      setIsDrawingMode(true);
                      setDrawnPolygonPoints([]);
                    }}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition text-xs"
                  >
                    Draw Custom Polygon
                  </button>
                  <button
                    onClick={handleLoadSampleBudgetPerimeter}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                    title="Load Central Corridor demo perimeter"
                  >
                    Central Corridor
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] text-emerald-400 font-medium">
                    {drawnPolygonPoints.length} points
                  </span>
                  <button
                    onClick={handleClearPolygon}
                    className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Clear Zone
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sub-Floating Overlay: Amenity Layer Controls (Active on Map View) */}
          {activeMainTab === 'map' && (
            <div className="absolute top-16 left-3 right-3 z-20 flex flex-wrap items-center gap-1.5 pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md shadow-md rounded-2xl p-2 border border-slate-200/90 flex flex-wrap items-center gap-1.5 text-xs pointer-events-auto">
                <span className="text-[11px] font-bold text-slate-700 px-1">
                  Proximity Layers:
                </span>

                {/* Primary Schools Toggle */}
                <button
                  onClick={() => toggleAmenity('school')}
                  className={`px-2.5 py-1 rounded-xl border font-semibold flex items-center space-x-1.5 transition ${
                    activeAmenities.school
                      ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-2xs'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  <School className="w-3.5 h-3.5 text-amber-600" />
                  <span>Primary Schools</span>
                </button>

                {/* Shopping Malls Toggle */}
                <button
                  onClick={() => toggleAmenity('mall')}
                  className={`px-2.5 py-1 rounded-xl border font-semibold flex items-center space-x-1.5 transition ${
                    activeAmenities.mall
                      ? 'bg-pink-100 border-pink-400 text-pink-900 shadow-2xs'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-pink-600" />
                  <span>Malls</span>
                </button>

                {/* Hawker Centres Toggle */}
                <button
                  onClick={() => toggleAmenity('hawker')}
                  className={`px-2.5 py-1 rounded-xl border font-semibold flex items-center space-x-1.5 transition ${
                    activeAmenities.hawker
                      ? 'bg-orange-100 border-orange-400 text-orange-900 shadow-2xs'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5 text-orange-600" />
                  <span>Hawkers</span>
                </button>

                {/* Transport / MRT Toggle */}
                <button
                  onClick={() => toggleAmenity('transport')}
                  className={`px-2.5 py-1 rounded-xl border font-semibold flex items-center space-x-1.5 transition ${
                    activeAmenities.transport
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-900 shadow-2xs'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  <Train className="w-3.5 h-3.5 text-emerald-600" />
                  <span>MRT / Hubs</span>
                </button>

                {/* Parks Toggle */}
                <button
                  onClick={() => toggleAmenity('park')}
                  className={`px-2.5 py-1 rounded-xl border font-semibold flex items-center space-x-1.5 transition ${
                    activeAmenities.park
                      ? 'bg-teal-100 border-teal-400 text-teal-900 shadow-2xs'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  <TreePine className="w-3.5 h-3.5 text-teal-600" />
                  <span>Parks</span>
                </button>

                {/* Proximity Radius Selector */}
                <div className="flex items-center space-x-1 pl-2 border-l border-slate-200 text-slate-600">
                  <span className="text-[11px] font-medium">Radius:</span>
                  <select
                    value={searchRadiusKm}
                    onChange={(e) => setSearchRadiusKm(Number(e.target.value))}
                    className="p-1 rounded bg-slate-100 border border-slate-200 text-xs font-bold"
                  >
                    <option value={1}>1 km</option>
                    <option value={2}>2 km</option>
                    <option value={3}>3 km</option>
                    <option value={5}>5 km (Full Proximity)</option>
                  </select>
                </div>

                {/* MOE School Circles Toggle */}
                <label className="flex items-center space-x-1 pl-2 border-l border-slate-200 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSchoolZones}
                    onChange={(e) => setShowSchoolZones(e.target.checked)}
                    className="rounded accent-amber-600 cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-amber-800">
                    MOE 1km/2km Rings
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* MAIN CONTENT VIEWPORT */}
          {activeMainTab === 'map' ? (
            <div className="flex-1 w-full h-full relative">
              <MapComponent
                selectedProperty={selectedProperty}
                filteredTransactions={filteredTransactions}
                onSelectProperty={(prop) => setSelectedProperty(prop)}
                amenities={AMENITIES_CATALOG}
                activeAmenities={activeAmenities}
                searchRadiusKm={searchRadiusKm}
                showSchoolZones={showSchoolZones}
                isDrawingMode={isDrawingMode}
                drawnPolygonPoints={drawnPolygonPoints}
                onAddPolygonPoint={handleAddPolygonPoint}
                onClearPolygon={handleClearPolygon}
                onFinishPolygon={handleFinishPolygon}
              />
            </div>
          ) : (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50 custom-scrollbar">
              <div className="max-w-3xl mx-auto space-y-6 pt-16 sm:pt-14">
                <SchoolProximityAnalyzer
                  selectedProperty={selectedProperty}
                  schools={schoolsList}
                />
              </div>
            </div>
          )}

          {/* Bottom Floating Bar on Map: Selected Property Summary */}
          {activeMainTab === 'map' && selectedProperty && (
            <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 pointer-events-auto max-w-4xl mx-auto">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                        Blk {selectedProperty.block} {selectedProperty.street}
                      </h4>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {formatCurrencySGD(selectedProperty.price)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedProperty.town} • {selectedProperty.flat_type} • Flr {selectedProperty.floor} • {selectedProperty.lease_remain} yrs lease remaining
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowDetailModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                  >
                    View Property Dossier
                  </button>
                  <button
                    onClick={() => setShowCalcModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition flex items-center space-x-1"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Grants Calculator</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 4. MODALS */}
      {showCalcModal && selectedProperty && (
        <FinancialCalculatorModal
          property={selectedProperty}
          onClose={() => setShowCalcModal(false)}
        />
      )}

      {showDetailModal && selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          amenities={AMENITIES_CATALOG}
          onClose={() => setShowDetailModal(false)}
          onOpenCalculator={() => setShowCalcModal(true)}
        />
      )}

      {showArchModal && (
        <VercelProxyArchitectureModal onClose={() => setShowArchModal(false)} />
      )}
    </div>
  );
}
