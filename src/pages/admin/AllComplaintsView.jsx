import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { ComplaintDetailsModal } from '../../components/complaints/ComplaintDetailsModal';
import { COMPLAINT_CATEGORIES } from '../../data/complaintCategories';
import { isValidStatusTransition } from '../../utils/constants';

export const AllComplaintsView = () => {
  const {
    complaints,
    departments,
    officers,
    verifyComplaint,
    requestAdditionalInfo,
    rejectComplaint,
    assignComplaintOfficer,
    updateComplaintStatus,
    updateComplaintDetails
  } = useComplaints();

  const { lang, t } = useLanguage();
  const { currentRole, USER_ROLES } = useAuth();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  // Sorting & Pagination States
  const [sortField, setSortField] = useState('regDate'); // 'regDate', 'priority', 'token', 'status'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Active Modals & Operations
  const [activeTicket, setActiveTicket] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isRequestInfoModalOpen, setIsRequestInfoModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Modal Input Values
  const [verificationNotes, setVerificationNotes] = useState('');
  const [requestInfoMessage, setRequestInfoMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [targetStatus, setTargetStatus] = useState('IN_PROGRESS');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [editFormData, setEditFormData] = useState({ title: '', description: '', priority: 'MEDIUM', category: '' });
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // -------------------------------------------------------------------------
  // KPI METRICS (The 8 requested summary cards)
  // -------------------------------------------------------------------------
  const summaryMetrics = useMemo(() => {
    const total = complaints.length;
    const newlyRegistered = complaints.filter(c => c.status === 'NEWLY_REGISTERED' || c.status === 'SUBMITTED').length;
    const pendingVerification = complaints.filter(c => c.status === 'PENDING_VERIFICATION' || c.verificationStatus === 'PENDING').length;
    const verified = complaints.filter(c => c.status === 'VERIFIED' || c.verificationStatus === 'VERIFIED').length;
    const assigned = complaints.filter(c => c.status === 'ASSIGNED').length;
    const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'UNDER_REVIEW').length;
    const resolved = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'ACTION_TAKEN' || c.status === 'CLOSED').length;
    const rejected = complaints.filter(c => c.status === 'REJECTED' || c.verificationStatus === 'REJECTED').length;

    return [
      { id: 'ALL', label: 'Total Complaints', count: total, icon: 'receipt_long', color: 'border-slate-300 text-slate-800 bg-white', trend: '100% Registry' },
      { id: 'NEWLY_REGISTERED', label: 'Newly Registered', count: newlyRegistered, icon: 'fiber_new', color: 'border-sky-300 text-sky-800 bg-sky-50/50', trend: `${Math.round((newlyRegistered / (total || 1)) * 100)}% of total` },
      { id: 'PENDING_VERIFICATION', label: 'Pending Verification', count: pendingVerification, icon: 'pending_actions', color: 'border-amber-300 text-amber-800 bg-amber-50/50', trend: 'Requires scrutiny' },
      { id: 'VERIFIED', label: 'Verified Complaints', count: verified, icon: 'verified', color: 'border-teal-300 text-teal-800 bg-teal-50/50', trend: 'Ready for cadre' },
      { id: 'ASSIGNED', label: 'Assigned Complaints', count: assigned, icon: 'assignment_ind', color: 'border-blue-300 text-blue-800 bg-blue-50/50', trend: 'Nodal allocated' },
      { id: 'IN_PROGRESS', label: 'In Progress', count: inProgress, icon: 'autorenew', color: 'border-indigo-300 text-indigo-800 bg-indigo-50/50', trend: 'Field action' },
      { id: 'RESOLVED', label: 'Resolved Complaints', count: resolved, icon: 'task_alt', color: 'border-emerald-300 text-emerald-800 bg-emerald-50/50', trend: `${Math.round((resolved / (total || 1)) * 100)}% resolution` },
      { id: 'REJECTED', label: 'Rejected Complaints', count: rejected, icon: 'cancel', color: 'border-rose-300 text-rose-800 bg-rose-50/50', trend: 'Retained in audit' }
    ];
  }, [complaints]);

  // -------------------------------------------------------------------------
  // FILTERING & SEARCH
  // -------------------------------------------------------------------------
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const token = (c.trackingId || c.token || c.id || '').toLowerCase();
      const legacyToken = (c.legacyToken || '').toLowerCase();
      const title = (c.title || '').toLowerCase();
      const citizenName = (c.citizenName || '').toLowerCase();
      const phone = (c.citizenPhone || '').toLowerCase();

      const matchesSearch = !q || token.includes(q) || legacyToken.includes(q) || title.includes(q) || citizenName.includes(q) || phone.includes(q);

      const matchesDept = selectedDept === 'ALL' || c.departmentId === selectedDept;
      const matchesCat = selectedCategory === 'ALL' || c.category === selectedCategory;
      const matchesPriority = selectedPriority === 'ALL' || c.priority === selectedPriority;

      let matchesStatus = true;
      if (selectedStatus === 'ALL') {
        matchesStatus = true;
      } else if (selectedStatus === 'NEWLY_REGISTERED') {
        matchesStatus = c.status === 'NEWLY_REGISTERED' || c.status === 'SUBMITTED';
      } else if (selectedStatus === 'PENDING_VERIFICATION') {
        matchesStatus = c.status === 'PENDING_VERIFICATION' || c.verificationStatus === 'PENDING';
      } else if (selectedStatus === 'RESOLVED') {
        matchesStatus = c.status === 'RESOLVED' || c.status === 'ACTION_TAKEN' || c.status === 'CLOSED';
      } else if (selectedStatus === 'REJECTED') {
        matchesStatus = c.status === 'REJECTED' || c.verificationStatus === 'REJECTED';
      } else {
        matchesStatus = c.status === selectedStatus;
      }

      // Date filtering
      let matchesDate = true;
      if (dateFilter === 'TODAY') {
        const todayStr = new Date().toISOString().slice(0, 10);
        matchesDate = (c.createdAt || c.regDate || '').includes(todayStr);
      } else if (dateFilter === 'LAST_7_DAYS') {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
        matchesDate = (c.createdAt || c.regDate || '') >= sevenDaysAgo;
      }

      return matchesSearch && matchesDept && matchesCat && matchesPriority && matchesStatus && matchesDate;
    });
  }, [complaints, searchQuery, selectedDept, selectedCategory, selectedStatus, selectedPriority, dateFilter]);

  // -------------------------------------------------------------------------
  // SORTING
  // -------------------------------------------------------------------------
  const sortedComplaints = useMemo(() => {
    return [...filteredComplaints].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'regDate') {
        const dateA = a.createdAt || a.regDate || '';
        const dateB = b.createdAt || b.regDate || '';
        comparison = dateA.localeCompare(dateB);
      } else if (sortField === 'token') {
        const tokenA = a.trackingId || a.token || a.id || '';
        const tokenB = b.trackingId || b.token || b.id || '';
        comparison = tokenA.localeCompare(tokenB);
      } else if (sortField === 'priority') {
        const orderMap = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        comparison = (orderMap[a.priority] || 0) - (orderMap[b.priority] || 0);
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [filteredComplaints, sortField, sortOrder]);

  // -------------------------------------------------------------------------
  // PAGINATION
  // -------------------------------------------------------------------------
  const totalPages = Math.ceil(sortedComplaints.length / pageSize) || 1;
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedComplaints.slice(start, start + pageSize);
  }, [sortedComplaints, currentPage, pageSize]);

  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDept('ALL');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSelectedPriority('ALL');
    setDateFilter('ALL');
    setCurrentPage(1);
  };

  // -------------------------------------------------------------------------
  // ACTION HANDLERS
  // -------------------------------------------------------------------------
  const handleOpenDossier = (ticket) => {
    setActiveTicket(ticket);
    setIsDossierOpen(true);
  };

  const handleOpenVerify = (ticket) => {
    setActiveTicket(ticket);
    setVerificationNotes('');
    setIsVerifyModalOpen(true);
  };

  const handleConfirmVerify = () => {
    if (!activeTicket) return;
    verifyComplaint(activeTicket.token, verificationNotes, 'Central Verification Officer');
    showToast(`Grievance #${activeTicket.token} has been verified successfully.`);
    setIsVerifyModalOpen(false);
  };

  const handleOpenRequestInfo = (ticket) => {
    setActiveTicket(ticket);
    setRequestInfoMessage('');
    setIsRequestInfoModalOpen(true);
  };

  const handleConfirmRequestInfo = () => {
    if (!activeTicket) return;
    if (!requestInfoMessage.trim()) {
      alert('Please enter a clarification message for the citizen.');
      return;
    }
    requestAdditionalInfo(activeTicket.token, requestInfoMessage, 'Scrutiny Desk Officer');
    showToast(`Clarification request dispatched to citizen ${activeTicket.citizenPhone}.`);
    setIsRequestInfoModalOpen(false);
  };

  const handleOpenReject = (ticket) => {
    setActiveTicket(ticket);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!activeTicket) return;
    if (!rejectionReason.trim()) {
      alert('A valid rejection reason is mandatory.');
      return;
    }
    rejectComplaint(activeTicket.token, rejectionReason, 'Administrative Scrutiny Desk');
    showToast(`Grievance #${activeTicket.token} rejected and retained in audit log.`);
    setIsRejectModalOpen(false);
  };

  const handleOpenAssign = (ticket) => {
    setActiveTicket(ticket);
    setSelectedOfficerId(ticket.assignedOfficer?.id || officers[0]?.id || '');
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = () => {
    if (!activeTicket || !selectedOfficerId) return;
    assignComplaintOfficer(activeTicket.token, selectedOfficerId, {
      assignedBy: 'Central Admin Desk',
      notes: 'Cadre allocated via Complaint Management Desk'
    });
    const off = officers.find(o => o.id === selectedOfficerId);
    showToast(`Complaint #${activeTicket.token} assigned to ${off?.name || 'Nodal Officer'}.`);
    setIsAssignModalOpen(false);
  };

  const handleOpenStatus = (ticket) => {
    setActiveTicket(ticket);
    setTargetStatus(ticket.status || 'IN_PROGRESS');
    setStatusRemarks('');
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatus = () => {
    if (!activeTicket) return;
    if (!isValidStatusTransition(activeTicket.status, targetStatus)) {
      alert(`Invalid transition from ${activeTicket.status} to ${targetStatus} according to Karnataka Redressal Rules.`);
      return;
    }
    updateComplaintStatus(activeTicket.token, targetStatus, statusRemarks, 'Central Admin Console');
    showToast(`Status updated to ${targetStatus} for #${activeTicket.token}.`);
    setIsStatusModalOpen(false);
  };

  const handleOpenEdit = (ticket) => {
    setActiveTicket(ticket);
    setEditFormData({
      title: ticket.title || '',
      description: ticket.description || '',
      priority: ticket.priority || 'MEDIUM',
      category: ticket.category || COMPLAINT_CATEGORIES[0].name
    });
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = () => {
    if (!activeTicket) return;
    updateComplaintDetails(activeTicket.token, editFormData, 'Central Admin Desk');
    showToast(`Grievance #${activeTicket.token} details updated successfully.`);
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-teal-400">check_circle</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Admin Console', path: '/admin/overview' },
              { label: 'Complaint Intake & Management' }
            ]}
          />
          <h1 className="text-2xl sm:text-3xl font-bold font-headline text-slate-900 mt-1">
            Complaint Registration & Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Central repository for grievance intake, jurisdictional verification, cadre assignment, and lifecycle monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/citizen/register"
            className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Register New Grievance</span>
          </Link>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 8 SUMMARY CARDS (Click-to-filter dashboard) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {summaryMetrics.map((card) => {
          const isSelected = selectedStatus === card.id;
          return (
            <div
              key={card.id}
              onClick={() => {
                setSelectedStatus(card.id);
                setCurrentPage(1);
              }}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${card.color} ${
                isSelected
                  ? 'ring-2 ring-teal-600 shadow-md scale-[1.02]'
                  : 'hover:shadow-sm hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="material-symbols-outlined text-lg opacity-80">{card.icon}</span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
                )}
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-mono font-bold leading-tight">{card.count}</p>
                <p className="text-[11px] font-bold truncate mt-0.5">{card.label}</p>
                <p className="text-[10px] opacity-75 mt-0.5 truncate">{card.trend}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* SEARCH & FILTERS BAR */}
      {/* =================================================================== */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Tracking ID, citizen name, phone, title..."
              className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-xs transition-all outline-none"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-xs transition-all outline-none cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-xs transition-all outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {COMPLAINT_CATEGORIES.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-xs transition-all outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 text-xs transition-all outline-none cursor-pointer"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Registered Today</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
            </select>
          </div>
        </div>

        {/* Filter Badges & Reset Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span>Showing <strong>{filteredComplaints.length}</strong> matching grievances</span>
            {(selectedDept !== 'ALL' || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || selectedPriority !== 'ALL' || searchQuery || dateFilter !== 'ALL') && (
              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px]">
                Filters Active
              </span>
            )}
          </div>
          <button
            onClick={handleResetFilters}
            className="hover:text-teal-700 font-bold flex items-center gap-1 transition-all"
          >
            <span className="material-symbols-outlined text-sm">filter_alt_off</span>
            <span>Reset All Filters</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* COMPREHENSIVE COMPLAINTS TABLE */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <th
                  onClick={() => handleSortToggle('token')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Tracking ID</span>
                    <span className="material-symbols-outlined text-xs">
                      {sortField === 'token' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                    </span>
                  </div>
                </th>
                <th className="py-3.5 px-4 min-w-[200px]">Complaint Title</th>
                <th className="py-3.5 px-4">Citizen Name & Mobile</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Assigned Officer</th>
                <th
                  onClick={() => handleSortToggle('regDate')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Reg Date</span>
                    <span className="material-symbols-outlined text-xs">
                      {sortField === 'regDate' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('priority')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <span className="material-symbols-outlined text-xs">
                      {sortField === 'priority' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('status')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Current Status</span>
                    <span className="material-symbols-outlined text-xs">
                      {sortField === 'status' ? (sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                    </span>
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedComplaints.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-slate-300">inbox</span>
                      <p className="font-semibold text-sm">No grievances match the specified criteria.</p>
                      <button
                        onClick={handleResetFilters}
                        className="text-xs font-bold text-teal-700 underline mt-1"
                      >
                        Reset filters to view all records
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedComplaints.map((ticket) => {
                  const token = ticket.trackingId || ticket.token || ticket.id;
                  const isPendingVerification = ticket.status === 'NEWLY_REGISTERED' || ticket.status === 'PENDING_VERIFICATION';

                  return (
                    <tr
                      key={token}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Tracking ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-800 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDossier(ticket)}
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{token}</span>
                          <span className="material-symbols-outlined text-[13px] opacity-0 group-hover:opacity-100 text-teal-600">
                            visibility
                          </span>
                        </button>
                      </td>

                      {/* Title */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900 line-clamp-1 max-w-xs">{ticket.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{ticket.ward}, {ticket.district}</p>
                      </td>

                      {/* Citizen Name & Phone */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-800">{ticket.citizenName}</p>
                        <p className="font-mono text-[11px] text-slate-500">{ticket.citizenPhone}</p>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {ticket.category}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="text-slate-800 font-medium truncate max-w-[150px]" title={ticket.departmentName}>
                          {ticket.departmentName}
                        </p>
                      </td>

                      {/* Assigned Officer */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {ticket.assignedOfficer ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-slate-800 font-medium truncate max-w-[130px]" title={ticket.assignedOfficer.name}>
                              {ticket.assignedOfficer.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-amber-700 font-semibold text-[11px] flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">hourglass_empty</span>
                            <span>Unassigned</span>
                          </span>
                        )}
                      </td>

                      {/* Registration Date */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {(ticket.createdAt || ticket.regDate || '').slice(0, 10)}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <PriorityBadge priority={ticket.priority} />
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={ticket.status} />
                      </td>

                      {/* Actions Menu */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Dossier */}
                          <button
                            onClick={() => handleOpenDossier(ticket)}
                            title="Inspect Complete Dossier (9 Tabs)"
                            className="p-1.5 rounded-lg hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition-all"
                          >
                            <span className="material-symbols-outlined text-base">info</span>
                          </button>

                          {/* Quick Verify if Pending */}
                          {isPendingVerification && (
                            <button
                              onClick={() => handleOpenVerify(ticket)}
                              title="Verify Grievance"
                              className="p-1.5 rounded-lg hover:bg-teal-50 text-teal-700 hover:text-teal-800 transition-all"
                            >
                              <span className="material-symbols-outlined text-base">verified</span>
                            </button>
                          )}

                          {/* Quick Assign / Reassign */}
                          <button
                            onClick={() => handleOpenAssign(ticket)}
                            title="Assign Nodal Officer"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all"
                          >
                            <span className="material-symbols-outlined text-base">person_add</span>
                          </button>

                          {/* Quick Update Status */}
                          <button
                            onClick={() => handleOpenStatus(ticket)}
                            title="Update Complaint Status"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all"
                          >
                            <span className="material-symbols-outlined text-base">sync_alt</span>
                          </button>

                          {/* Quick Edit */}
                          <button
                            onClick={() => handleOpenEdit(ticket)}
                            title="Edit Permitted Complaint Details"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8 px-2 rounded-lg border border-slate-300 bg-white font-medium outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedComplaints.length)} of {sortedComplaints.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              title="First Page"
            >
              <span className="material-symbols-outlined text-sm">first_page</span>
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              title="Previous Page"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span className="px-3 font-semibold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              title="Next Page"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
              title="Last Page"
            >
              <span className="material-symbols-outlined text-sm">last_page</span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 9-TAB COMPLAINT DOSSIER MODAL */}
      {/* =================================================================== */}
      {isDossierOpen && activeTicket && (
        <ComplaintDetailsModal
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
          ticket={activeTicket}
          onAssignOfficer={() => {
            setIsDossierOpen(false);
            handleOpenAssign(activeTicket);
          }}
          onUpdateStatus={() => {
            setIsDossierOpen(false);
            handleOpenStatus(activeTicket);
          }}
          onVerify={() => {
            setIsDossierOpen(false);
            handleOpenVerify(activeTicket);
          }}
          onRequestInfo={() => {
            setIsDossierOpen(false);
            handleOpenRequestInfo(activeTicket);
          }}
          onReject={() => {
            setIsDossierOpen(false);
            handleOpenReject(activeTicket);
          }}
        />
      )}

      {/* =================================================================== */}
      {/* VERIFY COMPLAINT MODAL */}
      {/* =================================================================== */}
      {isVerifyModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">verified</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-headline">Verify Grievance</h3>
                <p className="text-xs font-mono text-teal-700">#{activeTicket.token}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              Confirm that this grievance contains valid jurisdictional coordinates and authentic claims. Upon verification, the ticket becomes eligible for cadre assignment.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Verification Notes / Certification:
              </label>
              <textarea
                rows={3}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="e.g. Jurisdiction verified with Ward 14 revenue office; documents certified."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600/20 outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsVerifyModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVerify}
                className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm"
              >
                Certify & Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* REQUEST ADDITIONAL INFO MODAL */}
      {/* =================================================================== */}
      {isRequestInfoModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">contact_support</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-headline">Request Additional Info</h3>
                <p className="text-xs font-mono text-amber-700">#{activeTicket.token}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              Dispatch an official SMS and portal notification to the citizen requesting supplementary evidence, site photos, or document verification.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Clarification Message to Citizen *
              </label>
              <textarea
                rows={3}
                value={requestInfoMessage}
                onChange={(e) => setRequestInfoMessage(e.target.value)}
                placeholder="e.g. Please upload your latest electricity bill or consumer RR number to allow meter testing team to locate your meter."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRequestInfoModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRequestInfo}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
              >
                Dispatch Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* REJECT COMPLAINT MODAL */}
      {/* =================================================================== */}
      {isRejectModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">cancel</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-headline">Reject Grievance</h3>
                <p className="text-xs font-mono text-rose-700">#{activeTicket.token}</p>
              </div>
            </div>
            <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              <strong>Audit Notice:</strong> Rejected grievances are never silently deleted. Full documentation is preserved in the state audit gazette for ombudsman inspection and citizen appeal.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mandatory Rejection Justification *
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Matter is currently sub-judice before the High Court of Karnataka / Frivolous claim / Outside statutory mandate."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500/20 outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* ASSIGN OFFICER MODAL */}
      {/* =================================================================== */}
      {isAssignModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">person_pin</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-headline">Assign Nodal Officer</h3>
                <p className="text-xs font-mono text-teal-700">Docket: #{activeTicket.token} · Dept: {activeTicket.departmentName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Select an authorized officer from the departmental roster. Active caseload and capacity thresholds are synchronized automatically.
            </p>

            <div className="space-y-2.5 max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-2 divide-y divide-slate-100">
              {officers.map((off) => {
                const isSelected = selectedOfficerId === off.id;
                const isOverloaded = (off.activeCaseload || 0) >= (off.maxCapacity || 30);

                return (
                  <div
                    key={off.id}
                    onClick={() => setSelectedOfficerId(off.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-teal-50 border border-teal-300'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-900">{off.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {off.badge || off.employeeId} · {off.designation}
                      </p>
                      <p className="text-[10px] text-teal-800 font-medium">{off.department}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        isOverloaded ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {off.activeCaseload || 0} / {off.maxCapacity || 30} cases
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1">{off.availability || 'AVAILABLE'}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssign}
                className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm"
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* UPDATE STATUS MODAL */}
      {/* =================================================================== */}
      {isStatusModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">sync_alt</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-headline">Update Complaint Status</h3>
                <p className="text-xs font-mono text-teal-700">#{activeTicket.token}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Target Status
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600/20 outline-none cursor-pointer"
              >
                <option value="NEWLY_REGISTERED">Newly Registered</option>
                <option value="PENDING_VERIFICATION">Pending Verification</option>
                <option value="ADDITIONAL_INFO_REQUIRED">Additional Information Required</option>
                <option value="VERIFIED">Verified</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PENDING_CITIZEN_RESPONSE">Pending Citizen Response</option>
                <option value="RESOLVED">Resolved (Pending Citizen Verification)</option>
                <option value="REOPENED">Reopened</option>
                <option value="REJECTED">Rejected</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Administrative Remarks:
              </label>
              <textarea
                rows={3}
                value={statusRemarks}
                onChange={(e) => setStatusRemarks(e.target.value)}
                placeholder="Enter official remark / note for the audit log..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600/20 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatus}
                className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm"
              >
                Save Status Transition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* EDIT PERMITTED COMPLAINT DETAILS MODAL */}
      {/* =================================================================== */}
      {isEditModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">edit</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-headline">Edit Permitted Details</h3>
                <p className="text-xs font-mono text-slate-500">Immutable Tracking ID: #{activeTicket.token}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Title</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Priority</label>
                <select
                  value={editFormData.priority}
                  onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600/20 outline-none cursor-pointer"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={4}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600/20 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEdit}
                className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllComplaintsView;
