import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';

const DISTRICT_HOTSPOTS = [
  {
    id: 'dist-1',
    name: 'Bengaluru Urban (BBMP Central & East)',
    nameKn: 'ಬೆಂಗಳೂರು ನಗರ (ಕೇಂದ್ರ & ಪೂರ್ವ)',
    activeGrievances: 412,
    density: 'CRITICAL',
    riskScore: 92,
    topIssue: 'Pothole Craters & Water Supply Cross-Contamination',
    predictedOutbreak: 'Storm drain flooding risk along Koramangala Valley within 48h',
    coordinates: '12.9716° N, 77.5946° E',
    nodalLead: 'Er. V. R. Chandrashekar'
  },
  {
    id: 'dist-2',
    name: 'Belagavi Industrial Zone',
    nameKn: 'ಬೆಳಗಾವಿ ಕೈಗಾರಿಕಾ ವಲಯ',
    activeGrievances: 184,
    density: 'HIGH',
    riskScore: 78,
    topIssue: 'Industrial Effluent Drainage & Power Fluctuations',
    predictedOutbreak: 'Substation transformer overload forecast during evening peak load',
    coordinates: '15.8497° N, 74.4977° E',
    nodalLead: 'S. N. Patil'
  },
  {
    id: 'dist-3',
    name: 'Mysuru Heritage & South Corridor',
    nameKn: 'ಮೈಸೂರು ಹೆರಿಟೇಜ್ & ದಕ್ಷಿಣ ಕಾರಿಡಾರ್',
    activeGrievances: 122,
    density: 'MODERATE',
    riskScore: 64,
    topIssue: 'Street Lighting Faults & Waste Segregation',
    predictedOutbreak: 'Festival procession route cleanliness backlog anticipated',
    coordinates: '12.2958° N, 76.6394° E',
    nodalLead: 'Pooja Hegde'
  },
  {
    id: 'dist-4',
    name: 'Hubballi-Dharwad Twin Cities',
    nameKn: 'ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ ಅವಳಿ ನಗರ',
    activeGrievances: 210,
    density: 'HIGH',
    riskScore: 82,
    topIssue: 'Pipeline Rupture on BRTS Corridor',
    predictedOutbreak: 'Secondary water supply rationing risk in Ward 7 & 12',
    coordinates: '15.3647° N, 75.1240° E',
    nodalLead: 'Er. Sandeep Kulkarni'
  },
  {
    id: 'dist-5',
    name: 'Mangaluru Coastal & Port Belt',
    nameKn: 'ಮಂಗಳೂರು ಕರಾವಳಿ & ಬಂದರು ವಲಯ',
    activeGrievances: 95,
    density: 'MODERATE',
    riskScore: 58,
    topIssue: 'Soil Erosion & Highway Culvert Choking',
    predictedOutbreak: 'High-tide backwater ingress risk near Gurupura riverbed',
    coordinates: '12.9141° N, 74.8560° E',
    nodalLead: 'R. K. Shenoy'
  },
  {
    id: 'dist-6',
    name: 'Kalaburagi Dry Zone & Rural Taluks',
    nameKn: 'ಕಲಬುರಗಿ ಒಣ ವಲಯ ಮತ್ತು ಗ್ರಾಮೀಣ ತಾಲೂಕುಗಳು',
    activeGrievances: 165,
    density: 'HIGH',
    riskScore: 76,
    topIssue: 'Borewell Fluoride Contamination & Tanker Delay',
    predictedOutbreak: 'Seasonal drinking water deficit in 14 village panchayats',
    coordinates: '17.3297° N, 76.8343° E',
    nodalLead: 'A. H. Inamdar'
  }
];

export const GrievanceHeatmapView = () => {
  const { lang } = useLanguage();
  const [selectedZone, setSelectedZone] = useState(DISTRICT_HOTSPOTS[0]);
  const [timeFilter, setTimeFilter] = useState('7_DAYS');
  const [densityFilter, setDensityFilter] = useState('ALL');

  const filteredZones = DISTRICT_HOTSPOTS.filter(z => {
    if (densityFilter === 'ALL') return true;
    return z.density === densityFilter;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Breadcrumbs */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Admin Command', to: '/admin/overview' },
            { label: 'Predictive Grievance Hotspot Heatmap' },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-1">
          <div>
            <h1 className="font-headline text-headline-md font-bold text-on-surface tracking-tight">
              {lang === 'kn' ? 'ಮುನ್ಸೂಚನಾ ದೂರುಗಳ ಹಾಟ್‌ಸ್ಪಾಟ್ ಹೀಟ್‌ಮ್ಯಾಪ್' : 'Predictive Grievance Hotspot Heatmap'}
            </h1>
            <p className="font-body text-body-sm text-secondary">
              Spatial density clustering, seasonal outbreak prediction, and preventative municipal cadre dispatch matrix.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Statutory Demonstration Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
        <span className="material-symbols-outlined text-amber-700 text-xl shrink-0 mt-0.5">
          info
        </span>
        <div className="text-body-xs font-body">
          <strong className="font-bold">SPATIAL PREDICTION DEMONSTRATION:</strong> Geographic hotspot cluster densities, risk indices, and simulated meteorological outbreak forecasts are demonstrations for the prototype design system.
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-body text-label-sm font-semibold text-secondary">Time Horizon:</span>
          {['7_DAYS', '30_DAYS', 'MONSOON_FORECAST'].map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-3 py-1.5 rounded-xl font-body text-label-xs font-bold transition-all ${
                timeFilter === f
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              {f === '7_DAYS' ? 'Past 7 Days' : f === '30_DAYS' ? 'Past 30 Days' : 'Monsoon Predictive Window'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-body text-label-sm font-semibold text-secondary">Filter Risk:</span>
          <select
            value={densityFilter}
            onChange={(e) => setDensityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface border border-outline-variant/40 font-body text-label-sm font-semibold text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Risk Densities</option>
            <option value="CRITICAL">Critical Outbreak Risk</option>
            <option value="HIGH">High Volume Clustering</option>
            <option value="MODERATE">Moderate</option>
          </select>
        </div>
      </div>

      {/* Main Heatmap Visual & District Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Synthetic Spatial Canvas / Map Card */}
        <div className="lg:col-span-2 bg-inverse-surface rounded-2xl p-6 shadow-md flex flex-col justify-between text-inverse-on-surface relative overflow-hidden min-h-[460px]">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-mono text-xs uppercase tracking-wider font-bold text-slate-300">
                Karnataka State Spatial Geospatial Radar
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px] font-bold border border-slate-700">
              Live Geo-Telemetry: 6 Districts
            </span>
          </div>

          {/* Interactive Visual Cluster Map Points */}
          <div className="relative my-8 h-64 flex items-center justify-center">
            <div className="w-full max-w-lg grid grid-cols-3 gap-6 relative z-10">
              {filteredZones.map((zone) => {
                const isSelected = selectedZone.id === zone.id;
                const isCrit = zone.density === 'CRITICAL';
                const isHigh = zone.density === 'HIGH';

                return (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZone(zone)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-primary-container/40 border-primary shadow-lg ring-2 ring-primary'
                        : 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-slate-400 truncate">
                        {zone.name.split(' ')[0]}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCrit ? 'bg-red-500 animate-pulse' : isHigh ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                      />
                    </div>
                    <div className="font-mono text-lg font-extrabold text-white">
                      {zone.activeGrievances}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block truncate">
                      Risk: {zone.riskScore}/100
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Footer Key */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800 relative z-10 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical Cluster
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> High Inflow
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Stable SLA
              </span>
            </div>
            <span>Datum: WGS 84 · Geodetic Grid</span>
          </div>
        </div>

        {/* Selected Zone Deep Dive Card */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <span className="font-mono text-[11px] font-bold text-primary">
                {selectedZone.coordinates}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                  selectedZone.density === 'CRITICAL'
                    ? 'bg-error-container text-on-error-container animate-pulse'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {selectedZone.density} RISK
              </span>
            </div>

            <h3 className="font-headline text-title-lg font-bold text-on-surface mt-3">
              {selectedZone.name}
            </h3>
            {selectedZone.nameKn && (
              <p className="font-body text-body-xs text-secondary mt-0.5">
                {selectedZone.nameKn}
              </p>
            )}

            <div className="mt-5 space-y-3 font-body text-body-sm">
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <span className="font-bold text-label-xs uppercase tracking-wider text-secondary block mb-1">
                  Primary Hotspot Category
                </span>
                <p className="font-bold text-on-surface">
                  {selectedZone.topIssue}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900">
                <span className="font-bold text-label-xs uppercase tracking-wider text-red-700 block mb-1">
                  Predictive Outbreak Forecast
                </span>
                <p className="font-bold text-xs">
                  {selectedZone.predictedOutbreak}
                </p>
              </div>

              <div className="pt-2 text-xs text-secondary space-y-1">
                <p>• Active Zonal Caseload: <strong className="text-on-surface">{selectedZone.activeGrievances} complaints</strong></p>
                <p>• Vulnerability Composite: <strong className="text-primary">{selectedZone.riskScore} / 100</strong></p>
                <p>• Designated Nodal Officer: <strong className="text-on-surface">{selectedZone.nodalLead}</strong></p>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert(`Preemptive dispatch order generated for ${selectedZone.name}. Zonal response cadre alerted.`)}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-body text-label-md font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-lg">emergency</span>
            Dispatch Preemptive Taskforce
          </button>
        </div>
      </div>
    </div>
  );
};

