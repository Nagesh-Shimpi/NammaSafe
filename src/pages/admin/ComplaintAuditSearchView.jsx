import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';

export const ComplaintAuditSearchView = () => {
  const { complaints, departments, officers, escalations, auditLogs } = useComplaints();
  const { lang } = useLanguage();
  const { currentRole } = useAuth();
  const navigate = useNavigate();

  // Search & Filter State (Section 13)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedOfficer, setSelectedOfficer] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedEscalation, setSelectedEscalation] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sorting & Pagination State
  const [sortBy, setSortBy] = useState('registrationDate'); // 'registrationDate' | 'healthScore' | 'slaDeadline' | 'priority'
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const token = (c.token || c.trackingId || c.id || '').toUpperCase();
      const legacy = (c.legacyToken || '').toUpperCase();
      const citizen = (c.citizenName || '').toLowerCase();
      const phone = (c.citizenPhone || '').replace(/\D/g, '');
      const title = (c.title || '').toLowerCase();
      const query = searchTerm.trim().toLowerCase();

      // Search match
      const matchesSearch = !query ||
        token.includes(query.toUpperCase()) ||
        legacy.includes(query.toUpperCase()) ||
        citizen.includes(query) ||
        phone.includes(query) ||
        title.includes(query);

      // Dept match
      const matchesDept = selectedDept === 'ALL' || c.departmentId === selectedDept || c.departmentName === selectedDept;

      // Officer match
      const matchesOfficer = selectedOfficer === 'ALL' || c.assignedOfficer?.id === selectedOfficer || c.assignedOfficer?.name === selectedOfficer;

      // Status match
      const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;

      // Priority match
      const matchesPriority = selectedPriority === 'ALL' || c.priority === selectedPriority;

      // Escalation match
      const matchesEscalation = selectedEscalation === 'ALL' ||
        (selectedEscalation === 'ESCALATED' && c.escalationTier && c.escalationTier !== 'NONE') ||
        (selectedEscalation === 'NONE' && (!c.escalationTier || c.escalationTier === 'NONE')) ||
        c.escalationTier === selectedEscalation;

      // Date Range match
      const regDate = (c.createdAt || '').substring(0, 10);
      const matchesStart = !startDate || regDate >= startDate;
      const matchesEnd = !endDate || regDate <= endDate;

      return matchesSearch && matchesDept && matchesOfficer && matchesStatus && matchesPriority && matchesEscalation && matchesStart && matchesEnd;
    }).sort((a, b) => {
      let valA, valB;
      if (sortBy === 'registrationDate') {
        valA = new Date(a.createdAt || 0).getTime();
        valB = new Date(b.createdAt || 0).getTime();
      } else if (sortBy === 'healthScore') {
        valA = a.healthScore || 0;
        valB = b.healthScore || 0;
      } else if (sortBy === 'slaDeadline') {
        valA = new Date(a.slaDeadline || 0).getTime();
        valB = new Date(b.slaDeadline || 0).getTime();
      } else if (sortBy === 'priority') {
        const pOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        valA = pOrder[a.priority] || 0;
        valB = pOrder[b.priority] || 0;
      }
      return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }, [complaints, searchTerm, selectedDept, selectedOfficer, selectedStatus, selectedPriority, selectedEscalation, startDate, endDate, sortBy, sortOrder]);

  // Pagination calculation
  const totalItems = filteredComplaints.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredComplaints.slice(start, start + pageSize);
  }, [filteredComplaints, currentPage, pageSize]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDept('ALL');
    setSelectedOfficer('ALL');
    setSelectedStatus('ALL');
    setSelectedPriority('ALL');
    setSelectedEscalation('ALL');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Metric counts
  const totalAudited = complaints.length;
  const closedCount = complaints.filter(c => c.status === 'CLOSED').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;
  const reopenedCount = complaints.filter(c => c.status === 'REOPENED').length;
  const escalatedCount = complaints.filter(c => c.escalationTier && c.escalationTier !== 'NONE').length;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Header & Breadcrumb */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Admin Command', to: '/admin/overview' },
            { label: 'Central Complaint Intelligence & Resolution Audit' }
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-headline text-slate-900 tracking-tight flex items-center gap-2">
              <span>{lang === 'kn' ? 'ಕೇಂದ್ರೀಕೃತ ದೂರು ಆಡಿಟ್ ಮತ್ತು ಇಂಟೆಲಿಜೆನ್ಸ್' : 'Centralized Complaint Audit & Intelligence'}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Sakala Audit Gazette
              </span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Complete multi-dimensional search across grievances, officer actions, escalation breaches, and citizen resolution audits.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>Print Gazette Summary</span>
            </button>
            <Link
              to="/admin/all-complaints"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow transition-colors"
            >
              <span className="material-symbols-outlined text-base">format_list_bulleted</span>
              <span>All Complaints Ledger</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Audit Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Audited Grievances</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black font-mono text-slate-900">{totalAudited}</span>
            <span className="text-xs text-slate-400">100% Retained</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Awaiting Citizen Verify</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black font-mono text-teal-600">{resolvedCount}</span>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">Action Ready</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Citizen Confirmed (Closed)</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black font-mono text-emerald-600">{closedCount}</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">CSAT Logged</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Reopened Disputes</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black font-mono text-rose-600">{reopenedCount}</span>
            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">Remanded</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Escalations</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black font-mono text-amber-600">{escalatedCount}</span>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">L1-L3 Tiers</span>
          </div>
        </div>
      </div>

      {/* Multi-Dimensional Search & Filtering Bar (Section 13) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        {/* Search Row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Tracking ID (RTK-2026-XXXXXX / GRV-XXXX), Citizen Name, Mobile Number, or Grievance Keywords..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-sm">filter_alt_off</span>
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Chips & Selectors Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Department */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">All Departments ({departments.length})</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Assigned Officer */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nodal Officer</label>
            <select
              value={selectedOfficer}
              onChange={(e) => {
                setSelectedOfficer(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">All Officers ({officers.length})</option>
              {officers.map(o => (
                <option key={o.id} value={o.id}>{o.name} ({o.badge || o.employeeId})</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Lifecycle Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEWLY_REGISTERED">Newly Registered</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="VERIFIED">Verified</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="OVERDUE">Overdue</option>
              <option value="RESOLVED">Resolved (Awaiting Citizen)</option>
              <option value="REOPENED">Reopened Dispute</option>
              <option value="CLOSED">Closed (Completed)</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          {/* Escalation Tier */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Escalation</label>
            <select
              value={selectedEscalation}
              onChange={(e) => {
                setSelectedEscalation(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">All Dockets</option>
              <option value="ESCALATED">Any Active Escalation</option>
              <option value="TIER_1">Tier 1 (Nodal Officer Alert)</option>
              <option value="TIER_2">Tier 2 (Zonal Commissioner)</option>
              <option value="TIER_3">Tier 3 (Principal Secretary)</option>
              <option value="NONE">Unescalated</option>
            </select>
          </div>

          {/* Date Range Start */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Filed From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Audit Search Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 font-headline">Audit Results:</span>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
              {filteredComplaints.length} Records Found
            </span>
            {(selectedDept !== 'ALL' || selectedOfficer !== 'ALL' || selectedStatus !== 'ALL' || searchTerm) && (
              <span className="text-slate-500 italic text-[11px]">(Filtered view active)</span>
            )}
          </div>

          {/* Sorting Controller */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="registrationDate">Registration Date</option>
              <option value="healthScore">Health Score</option>
              <option value="slaDeadline">SLA Deadline</option>
              <option value="priority">Priority</option>
            </select>

            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-1 rounded-lg bg-white border border-slate-300 text-slate-600 hover:text-slate-900 transition-colors"
              title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
            >
              <span className="material-symbols-outlined text-base">
                {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
              </span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        {paginatedComplaints.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
            <p className="mt-2 text-sm font-semibold">No grievance records matched your search filters.</p>
            <button
              onClick={handleResetFilters}
              className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700"
            >
              Clear filters and show all records
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Tracking ID & Title</th>
                  <th className="py-3 px-4">Complainant</th>
                  <th className="py-3 px-4">Department & Officer</th>
                  <th className="py-3 px-4">Status & Escalation</th>
                  <th className="py-3 px-4">SLA & Health</th>
                  <th className="py-3 px-4">Registration</th>
                  <th className="py-3 px-4 text-right">Audit Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedComplaints.map(ticket => {
                  const token = ticket.trackingId || ticket.token || ticket.id;
                  const hours = ticket.hoursRemaining || 24;
                  const isBreach = hours < 0 || ticket.status === 'OVERDUE';

                  return (
                    <tr
                      key={token}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/admin/complaints/${token}`)}
                    >
                      {/* Token & Title */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-teal-700 text-xs group-hover:text-teal-800">
                            #{token}
                          </span>
                          <PriorityBadge priority={ticket.priority} />
                        </div>
                        <p className="text-slate-800 font-medium truncate mt-1 text-xs">
                          {ticket.title}
                        </p>
                        <span className="text-[10px] text-slate-500">{ticket.ward}, {ticket.district}</span>
                      </td>

                      {/* Complainant */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{ticket.citizenName}</span>
                        <span className="font-mono text-[11px] text-slate-500">{ticket.citizenPhone}</span>
                      </td>

                      {/* Department & Officer */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="text-slate-700 font-medium block truncate">
                          {ticket.departmentName || ticket.category}
                        </span>
                        {ticket.assignedOfficer ? (
                          <span className="text-[11px] font-semibold text-slate-600 block mt-0.5">
                            👤 {ticket.assignedOfficer.name} ({ticket.assignedOfficer.badge || ticket.assignedOfficer.employeeId || 'Nodal'})
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-bold block mt-0.5">
                            ⚠️ Unassigned Cadre
                          </span>
                        )}
                      </td>

                      {/* Status & Escalation */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <StatusBadge status={ticket.status} />
                          {ticket.escalationTier && ticket.escalationTier !== 'NONE' && (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono text-[10px] font-bold border border-rose-200">
                              ⚡ {ticket.escalationTier}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* SLA & Health */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-extrabold text-xs shrink-0 ${
                              ticket.healthScore >= 70
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                : ticket.healthScore >= 40
                                ? 'bg-amber-50 text-amber-700 border border-amber-300'
                                : 'bg-rose-50 text-rose-700 border border-rose-300'
                            }`}
                            title={`Health Score: ${ticket.healthScore || 80}/100`}
                          >
                            {ticket.healthScore || 80}
                          </div>
                          <div>
                            <span className={`font-mono text-[11px] font-bold block ${
                              isBreach ? 'text-rose-600' : hours <= 24 ? 'text-amber-600' : 'text-slate-700'
                            }`}>
                              {isBreach ? `Overdue ${Math.abs(hours)}h` : `${hours}h SLA`}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {ticket.daysOverdue > 0 ? `${ticket.daysOverdue}d overdue` : 'On track'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Registration */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {ticket.createdAt || 'Recent'}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/admin/complaints/${token}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition-colors border border-teal-200/80"
                        >
                          <span>Inspect Audit</span>
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="font-bold text-slate-800">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-bold text-slate-800">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
              <span className="font-bold text-slate-800">{totalItems}</span> grievances
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded bg-white border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded bg-white border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                Prev
              </button>
              <span className="px-3 py-1 font-mono font-bold text-slate-800 bg-white border border-slate-300 rounded">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded bg-white border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded bg-white border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
