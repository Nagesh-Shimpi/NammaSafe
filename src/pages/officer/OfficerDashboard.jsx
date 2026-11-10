import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { MetricCard } from '../../components/common/MetricCard';

export const OfficerDashboard = () => {
  const { complaints } = useComplaints();
  const { currentUser } = useAuth();
  const { lang, t, tDepartment, tPriority } = useLanguage();
  const navigate = useNavigate();

  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Filter complaints for this officer or general department triage
  const officerComplaints = complaints.filter(c => {
    const matchesPriority = filterPriority === 'ALL' || c.priority === filterPriority;
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    return matchesPriority && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Officer Triage Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-xs font-mono text-[11px] text-secondary uppercase tracking-wider">
            <span>{lang === 'kn' ? 'ಇಲಾಖಾ ಸರದಿ' : 'Department Queue'}</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-bold">{tDepartment(currentUser.department)}</span>
          </div>
          <h1 className="font-headline text-headline-xl text-on-surface tracking-tight font-extrabold mt-1">
            {lang === 'kn' ? 'ಅಧಿಕಾರಿಗಳ ಕ್ಷೇತ್ರ ತನಿಖೆ ಮತ್ತು ಕ್ರಮ ಕಾರ್ಯಕ್ಷೇತ್ರ' : 'Officer Field Triage & Action Workspace'}
          </h1>
          <p className="font-body text-body-md text-secondary">
            {t('officerName')}: <strong className="text-on-surface">{currentUser.name}</strong> ({currentUser.badge}) · {lang === 'kn' ? 'ಕಾರ್ಯಾಚರಣೆ SLA ಗುರಿ: 24–48 ಗಂ' : 'Operational SLA Target: 24–48h'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/citizen/register')}
            className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-headline text-label-md font-bold shadow-sm hover:bg-primary-container transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>{lang === 'kn' ? 'ಸ್ಥಳ ಪರಿಶೀಲನೆ ಟಿಕೆಟ್ ದಾಖಲಿಸಿ' : 'Lodge Field Inspection Ticket'}</span>
          </button>
        </div>
      </div>

      {/* 4 Officer Quick KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <MetricCard
          title={t('assignedComplaints')}
          value={officerComplaints.length.toString()}
          trend={lang === 'kn' ? '3 ತುರ್ತು ಪ್ರಕರಣ' : '3 High Priority'}
          trendPositive={false}
          icon="inbox"
          badgeText={lang === 'kn' ? 'ಸಕ್ರಿಯ ಹೊರೆ' : 'Active Caseload'}
        />
        <MetricCard
          title={lang === 'kn' ? 'ಗಡುವು ಮೀರಿದ ತುರ್ತು ದೂರುಗಳು' : 'Critical Overdue'}
          value={officerComplaints.filter(c => c.status === 'OVERDUE').length.toString()}
          icon="crisis_alert"
          isCritical={true}
          trend={lang === 'kn' ? 'ತಕ್ಷಣದ ಕ್ರಮ ಅಗತ್ಯ' : 'Immediate Action'}
          trendPositive={false}
          badgeText={lang === 'kn' ? 'SLA ಉಲ್ಲಂಘನೆ' : 'SLA Breached'}
          badgeColor="bg-error-container text-on-error-container font-bold"
        />
        <MetricCard
          title={t('inProgress')}
          value={officerComplaints.filter(c => c.status === 'IN_PROGRESS').length.toString()}
          icon="engineering"
          accentColor="tertiary"
          progressPercent={60}
          badgeText={lang === 'kn' ? 'ಕ್ಷೇತ್ರ ತಂಡ ರವಾನೆ' : 'Field Crew Dispatched'}
        />
        <MetricCard
          title={t('resolvedTotal')}
          value="42"
          icon="task_alt"
          trend={lang === 'kn' ? '96.2% ಸಮಯಪಾಲನೆ' : '96.2% On-Time'}
          trendPositive={true}
          badgeText="CSAT 4.7★"
          badgeColor="bg-emerald-100 text-emerald-800 font-bold"
        />
      </div>

      {/* Main Triage Queue Table */}
      <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-headline-sm font-bold text-on-surface">
              {lang === 'kn' ? `ನನ್ನ ಕ್ರಮ ಸರದಿ (${officerComplaints.length} ದೂರುಗಳು)` : `My Action Queue (${officerComplaints.length} Tickets)`}
            </h2>
            <p className="font-body text-body-sm text-secondary">
              {lang === 'kn'
                ? 'ವಿವರವಾದ ದೂರಿನ ದಾಖಲೆ ಮತ್ತು ಕ್ರಮದ ವರದಿಯನ್ನು ಸಲ್ಲಿಸಲು ಯಾವುದೇ ಸಾಲನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ'
                : 'Click any ticket to open detailed case dossier, audio transcripts, and submit action reports'}
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="h-9 px-3 bg-surface-container-low rounded-lg text-body-sm text-on-surface border border-outline-variant/40 outline-none cursor-pointer"
            >
              <option value="ALL">{lang === 'kn' ? 'ಎಲ್ಲಾ ಆದ್ಯತೆಗಳು' : 'All Priorities'}</option>
              <option value="CRITICAL">{t('priorityCritical')}</option>
              <option value="HIGH">{t('priorityHigh')}</option>
              <option value="MEDIUM">{t('priorityMedium')}</option>
              <option value="LOW">{t('priorityLow')}</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 px-3 bg-surface-container-low rounded-lg text-body-sm text-on-surface border border-outline-variant/40 outline-none cursor-pointer"
            >
              <option value="ALL">{t('allStatuses')}</option>
              <option value="IN_PROGRESS">{t('statusInProgress')}</option>
              <option value="OVERDUE">{t('statusOverdue')}</option>
              <option value="UNDER_REVIEW">{t('statusUnderReview')}</option>
              <option value="ACTION_TAKEN">{t('statusActionTaken')}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body text-body-sm">
            <thead>
              <tr className="bg-surface-container-low text-secondary font-mono text-[11px] uppercase tracking-wider border-b border-outline-variant/30">
                <th className="py-3 px-4 rounded-l-lg font-semibold">{t('glossary.trackingId')} & {t('glossary.priority')}</th>
                <th className="py-3 px-4 font-semibold">{t('citizenInformation')}</th>
                <th className="py-3 px-4 font-semibold">{t('complaintTitle')}</th>
                <th className="py-3 px-4 font-semibold">{t('deadlineHealth')}</th>
                <th className="py-3 px-4 font-semibold">{t('avgHealthScore')}</th>
                <th className="py-3 px-4 font-semibold">{t('glossary.status')}</th>
                <th className="py-3 px-4 text-right rounded-r-lg font-semibold">{t('glossary.view')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {officerComplaints.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/officer/complaints/${c.token}`)}
                  className={`hover:bg-surface-container-low/70 transition-colors cursor-pointer ${
                    c.status === 'OVERDUE' ? 'bg-error-container/10' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono">
                    <div className="flex flex-col">
                      <span className={`font-bold ${c.status === 'OVERDUE' ? 'text-error' : 'text-primary'}`}>
                        {c.token}
                      </span>
                      <span className={`text-[10px] font-bold ${c.priority === 'CRITICAL' ? 'text-error' : 'text-secondary'}`}>
                        {tPriority(c.priority)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface">{c.citizenName}</span>
                      <span className="text-secondary text-xs">{c.ward}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="font-medium text-on-surface line-clamp-1 truncate">
                      {lang === 'kn' && c.titleKn ? c.titleKn : c.title}
                    </span>
                    <span className="text-secondary text-xs line-clamp-1 truncate">{c.description}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className={`font-bold text-xs ${c.hoursRemaining < 0 ? 'text-error animate-pulse' : 'text-primary'}`}>
                      {c.hoursRemaining < 0
                        ? (lang === 'kn' ? `${Math.abs(c.hoursRemaining)}ಗಂ ಮೀರಿದೆ` : `Overdue ${Math.abs(c.hoursRemaining)}h`)
                        : (lang === 'kn' ? `${c.hoursRemaining}ಗಂ ಬಾಕಿ` : `${c.hoursRemaining}h remaining`)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                      <span className={`w-2 h-2 rounded-full ${c.healthScore >= 70 ? 'bg-emerald-500' : c.healthScore >= 40 ? 'bg-amber-500' : 'bg-error'}`} />
                      <span>{c.healthScore || 80}/100</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/officer/complaints/${c.token}`);
                      }}
                      className="px-3 py-1 rounded bg-primary text-on-primary font-body text-label-sm font-semibold hover:bg-primary-container transition-colors shadow-sm"
                    >
                      {lang === 'kn' ? 'ಪರಿಶೀಲಿಸಿ' : 'Inspect'}
                    </button>
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

