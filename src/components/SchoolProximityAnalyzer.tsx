import React, { useMemo } from 'react';
import { HDBTransaction, Amenity, getDistanceMeters } from '../data/hdbData';
import { School, CheckCircle2, AlertCircle, Info, ChevronRight } from 'lucide-react';

interface SchoolProximityAnalyzerProps {
  selectedProperty: HDBTransaction | null;
  schools: Amenity[];
}

export const SchoolProximityAnalyzer: React.FC<SchoolProximityAnalyzerProps> = ({
  selectedProperty,
  schools,
}) => {
  if (!selectedProperty) {
    return (
      <div className="p-4 text-center text-slate-400 text-xs">
        Select an HDB block to analyze MOE Primary 1 balloting radius.
      </div>
    );
  }

  // Calculate distance to all primary schools
  const analyzedSchools = useMemo(() => {
    return schools
      .map((sch) => {
        const distanceM = getDistanceMeters(
          selectedProperty.lat,
          selectedProperty.lng,
          sch.lat,
          sch.lng
        );
        const distanceKm = distanceM / 1000;
        let priority: 'PRIORITY_1KM' | 'ZONE_2KM' | 'OUTSIDE_2KM';
        if (distanceKm <= 1.0) {
          priority = 'PRIORITY_1KM';
        } else if (distanceKm <= 2.0) {
          priority = 'ZONE_2KM';
        } else {
          priority = 'OUTSIDE_2KM';
        }

        return {
          ...sch,
          distanceM,
          distanceKm,
          priority,
        };
      })
      .sort((a, b) => a.distanceM - b.distanceM);
  }, [selectedProperty, schools]);

  const within1km = analyzedSchools.filter((s) => s.priority === 'PRIORITY_1KM');
  const within2km = analyzedSchools.filter((s) => s.priority === 'ZONE_2KM');

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-start gap-2.5">
          <div className="p-2 bg-amber-500 text-white rounded-lg shadow-xs flex-shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              MOE Primary 1 Priority Zone Analysis
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Based on SLA OneMap geocoded perimeter boundary for{' '}
              <strong>Blk {selectedProperty.block} {selectedProperty.street}</strong>
            </p>
          </div>
        </div>

        {/* Quick Stats Count */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-amber-200/60">
          <div className="bg-white/90 p-2 rounded-lg border border-amber-200/50">
            <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
              Within 1.0 km (Priority)
            </div>
            <div className="text-xl font-extrabold text-amber-600">
              {within1km.length}{' '}
              <span className="text-xs font-normal text-slate-500">School{within1km.length === 1 ? '' : 's'}</span>
            </div>
          </div>
          <div className="bg-white/90 p-2 rounded-lg border border-amber-200/50">
            <div className="text-[10px] uppercase font-bold text-orange-800 tracking-wider">
              1.0 km to 2.0 km
            </div>
            <div className="text-xl font-extrabold text-orange-600">
              {within2km.length}{' '}
              <span className="text-xs font-normal text-slate-500">School{within2km.length === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* School List */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>Eligible Primary Schools</span>
          <span className="text-[11px] font-normal text-slate-500">Sorted by distance</span>
        </div>

        {analyzedSchools.slice(0, 6).map((sch) => {
          const is1km = sch.priority === 'PRIORITY_1KM';
          const is2km = sch.priority === 'ZONE_2KM';

          return (
            <div
              key={sch.id}
              className={`p-3 rounded-xl border transition ${
                is1km
                  ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300/40'
                  : is2km
                  ? 'bg-orange-50/30 border-orange-200'
                  : 'bg-white border-slate-200 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{sch.name}</span>
                    {is1km && (
                      <span className="bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> &lt; 1km (Highest Priority)
                      </span>
                    )}
                    {is2km && (
                      <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        1km - 2km Zone
                      </span>
                    )}
                  </div>
                  {sch.details && (
                    <p className="text-xs text-slate-500 mt-0.5">{sch.details}</p>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                    {sch.distanceKm < 1
                      ? `${Math.round(sch.distanceM)}m`
                      : `${sch.distanceKm.toFixed(2)} km`}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MOE Balloting Rules Explainer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center gap-1 text-slate-800 font-semibold">
          <Info className="w-3.5 h-3.5 text-indigo-600" />
          <span>MOE Home-School Distance Rule Note:</span>
        </div>
        <p className="leading-relaxed">
          From 2022 onwards, MOE calculates home-school distance from any point on the official school boundary (School Land Boundary) to the applicant's registered address, giving parents slightly expanded 1km and 2km zones. Singapore Citizens living within 1km receive first ballot priority in Phase 2C.
        </p>
      </div>
    </div>
  );
};
