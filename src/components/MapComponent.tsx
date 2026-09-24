import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { HDBTransaction, Amenity, AmenityCategory } from '../data/hdbData';

interface MapComponentProps {
  selectedProperty: HDBTransaction | null;
  filteredTransactions: HDBTransaction[];
  onSelectProperty: (property: HDBTransaction) => void;
  amenities: Amenity[];
  activeAmenities: Record<AmenityCategory, boolean>;
  searchRadiusKm: number;
  showSchoolZones: boolean;
  isDrawingMode: boolean;
  drawnPolygonPoints: [number, number][];
  onAddPolygonPoint: (point: [number, number]) => void;
  onClearPolygon: () => void;
  onFinishPolygon: () => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  selectedProperty,
  filteredTransactions,
  onSelectProperty,
  amenities,
  activeAmenities,
  searchRadiusKm,
  showSchoolZones,
  isDrawingMode,
  drawnPolygonPoints,
  onAddPolygonPoint,
  onClearPolygon,
  onFinishPolygon,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on central Singapore
    const initialLat = selectedProperty ? selectedProperty.lat : 1.3521;
    const initialLng = selectedProperty ? selectedProperty.lng : 103.8198;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: false,
    });

    // Add zoom control in bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // CartoDB Positron / OSM clean tile layer for Singapore
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | OneMap SLA & Data.gov.sg Data',
    }).addTo(map);

    const layersGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle map click when drawing budget boundary
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isDrawingMode) {
        onAddPolygonPoint([e.latlng.lat, e.latlng.lng]);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawingMode, onAddPolygonPoint]);

  // Update Drawn Polygon on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }

    if (drawnPolygonPoints.length >= 2) {
      const polygon = L.polygon(drawnPolygonPoints, {
        color: '#4f46e5',
        fillColor: '#818cf8',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: isDrawingMode ? '6, 6' : undefined,
      }).addTo(map);

      polygonLayerRef.current = polygon;
    }
  }, [drawnPolygonPoints, isDrawingMode]);

  // Recenter map when selectedProperty changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedProperty) return;

    map.setView([selectedProperty.lat, selectedProperty.lng], 14, {
      animate: true,
    });
  }, [selectedProperty?.id]);

  // Render Map Markers & Overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layersGroup = layersGroupRef.current;
    if (!map || !layersGroup) return;

    layersGroup.clearLayers();

    // 1. Draw Search Radius around Selected Property
    if (selectedProperty) {
      const radiusMeters = searchRadiusKm * 1000;
      L.circle([selectedProperty.lat, selectedProperty.lng], {
        radius: radiusMeters,
        color: '#6366f1',
        fillColor: '#6366f1',
        fillOpacity: 0.04,
        weight: 1.5,
        dashArray: '6, 6',
      })
        .addTo(layersGroup)
        .bindTooltip(`${searchRadiusKm}km Proximity Boundary`, {
          permanent: false,
          direction: 'top',
        });
    }

    // 2. Render Amenities with category styles and MOE school circles
    amenities.forEach((amenity) => {
      if (!activeAmenities[amenity.category]) return;

      // Filter to within radius if property selected
      if (selectedProperty) {
        const dist = map.distance(
          [selectedProperty.lat, selectedProperty.lng],
          [amenity.lat, amenity.lng]
        );
        if (dist > searchRadiusKm * 1000) return;
      }

      let bgColor = '#3b82f6';
      let iconSvg = '';
      let badgeLabel = 'Amenity';

      if (amenity.category === 'school') {
        bgColor = '#f59e0b';
        badgeLabel = 'Primary School';
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;

        // Draw MOE 1km & 2km Priority admission circles if enabled
        if (showSchoolZones) {
          // 1km Circle (Phase 2B/2C top priority)
          L.circle([amenity.lat, amenity.lng], {
            radius: 1000,
            color: '#f59e0b',
            fillColor: '#fbbf24',
            fillOpacity: 0.12,
            weight: 1.5,
          })
            .addTo(layersGroup)
            .bindTooltip(`MOE 1km Priority: ${amenity.name}`, {
              sticky: true,
              className: 'text-xs font-semibold',
            });

          // 2km Circle (Phase 2B/2C 1km-2km priority)
          L.circle([amenity.lat, amenity.lng], {
            radius: 2000,
            color: '#d97706',
            fillColor: '#fef3c7',
            fillOpacity: 0.04,
            weight: 1,
            dashArray: '4, 4',
          })
            .addTo(layersGroup)
            .bindTooltip(`MOE 2km Zone: ${amenity.name}`, {
              sticky: true,
              className: 'text-xs',
            });
        }
      } else if (amenity.category === 'mall') {
        bgColor = '#ec4899';
        badgeLabel = 'Mall';
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
      } else if (amenity.category === 'hawker') {
        bgColor = '#f97316';
        badgeLabel = 'Hawker Centre';
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2-4 12-4-12"/><path d="M18 10H6"/><path d="M5 22h14"/></svg>`;
      } else if (amenity.category === 'transport') {
        bgColor = '#10b981';
        badgeLabel = 'MRT / Interchange';
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><path d="M8 15h0"/><path d="M16 15h0"/></svg>`;
      } else if (amenity.category === 'park') {
        bgColor = '#059669';
        badgeLabel = 'Park & Nature';
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10v.01"/><path d="M14 10v.01"/><path d="M12 2a8 8 0 0 0-8 8v12h16V10a8 8 0 0 0-8-8z"/></svg>`;
      }

      const distanceToSelected = selectedProperty
        ? (
            map.distance(
              [selectedProperty.lat, selectedProperty.lng],
              [amenity.lat, amenity.lng]
            ) / 1000
          ).toFixed(2)
        : null;

      const markerHtml = `
        <div style="background-color: ${bgColor};" class="text-white p-1 rounded-full shadow-md border-2 border-white flex items-center justify-center w-7 h-7 transform hover:scale-125 transition-transform duration-150">
          ${iconSvg}
        </div>
      `;

      const amenityIcon = L.divIcon({
        className: 'amenity-marker-icon',
        html: markerHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const amenityMarker = L.marker([amenity.lat, amenity.lng], {
        icon: amenityIcon,
      }).addTo(layersGroup);

      const popupHtml = `
        <div class="p-2 min-w-[200px] font-sans">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded text-white" style="background-color: ${bgColor}">
              ${badgeLabel}
            </span>
          </div>
          <div class="text-sm font-bold text-slate-800">${amenity.name}</div>
          ${amenity.details ? `<div class="text-xs text-slate-500 mt-1">${amenity.details}</div>` : ''}
          ${
            distanceToSelected
              ? `<div class="mt-2 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded inline-block">
                  📍 ${distanceToSelected} km from selected block
                 </div>`
              : ''
          }
        </div>
      `;

      amenityMarker.bindPopup(popupHtml);
    });

    // 3. Render Non-Selected HDB Transaction Markers
    filteredTransactions.forEach((tx) => {
      const isSelected = selectedProperty?.id === tx.id;
      if (isSelected) return; // Selected property drawn last for z-index dominance

      const icon = L.divIcon({
        className: 'hdb-marker-icon',
        html: `
          <div class="bg-slate-700 hover:bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow border border-white whitespace-nowrap cursor-pointer transition transform hover:scale-110">
            $${(tx.price / 1000).toFixed(0)}k
          </div>
        `,
        iconSize: [44, 20],
        iconAnchor: [22, 10],
      });

      const marker = L.marker([tx.lat, tx.lng], { icon }).addTo(layersGroup);

      marker.on('click', () => {
        onSelectProperty(tx);
      });

      marker.bindTooltip(
        `<strong>Blk ${tx.block} ${tx.street}</strong><br/>${tx.flat_type} • $${(tx.price / 1000).toFixed(0)}k`,
        { direction: 'top', offset: [0, -10] }
      );
    });

    // 4. Render Selected Property Marker (Dominant & Pulsing)
    if (selectedProperty) {
      const selectedIcon = L.divIcon({
        className: 'selected-property-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-12 h-12 bg-indigo-500/30 rounded-full animate-ping"></div>
            <div class="relative bg-indigo-600 text-white p-2 rounded-2xl shadow-xl border-2 border-white flex flex-col items-center justify-center min-w-[50px]">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span class="text-[10px] font-extrabold tracking-tight">$${(selectedProperty.price / 1000).toFixed(0)}k</span>
            </div>
          </div>
        `,
        iconSize: [54, 54],
        iconAnchor: [27, 27],
      });

      const selectedMarker = L.marker(
        [selectedProperty.lat, selectedProperty.lng],
        { icon: selectedIcon, zIndexOffset: 1000 }
      ).addTo(layersGroup);

      const popupContent = `
        <div class="p-2 font-sans min-w-[220px]">
          <div class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-0.5">Selected Property</div>
          <div class="text-sm font-bold text-slate-900 leading-snug">Blk ${selectedProperty.block} ${selectedProperty.street}</div>
          <div class="text-xs text-slate-500 mb-2">${selectedProperty.town} • Postal ${selectedProperty.postal}</div>
          
          <div class="grid grid-cols-2 gap-1.5 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2">
            <div>
              <span class="text-slate-400 block text-[10px]">Flat Type</span>
              <span class="font-semibold text-slate-700">${selectedProperty.flat_type}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px]">Resale Price</span>
              <span class="font-bold text-emerald-600">$${selectedProperty.price.toLocaleString()}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px]">Storey Level</span>
              <span class="font-medium text-slate-700">Flr ${selectedProperty.floor}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px]">Remaining Lease</span>
              <span class="font-medium text-slate-700">${selectedProperty.lease_remain} Years</span>
            </div>
          </div>
          <div class="text-[11px] text-indigo-600 font-semibold text-center py-0.5">
            5km radius & MOE school priority active
          </div>
        </div>
      `;

      selectedMarker.bindPopup(popupContent).openPopup();
    }
  }, [
    selectedProperty,
    filteredTransactions,
    amenities,
    activeAmenities,
    searchRadiusKm,
    showSchoolZones,
  ]);

  return (
    <div className="relative w-full h-full">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Drawing Active Floating Notice */}
      {isDrawingMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 text-white px-4 py-2 rounded-full shadow-2xl border border-indigo-500 backdrop-blur-sm flex items-center space-x-3 text-xs animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            <strong>Drawing Mode:</strong> Click points on map to bound your budget area ({drawnPolygonPoints.length} points set)
          </span>
          <div className="flex items-center space-x-1 pl-2 border-l border-slate-700">
            <button
              onClick={onFinishPolygon}
              disabled={drawnPolygonPoints.length < 3}
              className="px-2.5 py-0.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded text-white font-medium"
            >
              Finish Zone
            </button>
            <button
              onClick={onClearPolygon}
              className="px-2.5 py-0.5 bg-red-600/80 hover:bg-red-500 rounded text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
