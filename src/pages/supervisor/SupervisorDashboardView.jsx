import React from 'react';
import { Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';

export const SupervisorDashboardView = () => {
  const { complaints, officers, escalations, departments } = useComplaints();
  const { lang, t } = useLanguage();

  const overdueList = complaints.filter(c => c.status === 'OVERDUE' || c.hoursRemaining < 0);
  const pendingApprovals = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'UNDER_REVIEW');
  const criticalEscalations = escalations.filter(e => e.level === 'TIER_2' || e.level === 'TIER_3');

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Breadcrumbs */}
      <div>
        <Breadcrumb
          items={[
            { label: t('glossary.supervisor'), to: '/supervisor/dashboard' },
            { label: lang === 'kn' ? 'ವಲಯ ನಿಯಂತ್ರಣ ಫಲಕ' : 'Zonal Command Dashboard' },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-1">
          <div>
            <h1 className="font-headline text-headline-md font-bold text-on-surface tracking-tight">
              {lang === 'kn' ? 'ಮೇಲ್ವಿಚಾರಕರ ನಿಯಂತ್ರಣ ಮತ್ತು ತಂಡದ ಮೇಲ್ವಿಚಾರಣೆ' : 'Supervisor Command & Team Oversight'}
            </h1>
            <p className="font-body text-body-sm text-secondary">
              {lang === 'kn'
                ? 'ವಲಯ 1 (ಬೆಂಗಳೂರು ನಗರ) · ನೈಜ-ಸಮಯದ ತಂಡದ ಸಾಮರ್ಥ್ಯ, ಗಡುವು ಉಲ್ಲಂಘನೆ ನಿಯಂತ್ರಣ ಮತ್ತು ಅನುಮೋದನೆ ದ್ವಾರಗಳು.'
                : 'Zone 1 (Bengaluru Urban & Industrial Belt) · Real-time team capacity, breach mitigation & approval gates.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/supervisor/resolution-approval"
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-body text-label-md font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">fact_check</span>
              {lang === 'kn' ? `ಅನುಮೋದನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ (${pendingApprovals.length})` : `Review Approvals (${pendingApprovals.length})`}
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-body text-label-sm font-semibold text-secondary">
              {lang === 'kn' ? 'ತಂಡದ ಸಕ್ರಿಯ ಕಾರ್ಯಭಾರ' : 'Team Active Caseload'}
            </span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">group</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="font-headline text-headline-sm font-extrabold text-on-surface">
              {complaints.length} {lang === 'kn' ? 'ಪ್ರಕರಣಗಳು' : 'Cases'}
            </div>
            <span className="font-mono text-[11px] text-secondary">
              {lang === 'kn' ? `${officers.length} ನೋಡಲ್ ಅಧಿಕಾರಿಗಳಲ್ಲಿ` : `Across ${officers.length} Nodal Cadres`}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-body text-label-sm font-semibold text-secondary">
              {lang === 'kn' ? 'ಅನುಮೋದನೆ ಬಾಕಿ ಇರುವ ದೂರುಗಳು' : 'Pending Sign-off Approvals'}
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">verified</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="font-headline text-headline-sm font-extrabold text-emerald-700">
              {pendingApprovals.length} {lang === 'kn' ? 'ದ್ವಾರಗಳು' : 'Gateways'}
            </div>
            <span className="font-mono text-[11px] text-secondary">
              {lang === 'kn' ? 'ಮೇಲ್ವಿಚಾರಕರ ಸಹಿಗಾಗಿ ಕಾಯುತ್ತಿದೆ' : 'Awaiting supervisory sign-off'}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-body text-label-sm font-semibold text-secondary">{t('overdueTickets')}</span>
            <span className="w-8 h-8 rounded-lg bg-error-container/30 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-lg animate-pulse">crisis_alert</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="font-headline text-headline-sm font-extrabold text-error">
              {overdueList.length} {lang === 'kn' ? 'ಉಲ್ಲಂಘನೆ' : 'Breached'}
            </div>
            <span className="font-mono text-[11px] text-secondary">
              {lang === 'kn' ? 'ಕಾರಣ ಕೇಳಿ ನೋಟಿಸ್ ನೀಡಲಾಗಿದೆ' : 'Mandatory show-cause issued'}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-body text-label-sm font-semibold text-secondary">{t('escalationLevel')}</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">warning</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="font-headline text-headline-sm font-extrabold text-amber-700">
              {criticalEscalations.length} Critical
            </div>
            <span className="font-mono text-[11px] text-secondary">Statutory penalty exposure</span>
          </div>
        </div>
      </div>

      {/* Grid: Officer Workload Comparison & Overdue Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Officer Workload Comparison */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <h2 className="font-headline text-title-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">equalizer</span>
                Officer Workload Comparison & Capacity
              </h2>
              <Link to="/supervisor/officers" className="text-primary font-body text-xs font-bold hover:underline">
                View Roster →
              </Link>
            </div>

            <div className="mt-4 space-y-4">
              {officers.slice(0, 5).map((off) => {
                const maxCap = 25;
                const pct = Math.min(100, Math.round((off.activeCaseload / maxCap) * 100));
                return (
                  <div key={off.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between font-body text-xs">
                      <span className="font-bold text-on-surface">
                        {off.name} ({off.badge})
                      </span>
                      <span className="font-mono font-semibold text-secondary">
                        {off.activeCaseload} / {maxCap} cases ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-primary'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Link
            to="/admin/officer-workload"
            className="w-full py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-body text-label-sm font-bold text-center transition-colors"
          >
            Rebalance Nodal Workloads
          </Link>
        </div>

        {/* Immediate Escalation & Overdue Alert Dossiers */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <h2 className="font-headline text-title-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-error">notification_important</span>
                Critical Overdue Cases Requiring Review
              </h2>
              <Link to="/supervisor/escalations" className="text-error font-body text-xs font-bold hover:underline">
                Breach Command →
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {overdueList.slice(0, 3).map((item) => (
                <div
                  key={item.token}
                  className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">#{item.token}</span>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <h4 className="font-body text-body-sm font-bold text-on-surface line-clamp-1">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between font-mono text-[11px] text-secondary">
                    <span>Officer: {item.assignedOfficer?.name || 'Unassigned'}</span>
                    <span className="text-error font-bold">{Math.abs(item.hoursRemaining)}h Overdue</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/supervisor/escalations"
            className="w-full py-2 rounded-xl bg-error hover:bg-error/90 text-on-error font-body text-label-sm font-bold text-center transition-colors shadow-xs"
          >
            Enforce Section 8 Escalations
          </Link>
        </div>
      </div>

      {/* Department Performance Summary Table */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
          <h2 className="font-headline text-title-md font-bold text-on-surface">
            Zonal Ministry Performance Scorecard
          </h2>
          <Link to="/admin/departments" className="text-primary font-body text-xs font-bold hover:underline">
            All 24 Ministries →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-secondary font-mono text-[11px] uppercase tracking-wider border-b border-outline-variant/30">
                <th className="py-2.5 px-3">Ministry</th>
                <th className="py-2.5 px-3">SLA Mandate</th>
                <th className="py-2.5 px-3">Active Tickets</th>
                <th className="py-2.5 px-3">Composite Index</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low font-body text-body-xs">
              {departments.slice(0, 4).map((d) => (
                <tr key={d.id} className="hover:bg-surface-container-low/60">
                  <td className="py-3 px-3 font-semibold text-on-surface">{d.name}</td>
                  <td className="py-3 px-3 font-mono text-secondary">{d.slaDays} Days</td>
                  <td className="py-3 px-3 font-mono font-bold text-primary">{d.activeCases || 12}</td>
                  <td className="py-3 px-3 font-mono font-extrabold text-on-surface">{d.compositeScore || 90}/100</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      Compliant
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

