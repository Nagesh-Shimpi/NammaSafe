import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';

export const OfficerRoster = () => {
  const { officers } = useComplaints();
  const { lang } = useLanguage();
  const [selectedOfficer, setSelectedOfficer] = useState(officers[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredOfficers = officers.filter(o =>
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.badge.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Top Classification Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs font-mono text-[11px] text-secondary uppercase tracking-widest">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span>Human Resources & Administrative Cadre</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-bold">Officer Accountability & Performance Roster</span>
          </div>
          <div className="flex items-center gap-space-md mt-1">
            <h1 className="font-headline text-headline-lg text-on-surface tracking-tight font-extrabold">
              Cadre Accountability & Vigilance Matrix
            </h1>
            <span className="px-3 py-1 rounded-full bg-surface-container-high text-primary font-mono text-xs font-bold">
              FY 2024-25 Q3
            </span>
          </div>
        </div>

        {/* Action Suite */}
        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => alert('Exporting full Gazetted Cadre Vigilance Audit Dossier (PDF)...')}
            className="px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-body text-label-md font-semibold shadow-sm hover:bg-surface-container transition-all flex items-center gap-1.5 border border-outline-variant/40"
          >
            <span className="material-symbols-outlined text-base text-secondary">file_download</span>
            <span>Export Audit Dossier</span>
          </button>
          <button
            onClick={() => alert('Emergency Section 8 disciplinary hearing scheduled with District Magistrate.')}
            className="px-4 py-2.5 rounded-lg bg-error-container text-on-error-container font-headline text-label-md font-bold shadow-sm hover:opacity-90 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">gavel</span>
            <span>Schedule Hearing (Sec 8)</span>
          </button>
        </div>
      </div>

      {/* 5-Column Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-xs text-secondary uppercase font-semibold">Total Nodal Officers</span>
              <div className="font-headline text-3xl font-extrabold text-on-surface mt-1">1,420</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">badge</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between font-mono text-xs text-secondary">
            <span><strong className="text-primary font-bold">94.2%</strong> Live in Triage</span>
            <span>1,338 Online</span>
          </div>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-xs text-secondary uppercase font-semibold">Exemplary Tier (&gt;95%)</span>
              <div className="font-headline text-3xl font-extrabold text-primary mt-1">912</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">military_tech</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between font-mono text-xs text-primary font-bold">
            <span>+4.8% MoM Cadre Lift</span>
            <span>★ &gt;= 4.5 Rating</span>
          </div>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-error/30 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-xs text-error uppercase font-bold">Section 8 Default Review</span>
              <div className="font-headline text-3xl font-extrabold text-error mt-1">46</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-error-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined">report_problem</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-error/20 flex items-center justify-between font-mono text-xs text-error font-bold">
            <span>14 Hearing Submissions</span>
            <span>CRITICAL</span>
          </div>
        </div>

        <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-xs text-secondary uppercase font-semibold">Avg Caseload / Burnout</span>
              <div className="font-headline text-3xl font-extrabold text-on-surface mt-1">38 <span className="text-sm font-normal text-secondary">tix/officer</span></div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined">speed</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between font-mono text-xs text-secondary">
            <span>Burnout Index: <strong className="text-on-surface font-bold">Moderate</strong></span>
            <span>Max: 52 (PWD)</span>
          </div>
        </div>
      </div>

      {/* Main Cadre Table */}
      <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-headline-sm font-bold text-on-surface">
              Nodal Officer Accountability Roster
            </h2>
            <p className="font-body text-body-sm text-secondary">
              Real-time monitoring of assigned ticket queues, resolution speed, and disciplinary reviews
            </p>
          </div>
          <input
            type="text"
            placeholder="Search officer by name, badge, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 px-3.5 rounded-lg bg-surface-container-low border border-outline-variant/40 outline-none text-body-sm w-full sm:w-72"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body text-body-sm">
            <thead>
              <tr className="bg-surface-container-low text-secondary font-mono text-[11px] uppercase tracking-wider border-b border-outline-variant/30">
                <th className="py-3 px-4 rounded-l-lg font-semibold">Officer Name & Cadre</th>
                <th className="py-3 px-4 font-semibold">Department & Zone</th>
                <th className="py-3 px-4 font-semibold">Active Caseload</th>
                <th className="py-3 px-4 font-semibold">SLA Resolution Rate</th>
                <th className="py-3 px-4 font-semibold">CSAT Citizen Rating</th>
                <th className="py-3 px-4 font-semibold">Disciplinary Status</th>
                <th className="py-3 px-4 text-right rounded-r-lg font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {filteredOfficers.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => {
                    setSelectedOfficer(o);
                    setIsDrawerOpen(true);
                  }}
                  className="hover:bg-surface-container-low/70 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-mono font-bold flex items-center justify-center">
                        {o.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">{o.name}</span>
                        <span className="text-secondary text-xs">{o.designation}</span>
                        <span className="font-mono text-[11px] text-primary">Badge: {o.badge}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-on-surface">{o.department}</span>
                      <span className="text-secondary text-xs">{o.zone}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold">
                    <span className="text-on-surface">{o.activeCaseload}</span> active tickets
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold ${o.slaRate >= 90 ? 'text-primary' : o.slaRate >= 80 ? 'text-secondary' : 'text-error'}`}>
                        {o.slaRate}%
                      </span>
                      <div className="w-16 bg-surface-container rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${o.slaRate >= 90 ? 'bg-primary' : 'bg-error'}`}
                          style={{ width: `${o.slaRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-amber-600 font-bold">
                    ★ {o.rating} / 5.0
                  </td>
                  <td className="py-3.5 px-4">
                    {o.section8Flag ? (
                      <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-mono text-[10px] font-bold animate-pulse">
                        Section 8 Flagged
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                        Clear Audit
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOfficer(o);
                        setIsDrawerOpen(true);
                      }}
                      className="px-3 py-1 rounded bg-surface-container-low hover:bg-primary hover:text-on-primary text-on-surface font-body text-label-sm font-semibold transition-colors"
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Officer Inspection Dossier Drawer */}
      {isDrawerOpen && selectedOfficer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-lg bg-surface-container-lowest h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto z-10 border-l border-outline-variant/40 animate-in slide-in-from-right duration-200">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                <div>
                  <span className="font-mono text-xs uppercase font-bold text-secondary">Cadre File #{selectedOfficer.badge}</span>
                  <h3 className="font-headline text-headline-sm font-bold text-on-surface mt-1">{selectedOfficer.name}</h3>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-1 rounded text-outline hover:text-on-surface">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2 font-body text-body-sm">
                <div className="flex justify-between">
                  <span className="text-secondary">Department:</span>
                  <span className="font-bold text-on-surface">{selectedOfficer.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Official Designation:</span>
                  <span className="font-bold text-on-surface">{selectedOfficer.designation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Jurisdiction Zone:</span>
                  <span className="font-bold text-on-surface">{selectedOfficer.zone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/30 flex flex-col">
                  <span className="font-mono text-xs text-secondary">Active Caseload</span>
                  <span className="font-headline text-2xl font-bold text-on-surface mt-1">{selectedOfficer.activeCaseload}</span>
                  <span className="text-xs text-secondary font-mono mt-1">High Workload Tier</span>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/30 flex flex-col">
                  <span className="font-mono text-xs text-secondary">Cases Resolved</span>
                  <span className="font-headline text-2xl font-bold text-emerald-700 mt-1">{selectedOfficer.resolvedCount}</span>
                  <span className="text-xs text-emerald-800 font-mono mt-1">Lifetime Redressal</span>
                </div>
              </div>

              {selectedOfficer.section8Flag && (
                <div className="p-4 rounded-xl bg-error-container/40 border border-error/30 text-error flex flex-col gap-2">
                  <span className="font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-lg">warning</span>
                    Section 8 Default Liability Warning
                  </span>
                  <p className="text-body-sm leading-relaxed text-on-error-container">
                    This officer has 3 complaints overdue beyond the statutory 72h window without approved contractor extension. A daily penalty hearing is mandated.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-outline-variant/30 flex flex-col gap-3">
              <button
                onClick={() => alert(`Official Performance Warning issued to ${selectedOfficer.name}`)}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-headline text-label-md font-bold shadow-md hover:bg-primary-container transition-all"
              >
                Issue Formal Performance Directive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

