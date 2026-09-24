import React from 'react';
import { HDBTransaction, Amenity, getDistanceMeters, formatCurrencySGD } from '../data/hdbData';
import {
  X,
  Building,
  MapPin,
  Calendar,
  Layers,
  Maximize2,
  TrendingUp,
  School,
  ShoppingBag,
  Utensils,
  Train,
  Calculator,
  Compass,
} from 'lucide-react';

interface PropertyDetailModalProps {
  property: HDBTransaction;
  amenities: Amenity[];
  onClose: () => void;
  onOpenCalculator: () => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  amenities,
  onClose,
  onOpenCalculator,
}) => {
  // Convert sqm to sqft (1 sqm ≈ 10.7639 sqft)
  const floorAreaSqft = Math.round(property.floor_area_sqm * 10.7639);
  const psf = Math.round(property.price / floorAreaSqft);

  // Proximity breakdown
  const nearbyStats = React.useMemo(() => {
    let schools1km = 0;
    let schools2km = 0;
    let malls2km = 0;
    let mrts1km = 0;
    let hawkers2km = 0;

    amenities.forEach((a) => {
      const dist = getDistanceMeters(property.lat, property.lng, a.lat, a.lng);
      if (a.category === 'school') {
        if (dist <= 1000) schools1km++;
        else if (dist <= 2000) schools2km++;
      } else if (a.category === 'mall' && dist <= 2000) {
        malls2km++;
      } else if (a.category === 'transport' && dist <= 1000) {
        mrts1km++;
      } else if (a.category === 'hawker' && dist <= 2000) {
        hawkers2km++;
      }
    });

    return { schools1km, schools2km, malls2km, mrts1km, hawkers2km };
  }, [property, amenities]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-700/50">
              HDB Resale Dossier
            </span>
            <h3 className="text-xl font-black text-white leading-tight">
              Blk {property.block} {property.street}
            </h3>
            <p className="text-xs text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>{property.town} • Postal Code {property.postal}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Price & Key Metrics Card */}
        <div className="p-5 space-y-5">
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-wrap justify-between items-center gap-3">
            <div>
              <span className="text-xs text-slate-500 font-medium">Transacted Resale Price</span>
              <div className="text-2xl font-black text-emerald-600">
                {formatCurrencySGD(property.price)}
              </div>
              <span className="text-xs font-semibold text-slate-600">
                ~${psf.toLocaleString()} PSF
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">Transaction Month</span>
              <div className="text-sm font-bold text-slate-800">{property.month}</div>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded">
                Verified Past 6M
              </span>
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 text-[11px] flex items-center gap-1 mb-1">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                <span>Flat Type / Model</span>
              </div>
              <div className="font-bold text-slate-800">{property.flat_type}</div>
              <div className="text-slate-500 text-[11px]">{property.model}</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 text-[11px] flex items-center gap-1 mb-1">
                <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Floor Area</span>
              </div>
              <div className="font-bold text-slate-800">{property.floor_area_sqm} sqm</div>
              <div className="text-slate-500 text-[11px]">~{floorAreaSqft} sqft</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 text-[11px] flex items-center gap-1 mb-1">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Storey Level</span>
              </div>
              <div className="font-bold text-slate-800">Flr {property.floor}</div>
              <div className="text-slate-500 text-[11px]">{property.floor_category} Level</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 text-[11px] flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Remaining Lease</span>
              </div>
              <div className="font-bold text-slate-800">{property.lease_remain} Years</div>
              <div className="text-slate-500 text-[11px]">Built in {property.lease_commence_date}</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs col-span-2">
              <div className="text-slate-400 text-[11px] flex items-center gap-1 mb-1">
                <Compass className="w-3.5 h-3.5 text-indigo-500" />
                <span>SLA Coordinates</span>
              </div>
              <div className="font-mono text-slate-800 text-[11px]">
                Lat: {property.lat.toFixed(5)}, Lng: {property.lng.toFixed(5)}
              </div>
            </div>
          </div>

          {/* Amenities & Proximity Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Immediate Proximity Scorecard
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <School className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <span className="text-[10px] text-slate-500 block">Schools &lt;1km</span>
                <span className="font-bold text-slate-800 text-sm">{nearbyStats.schools1km}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <Train className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <span className="text-[10px] text-slate-500 block">MRT &lt;1km</span>
                <span className="font-bold text-slate-800 text-sm">{nearbyStats.mrts1km}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <ShoppingBag className="w-4 h-4 text-pink-500 mx-auto mb-1" />
                <span className="text-[10px] text-slate-500 block">Malls &lt;2km</span>
                <span className="font-bold text-slate-800 text-sm">{nearbyStats.malls2km}</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                <Utensils className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                <span className="text-[10px] text-slate-500 block">Hawkers &lt;2km</span>
                <span className="font-bold text-slate-800 text-sm">{nearbyStats.hawkers2km}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap gap-2 justify-end">
          <button
            onClick={() => {
              onClose();
              onOpenCalculator();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <Calculator className="w-4 h-4" />
            <span>Calculate Grants & Mortgage</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
