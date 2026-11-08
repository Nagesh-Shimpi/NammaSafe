import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';

export const ActionHistoryView = () => {
  const { complaints } = useComplaints();
  const { lang } = useLanguage();

  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten all action logs across complaints
  const allActions = useMemo(() => {
    const list = [];
    complaints.forEach((c) => {
      if (c.actions && Array.isArray(c.actions)) {
        c.actions.forEach((act) => {
          list.push({
            ...act,
            token: c.token,
            complaintTitle: c.title,
            department: c.departmentName,
            status: c.status
          });
        });
      }
    });

    // Sort descending by date
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [complaints]);

  const filteredActions = allActions.filter((act) => {
    const matchesType = selectedType === 'ALL' || act.type === selectedType;
    const matchesSearch =
      act.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.complaintTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getActionTypeBadge = (type) => {
    switch (type) {
      case 'SUBMITTED':
        return <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">SUBMITTED</span>;
      case 'AUTO_ASSIGNED':
      case 'AUTO_ROUTED':
        return <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[10px] font-bold">AI ROUTED</span>;
      case 'STATUS_UPDATE':
        return <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">STATUS UPDATE</span>;
      case 'OFFICER_REASSIGNMENT':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[10px] font-bold">REASSIGNMENT</span>;
      case 'ESCALATION':
        return <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-mono text-[10px] font-bold">ESCALATION</span>;
      case 'NOTE':
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[10px] font-bold">FIELD NOTE</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[10px] font-bold">{type}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Breadcrumbs */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Officer Workspace', to: '/officer/dashboard' },
            { label: 'Action History & Cadre Audit Trail' },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-1">
          <div>
            <h1 className="font-headline text-headline-md font-bold text-on-surface tracking-tight">
              {lang === 'kn' ? 'ಕ್ರಮಗಳ ಇತಿಹಾಸ ಮತ್ತು ಆಡಿಟ್ ದಾಖಲೆ' : 'Grievance Action History & Cadre Audit Trail'}
            </h1>
            <p className="font-body text-body-sm text-secondary">
              Immutable chronological record of field inspections, status transitions, and supervisory notices.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action logs by token, remarks, or actor..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-outline-variant/40 font-body text-body-sm text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'STATUS_UPDATE', 'OFFICER_REASSIGNMENT', 'ESCALATION', 'NOTE'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl font-body text-label-xs font-bold transition-all ${
                selectedType === type
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              {type === 'ALL' ? 'All Event Types' : type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Action Timeline List */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <span className="font-headline text-title-md font-bold text-on-surface">
            Historical Action Log Entries
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed/40 font-mono text-xs font-bold text-secondary-fixed">
            {filteredActions.length} Recorded Events
          </span>
        </div>

        {filteredActions.length === 0 ? (
          <div className="py-12 text-center text-secondary">
            No action log records matching the active filter.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-outline-variant/40">
            {filteredActions.map((act, idx) => (
              <div key={idx} className="relative flex flex-col gap-1.5 group">
                {/* Timeline node */}
                <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-surface shadow-xs group-hover:scale-125 transition-transform" />

                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-secondary">{act.date}</span>
                  {getActionTypeBadge(act.type)}
                  <Link
                    to={`/officer/complaints/${act.token}`}
                    className="font-mono text-xs font-bold text-primary hover:underline"
                  >
                    #{act.token}
                  </Link>
                  <span className="font-body text-xs text-secondary">· by <strong className="text-on-surface">{act.user}</strong></span>
                </div>

                <p className="font-body text-body-sm font-semibold text-on-surface">
                  {act.text}
                </p>

                <p className="font-body text-[11px] text-secondary">
                  Subject: {act.complaintTitle} ({act.department})
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

