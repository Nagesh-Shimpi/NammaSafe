import React, { useState, useMemo } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { NodalReassignmentModal } from '../../components/modals/NodalReassignmentModal';
import { USER_ROLES } from '../../utils/constants';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

export const OverdueEscalations = () => {
  const {
    complaints = [],
    departments = [],
    officers = [],
    escalations = [],
    reminders = [],
    complaintHistory = [],
    escalateComplaintLevel,
    sendComplaintReminder,
    addComplaintReviewNote,
    updateFollowUpDeadline,
    resolveComplaintDirect
  } = useComplaints();

  const { currentUser, currentRole, switchRole } = useAuth();
  const { lang } = useLanguage();

  // Active View Tabs: 'DASHBOARD' | 'TABLE' | 'ESCALATIONS' | 'ANALYTICS'
  const [activeTab, setActiveTab] = useState('TABLE');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [deadlineFilter, setDeadlineFilter] = useState('ALL'); // 'ALL' | 'OVERDUE' | 'DUE_TODAY' | 'UPCOMING' | 'ESCALATED'
  const [sortField, setSortField] = useState('daysOverdue'); // 'daysOverdue' | 'daysRemaining' | 'priority' | 'date'
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Privacy Masking Toggle
  const [maskCitizenPrivacy, setMaskCitizenPrivacy] = useState(false);

  // Selected Complaint for Detail Drawer
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  // Reassignment Modal State (reusing NodalReassignmentModal)
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignTargetToken, setReassignTargetToken] = useState('');

  // Reminder Modal State
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderTargetComplaint, setReminderTargetComplaint] = useState(null);
  const [reminderChannel, setReminderChannel] = useState('WHATSAPP');
  const [reminderSubject, setReminderSubject] = useState('');
  const [reminderNotes, setReminderNotes] = useState('');

  // Escalation Modal State
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalateTargetComplaint, setEscalateTargetComplaint] = useState(null);
  const [targetEscalationLevel, setTargetEscalationLevel] = useState(2);
  const [escalationReason, setEscalationReason] = useState('Statutory SLA Breach under Public Services Guarantee Act');
  const [escalationAuthority, setEscalationAuthority] = useState('District Magistrate & Zonal Ombudsman');
  const [escalationRemarks, setEscalationRemarks] = useState('');

  // Review Note Modal State
  const [isReviewNoteModalOpen, setIsReviewNoteModalOpen] = useState(false);
  const [reviewNoteComplaint, setReviewNoteComplaint] = useState(null);
  const [reviewNoteText, setReviewNoteText] = useState('');

  // Deadline Update Modal State (for demonstration/testing)
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [deadlineComplaint, setDeadlineComplaint] = useState(null);
  const [newDueDate, setNewDueDate] = useState('');
  const [newNextFollowUp, setNewNextFollowUp] = useState('');

  // Resolution Modal State
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolveTargetComplaint, setResolveTargetComplaint] = useState(null);
  const [resolutionSummaryText, setResolutionSummaryText] = useState('');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');
  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Helper: Calculate actual deadline status using date values
  const getComplaintDeadlineState = (complaint) => {
    if (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') {
      return {
        key: 'RESOLVED',
        label: 'Resolved',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        color: '#10b981',
        icon: 'check_circle'
      };
    }

    const now = new Date();
    const dueDateStr = complaint.dueDate || complaint.slaDeadline;
    const nextFollowUpStr = complaint.nextFollowUpDate;

    const dueDate = dueDateStr ? new Date(dueDateStr) : null;
    const nextFollowUp = nextFollowUpStr ? new Date(nextFollowUpStr) : null;

    // Check if Escalated
    const isEscalated =
      (complaint.escalationLevel !== undefined && complaint.escalationLevel > 0) ||
      (complaint.escalationTier && complaint.escalationTier !== 'NONE') ||
      complaint.escalationStatus === 'ACTIVE_ESCALATION';

    // Check if Overdue (configured due date has passed)
    const isPastDue = dueDate && !isNaN(dueDate) && dueDate < now;
    if (isPastDue || complaint.status === 'OVERDUE' || (complaint.daysOverdue && complaint.daysOverdue > 0)) {
      if (isEscalated) {
        return {
          key: 'ESCALATED',
          label: `Escalated L${complaint.escalationLevel || 2}`,
          badgeClass: 'bg-purple-50 text-purple-800 border-purple-200 ring-1 ring-purple-400/30',
          color: '#9333ea',
          icon: 'crisis_alert'
        };
      }
      return {
        key: 'OVERDUE',
        label: 'Overdue',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200 ring-1 ring-rose-400/30 font-bold',
        color: '#ef4444',
        icon: 'alarm'
      };
    }

    // Check if Due Today (within 24 hours or same calendar day)
    const isDueToday =
      (nextFollowUp && nextFollowUp.toDateString() === now.toDateString()) ||
      (dueDate && dueDate.toDateString() === now.toDateString()) ||
      (dueDate && dueDate - now > 0 && dueDate - now <= 24 * 60 * 60 * 1000);

    if (isDueToday) {
      return {
        key: 'DUE_TODAY',
        label: 'Due Today',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-400/30 font-bold',
        color: '#f59e0b',
        icon: 'schedule'
      };
    }

    // Approaching / Upcoming deadline
    return {
      key: 'UPCOMING',
      label: 'Approaching Deadline',
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
      color: '#3b82f6',
      icon: 'hourglass_top'
    };
  };

  // Filter complaints based on search, department, priority, status, and deadline state
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Role-based visibility: Department Officer only sees their assigned department/officer complaints
      if (currentRole === USER_ROLES.OFFICER) {
        const isAssigned =
          c.assignedOfficer?.id === currentUser?.badge ||
          c.assignedOfficer?.name === currentUser?.name ||
          (c.departmentName && currentUser?.department && c.departmentName.includes(currentUser.department));
        if (!isAssigned) return false;
      }

      // Department filter
      if (selectedDeptId !== 'ALL' && c.departmentId !== selectedDeptId) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'ALL' && c.priority !== selectedPriority) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && c.status !== selectedStatus) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesToken = (c.token || '').toLowerCase().includes(q);
        const matchesTitle = (c.title || '').toLowerCase().includes(q);
        const matchesCitizen = (c.citizenName || '').toLowerCase().includes(q);
        const matchesOfficer = (c.assignedOfficer?.name || '').toLowerCase().includes(q);
        const matchesCategory = (c.category || '').toLowerCase().includes(q);
        if (!matchesToken && !matchesTitle && !matchesCitizen && !matchesOfficer && !matchesCategory) {
          return false;
        }
      }

      // Deadline filter
      if (deadlineFilter !== 'ALL') {
        const state = getComplaintDeadlineState(c);
        if (deadlineFilter === 'OVERDUE' && state.key !== 'OVERDUE' && state.key !== 'ESCALATED') return false;
        if (deadlineFilter === 'DUE_TODAY' && state.key !== 'DUE_TODAY') return false;
        if (deadlineFilter === 'UPCOMING' && state.key !== 'UPCOMING') return false;
        if (deadlineFilter === 'ESCALATED' && state.key !== 'ESCALATED') return false;
      }

      return true;
    });
  }, [complaints, selectedDeptId, selectedPriority, selectedStatus, searchQuery, deadlineFilter, currentRole, currentUser]);

  // Sort complaints
  const sortedComplaints = useMemo(() => {
    return [...filteredComplaints].sort((a, b) => {
      if (sortField === 'daysOverdue') {
        const overdueA = a.daysOverdue || (a.status === 'OVERDUE' ? 1 : 0);
        const overdueB = b.daysOverdue || (b.status === 'OVERDUE' ? 1 : 0);
        return sortOrder === 'desc' ? overdueB - overdueA : overdueA - overdueB;
      }
      if (sortField === 'priority') {
        const pOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const scoreA = pOrder[a.priority] || 0;
        const scoreB = pOrder[b.priority] || 0;
        return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
      }
      if (sortField === 'date') {
        const dateA = new Date(a.registrationDate || a.createdDate || 0).getTime();
        const dateB = new Date(b.registrationDate || b.createdDate || 0).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
      return 0;
    });
  }, [filteredComplaints, sortField, sortOrder]);

  // Paginated data
  const totalPages = Math.ceil(sortedComplaints.length / pageSize) || 1;
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedComplaints.slice(start, start + pageSize);
  }, [sortedComplaints, currentPage, pageSize]);

  // 6 Summary Metrics Calculations
  const summaryMetrics = useMemo(() => {
    const totalPending = complaints.filter(
      (c) => c.status === 'IN_PROGRESS' || c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' || c.status === 'OVERDUE'
    ).length;

    let followUpsDueToday = 0;
    let approachingDeadline = 0;
    let totalOverdue = 0;
    let criticalOverdue = 0;
    let escalationsAwaitingAction = 0;

    complaints.forEach((c) => {
      const state = getComplaintDeadlineState(c);
      if (state.key === 'DUE_TODAY') followUpsDueToday++;
      if (state.key === 'UPCOMING') approachingDeadline++;
      if (state.key === 'OVERDUE' || state.key === 'ESCALATED') {
        totalOverdue++;
        if (c.priority === 'CRITICAL' || c.priority === 'HIGH') {
          criticalOverdue++;
        }
      }
      if (state.key === 'ESCALATED' || (c.escalationStatus === 'ACTIVE_ESCALATION')) {
        escalationsAwaitingAction++;
      }
    });

    return {
      totalPending,
      followUpsDueToday,
      approachingDeadline,
      totalOverdue,
      criticalOverdue,
      escalationsAwaitingAction
    };
  }, [complaints]);

  // Analytics Chart 1: Overdue Complaints by Department
  const overdueByDeptData = useMemo(() => {
    const counts = {};
    departments.forEach((d) => {
      counts[d.code || d.name] = 0;
    });

    complaints.forEach((c) => {
      const state = getComplaintDeadlineState(c);
      if (state.key === 'OVERDUE' || state.key === 'ESCALATED') {
        const deptKey = c.departmentName?.split(' ')[0] || 'Other';
        counts[deptKey] = (counts[deptKey] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      overdue: count
    }));
  }, [departments, complaints]);

  // Analytics Chart 2: Escalations by Level (Levels 0, 1, 2, 3)
  const escalationsByLevelData = useMemo(() => {
    let l0 = 0, l1 = 0, l2 = 0, l3 = 0;
    complaints.forEach((c) => {
      const lvl = c.escalationLevel || 0;
      if (lvl === 3) l3++;
      else if (lvl === 2) l2++;
      else if (lvl === 1) l1++;
      else l0++;
    });

    return [
      { name: 'Level 0: Normal Monitoring', value: l0, color: '#10b981' },
      { name: 'Level 1: Officer Reminder', value: l1, color: '#3b82f6' },
      { name: 'Level 2: Supervisor Escalation', value: l2, color: '#f59e0b' },
      { name: 'Level 3: Department Head Review', value: l3, color: '#9333ea' }
    ];
  }, [complaints]);

  // Analytics Chart 3: Weekly Overdue Trend (Demonstration 7-day metric)
  const weeklyTrendData = [
    { day: 'Day 1', pending: 45, overdue: 8, resolved: 32 },
    { day: 'Day 2', pending: 52, overdue: 11, resolved: 38 },
    { day: 'Day 3', pending: 60, overdue: 14, resolved: 45 },
    { day: 'Day 4', pending: 58, overdue: 19, resolved: 41 },
    { day: 'Day 5', pending: 64, overdue: 16, resolved: 50 },
    { day: 'Day 6', pending: 62, overdue: 12, resolved: 54 },
    { day: 'Day 7', pending: 59, overdue: 10, resolved: 58 }
  ];

  // Open Drawer with selected complaint
  const handleOpenDetailDrawer = (complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailDrawerOpen(true);
  };

  // Open Reassign Modal for complaint
  const handleOpenReassign = (complaint, e) => {
    if (e) e.stopPropagation();
    setReassignTargetToken(complaint.token);
    setIsReassignModalOpen(true);
  };

  // Open Reminder Modal for complaint
  const handleOpenReminderModal = (complaint, e) => {
    if (e) e.stopPropagation();
    setReminderTargetComplaint(complaint);
    setReminderSubject(`Urgent Action Notice: Grievance #${complaint.token} (${complaint.priority} priority)`);
    setReminderNotes('');
    setIsReminderModalOpen(true);
  };

  // Submit Reminder
  const handleExecuteReminder = (e) => {
    if (e) e.preventDefault();
    if (!reminderTargetComplaint) return;

    const res = sendComplaintReminder({
      complaintToken: reminderTargetComplaint.token,
      channel: reminderChannel,
      recipientName: reminderTargetComplaint.assignedOfficer?.name,
      recipientRole: 'Department Officer',
      subject: reminderSubject,
      notes: reminderNotes
    });

    if (res.duplicate) {
      showToast(res.message, 'warning');
    } else if (res.success) {
      showToast(`Demonstration reminder queued via ${reminderChannel} for #${reminderTargetComplaint.token}. Real external calls require backend confirmation.`);
    }

    setIsReminderModalOpen(false);
  };

  // Open Escalate Modal
  const handleOpenEscalateModal = (complaint, e) => {
    if (e) e.stopPropagation();
    setEscalateTargetComplaint(complaint);
    setTargetEscalationLevel(Math.min(3, (complaint.escalationLevel || 0) + 1));
    setEscalationReason(
      complaint.priority === 'CRITICAL'
        ? 'Public Safety Hazard & Statutory Section 8 Breach'
        : 'SLA Grace Period Expired without Officer Action'
    );
    setEscalationRemarks('');
    setIsEscalateModalOpen(true);
  };

  // Submit Escalation
  const handleExecuteEscalation = (e) => {
    if (e) e.preventDefault();
    if (!escalateTargetComplaint) return;

    const res = escalateComplaintLevel({
      complaintToken: escalateTargetComplaint.token,
      targetLevel: targetEscalationLevel,
      reason: escalationReason,
      reviewingAuthority: escalationAuthority,
      remarks: escalationRemarks,
      initiatedBy: currentUser?.name || 'Supervisor Oversight'
    });

    if (res.duplicate) {
      showToast(res.message, 'warning');
    } else if (res.success) {
      showToast(`Complaint #${escalateTargetComplaint.token} escalated to Level ${targetEscalationLevel}. Audit record updated.`);
    }

    setIsEscalateModalOpen(false);
  };

  // Open Review Note Modal
  const handleOpenReviewNoteModal = (complaint, e) => {
    if (e) e.stopPropagation();
    setReviewNoteComplaint(complaint);
    setReviewNoteText('');
    setIsReviewNoteModalOpen(true);
  };

  // Submit Review Note
  const handleExecuteReviewNote = (e) => {
    if (e) e.preventDefault();
    if (!reviewNoteComplaint || !reviewNoteText.trim()) return;

    addComplaintReviewNote({
      complaintToken: reviewNoteComplaint.token,
      noteText: reviewNoteText.trim(),
      authorName: currentUser?.name || 'Supervisor',
      authorRole: currentRole
    });

    showToast(`Review note recorded for complaint #${reviewNoteComplaint.token}.`);
    setIsReviewNoteModalOpen(false);
  };

  // Open Deadline Edit Modal (Test 1, 2, 3 verification)
  const handleOpenDeadlineModal = (complaint, e) => {
    if (e) e.stopPropagation();
    setDeadlineComplaint(complaint);
    setNewDueDate(complaint.dueDate || new Date().toISOString().substring(0, 16));
    setNewNextFollowUp(complaint.nextFollowUpDate || new Date().toISOString().substring(0, 16));
    setIsDeadlineModalOpen(true);
  };

  // Execute Deadline Change
  const handleExecuteDeadlineChange = (presetType) => {
    if (!deadlineComplaint) return;
    const now = new Date();
    let updatedDue = '';
    let updatedFollowUp = '';

    if (presetType === 'UPCOMING') {
      const future = new Date(now.getTime() + 48 * 3600 * 1000);
      updatedDue = future.toISOString().replace('T', ' ').substring(0, 16);
      updatedFollowUp = new Date(now.getTime() + 24 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 16);
    } else if (presetType === 'DUE_TODAY') {
      const todayLater = new Date(now.getTime() + 4 * 3600 * 1000);
      updatedDue = todayLater.toISOString().replace('T', ' ').substring(0, 16);
      updatedFollowUp = now.toISOString().replace('T', ' ').substring(0, 16);
    } else if (presetType === 'OVERDUE') {
      const past = new Date(now.getTime() - 48 * 3600 * 1000);
      updatedDue = past.toISOString().replace('T', ' ').substring(0, 16);
      updatedFollowUp = past.toISOString().replace('T', ' ').substring(0, 16);
    } else {
      updatedDue = newDueDate;
      updatedFollowUp = newNextFollowUp;
    }

    updateFollowUpDeadline({
      complaintToken: deadlineComplaint.token,
      nextFollowUpDate: updatedFollowUp,
      dueDate: updatedDue
    });

    showToast(`Deadline adjusted for #${deadlineComplaint.token}. New status dynamically re-evaluated.`);
    setIsDeadlineModalOpen(false);
  };

  // Open Resolve Modal
  const handleOpenResolveModal = (complaint, e) => {
    if (e) e.stopPropagation();
    setResolveTargetComplaint(complaint);
    setResolutionSummaryText('Inspection completed and required remediation successfully deployed.');
    setIsResolveModalOpen(true);
  };

  // Submit Resolution
  const handleExecuteResolve = (e) => {
    if (e) e.preventDefault();
    if (!resolveTargetComplaint) return;

    resolveComplaintDirect({
      complaintToken: resolveTargetComplaint.token,
      resolutionSummary: resolutionSummaryText,
      resolvedBy: currentUser?.name || 'Nodal Authority'
    });

    showToast(`Complaint #${resolveTargetComplaint.token} marked as RESOLVED. It will no longer appear in active overdue queues.`);
    setIsResolveModalOpen(false);
    if (isDetailDrawerOpen) setIsDetailDrawerOpen(false);
  };

  // History entries for selected complaint in drawer
  const selectedComplaintHistoryList = useMemo(() => {
    if (!selectedComplaint) return [];
    return complaintHistory.filter((h) => h.complaintToken === selectedComplaint.token);
  }, [complaintHistory, selectedComplaint]);

  // Reminders for selected complaint in drawer
  const selectedComplaintRemindersList = useMemo(() => {
    if (!selectedComplaint) return [];
    return reminders.filter((r) => r.complaintToken === selectedComplaint.token);
  }, [reminders, selectedComplaint]);

  // Escalations for selected complaint in drawer
  const selectedComplaintEscalationsList = useMemo(() => {
    if (!selectedComplaint) return [];
    return escalations.filter((e) => e.complaintToken === selectedComplaint.token);
  }, [escalations, selectedComplaint]);

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl border text-white text-xs sm:text-sm font-semibold flex items-center gap-3 animate-bounce ${
            toastType === 'warning'
              ? 'bg-amber-900 border-amber-700'
              : 'bg-slate-900 border-slate-700'
          }`}
        >
          <span className="material-symbols-outlined text-teal-400">
            {toastType === 'warning' ? 'warning' : 'task_alt'}
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Command Strip */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <Breadcrumb
          items={[
            { label: 'Admin Command', to: '/admin/overview' },
            { label: 'Oversight & Monitoring' },
            { label: 'Overdue Complaints & Intelligent Escalation' },
          ]}
        />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-2">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">alarm_on</span>
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-headline text-2xl font-bold text-slate-900 tracking-tight">
                  {lang === 'kn' ? 'ಅವಧಿ ಮೀರಿದ ದೂರುಗಳು ಮತ್ತು ಜ್ಞಾನಶೀಲ ಹಂತೀಕರಣ' : 'Overdue Complaints & Intelligent Escalation'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                  {summaryMetrics.totalOverdue} Active Breaches
                </span>
              </div>
              <p className="font-body text-xs sm:text-sm text-slate-500 mt-0.5">
                Multi-tier follow-up monitoring, automated grace alert cadences, and statutory ombudsman escalations.
              </p>
            </div>
          </div>

          {/* Quick Role & Mode Switcher for Demonstration */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs flex items-center gap-2">
              <span className="text-slate-500 font-medium">Session Role:</span>
              <select
                value={currentRole}
                onChange={(e) => switchRole(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value={USER_ROLES.ADMIN}>Administrator (Full Rights)</option>
                <option value={USER_ROLES.SUPERVISOR}>Supervisor (Review Rights)</option>
                <option value={USER_ROLES.OFFICER}>Department Officer (Assigned)</option>
              </select>
            </div>

            <button
              onClick={() => setActiveTab(activeTab === 'ANALYTICS' ? 'TABLE' : 'ANALYTICS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                activeTab === 'ANALYTICS'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-sm">monitoring</span>
              <span>{activeTab === 'ANALYTICS' ? 'Hide Analytics' : 'Breach Analytics'}</span>
            </button>
          </div>
        </div>

        {/* 6 Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          {/* 1. Total Pending */}
          <div
            onClick={() => { setDeadlineFilter('ALL'); setActiveTab('TABLE'); }}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              deadlineFilter === 'ALL' && activeTab === 'TABLE'
                ? 'border-slate-800 bg-slate-50 ring-2 ring-slate-800/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-center text-slate-500 mb-1 text-xs font-bold uppercase">
              <span>Total Pending</span>
              <span className="material-symbols-outlined text-slate-600 text-base">pending_actions</span>
            </div>
            <div className="font-headline text-2xl font-bold text-slate-900">
              {summaryMetrics.totalPending}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Active redressal queue</div>
          </div>

          {/* 2. Follow-ups Due Today */}
          <div
            onClick={() => { setDeadlineFilter('DUE_TODAY'); setActiveTab('TABLE'); }}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              deadlineFilter === 'DUE_TODAY'
                ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20'
                : 'border-amber-200 bg-amber-50/30 hover:border-amber-300'
            }`}
          >
            <div className="flex justify-between items-center text-amber-800 mb-1 text-xs font-bold uppercase">
              <span>Due Today</span>
              <span className="material-symbols-outlined text-amber-600 text-base">schedule</span>
            </div>
            <div className="font-headline text-2xl font-bold text-amber-800">
              {summaryMetrics.followUpsDueToday}
            </div>
            <div className="text-[10px] text-amber-700 mt-1 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              <span>Action required today</span>
            </div>
          </div>

          {/* 3. Approaching Deadline */}
          <div
            onClick={() => { setDeadlineFilter('UPCOMING'); setActiveTab('TABLE'); }}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              deadlineFilter === 'UPCOMING'
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                : 'border-blue-200 bg-blue-50/30 hover:border-blue-300'
            }`}
          >
            <div className="flex justify-between items-center text-blue-800 mb-1 text-xs font-bold uppercase">
              <span>Approaching</span>
              <span className="material-symbols-outlined text-blue-600 text-base">hourglass_top</span>
            </div>
            <div className="font-headline text-2xl font-bold text-blue-800">
              {summaryMetrics.approachingDeadline}
            </div>
            <div className="text-[10px] text-blue-600 mt-1 font-semibold">&lt;48h window remaining</div>
          </div>

          {/* 4. Total Overdue Complaints */}
          <div
            onClick={() => { setDeadlineFilter('OVERDUE'); setActiveTab('TABLE'); }}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              deadlineFilter === 'OVERDUE'
                ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-500/20'
                : 'border-rose-200 bg-rose-50/40 hover:border-rose-300'
            }`}
          >
            <div className="flex justify-between items-center text-rose-800 mb-1 text-xs font-bold uppercase">
              <span>Total Overdue</span>
              <span className="material-symbols-outlined text-rose-600 text-base">alarm</span>
            </div>
            <div className="font-headline text-2xl font-bold text-rose-700">
              {summaryMetrics.totalOverdue}
            </div>
            <div className="text-[10px] text-rose-600 mt-1 font-semibold">Statutory SLA breached</div>
          </div>

          {/* 5. Critical Overdue Complaints */}
          <div
            onClick={() => { setDeadlineFilter('OVERDUE'); setSelectedPriority('CRITICAL'); setActiveTab('TABLE'); }}
            className="p-4 rounded-xl border border-rose-300 bg-rose-100/50 hover:border-rose-400 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-center text-rose-900 mb-1 text-xs font-bold uppercase">
              <span>Critical Overdue</span>
              <span className="material-symbols-outlined text-rose-700 text-base">warning</span>
            </div>
            <div className="font-headline text-2xl font-bold text-rose-900">
              {summaryMetrics.criticalOverdue}
            </div>
            <div className="text-[10px] text-rose-800 mt-1 font-semibold">Section 8 Sakala risk</div>
          </div>

          {/* 6. Escalations Awaiting Action */}
          <div
            onClick={() => { setDeadlineFilter('ESCALATED'); setActiveTab('TABLE'); }}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              deadlineFilter === 'ESCALATED'
                ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500/20'
                : 'border-purple-200 bg-purple-50/30 hover:border-purple-300'
            }`}
          >
            <div className="flex justify-between items-center text-purple-800 mb-1 text-xs font-bold uppercase">
              <span>Escalations</span>
              <span className="material-symbols-outlined text-purple-600 text-base">crisis_alert</span>
            </div>
            <div className="font-headline text-2xl font-bold text-purple-700">
              {summaryMetrics.escalationsAwaitingAction}
            </div>
            <div className="text-[10px] text-purple-600 mt-1 font-semibold">Supervisor / DM desk</div>
          </div>
        </div>

        {/* Demonstration Setting & Legend Strip */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-slate-700">Deadline Status Codes:</span>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-600">Green: Within Deadline</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-slate-600">Orange: Approaching / Due Today</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="text-slate-600">Red: Overdue</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
              <span className="text-slate-600">Purple: Escalated</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMaskCitizenPrivacy(!maskCitizenPrivacy)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">
                {maskCitizenPrivacy ? 'visibility_off' : 'visibility'}
              </span>
              <span>{maskCitizenPrivacy ? 'Citizen Privacy Mask Active' : 'Mask Citizen Identity'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard (Toggleable Section) */}
      {activeTab === 'ANALYTICS' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-headline text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-600">analytics</span>
                <span>Overdue & Escalation Intelligence Analytics</span>
              </h3>
              <p className="font-body text-xs text-slate-500">
                Demonstration cadre telemetry showing statutory breach concentration and resolution velocity.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 font-mono text-xs font-semibold border border-teal-200">
              Live State Telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Overdue by Department */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                Overdue Complaints by Department
              </h4>
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overdueByDeptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" fontSize={10} stroke="#64748b" tickLine={false} />
                    <YAxis fontSize={10} stroke="#64748b" tickLine={false} />
                    <RechartsTooltip />
                    <Bar dataKey="overdue" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[11px] text-slate-500 text-center font-mono mt-1">
                Highest breach frequency: MORTH & BBMP
              </div>
            </div>

            {/* Chart 2: Escalations by Level (Donut) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                Escalations by Configured Level
              </h4>
              <div className="w-full h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={escalationsByLevelData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                      {escalationsByLevelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 font-mono mt-1">
                {escalationsByLevelData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="truncate">{d.name.split(':')[0]}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 3: Weekly Overdue Trend */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                7-Day Breach & Resolution Velocity
              </h4>
              <div className="w-full h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" fontSize={10} stroke="#64748b" tickLine={false} />
                    <YAxis fontSize={10} stroke="#64748b" tickLine={false} />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="overdue" stroke="#ef4444" fill="#fee2e2" />
                    <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="#d1fae5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-1">
                <span className="text-rose-600 font-bold">Red: Overdue</span>
                <span className="text-emerald-700 font-bold">Green: Resolved</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table View: Comprehensive Overdue Grievances */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        {/* Table Filters & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pb-3 border-b border-slate-100">
          {/* Search */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Search Dossiers</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-sm">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Token, citizen, title, officer..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Department</label>
            <select
              value={selectedDeptId}
              onChange={(e) => { setSelectedDeptId(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => { setSelectedPriority(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          {/* Deadline Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Follow-up Window</label>
            <select
              value={deadlineFilter}
              onChange={(e) => { setDeadlineFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Windows</option>
              <option value="OVERDUE">Overdue Only (SLA Breached)</option>
              <option value="DUE_TODAY">Due Today (T-0h)</option>
              <option value="UPCOMING">Approaching Deadline (&lt;48h)</option>
              <option value="ESCALATED">Active Escalations Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Sort By</label>
            <div className="flex gap-1.5">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-500"
              >
                <option value="daysOverdue">Days Overdue</option>
                <option value="priority">Priority Tier</option>
                <option value="date">Registration Date</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                title="Toggle sort direction"
                className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                {sortOrder === 'desc' ? '↓' : '↑'}
              </button>
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-3 font-bold">Tracking ID</th>
                <th className="py-3 px-3 font-bold">Grievance Subject</th>
                <th className="py-3 px-3 font-bold">Citizen</th>
                <th className="py-3 px-3 font-bold">Department</th>
                <th className="py-3 px-3 font-bold">Assigned Officer</th>
                <th className="py-3 px-3 font-bold">Priority</th>
                <th className="py-3 px-3 font-bold">Deadline Status</th>
                <th className="py-3 px-3 font-bold">Escalation</th>
                <th className="py-3 px-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-body">
              {paginatedComplaints.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-4xl text-slate-300">task_alt</span>
                      <p className="font-semibold text-slate-600">No overdue complaints matching current filters.</p>
                      <p className="text-[11px] text-slate-400">All statutory follow-up timelines in this sector are on track.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedComplaints.map((complaint) => {
                  const deadlineState = getComplaintDeadlineState(complaint);
                  const isOverdue = deadlineState.key === 'OVERDUE' || deadlineState.key === 'ESCALATED';

                  return (
                    <tr
                      key={complaint.token}
                      onClick={() => handleOpenDetailDrawer(complaint)}
                      className={`cursor-pointer transition-colors ${
                        isOverdue
                          ? 'bg-rose-50/20 hover:bg-rose-50/50'
                          : deadlineState.key === 'DUE_TODAY'
                          ? 'bg-amber-50/20 hover:bg-amber-50/50'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Tracking ID */}
                      <td className="py-3 px-3 font-mono font-bold text-teal-700 whitespace-nowrap">
                        #{complaint.token}
                      </td>

                      {/* Title & Category */}
                      <td className="py-3 px-3 max-w-[220px]">
                        <div className="font-semibold text-slate-900 truncate" title={complaint.title}>
                          {complaint.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {complaint.category || 'Public Works'} · {complaint.registrationDate || complaint.createdDate}
                        </div>
                      </td>

                      {/* Citizen Name (with privacy mask option) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-medium text-slate-700">
                          {maskCitizenPrivacy || complaint.privacyMasked
                            ? `${(complaint.citizenName || 'Citizen').substring(0, 3)}****`
                            : complaint.citizenName || 'Registered Resident'}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-3 text-slate-600 max-w-[140px]">
                        <span className="truncate block text-[11px]" title={complaint.departmentName}>
                          {complaint.departmentName}
                        </span>
                      </td>

                      {/* Assigned Officer */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 text-xs">
                          {complaint.assignedOfficer?.name || 'Unassigned'}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {complaint.assignedOfficer?.badge || complaint.assignedOfficer?.employeeId || 'Nodal Cadre'}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <PriorityBadge priority={complaint.priority} />
                      </td>

                      {/* Deadline Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${deadlineState.badgeClass}`}>
                            <span className="material-symbols-outlined text-[12px]">{deadlineState.icon}</span>
                            <span>{deadlineState.label}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {complaint.daysOverdue > 0
                              ? `${complaint.daysOverdue} days overdue`
                              : complaint.daysRemaining <= 0
                              ? 'Due Today'
                              : `${complaint.daysRemaining} days left`}
                          </span>
                        </div>
                      </td>

                      {/* Escalation Level */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            complaint.escalationLevel === 3
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : complaint.escalationLevel === 2
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : complaint.escalationLevel === 1
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Level {complaint.escalationLevel || 0}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          {/* Send Reminder (Admin & Supervisor) */}
                          {(currentRole === USER_ROLES.ADMIN || currentRole === USER_ROLES.SUPERVISOR) && (
                            <button
                              onClick={(e) => handleOpenReminderModal(complaint, e)}
                              title="Send Demonstration Reminder"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">notifications</span>
                            </button>
                          )}

                          {/* Escalate (Admin & Supervisor) */}
                          {(currentRole === USER_ROLES.ADMIN || currentRole === USER_ROLES.SUPERVISOR) && (
                            <button
                              onClick={(e) => handleOpenEscalateModal(complaint, e)}
                              title="Escalate to Next Level"
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">upgrade</span>
                            </button>
                          )}

                          {/* Reassign Officer (Integrated with Officer Workload) */}
                          <button
                            onClick={(e) => handleOpenReassign(complaint, e)}
                            title="Nodal Reassignment"
                            className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">swap_horiz</span>
                          </button>

                          {/* Inspect Detail Drawer */}
                          <button
                            onClick={() => handleOpenDetailDrawer(complaint)}
                            title="Inspect Details"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
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

        {/* Pagination Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500 font-body">
          <div>
            Showing <strong>{Math.min(sortedComplaints.length, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
            <strong>{Math.min(sortedComplaints.length, currentPage * pageSize)}</strong> of{' '}
            <strong>{sortedComplaints.length}</strong> filtered dockets
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 font-mono text-slate-700 font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Detail Drawer (Section 6) */}
      {isDetailDrawerOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDetailDrawerOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-xl bg-white shadow-2xl h-full flex flex-col justify-between overflow-y-auto z-10 p-6 border-l border-slate-200 animate-slide-left">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-teal-700">
                      #{selectedComplaint.token}
                    </span>
                    <PriorityBadge priority={selectedComplaint.priority} />
                    <StatusBadge status={selectedComplaint.status} />
                  </div>
                  <h3 className="font-headline text-lg font-bold text-slate-900 mt-1">
                    {selectedComplaint.title}
                  </h3>
                </div>
                <button
                  onClick={() => setIsDetailDrawerOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Deadline Status & Days Overdue Badge */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold uppercase block">Follow-up Condition</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-rose-600">alarm</span>
                    <span>
                      {selectedComplaint.daysOverdue > 0
                        ? `${selectedComplaint.daysOverdue} Days Past Due Date`
                        : selectedComplaint.daysRemaining <= 0
                        ? 'Follow-up Action Due Today'
                        : `${selectedComplaint.daysRemaining} Days Remaining`}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase block">Current Escalation</span>
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    Level {selectedComplaint.escalationLevel || 0}
                  </span>
                </div>
              </div>

              {/* Complaint & Department Information */}
              <div className="space-y-2 text-xs font-body">
                <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                  Dossier Information
                </h4>
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Department</span>
                    <span className="font-semibold text-slate-800">{selectedComplaint.departmentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Category</span>
                    <span className="font-semibold text-slate-800">{selectedComplaint.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Citizen Contact</span>
                    <span className="font-semibold text-slate-800">{selectedComplaint.citizenName} ({selectedComplaint.citizenPhone})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Assigned Officer</span>
                    <span className="font-semibold text-teal-800">{selectedComplaint.assignedOfficer?.name} ({selectedComplaint.assignedOfficer?.badge})</span>
                  </div>
                </div>
              </div>

              {/* Deadline & Follow-up Timeline */}
              <div className="space-y-2 text-xs font-body">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Deadline Schedule
                  </h4>
                  <button
                    onClick={(e) => handleOpenDeadlineModal(selectedComplaint, e)}
                    className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-xs">edit_calendar</span>
                    <span>Adjust Deadline (Demo)</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold">Registered</div>
                    <div className="font-mono text-slate-800 font-bold text-xs mt-0.5">
                      {selectedComplaint.registrationDate?.split(' ')[0] || selectedComplaint.createdDate}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold">Last Follow-up</div>
                    <div className="font-mono text-slate-800 font-bold text-xs mt-0.5">
                      {selectedComplaint.lastFollowUpDate?.split(' ')[0] || 'None'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="text-[10px] text-amber-700 font-semibold">Next Follow-up</div>
                    <div className="font-mono text-amber-900 font-bold text-xs mt-0.5">
                      {selectedComplaint.nextFollowUpDate?.split(' ')[0] || 'Due Today'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                    <div className="text-[10px] text-rose-700 font-semibold">Statutory Due</div>
                    <div className="font-mono text-rose-900 font-bold text-xs mt-0.5">
                      {selectedComplaint.dueDate?.split(' ')[0] || selectedComplaint.slaDeadline?.split('T')[0]}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action History Log */}
              <div className="space-y-2 text-xs font-body">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Chronological Action & Escalation History ({selectedComplaintHistoryList.length})
                  </h4>
                  <button
                    onClick={(e) => handleOpenReviewNoteModal(selectedComplaint, e)}
                    className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-xs">add_comment</span>
                    <span>Add Review Note</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                  {selectedComplaintHistoryList.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl">
                      No prior escalation events recorded. Initial intake nominal.
                    </div>
                  ) : (
                    selectedComplaintHistoryList.map((hist) => (
                      <div key={hist.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900">{hist.eventType}</span>
                          <span className="font-mono text-[10px] text-slate-400">{hist.timestamp}</span>
                        </div>
                        <p className="text-slate-600 font-body text-[11px]">{hist.description}</p>
                        <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>By: {hist.responsibleUser}</span>
                          {hist.newValue && <span className="text-teal-700 font-bold">{hist.newValue}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Reminder Log */}
              {selectedComplaintRemindersList.length > 0 && (
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Dispatched Follow-up Notices ({selectedComplaintRemindersList.length})
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    {selectedComplaintRemindersList.map((rem) => (
                      <div key={rem.id} className="p-2 rounded-lg bg-teal-50/50 border border-teal-200 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-teal-900 block">{rem.subject}</span>
                          <span className="text-[10px] text-teal-700 font-mono">Via {rem.channel} to {rem.recipientName} ({rem.dispatchedDate})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono text-[10px] font-bold">
                          {rem.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Authorized Actions Section */}
            <div className="pt-4 mt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* Send Reminder Button */}
                <button
                  onClick={(e) => handleOpenReminderModal(selectedComplaint, e)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">notifications</span>
                  <span>Send Reminder</span>
                </button>

                {/* Escalate Button */}
                {(currentRole === USER_ROLES.ADMIN || currentRole === USER_ROLES.SUPERVISOR) && (
                  <button
                    onClick={(e) => handleOpenEscalateModal(selectedComplaint, e)}
                    className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">upgrade</span>
                    <span>Escalate</span>
                  </button>
                )}

                {/* Reassign Officer Button */}
                <button
                  onClick={(e) => handleOpenReassign(selectedComplaint, e)}
                  className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-bold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">swap_horiz</span>
                  <span>Reassign Officer</span>
                </button>
              </div>

              {/* Mark as Resolved */}
              <button
                onClick={(e) => handleOpenResolveModal(selectedComplaint, e)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">task_alt</span>
                <span>Mark Resolved</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Nodal Reassignment Modal (Section 7) */}
      <NodalReassignmentModal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        initialComplaintToken={reassignTargetToken}
        onSuccess={({ complaint, targetOfficer, requireSupervisorApproval }) => {
          showToast(
            requireSupervisorApproval
              ? `Reassignment for #${complaint.token} submitted for supervisor clearance.`
              : `Complaint #${complaint.token} reassigned to ${targetOfficer.name}. Officer workload updated!`
          );
        }}
      />

      {/* Send Reminder Modal (Section 9) */}
      {isReminderModalOpen && reminderTargetComplaint && (
        <Modal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          title={`Send Follow-up Reminder: #${reminderTargetComplaint.token}`}
          subtitle="Generate and queue a simulated demonstration notice"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleExecuteReminder} className="space-y-4 text-xs font-body">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Recipient Officer
              </label>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800">
                {reminderTargetComplaint.assignedOfficer?.name || 'Responsible Nodal Engineer'} (
                {reminderTargetComplaint.assignedOfficer?.badge || 'Nodal'})
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Demonstration Channel
              </label>
              <select
                value={reminderChannel}
                onChange={(e) => setReminderChannel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:border-teal-500"
              >
                <option value="WHATSAPP">WhatsApp Outbound Notice</option>
                <option value="IN_APP">In-App Cadre Alert</option>
                <option value="EMAIL">Official Ministerial Email</option>
                <option value="IVR">Automated IVR Outbound Nudge</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subject Line
              </label>
              <input
                type="text"
                value={reminderSubject}
                onChange={(e) => setReminderSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Administrative Directives / Notes
              </label>
              <textarea
                value={reminderNotes}
                onChange={(e) => setReminderNotes(e.target.value)}
                rows={2}
                placeholder="Specify required site verification or deadline constraints..."
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
              <strong>Demonstration Notice:</strong> Real external SMS, WhatsApp, and IVR calls require live gateway provider credentials. This action simulates delivery and records it in the immutable audit trail.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsReminderModalOpen(false)}
                className="px-4 py-2 rounded-xl hover:bg-slate-100 font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm"
              >
                Dispatch Demonstration Reminder
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Escalation Workflow Modal (Section 5) */}
      {isEscalateModalOpen && escalateTargetComplaint && (
        <Modal
          isOpen={isEscalateModalOpen}
          onClose={() => setIsEscalateModalOpen(false)}
          title={`Escalate Grievance #${escalateTargetComplaint.token}`}
          subtitle="Statutory escalation under Public Services Guarantee Act Rule 12"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleExecuteEscalation} className="space-y-4 text-xs font-body">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Escalation Level
              </label>
              <select
                value={targetEscalationLevel}
                onChange={(e) => setTargetEscalationLevel(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:border-purple-600"
              >
                <option value={1}>Level 1: Officer Reminder (Nodal Warning)</option>
                <option value={2}>Level 2: Supervisor Escalation (Zonal Oversight)</option>
                <option value={3}>Level 3: Department Head Review (DM / Apex Ombudsman)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Statutory Escalation Reason <span className="text-rose-500">*</span>
              </label>
              <select
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-purple-600"
              >
                <option value="Statutory SLA Breach under Public Services Guarantee Act">
                  Statutory SLA Breach under Public Services Guarantee Act
                </option>
                <option value="Severe Public Safety Hazard & Acute Citizen Harm Risk">
                  Severe Public Safety Hazard & Acute Citizen Harm Risk
                </option>
                <option value="Nodal Officer Inaction past grace period (Section 4 Notice)">
                  Nodal Officer Inaction past grace period (Section 4 Notice)
                </option>
                <option value="Inter-Departmental Jurisdictional Impasse">
                  Inter-Departmental Jurisdictional Impasse
                </option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reviewing Authority
              </label>
              <input
                type="text"
                value={escalationAuthority}
                onChange={(e) => setEscalationAuthority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mandated Action / Remarks
              </label>
              <textarea
                value={escalationRemarks}
                onChange={(e) => setEscalationRemarks(e.target.value)}
                rows={2}
                placeholder="Specify corrective actions, contractor summons, or emergency orders..."
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-[11px]">
              <strong>Confirmation Required:</strong> Escalating this ticket will update the official gazette queue, notify the reviewing authority, and increase penalty liability under statutory rules.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEscalateModalOpen(false)}
                className="px-4 py-2 rounded-xl hover:bg-slate-100 font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm"
              >
                Confirm Statutory Escalation
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Review Note Modal */}
      {isReviewNoteModalOpen && reviewNoteComplaint && (
        <Modal
          isOpen={isReviewNoteModalOpen}
          onClose={() => setIsReviewNoteModalOpen(false)}
          title={`Add Review Note: #${reviewNoteComplaint.token}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleExecuteReviewNote} className="space-y-3 text-xs font-body">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Supervisor / Officer Notes
              </label>
              <textarea
                required
                value={reviewNoteText}
                onChange={(e) => setReviewNoteText(e.target.value)}
                rows={4}
                placeholder="Enter field inspection updates, material supply constraints, or citizen communication details..."
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsReviewNoteModalOpen(false)}
                className="px-4 py-2 rounded-xl hover:bg-slate-100 font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
              >
                Save Review Note
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Demonstration Deadline Adjuster Modal (Satisfies Tests 1, 2, 3) */}
      {isDeadlineModalOpen && deadlineComplaint && (
        <Modal
          isOpen={isDeadlineModalOpen}
          onClose={() => setIsDeadlineModalOpen(false)}
          title={`Adjust Follow-up & Due Date: #${deadlineComplaint.token}`}
          subtitle="Test deadline monitoring conditions in real time"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs font-body">
            <p className="text-slate-600">
              Use these demonstration presets to test how ResolveTrack calculates actual date differences and updates deadline states dynamically:
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleExecuteDeadlineChange('UPCOMING')}
                className="p-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-center"
              >
                <span className="block text-sm">📅 +48h</span>
                <span className="text-[10px]">Test Upcoming</span>
              </button>
              <button
                type="button"
                onClick={() => handleExecuteDeadlineChange('DUE_TODAY')}
                className="p-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-center"
              >
                <span className="block text-sm">⏰ Today</span>
                <span className="text-[10px]">Test Due Today</span>
              </button>
              <button
                type="button"
                onClick={() => handleExecuteDeadlineChange('OVERDUE')}
                className="p-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold text-center"
              >
                <span className="block text-sm">⚠️ -48h Past</span>
                <span className="text-[10px]">Test Overdue</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDeadlineModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Resolution Confirmation Modal */}
      {isResolveModalOpen && resolveTargetComplaint && (
        <Modal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          title={`Confirm Redressal: #${resolveTargetComplaint.token}`}
          subtitle="Permanently mark this grievance resolved"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleExecuteResolve} className="space-y-3 text-xs font-body">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Resolution Summary
              </label>
              <textarea
                required
                value={resolutionSummaryText}
                onChange={(e) => setResolutionSummaryText(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
              Marking as resolved removes this grievance from all active overdue and escalation queues.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsResolveModalOpen(false)}
                className="px-4 py-2 rounded-xl hover:bg-slate-100 font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
              >
                Confirm Resolution
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
