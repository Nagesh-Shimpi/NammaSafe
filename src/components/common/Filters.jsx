import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DEPARTMENTS, DISTRICTS } from '../../utils/constants';

export const Filters = ({
  statusFilter,
  onStatusChange,
  deptFilter,
  onDeptChange,
  districtFilter,
  onDistrictChange,
  onReset
}) => {
  const { t, lang } = useLanguage();

  return (
    <div className="flex flex-wrap items-center gap-space-xs">
      {/* Status Filter */}
      {onStatusChange && (
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-9 px-3 bg-surface-container-low rounded-lg text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/40 cursor-pointer"
        >
          <option value="ALL">{t('allStatuses')}</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="OVERDUE">Overdue / SLA Breach</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="ACTION_TAKEN">Action Taken</option>
          <option value="SUBMITTED">Submitted</option>
        </select>
      )}

      {/* Department Filter */}
      {onDeptChange && (
        <select
          value={deptFilter}
          onChange={(e) => onDeptChange(e.target.value)}
          className="h-9 px-3 bg-surface-container-low rounded-lg text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/40 cursor-pointer max-w-[200px]"
        >
          <option value="ALL">All Departments</option>
          {DEPARTMENTS.map(d => (
            <option key={d.id} value={d.id}>
              {lang === 'kn' ? d.nameKn : d.name}
            </option>
          ))}
        </select>
      )}

      {/* District Filter */}
      {onDistrictChange && (
        <select
          value={districtFilter}
          onChange={(e) => onDistrictChange(e.target.value)}
          className="h-9 px-3 bg-surface-container-low rounded-lg text-body-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/40 cursor-pointer"
        >
          <option value="ALL">All Districts</option>
          {DISTRICTS.map(dist => (
            <option key={dist} value={dist}>{dist}</option>
          ))}
        </select>
      )}

      {onReset && (
        <button
          onClick={onReset}
          className="h-9 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-label-sm font-semibold flex items-center gap-1 transition-colors border border-outline-variant/40"
          title="Reset Filters"
        >
          <span className="material-symbols-outlined text-base">restart_alt</span>
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};

