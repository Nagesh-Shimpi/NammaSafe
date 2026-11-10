import React, { useState, useMemo } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Modal } from '../../components/common/Modal';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Configurable Statutory Thresholds (GovOps Rule 14-B)
const THRESHOLDS = {
  BALANCED: 15,
  HIGH: 25,
  MAX_CAPACITY: 30
};

export const OfficerWorkloadView = () => {
  const {
    officers = [],
    complaints = [],
    departments = [],
    reassignments = [],
    reassignOfficer
  } = useComplaints();
  const { lang, t, tDepartment } = useLanguage();
  const { currentRole, USER_ROLES } = useAuth();
  const isAuthorizedReassign = currentRole === USER_ROLES.ADMIN || currentRole === USER_ROLES.SUPERVISOR;

  // Primary filters & active tab
  const [selectedDeptId, setSelectedDeptId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [workloadStatusFilter, setWorkloadStatusFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');
  const [viewTab, setViewTab] = useState('DIRECTORY'); // 'DIRECTORY' | 'HISTORY' | 'ANALYTICS'

  // Selected officer for inspection detail panel
  const [selectedOfficer, setSelectedOfficer] = useState(officers[0] || null);

  // Guided Nodal Reassignment Wizard State
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedComplaintToken, setSelectedComplaintToken] = useState('');
  const [selectedTargetOfficerId, setSelectedTargetOfficerId] = useState('');
  const [reassignmentReason, setReassignmentReason] = useState('Caseload Rebalancing & Bottleneck Mitigation');
  const [reassignmentNotes, setReassignmentNotes] = useState('');
  const [requireSupervisorApproval, setRequireSupervisorApproval] = useState(false);
  const [supervisorApprover, setSupervisorApprover] = useState('Shri Vikram Malhotra, IAS');

  // UI Toast notification
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper: compute officer category based on configurable thresholds
  const getWorkloadCategory = (officer) => {
    const caseload = officer.activeCaseload || 0;
    if (officer.availability === 'ON_LEAVE') {
      return {
        key: 'ON_LEAVE',
        label: 'On Leave',
        labelKn: 'ರಜೆಯಲ್ಲಿದ್ದಾರೆ',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
        color: '#64748b'
      };
    }
    if (caseload > THRESHOLDS.HIGH) {
      return {
        key: 'OVERLOADED',
        label: 'Overloaded',
        labelKn: 'ಅಧಿಕ ಕಾರ್ಯಭಾರ',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-400/30',
        color: '#ef4444'
      };
    }
    if (caseload > THRESHOLDS.BALANCED) {
      return {
        key: 'HIGH',
        label: 'High Workload',
        labelKn: 'ಹೆಚ್ಚಿನ ಹೊರೆ',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400/30',
        color: '#f59e0b'
      };
    }
    return {
      key: 'BALANCED',
      label: 'Balanced',
      labelKn: 'ಸಮತೋಲಿತ',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      color: '#10b981'
    };
  };

  // Filtered officers list
  const filteredOfficers = useMemo(() => {
    return officers.filter((officer) => {
      // Department filter
      if (selectedDeptId !== 'ALL' && officer.departmentId !== selectedDeptId) {
        return false;
      }
      // Search query (name, badge, employeeId, designation)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (officer.name || '').toLowerCase().includes(q);
        const matchesBadge = (officer.badge || '').toLowerCase().includes(q);
        const matchesEmpId = (officer.employeeId || '').toLowerCase().includes(q);
        const matchesDesig = (officer.designation || '').toLowerCase().includes(q);
        if (!matchesName && !matchesBadge && !matchesEmpId && !matchesDesig) {
          return false;
        }
      }
      // Workload Status filter
      const cat = getWorkloadCategory(officer);
      if (workloadStatusFilter !== 'ALL' && cat.key !== workloadStatusFilter) {
        return false;
      }
      // Availability filter
      if (availabilityFilter !== 'ALL') {
        if (availabilityFilter === 'AVAILABLE' && (officer.availability !== 'AVAILABLE' || cat.key === 'OVERLOADED')) {
          return false;
        }
        if (availabilityFilter === 'ON_LEAVE' && officer.availability !== 'ON_LEAVE') {
          return false;
        }
        if (availabilityFilter === 'BUSY' && officer.availability !== 'BUSY' && cat.key !== 'HIGH') {
          return false;
        }
      }
      return true;
    });
  }, [officers, selectedDeptId, searchQuery, workloadStatusFilter, availabilityFilter]);

  // Summary Metrics calculations
  const summaryMetrics = useMemo(() => {
    const totalActiveOfficers = officers.filter(o => o.availability !== 'ON_LEAVE').length;
    const totalAssignedComplaints = officers.reduce((acc, o) => acc + (o.activeCaseload || 0), 0);
    const availableForAssignment = officers.filter(o => o.availability === 'AVAILABLE' && (o.activeCaseload || 0) <= THRESHOLDS.BALANCED).length;
    const highWorkloadOfficers = officers.filter(o => {
      const c = o.activeCaseload || 0;
      return c > THRESHOLDS.BALANCED && c <= THRESHOLDS.HIGH && o.availability !== 'ON_LEAVE';
    }).length;
    const overloadedOfficers = officers.filter(o => (o.activeCaseload || 0) > THRESHOLDS.HIGH).length;
    const pendingReassignments = reassignments.filter(r => r.status === 'PENDING_APPROVAL').length;

    return {
      totalActiveOfficers,
      totalAssignedComplaints,
      availableForAssignment,
      highWorkloadOfficers,
      overloadedOfficers,
      pendingReassignments
    };
  }, [officers, reassignments]);

  // Chart data for visual distribution
  const chartData = useMemo(() => {
    return filteredOfficers.map((o) => {
      const caseload = o.activeCaseload || 0;
      const maxCap = o.maxCapacity || THRESHOLDS.MAX_CAPACITY;
      const availableCapacity = Math.max(0, maxCap - caseload);

      return {
        name: o.name.split(' ')[0] + ' ' + (o.name.split(' ')[1]?.[0] || '') + '.',
        fullName: o.name,
        badge: o.badge || o.employeeId,
        department: o.department,
        caseload,
        availableCapacity,
        maxCapacity: maxCap,
        statusKey: getWorkloadCategory(o).key
      };
    });
  }, [filteredOfficers]);

  // Donut chart distribution categories
  const pieData = useMemo(() => {
    let balanced = 0;
    let high = 0;
    let overloaded = 0;
    let onLeave = 0;

    officers.forEach((o) => {
      const cat = getWorkloadCategory(o).key;
      if (cat === 'BALANCED') balanced++;
      else if (cat === 'HIGH') high++;
      else if (cat === 'OVERLOADED') overloaded++;
      else if (cat === 'ON_LEAVE') onLeave++;
    });

    return [
      { name: 'Balanced Workload (≤15)', value: balanced, color: '#0d9488' }, // teal-600
      { name: 'High Workload (16-25)', value: high, color: '#f59e0b' },      // amber-500
      { name: 'Overloaded (>25)', value: overloaded, color: '#ef4444' },      // red-500
      { name: 'On Leave / Offline', value: onLeave, color: '#64748b' }         // slate-500
    ];
  }, [officers]);

  // Complaints assigned to currently selected officer for the detail panel
  const selectedOfficerComplaints = useMemo(() => {
    if (!selectedOfficer) return [];
    return complaints.filter((c) => {
      return (
        c.assignedOfficer?.id === selectedOfficer.id ||
        c.assignedOfficer?.badge === selectedOfficer.badge ||
        c.assignedOfficer?.name === selectedOfficer.name
      );
    });
  }, [complaints, selectedOfficer]);

  // Priority distribution for selected officer
  const priorityDistribution = useMemo(() => {
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    selectedOfficerComplaints.forEach((c) => {
      if (counts[c.priority] !== undefined) {
        counts[c.priority]++;
      }
    });
    return counts;
  }, [selectedOfficerComplaints]);

  // Upcoming deadlines & overdue cases for selected officer
  const officerAlerts = useMemo(() => {
    const overdue = selectedOfficerComplaints.filter(c => c.status === 'OVERDUE' || (c.hoursRemaining !== undefined && c.hoursRemaining < 0));
    const urgentUpcoming = selectedOfficerComplaints.filter(c => c.hoursRemaining > 0 && c.hoursRemaining <= 24);
    return { overdue, urgentUpcoming };
  }, [selectedOfficerComplaints]);

  // Open Reassignment Modal with a pre-selected complaint (or first available)
  const handleOpenReassignModal = (complaint = null, preSelectedOfficer = null) => {
    if (complaint) {
      setSelectedComplaintToken(complaint.token || complaint.id);
    } else if (selectedOfficerComplaints.length > 0) {
      setSelectedComplaintToken(selectedOfficerComplaints[0].token || selectedOfficerComplaints[0].id);
    } else if (complaints.length > 0) {
      setSelectedComplaintToken(complaints[0].token || complaints[0].id);
    }

    if (preSelectedOfficer) {
      setSelectedOfficer(preSelectedOfficer);
    }

    // Pick top recommended officer as initial selection
    const defaultTarget = officers.find(
      (o) => o.id !== (complaint?.assignedOfficer?.id || selectedOfficer?.id) && o.availability === 'AVAILABLE'
    ) || officers[0];

    setSelectedTargetOfficerId(defaultTarget ? defaultTarget.id : '');
    setWizardStep(1);
    setReassignmentReason('Caseload Rebalancing & Bottleneck Mitigation');
    setReassignmentNotes('');
    setRequireSupervisorApproval(false);
    setIsReassignModalOpen(true);
  };

  // Currently chosen complaint in wizard
  const currentWizardComplaint = useMemo(() => {
    return complaints.find(c => c.token === selectedComplaintToken || c.id === selectedComplaintToken) || complaints[0];
  }, [complaints, selectedComplaintToken]);

  // Eligible recommended officers ranked with explainability
  const eligibleOfficersRecommendations = useMemo(() => {
    if (!currentWizardComplaint) return [];
    const sourceOfficerId = currentWizardComplaint.assignedOfficer?.id || selectedOfficer?.id;

    return officers
      .filter(o => o.id !== sourceOfficerId)
      .map(o => {
        let score = 70;
        const reasons = [];

        // Check if officer is available
        const isAvailable = o.availability !== 'ON_LEAVE' && (o.activeCaseload || 0) < THRESHOLDS.MAX_CAPACITY;
        if (!isAvailable) {
          score = 0;
        }

        // Domain / department match
        const isDeptMatch = o.departmentId === currentWizardComplaint.departmentId ||
          (o.department && currentWizardComplaint.departmentName && o.department.includes(currentWizardComplaint.departmentName));
        if (isDeptMatch) {
          score += 20;
          reasons.push('Same ministerial department jurisdiction');
        }

        // Category experience
        const hasCategoryExp = Array.isArray(o.categoryExperience) &&
          o.categoryExperience.some(cat => cat.toLowerCase().includes((currentWizardComplaint.category || '').toLowerCase()));
        if (hasCategoryExp) {
          score += 15;
          reasons.push(`Direct track record in ${currentWizardComplaint.category}`);
        }

        // Caseload headroom bonus
        const caseload = o.activeCaseload || 0;
        if (caseload <= 10) {
          score += 15;
          reasons.push(`Low active caseload (${caseload}/30) with ample capacity headroom`);
        } else if (caseload <= THRESHOLDS.BALANCED) {
          score += 8;
          reasons.push(`Balanced workload (${caseload}/30)`);
        } else if (caseload > THRESHOLDS.HIGH) {
          score -= 30;
        }

        // SLA rate bonus
        if ((o.slaRate || 0) >= 94) {
          score += 10;
          reasons.push(`High statutory SLA compliance rate (${o.slaRate}%)`);
        }

        const clampedScore = Math.min(99, Math.max(10, score));

        return {
          ...o,
          computedSuitability: isAvailable ? clampedScore : 0,
          isEligible: isAvailable,
          recommendationReasons: reasons.length > 0 ? reasons : ['General administrative cadre eligibility']
        };
      })
      .sort((a, b) => b.computedSuitability - a.computedSuitability);
  }, [officers, currentWizardComplaint, selectedOfficer]);

  // Chosen target officer object in wizard
  const currentWizardTargetOfficer = useMemo(() => {
    return officers.find(o => o.id === selectedTargetOfficerId) || eligibleOfficersRecommendations[0];
  }, [officers, selectedTargetOfficerId, eligibleOfficersRecommendations]);

  // Execute Reassignment submission
  const handleExecuteReassignment = (e) => {
    if (e) e.preventDefault();
    if (!isAuthorizedReassign) {
      showToast('Unauthorized action blocked: Nodal officer reassignment requires Administrator or Supervisor privileges.');
      return;
    }
    if (!currentWizardComplaint || !currentWizardTargetOfficer) return;

    const status = requireSupervisorApproval ? 'PENDING_APPROVAL' : 'COMPLETED';
    const approvedBy = requireSupervisorApproval ? 'Pending Ombudsman / Supervisor Clearance' : supervisorApprover;

    const success = reassignOfficer(
      currentWizardComplaint.token || currentWizardComplaint.id,
      currentWizardTargetOfficer.id,
      {
        reason: reassignmentReason,
        initiatedBy: 'Zonal Administrator',
        approvedBy,
        notes: reassignmentNotes || 'Executed via ResolveTrack Nodal Rebalancing Desk.',
        status
      }
    );

    if (success) {
      if (requireSupervisorApproval) {
        showToast(`Reassignment request for #${currentWizardComplaint.token} submitted for Supervisor Approval.`);
      } else {
        showToast(`Complaint #${currentWizardComplaint.token} successfully reassigned to ${currentWizardTargetOfficer.name}. Audit trail updated.`);
      }
    }
    setIsReassignModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700/80 flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-teal-400">task_alt</span>
          <span className="font-body text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Header Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <Breadcrumb
          items={[
            { label: t('navOverview'), to: '/admin/overview' },
            { label: t('navOfficers'), to: '/admin/officers' },
            { label: t('workloadTitle') },
          ]}
        />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-2">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">supervisor_account</span>
              </span>
              <div>
                <h1 className="font-headline text-2xl font-bold text-slate-900 tracking-tight">
                  {t('workloadTitle')}
                </h1>
                <p className="font-body text-xs sm:text-sm text-slate-500 mt-0.5">
                  {t('workloadSubtitle')}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setViewTab(viewTab === 'HISTORY' ? 'DIRECTORY' : 'HISTORY')}
              className={`px-4 py-2 rounded-xl font-body text-sm font-semibold border transition-all flex items-center gap-2 ${
                viewTab === 'HISTORY'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-base">history</span>
              <span>{t('reassignmentHistory')}</span>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-teal-100 text-teal-800">
                {reassignments.length}
              </span>
            </button>

            <button
              onClick={() => handleOpenReassignModal()}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-body text-sm font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">swap_horiz</span>
              <span>{t('reassignOfficer')}</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          {/* Department Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{t('department')}</label>
            <div className="relative">
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 transition-colors"
              >
                <option value="ALL">{lang === 'kn' ? `ಎಲ್ಲಾ ಇಲಾಖೆಗಳು (${departments.length})` : `All Departments (${departments.length})`}</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {tDepartment(dept.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Officer Search */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {lang === 'kn' ? 'ಅಧಿಕಾರಿ ಹುಡುಕಿ' : 'Search Officer'}
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'kn' ? 'ಹೆಸರು, ಬ್ಯಾಡ್ಜ್ ಅಥವಾ ಐಡಿ...' : 'Name, badge or EMP ID...'}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Workload Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">{t('workloadStatus')}</label>
            <select
              value={workloadStatusFilter}
              onChange={(e) => setWorkloadStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 transition-colors"
            >
              <option value="ALL">{lang === 'kn' ? 'ಎಲ್ಲಾ ಕಾರ್ಯಭಾರ ಮಟ್ಟಗಳು' : 'All Workload Levels'}</option>
              <option value="BALANCED">{lang === 'kn' ? 'ಸಮತೋಲಿತ (≤15)' : 'Balanced Workload (≤15)'}</option>
              <option value="HIGH">{lang === 'kn' ? 'ಹೆಚ್ಚಿನ ಕಾರ್ಯಭಾರ (16-25)' : 'High Workload (16-25)'}</option>
              <option value="OVERLOADED">{lang === 'kn' ? 'ಅಧಿಕ ಹೊರೆ (>25)' : 'Overloaded (>25)'}</option>
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {lang === 'kn' ? 'ಲಭ್ಯತೆ' : 'Availability'}
            </label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 transition-colors"
            >
              <option value="ALL">{lang === 'kn' ? 'ಎಲ್ಲಾ ಲಭ್ಯತೆ' : 'All Availabilities'}</option>
              <option value="AVAILABLE">{lang === 'kn' ? 'ನಿಯೋಜನೆಗೆ ಲಭ್ಯ' : 'Available for Assignment'}</option>
              <option value="BUSY">{lang === 'kn' ? 'ಕಾರ್ಯನಿರತ' : 'Busy / At Capacity'}</option>
              <option value="ON_LEAVE">{lang === 'kn' ? 'ರಜೆಯಲ್ಲಿದ್ದಾರೆ' : 'On Leave'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Total Active Officers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{t('availableOfficers')}</span>
              <span className="material-symbols-outlined text-teal-600 text-lg">badge</span>
            </div>
            <div className="font-headline text-2xl font-bold text-slate-900">
              {summaryMetrics.totalActiveOfficers}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {lang === 'kn' ? `${departments.length} ರಾಜ್ಯ ಇಲಾಖೆಗಳಲ್ಲಿ` : `Across ${departments.length} state departments`}
          </div>
        </div>

        {/* 2. Total Assigned Complaints */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{t('assignedComplaints')}</span>
              <span className="material-symbols-outlined text-blue-600 text-lg">folder_open</span>
            </div>
            <div className="font-headline text-2xl font-bold text-slate-900">
              {summaryMetrics.totalAssignedComplaints}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {lang === 'kn' ? 'ತನಿಖೆಯಲ್ಲಿರುವ ಸಕ್ರಿಯ ದೂರುಗಳು' : 'Active under officer inquiry'}
          </div>
        </div>

        {/* 3. Officers Available for Assignment */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {lang === 'kn' ? 'ಲಭ್ಯ ಅಧಿಕಾರಿಗಳು' : 'Available Officers'}
              </span>
              <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
            </div>
            <div className="font-headline text-2xl font-bold text-emerald-700">
              {summaryMetrics.availableForAssignment}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            {lang === 'kn' ? 'ತಕ್ಷಣದ ನಿಯೋಜನೆಗೆ ಸಿದ್ಧ' : 'Immediate intake headroom'}
          </div>
        </div>

        {/* 4. Officers with High Workload */}
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-amber-700 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {lang === 'kn' ? 'ಹೆಚ್ಚಿನ ಹೊರೆ' : 'High Workload'}
              </span>
              <span className="material-symbols-outlined text-amber-600 text-lg">warning</span>
            </div>
            <div className="font-headline text-2xl font-bold text-amber-900">
              {summaryMetrics.highWorkloadOfficers}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-medium">
            {lang === 'kn' ? '16–25 ಸಕ್ರಿಯ ಪ್ರಕರಣಗಳು' : '16–25 active cases (60-85%)'}
          </div>
        </div>

        {/* 5. Officers Overloaded */}
        <div className="bg-white p-4 rounded-xl border border-rose-200/80 bg-rose-50/20 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-rose-700 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {lang === 'kn' ? 'ಅಧಿಕ ಕಾರ್ಯಭಾರ' : 'Overloaded'}
              </span>
              <span className="material-symbols-outlined text-rose-600 text-lg">error</span>
            </div>
            <div className="font-headline text-2xl font-bold text-rose-700">
              {summaryMetrics.overloadedOfficers}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-rose-700 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
            <span>{lang === 'kn' ? '>25 ಪ್ರಕರಣಗಳು · SLA ಅಪಾಯ' : '>25 cases · SLA Risk'}</span>
          </div>
        </div>

        {/* 6. Reassignments Pending Approval */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {lang === 'kn' ? 'ಅನುಮೋದನೆ ಬಾಕಿ' : 'Pending Approvals'}
              </span>
              <span className="material-symbols-outlined text-purple-600 text-lg">pending_actions</span>
            </div>
            <div className="font-headline text-2xl font-bold text-purple-700">
              {summaryMetrics.pendingReassignments}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-purple-600 font-medium">
            {lang === 'kn' ? 'ಮೇಲ್ವಿಚಾರಕರ ಸಹಿಗಾಗಿ ಕಾಯುತ್ತಿದೆ' : 'Awaiting ombudsman sign-off'}
          </div>
        </div>
      </div>

      {/* Main View Tab Switcher: Directory vs Reassignment History */}
      {viewTab === 'HISTORY' ? (
        /* Reassignment History View */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-600 text-xl">history</span>
                <h2 className="font-headline text-lg font-bold text-slate-900">
                  {lang === 'kn' ? 'ನೋಡಲ್ ಮರುನಿಯೋಜನೆ ಪರಿಶೋಧನಾ ಹಾದಿ' : 'Nodal Reassignment Statutory Audit Trail'}
                </h2>
              </div>
              <p className="font-body text-xs text-slate-500 mt-0.5">
                {lang === 'kn' ? 'ಕಲಂ 12 ಮಾರ್ಗಸೂಚಿಗಳಡಿ ವರ್ಗಾವಣೆಯಾದ ದೂರುಗಳ ಸಂಪೂರ್ಣ ದಾಖಲೆ.' : 'Complete historical record of cadre dockets transferred under Section 12 GovOps guidelines.'}
              </p>
            </div>
            <button
              onClick={() => setViewTab('DIRECTORY')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>{lang === 'kn' ? 'ಅಧಿಕಾರಿ ಪಟ್ಟಿಗೆ ಹಿಂತಿರುಗಿ' : 'Back to Officer Directory'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3.5 font-bold">{t('glossary.trackingId')}</th>
                  <th className="py-3 px-3.5 font-bold">{lang === 'kn' ? 'ಹಿಂದಿನ ಅಧಿಕಾರಿ' : 'Previous Officer'}</th>
                  <th className="py-3 px-3.5 font-bold">{lang === 'kn' ? 'ಹೊಸ ನೋಡಲ್ ಅಧಿಕಾರಿ' : 'New Nodal Officer'}</th>
                  <th className="py-3 px-3.5 font-bold">{t('transferReason')}</th>
                  <th className="py-3 px-3.5 font-bold">{lang === 'kn' ? 'ಪ್ರಾರಂಭಿಸಿದವರು' : 'Initiated By'}</th>
                  <th className="py-3 px-3.5 font-bold">{lang === 'kn' ? 'ಅನುಮೋದಿಸಿದವರು' : 'Approved By'}</th>
                  <th className="py-3 px-3.5 font-bold">{t('eventTimestamp')}</th>
                  <th className="py-3 px-3.5 font-bold">{t('glossary.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {reassignments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-teal-700">
                      #{item.complaintId}
                    </td>
                    <td className="py-3 px-3.5 font-medium text-slate-700">
                      <div>{item.previousOfficer}</div>
                      <div className="text-[10px] text-slate-400">{item.previousOfficerDesignation || 'Officer'}</div>
                    </td>
                    <td className="py-3 px-3.5 font-medium text-slate-900">
                      <div className="font-semibold text-teal-900">{item.newOfficer}</div>
                      <div className="text-[10px] text-slate-400">{item.newOfficerDesignation || 'Officer'}</div>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 max-w-xs">
                      <span className="line-clamp-2">{item.reason}</span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 font-medium">
                      {item.initiatedBy}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600">
                      {item.approvedBy}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-500 whitespace-nowrap">
                      {item.timestamp}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'COMPLETED'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'COMPLETED' ? 'bg-teal-600' : 'bg-amber-500'}`} />
                        <span>{item.status === 'COMPLETED' ? 'Executed' : 'Pending Approval'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Workload Overview Charts & Explainer */
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Workload Distribution Chart */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-headline text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-600 text-lg">stacked_bar_chart</span>
                    <span>Officer Caseload vs Maximum Capacity</span>
                  </h3>
                  <p className="font-body text-xs text-slate-500">
                    Live active dockets (stacked) relative to max recommended capacity (30 cases).
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-teal-600 inline-block" />
                    <span className="text-slate-600">Active Load</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-slate-200 inline-block" />
                    <span className="text-slate-500">Available Headroom</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 35]}
                    />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs font-body border border-slate-700">
                              <div className="font-bold text-sm text-teal-300">{data.fullName}</div>
                              <div className="text-slate-400 text-[11px] mb-2">{data.department}</div>
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px]">
                                <span className="text-slate-400">Active Caseload:</span>
                                <span className="font-bold text-white">{data.caseload} dockets</span>
                                <span className="text-slate-400">Headroom Capacity:</span>
                                <span className="font-bold text-teal-400">{data.availableCapacity} slots</span>
                                <span className="text-slate-400">Max Threshold:</span>
                                <span className="font-bold text-slate-300">{data.maxCapacity}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="caseload" stackId="a" fill="#0d9488" radius={[0, 0, 0, 0]}>
                      {chartData.map((entry, index) => {
                        const color =
                          entry.statusKey === 'OVERLOADED'
                            ? '#ef4444'
                            : entry.statusKey === 'HIGH'
                            ? '#f59e0b'
                            : '#0d9488';
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                    <Bar dataKey="availableCapacity" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Explainer note */}
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
                <span className="material-symbols-outlined text-teal-600 text-base mt-0.5">info</span>
                <div>
                  <strong>Configurable Threshold Guidelines:</strong> Workload distribution is categorized under GovOps Cadre Directive Rule 14-B:
                  <span className="font-semibold text-emerald-700"> Balanced (≤15)</span>,
                  <span className="font-semibold text-amber-700"> High Workload (16–25)</span>, and
                  <span className="font-semibold text-rose-700"> Overloaded (&gt;25 cases)</span>.
                  Thresholds dynamically adjust based on case complexity and statutory timeline urgency.
                </div>
              </div>
            </div>

            {/* Cadre Workload Distribution Pie */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-headline text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-teal-600 text-lg">pie_chart</span>
                  <span>Cadre Distribution Ratio</span>
                </h3>
                <p className="font-body text-xs text-slate-500 mb-3">
                  Officer division by statutory workload tier.
                </p>

                <div className="w-full h-52 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend list */}
                <div className="flex flex-col gap-2 mt-2">
                  {pieData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-700 font-medium">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">{item.value} officers</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance disclaimer card */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 italic">
                * Note: Complaint count alone does not reflect officer performance. Weighted factors include grievance complexity, jurisdictional terrain, and statutory verification SLAs.
              </div>
            </div>
          </div>

          {/* Officer Directory Table & Selected Officer Detail Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Officer Directory Table (Takes 2 cols on desktop) */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="font-headline text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-600 text-lg">view_list</span>
                      <span>Nodal Officer Directory & Cadre Caseload</span>
                    </h2>
                    <p className="font-body text-xs text-slate-500">
                      Showing {filteredOfficers.length} of {officers.length} registered officers. Click any row to inspect assigned docket.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                        <th className="py-2.5 px-3 font-bold">Officer</th>
                        <th className="py-2.5 px-3 font-bold">Employee ID</th>
                        <th className="py-2.5 px-3 font-bold">Department</th>
                        <th className="py-2.5 px-3 font-bold text-center">Active</th>
                        <th className="py-2.5 px-3 font-bold text-center">Pending</th>
                        <th className="py-2.5 px-3 font-bold text-center">Overdue</th>
                        <th className="py-2.5 px-3 font-bold text-center">Resolved</th>
                        <th className="py-2.5 px-3 font-bold">Workload</th>
                        <th className="py-2.5 px-3 font-bold">Availability</th>
                        <th className="py-2.5 px-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-body">
                      {filteredOfficers.map((officer) => {
                        const isSelected = selectedOfficer?.id === officer.id;
                        const cat = getWorkloadCategory(officer);
                        const pct = Math.min(100, Math.round(((officer.activeCaseload || 0) / (officer.maxCapacity || THRESHOLDS.MAX_CAPACITY)) * 100));

                        return (
                          <tr
                            key={officer.id}
                            onClick={() => setSelectedOfficer(officer)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-teal-50/50 hover:bg-teal-50'
                                : 'hover:bg-slate-50/80'
                            }`}
                          >
                            {/* Officer Name & Avatar */}
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={officer.avatar}
                                  alt={officer.name}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                />
                                <div>
                                  <div className="font-bold text-slate-900 line-clamp-1">{officer.name}</div>
                                  <div className="text-[10px] text-slate-500 line-clamp-1">{officer.designation}</div>
                                </div>
                              </div>
                            </td>

                            {/* Employee ID */}
                            <td className="py-3 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                              {officer.employeeId || officer.badge}
                            </td>

                            {/* Department */}
                            <td className="py-3 px-3 text-slate-600 max-w-[140px]">
                              <span className="line-clamp-1 text-[11px] font-medium" title={officer.department}>
                                {officer.department}
                              </span>
                            </td>

                            {/* Active */}
                            <td className="py-3 px-3 font-mono font-bold text-center text-slate-900">
                              {officer.activeCaseload || 0}
                            </td>

                            {/* Pending */}
                            <td className="py-3 px-3 font-mono text-center text-slate-600">
                              {officer.pendingCount || Math.round((officer.activeCaseload || 1) * 0.7)}
                            </td>

                            {/* Overdue */}
                            <td className="py-3 px-3 font-mono text-center">
                              {(officer.overdueCount || 0) > 0 ? (
                                <span className="inline-block px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                                  {officer.overdueCount}
                                </span>
                              ) : (
                                <span className="text-slate-400">0</span>
                              )}
                            </td>

                            {/* Resolved */}
                            <td className="py-3 px-3 font-mono text-center text-slate-600">
                              {officer.resolvedCount || 0}
                            </td>

                            {/* Workload Indicator */}
                            <td className="py-3 px-3 whitespace-nowrap min-w-[120px]">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                  <span className={`px-1.5 py-0.2 rounded font-bold ${cat.badgeClass}`}>
                                    {cat.label}
                                  </span>
                                  <span className="text-slate-500">{pct}%</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      cat.key === 'OVERLOADED'
                                        ? 'bg-rose-500'
                                        : cat.key === 'HIGH'
                                        ? 'bg-amber-500'
                                        : 'bg-teal-600'
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Availability */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                                  officer.availability === 'AVAILABLE'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : officer.availability === 'ON_LEAVE'
                                    ? 'bg-slate-100 text-slate-700'
                                    : officer.availability === 'OVERLOADED'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    officer.availability === 'AVAILABLE'
                                      ? 'bg-emerald-600'
                                      : officer.availability === 'ON_LEAVE'
                                      ? 'bg-slate-500'
                                      : officer.availability === 'OVERLOADED'
                                      ? 'bg-rose-600'
                                      : 'bg-amber-600'
                                  }`}
                                />
                                <span>{officer.availability || 'AVAILABLE'}</span>
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOfficer(officer);
                                  }}
                                  title="Inspect Officer Dossier"
                                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-base">visibility</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenReassignModal(null, officer);
                                  }}
                                  title="Reassign Dockets from this officer"
                                  className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-xs">swap_horiz</span>
                                  <span>Reassign</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Officer Detail Panel (Right col) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              {selectedOfficer ? (
                <div className="flex flex-col gap-4">
                  {/* Header Profile */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedOfficer.avatar}
                        alt={selectedOfficer.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-teal-500"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-headline text-base font-bold text-slate-900">
                            {selectedOfficer.name}
                          </h3>
                        </div>
                        <p className="font-body text-xs text-slate-500">
                          {selectedOfficer.designation}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {selectedOfficer.employeeId || selectedOfficer.badge}
                          </span>
                          <span className="text-[11px] text-teal-700 font-semibold">
                            {selectedOfficer.zone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-emerald-700 block">
                        {selectedOfficer.slaComplianceRate || `${selectedOfficer.slaRate}%`}
                      </span>
                      <span className="text-[10px] text-slate-400">SLA Adherence</span>
                    </div>
                  </div>

                  {/* Workload Capacity Gauge */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-600">Current Workload Capacity</span>
                      <span className="font-mono font-bold text-slate-900">
                        {selectedOfficer.activeCaseload || 0} / {selectedOfficer.maxCapacity || THRESHOLDS.MAX_CAPACITY} cases
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full ${
                          (selectedOfficer.activeCaseload || 0) > THRESHOLDS.HIGH
                            ? 'bg-rose-500'
                            : (selectedOfficer.activeCaseload || 0) > THRESHOLDS.BALANCED
                            ? 'bg-amber-500'
                            : 'bg-teal-600'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              ((selectedOfficer.activeCaseload || 0) /
                                (selectedOfficer.maxCapacity || THRESHOLDS.MAX_CAPACITY)) *
                                100
                            )
                          )}%`
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>Status: {getWorkloadCategory(selectedOfficer).label}</span>
                      <span>
                        {Math.max(0, (selectedOfficer.maxCapacity || THRESHOLDS.MAX_CAPACITY) - (selectedOfficer.activeCaseload || 0))} slots available
                      </span>
                    </div>
                  </div>

                  {/* Complaint Priority Breakdown */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Priority Distribution in Queue
                    </h4>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
                        <div className="font-mono font-bold text-rose-700 text-sm">
                          {priorityDistribution.CRITICAL}
                        </div>
                        <div className="text-[10px] text-rose-600 font-medium">Critical</div>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                        <div className="font-mono font-bold text-amber-700 text-sm">
                          {priorityDistribution.HIGH}
                        </div>
                        <div className="text-[10px] text-amber-600 font-medium">High</div>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="font-mono font-bold text-blue-700 text-sm">
                          {priorityDistribution.MEDIUM}
                        </div>
                        <div className="text-[10px] text-blue-600 font-medium">Medium</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="font-mono font-bold text-slate-700 text-sm">
                          {priorityDistribution.LOW}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">Low</div>
                      </div>
                    </div>
                  </div>

                  {/* Overdue / Deadline Alerts */}
                  {(officerAlerts.overdue.length > 0 || officerAlerts.urgentUpcoming.length > 0) && (
                    <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                      <span className="material-symbols-outlined text-rose-600 text-base mt-0.5">notification_important</span>
                      <div>
                        <strong className="block font-bold">Timeline Alerts:</strong>
                        {officerAlerts.overdue.length > 0 && (
                          <div>• {officerAlerts.overdue.length} cases currently overdue Section 8 statutory SLA.</div>
                        )}
                        {officerAlerts.urgentUpcoming.length > 0 && (
                          <div>• {officerAlerts.urgentUpcoming.length} cases nearing SLA deadline (&lt;24 hours remaining).</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Assigned Complaints List */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Assigned Active Dockets ({selectedOfficerComplaints.length})
                      </h4>
                      <button
                        onClick={() => handleOpenReassignModal(null, selectedOfficer)}
                        className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline flex items-center gap-0.5"
                      >
                        <span>Rebalance All</span>
                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </button>
                    </div>

                    {selectedOfficerComplaints.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 font-body text-xs">
                        No active grievances currently assigned to this officer.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                        {selectedOfficerComplaints.map((ticket) => (
                          <div
                            key={ticket.token || ticket.id}
                            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-teal-400 transition-colors flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="font-mono text-xs font-bold text-teal-700">
                                  #{ticket.token}
                                </span>
                                <PriorityBadge priority={ticket.priority} className="text-[9px] py-0 px-1.5" />
                              </div>
                              <p className="font-body text-xs text-slate-800 font-medium truncate">
                                {ticket.title}
                              </p>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                SLA: {ticket.hoursRemaining !== undefined ? `${ticket.hoursRemaining}h remaining` : 'On track'}
                              </div>
                            </div>
                            <button
                              onClick={() => handleOpenReassignModal(ticket, selectedOfficer)}
                              className="px-2 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-body text-[10px] font-bold flex items-center gap-1 shrink-0"
                            >
                              <span className="material-symbols-outlined text-xs">swap_horiz</span>
                              <span>Reassign</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Activity */}
                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Recent Field Action
                    </h4>
                    <p className="text-xs text-slate-600 font-body italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      "{selectedOfficer.recentActivity || 'Verified inspection logs; routine redressal updates.'}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  Select an officer from the directory table to inspect caseload details.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Guided Nodal Reassignment 4-Step Modal */}
      {isReassignModalOpen && currentWizardComplaint && (
        <Modal
          isOpen={isReassignModalOpen}
          onClose={() => setIsReassignModalOpen(false)}
          title="Guided Nodal Reassignment Workflow"
          subtitle={`Redistributing docket #${currentWizardComplaint.token} to optimal cadre nodal officer`}
          maxWidth="max-w-3xl"
        >
          {/* Step Indicator */}
          <div className="mb-6 pb-4 border-b border-slate-200">
            <div className="grid grid-cols-4 gap-2 text-center font-body text-xs">
              <div
                className={`flex flex-col items-center gap-1 pb-2 border-b-2 transition-all ${
                  wizardStep >= 1 ? 'border-teal-600 text-teal-700 font-bold' : 'border-slate-200 text-slate-400'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-500 text-teal-700 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <span>1. Select Complaint</span>
              </div>
              <div
                className={`flex flex-col items-center gap-1 pb-2 border-b-2 transition-all ${
                  wizardStep >= 2 ? 'border-teal-600 text-teal-700 font-bold' : 'border-slate-200 text-slate-400'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-500 text-teal-700 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <span>2. AI Recommendation</span>
              </div>
              <div
                className={`flex flex-col items-center gap-1 pb-2 border-b-2 transition-all ${
                  wizardStep >= 3 ? 'border-teal-600 text-teal-700 font-bold' : 'border-slate-200 text-slate-400'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-500 text-teal-700 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <span>3. Review Shift</span>
              </div>
              <div
                className={`flex flex-col items-center gap-1 pb-2 border-b-2 transition-all ${
                  wizardStep >= 4 ? 'border-teal-600 text-teal-700 font-bold' : 'border-slate-200 text-slate-400'
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-500 text-teal-700 text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <span>4. Statutory Confirm</span>
              </div>
            </div>
          </div>

          {/* STEP 1: Select Complaint & Reassignment Reason */}
          {wizardStep === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Grievance Dossier
                </label>
                <select
                  value={selectedComplaintToken}
                  onChange={(e) => setSelectedComplaintToken(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500"
                >
                  {complaints.map((c) => (
                    <option key={c.token} value={c.token}>
                      #{c.token} · [{c.priority}] {c.title} (Currently: {c.assignedOfficer?.name || 'Unassigned'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Complaint Details Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-700">
                      #{currentWizardComplaint.token}
                    </span>
                    <PriorityBadge priority={currentWizardComplaint.priority} />
                    <StatusBadge status={currentWizardComplaint.status} />
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    SLA: {currentWizardComplaint.hoursRemaining !== undefined ? `${currentWizardComplaint.hoursRemaining}h remaining` : '72h'}
                  </span>
                </div>

                <h4 className="font-headline text-sm font-bold text-slate-900 mb-1">
                  {currentWizardComplaint.title}
                </h4>
                <p className="font-body text-xs text-slate-600 mb-3">
                  {currentWizardComplaint.description || 'Grievance registered via public portal.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Department</span>
                    <span className="font-semibold text-slate-800">{currentWizardComplaint.departmentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Category</span>
                    <span className="font-semibold text-slate-800">{currentWizardComplaint.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Current Nodal Officer</span>
                    <span className="font-semibold text-slate-800">
                      {currentWizardComplaint.assignedOfficer?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reassignment Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for Reassignment <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reassignmentReason}
                  onChange={(e) => setReassignmentReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium focus:outline-none focus:border-teal-500 mb-2"
                >
                  <option value="Caseload Rebalancing & Bottleneck Mitigation">
                    Caseload Rebalancing & Bottleneck Mitigation
                  </option>
                  <option value="Officer on Medical / Statutory Leave">
                    Officer on Medical / Statutory Leave
                  </option>
                  <option value="Subject Matter Technical Expertise Required">
                    Subject Matter Technical Expertise Required
                  </option>
                  <option value="Jurisdictional Boundary Transfer (Zonal Re-alignment)">
                    Jurisdictional Boundary Transfer (Zonal Re-alignment)
                  </option>
                  <option value="Critical SLA Escalation Prevention (Section 8)">
                    Critical SLA Escalation Prevention (Section 8)
                  </option>
                  <option value="Citizen Appeal / Conflict of Interest Recusal">
                    Citizen Appeal / Conflict of Interest Recusal
                  </option>
                </select>

                <textarea
                  value={reassignmentNotes}
                  onChange={(e) => setReassignmentNotes(e.target.value)}
                  rows={2}
                  placeholder="Optional administrative notes or special handover instructions..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsReassignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <span>Recommend Eligible Officers</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Recommend Eligible Officers */}
          {wizardStep === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-headline text-sm font-bold text-slate-900">
                    Recommended Cadre Officers
                  </h4>
                  <p className="font-body text-xs text-slate-500">
                    Ranked by GovOps Affinity Algorithm based on department domain, capacity headroom, and SLA track record.
                  </p>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold border border-teal-200">
                  {eligibleOfficersRecommendations.filter(o => o.isEligible).length} Eligible Officers
                </span>
              </div>

              <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
                {eligibleOfficersRecommendations.map((officer) => {
                  const isSelected = selectedTargetOfficerId === officer.id;
                  const isEligible = officer.isEligible;
                  const caseload = officer.activeCaseload || 0;
                  const pct = Math.min(100, Math.round((caseload / (officer.maxCapacity || THRESHOLDS.MAX_CAPACITY)) * 100));

                  return (
                    <div
                      key={officer.id}
                      onClick={() => {
                        if (isEligible) {
                          setSelectedTargetOfficerId(officer.id);
                        }
                      }}
                      className={`p-3.5 rounded-xl border transition-all ${
                        !isEligible
                          ? 'opacity-50 bg-slate-100 border-slate-200 cursor-not-allowed'
                          : isSelected
                          ? 'bg-teal-50/70 border-teal-500 shadow-xs ring-2 ring-teal-500/20 cursor-pointer'
                          : 'bg-white border-slate-200 hover:border-teal-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="targetOfficer"
                            checked={isSelected}
                            disabled={!isEligible}
                            onChange={() => setSelectedTargetOfficerId(officer.id)}
                            className="text-teal-600 focus:ring-teal-500"
                          />
                          <img
                            src={officer.avatar}
                            alt={officer.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                                {officer.name}
                              </h5>
                              <span className="font-mono text-[10px] text-slate-500 font-semibold">
                                ({officer.employeeId || officer.badge})
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {officer.designation} · {officer.department}
                            </p>
                          </div>
                        </div>

                        {/* Suitability score badge */}
                        <div className="text-right">
                          {isEligible ? (
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                                officer.computedSuitability >= 90
                                  ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}
                            >
                              {officer.computedSuitability}% Suitability
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-rose-100 text-rose-800">
                              Ineligible ({officer.availability})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Workload and suitability explanation */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono text-[11px]">
                            Load: <strong>{caseload}/30</strong> ({pct}%)
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase font-mono ${
                              officer.availability === 'AVAILABLE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {officer.availability}
                          </span>
                        </div>

                        <div className="text-[11px] text-teal-800 font-medium">
                          ✔ {officer.recommendationReasons?.[0] || 'Eligible cadre officer'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  disabled={!selectedTargetOfficerId}
                  onClick={() => setWizardStep(3)}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <span>Review Reassignment Shift</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review Reassignment Comparison */}
          {wizardStep === 3 && currentWizardTargetOfficer && (
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="font-headline text-sm font-bold text-slate-900">
                  Comparative Cadre Impact Review
                </h4>
                <p className="font-body text-xs text-slate-500">
                  Verify the before-and-after caseload reallocation to ensure statutory equilibrium.
                </p>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Source Officer */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-2">
                    Current Responsible Officer
                  </div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <img
                      src={currentWizardComplaint.assignedOfficer?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-slate-300"
                    />
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {currentWizardComplaint.assignedOfficer?.name || 'Current Officer'}
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        {currentWizardComplaint.assignedOfficer?.designation || 'Zonal Officer'}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex justify-between items-center font-mono">
                    <span className="text-slate-600">Caseload Shift:</span>
                    <span className="font-bold text-slate-800">
                      {currentWizardComplaint.assignedOfficer?.activeCaseload || 15} →{' '}
                      <span className="text-emerald-700">
                        {Math.max(0, (currentWizardComplaint.assignedOfficer?.activeCaseload || 15) - 1)} (-1 docket)
                      </span>
                    </span>
                  </div>
                </div>

                {/* Target Officer */}
                <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-teal-800 font-bold mb-2 flex items-center justify-between">
                    <span>New Nodal Officer</span>
                    <span className="material-symbols-outlined text-sm text-teal-600">check_circle</span>
                  </div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <img
                      src={currentWizardTargetOfficer.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border-2 border-teal-500"
                    />
                    <div>
                      <h5 className="font-bold text-teal-950 text-xs sm:text-sm">
                        {currentWizardTargetOfficer.name}
                      </h5>
                      <p className="text-[11px] text-teal-700">
                        {currentWizardTargetOfficer.designation}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-teal-200 text-xs flex justify-between items-center font-mono">
                    <span className="text-slate-600">Caseload Shift:</span>
                    <span className="font-bold text-slate-800">
                      {currentWizardTargetOfficer.activeCaseload || 0} →{' '}
                      <span className="text-teal-700 font-bold">
                        {(currentWizardTargetOfficer.activeCaseload || 0) + 1} (+1 docket)
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Transfer Summary Dossier Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-body">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Complaint Token:</span>
                  <span className="font-mono font-bold text-teal-700">#{currentWizardComplaint.token}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Grievance Title:</span>
                  <span className="font-semibold text-slate-900 max-w-sm truncate">{currentWizardComplaint.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Reassignment Reason:</span>
                  <span className="font-semibold text-slate-800">{reassignmentReason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Compliance Check:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    <span>Compliant with Rule 14-B Caseload Balance</span>
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(4)}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <span>Proceed to Final Authorization</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Confirm Reassignment & Optional Supervisor Approval */}
          {wizardStep === 4 && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3 font-body">
                <h4 className="font-headline text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-600 text-lg">gavel</span>
                  <span>Statutory Authorization & Handover Mandate</span>
                </h4>
                <p className="text-slate-600">
                  Please review statutory authorization settings before updating the official state ledger.
                </p>

                {/* Supervisor Approval Checkbox */}
                <div className="pt-2 border-t border-slate-200 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="requireSupervisorCheck"
                    checked={requireSupervisorApproval}
                    onChange={(e) => setRequireSupervisorApproval(e.target.checked)}
                    className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <label htmlFor="requireSupervisorCheck" className="font-bold text-slate-900 cursor-pointer block">
                      Require Formal Supervisor / Ombudsman Clearance
                    </label>
                    <p className="text-[11px] text-slate-500">
                      If checked, this transfer will be queued under "Pending Approval" until formally counter-signed by the designated ombudsman.
                    </p>
                  </div>
                </div>

                {/* Supervisor Approver Selector if required */}
                {requireSupervisorApproval ? (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      Routing to Approving Authority:
                    </label>
                    <select
                      value={supervisorApprover}
                      onChange={(e) => setSupervisorApprover(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-slate-800 text-xs font-medium focus:outline-none"
                    >
                      <option value="Shri Vikram Malhotra, IAS - Department Head">
                        Shri Vikram Malhotra, IAS - Department Head (MORTH)
                      </option>
                      <option value="Dr. Sudha Chandran, IAS - Nodal Ombudsman">
                        Dr. Sudha Chandran, IAS - Nodal Ombudsman (Jal Shakti)
                      </option>
                      <option value="Apex Redressal Vigilance Directorate">
                        Apex Redressal Vigilance Directorate
                      </option>
                    </select>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-200 text-teal-900">
                    <span className="font-bold block mb-0.5">Direct Administrator Fast-Track Reassignment:</span>
                    Executed under Delegated Section 14-B emergency powers. Notifications will dispatch immediately to both officers and the registered citizen.
                  </div>
                )}
              </div>

              {/* Audit trail warning banner */}
              <div className="p-3 rounded-xl bg-slate-900 text-white text-xs font-body flex items-start gap-2.5">
                <span className="material-symbols-outlined text-teal-400 text-base mt-0.5">verified_user</span>
                <div>
                  <strong>Section 12 Cadre Audit Trail:</strong> This action will be permanently recorded in the immutable ResolveTrack log. Both officers will receive SMS and in-app notifications with the complete case dossier.
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={handleExecuteReassignment}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
                >
                  <span className="material-symbols-outlined text-sm">task_alt</span>
                  <span>{requireSupervisorApproval ? 'Submit for Supervisor Approval' : 'Authorize & Execute Reassignment'}</span>
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
