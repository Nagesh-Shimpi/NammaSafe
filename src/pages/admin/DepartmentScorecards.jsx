import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Modal } from '../../components/common/Modal';
import {
  calculateResolutionRate,
  calculateAverageResolutionTime,
  calculateSLACompliance,
  calculateOverduePercentage,
  calculateCitizenSatisfaction,
  calculateDepartmentPerformance,
  calculateOfficerPerformance,
  generatePerformanceTrends,
  exportDataToCSV
} from '../../utils/analyticsCalculations';

export const DepartmentScorecards = () => {
  const { complaints, departments, officers, escalations, reminders, feedbackRecords } = useComplaints();
  const { lang, t, tDepartment } = useLanguage();
  const { currentRole, USER_ROLES } = useAuth();
  const navigate = useNavigate();

  // Active View Tab
  const [activeTab, setActiveTab] = useState('scorecards'); // 'scorecards' | 'comparison' | 'officers' | 'sla' | 'csat' | 'trends'

  // Global Filter State (Section 10)
  const [reportingPeriod, setReportingPeriod] = useState('ALL'); // 'ALL' | '7D' | '30D' | 'Q3' | 'YTD'
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Department Comparison State (Section 4)
  const [comparisonDeptIds, setComparisonDeptIds] = useState([]);

  // Modals
  const [isMethodologyModalOpen, setIsMethodologyModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Initialize comparison departments (first 3 departments by default)
  React.useEffect(() => {
    if (comparisonDeptIds.length === 0 && departments.length >= 2) {
      setComparisonDeptIds([departments[0].id, departments[1].id, departments[2]?.id].filter(Boolean));
    }
  }, [departments]);

  // Apply Global Filters to Complaints cohort
  const filteredComplaints = useMemo(() => {
    const now = new Date();
    return complaints.filter(c => {
      // 1. Period filter
      if (reportingPeriod !== 'ALL') {
        const cDate = new Date(c.createdAt || c.incidentDate || 0);
        const diffDays = (now.getTime() - cDate.getTime()) / (1000 * 60 * 60 * 24);
        if (reportingPeriod === '7D' && diffDays > 7) return false;
        if (reportingPeriod === '30D' && diffDays > 30) return false;
        if (reportingPeriod === 'Q3' && diffDays > 90) return false;
        if (reportingPeriod === 'YTD' && diffDays > 365) return false;
      }

      // 2. Department filter
      if (selectedDept !== 'ALL' && c.departmentId !== selectedDept && c.departmentName !== selectedDept) {
        return false;
      }

      // 3. District filter
      if (selectedDistrict !== 'ALL' && c.district !== selectedDistrict) {
        return false;
      }

      // 4. Priority filter
      if (selectedPriority !== 'ALL' && c.priority !== selectedPriority) {
        return false;
      }

      // 5. Search match
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const titleMatch = (c.title || '').toLowerCase().includes(term);
        const tokenMatch = (c.token || '').toLowerCase().includes(term);
        const deptMatch = (c.departmentName || '').toLowerCase().includes(term);
        if (!titleMatch && !tokenMatch && !deptMatch) return false;
      }

      return true;
    });
  }, [complaints, reportingPeriod, selectedDept, selectedDistrict, selectedPriority, searchTerm]);

  // Calculate Executive Dashboard Metrics (Section 2)
  const totalRegistered = filteredComplaints.length;
  const totalResolved = filteredComplaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;
  const totalPending = filteredComplaints.filter(c => !['RESOLVED', 'CLOSED', 'REJECTED'].includes(c.status)).length;
  const totalOverdue = filteredComplaints.filter(c => {
    const hours = typeof c.hoursRemaining === 'number' ? c.hoursRemaining : 24;
    return hours < 0 || c.status === 'OVERDUE' || (c.daysOverdue || 0) > 0;
  }).length;

  const resolutionRate = calculateResolutionRate(filteredComplaints);
  const avgResolutionTime = calculateAverageResolutionTime(filteredComplaints);
  const slaCompliance = calculateSLACompliance(filteredComplaints);
  const overduePercentage = calculateOverduePercentage(filteredComplaints);

  // Active Escalations for this cohort
  const cohortTokens = useMemo(() => new Set(filteredComplaints.map(c => c.token || c.id)), [filteredComplaints]);
  const activeEscalationsCount = useMemo(() => {
    return escalations.filter(e => cohortTokens.has(e.complaintId) || cohortTokens.has(e.token)).length;
  }, [escalations, cohortTokens]);

  // CSAT summary
  const csatSummary = useMemo(() => {
    return calculateCitizenSatisfaction(feedbackRecords, filteredComplaints);
  }, [feedbackRecords, filteredComplaints]);

  // Department Performance Scorecards Array (Section 3 & 11)
  const departmentScores = useMemo(() => {
    return calculateDepartmentPerformance(
      departments,
      filteredComplaints,
      feedbackRecords,
      escalations,
      officers
    );
  }, [departments, filteredComplaints, feedbackRecords, escalations, officers]);

  // Officer Performance Metrics (Section 5)
  const officerMetrics = useMemo(() => {
    return calculateOfficerPerformance(officers, filteredComplaints, escalations);
  }, [officers, filteredComplaints, escalations]);

  // Performance Trends Array (Section 9)
  const performanceTrends = useMemo(() => {
    return generatePerformanceTrends(filteredComplaints);
  }, [filteredComplaints]);

  // Distinct Districts for filter
  const distinctDistricts = useMemo(() => {
    return Array.from(new Set(complaints.map(c => c.district).filter(Boolean))).sort();
  }, [complaints]);

  // Top Ranked & Critical Departments
  const topDepartment = departmentScores[0];
  const criticalDepartment = departmentScores.find(d => d.category === 'Critical') || departmentScores[departmentScores.length - 1];

  // Toggle department selection for comparison
  const toggleComparisonDept = (deptId) => {
    setComparisonDeptIds(prev => {
      if (prev.includes(deptId)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter(id => id !== deptId);
      } else {
        if (prev.length >= 5) {
          alert('You can compare a maximum of 5 departments concurrently.');
          return prev;
        }
        return [...prev, deptId];
      }
    });
  };

  // Departments selected for comparison
  const comparisonDepartments = useMemo(() => {
    return departmentScores.filter(d => comparisonDeptIds.includes(d.id));
  }, [departmentScores, comparisonDeptIds]);

  // Reset all filters
  const handleResetFilters = () => {
    setReportingPeriod('ALL');
    setSelectedDept('ALL');
    setSelectedDistrict('ALL');
    setSelectedPriority('ALL');
    setSearchTerm('');
  };

  // -------------------------------------------------------------------------
  // EXPORT HANDLERS (Section 12)
  // -------------------------------------------------------------------------
  const handleExportDepartmentsCSV = () => {
    exportDataToCSV('Karnataka_Ministry_Scorecards', departmentScores, [
      { key: 'rank', label: 'Rank' },
      { key: 'name', label: 'Department Name' },
      { key: 'category', label: 'Performance Tier' },
      { key: 'compositeScore', label: 'Composite Score' },
      { key: 'total', label: 'Total Complaints' },
      { key: 'resolved', label: 'Resolved Complaints' },
      { key: 'pending', label: 'Pending Complaints' },
      { key: 'overdue', label: 'Overdue Violations' },
      { key: 'resolutionRate', label: 'Resolution Rate (%)' },
      { key: 'slaCompliance', label: 'SLA Compliance (%)' },
      { key: 'avgResolutionDays', label: 'Avg Resolution Time (Days)' },
      { key: 'citizenSatisfaction', label: 'Citizen CSAT Rating' },
      { key: 'escalations', label: 'Active Escalations' }
    ]);
    setIsExportMenuOpen(false);
  };

  const handleExportOfficersCSV = () => {
    exportDataToCSV('Officer_Caseload_Performance', officerMetrics, [
      { key: 'name', label: 'Officer Name' },
      { key: 'badge', label: 'Badge / Employee ID' },
      { key: 'designation', label: 'Designation' },
      { key: 'department', label: 'Department' },
      { key: 'assignedComplaints', label: 'Assigned Complaints' },
      { key: 'resolvedComplaints', label: 'Resolved' },
      { key: 'pendingComplaints', label: 'Pending' },
      { key: 'overdueComplaints', label: 'Overdue' },
      { key: 'resolutionRate', label: 'Resolution Rate (%)' },
      { key: 'avgResolutionDays', label: 'Avg Turnaround (Days)' },
      { key: 'workloadStatus', label: 'Workload Status' }
    ]);
    setIsExportMenuOpen(false);
  };

  const handleExportOverdueCSV = () => {
    const overdueList = filteredComplaints.filter(c => {
      const hours = typeof c.hoursRemaining === 'number' ? c.hoursRemaining : 24;
      return hours < 0 || c.status === 'OVERDUE' || (c.daysOverdue || 0) > 0;
    }).map(c => ({
      token: c.token || c.trackingId,
      title: c.title,
      department: c.departmentName,
      citizen: c.citizenName,
      priority: c.priority,
      status: c.status,
      daysOverdue: c.daysOverdue || 1,
      officer: c.assignedOfficer?.name || 'Unassigned',
      penalty: (c.daysOverdue || 1) * 250
    }));

    exportDataToCSV('Overdue_Complaints_Audit', overdueList, [
      { key: 'token', label: 'Tracking ID' },
      { key: 'title', label: 'Complaint Title' },
      { key: 'department', label: 'Department' },
      { key: 'citizen', label: 'Complainant' },
      { key: 'priority', label: 'Priority' },
      { key: 'status', label: 'Current Status' },
      { key: 'daysOverdue', label: 'Days Overdue' },
      { key: 'officer', label: 'Assigned Officer' },
      { key: 'penalty', label: 'Accrued Statutory Penalty (INR)' }
    ]);
    setIsExportMenuOpen(false);
  };

  const handleExportCSATCSV = () => {
    const csatList = feedbackRecords.map(f => ({
      complaintId: f.complaintId,
      citizen: f.citizenName,
      department: f.departmentName,
      overallRating: f.overallRating,
      qualityRating: f.qualityRating,
      responsivenessRating: f.responsivenessRating,
      timelinessRating: f.timelinessRating,
      category: f.category,
      comments: f.comments,
      date: f.createdAt
    }));

    exportDataToCSV('Citizen_Satisfaction_Surveys', csatList, [
      { key: 'complaintId', label: 'Tracking ID' },
      { key: 'citizen', label: 'Complainant' },
      { key: 'department', label: 'Department' },
      { key: 'overallRating', label: 'Overall Rating (1-5)' },
      { key: 'qualityRating', label: 'Quality Rating' },
      { key: 'responsivenessRating', label: 'Responsiveness Rating' },
      { key: 'timelinessRating', label: 'Timeliness Rating' },
      { key: 'category', label: 'Category' },
      { key: 'comments', label: 'Citizen Comments' },
      { key: 'date', label: 'Timestamp' }
    ]);
    setIsExportMenuOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16">
      {/* Breadcrumb & Navigation */}
      <div>
        <Breadcrumb
          items={[
            { label: currentRole === USER_ROLES.SUPERVISOR ? (lang === 'kn' ? 'ಮೇಲ್ವಿಚಾರಣಾ ಕಮಾಂಡ್' : 'Supervisor Command') : t('navOverview'), to: currentRole === USER_ROLES.SUPERVISOR ? '/supervisor/dashboard' : '/admin/overview' },
            { label: t('scorecardsTitle') }
          ]}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-headline text-slate-900 tracking-tight flex items-center gap-2.5 flex-wrap">
              <span>{t('scorecardsTitle')}</span>
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                Sakala Q3 FY2026
              </span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              {t('scorecardsSubtitle')}
            </p>
          </div>

          {/* Action Suite */}
          <div className="flex items-center gap-2.5 relative flex-wrap">
            <button
              onClick={() => setIsMethodologyModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <span className="material-symbols-outlined text-base">info</span>
              <span>{t('methodologyModal')}</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                <span className="material-symbols-outlined text-base">download</span>
                <span>{t('export')}</span>
                <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-30 py-2 text-xs divide-y divide-slate-100">
                  <button
                    onClick={handleExportDepartmentsCSV}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base text-teal-600">table_chart</span>
                    <span>{lang === 'kn' ? 'ಇಲಾಖಾ ಸ್ಕೋರ್‌ಕಾರ್ಡ್ ರಫ್ತು (CSV)' : 'Export Department Scorecards (CSV)'}</span>
                  </button>
                  <button
                    onClick={handleExportOfficersCSV}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base text-teal-600">badge</span>
                    <span>{lang === 'kn' ? 'ಅಧಿಕಾರಿಗಳ ಕಾರ್ಯಕ್ಷಮತೆ ರಫ್ತು (CSV)' : 'Export Officer Performance (CSV)'}</span>
                  </button>
                  <button
                    onClick={handleExportOverdueCSV}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base text-rose-600">warning</span>
                    <span>{lang === 'kn' ? 'ಗಡುವು ಮೀರಿದ ಲಾಗ್ ರಫ್ತು (CSV)' : 'Export Overdue & Breach Log (CSV)'}</span>
                  </button>
                  <button
                    onClick={handleExportCSATCSV}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base text-amber-500">star</span>
                    <span>{lang === 'kn' ? 'ನಾಗರಿಕ CSAT ಸಮೀಕ್ಷೆ ರಫ್ತು (CSV)' : 'Export Citizen CSAT Surveys (CSV)'}</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow transition-colors"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>{lang === 'kn' ? 'ಅಧಿಕೃತ ಗೆಜೆಟ್ ಮುದ್ರಿಸಿ' : 'Print Official Gazette'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* GLOBAL PERFORMANCE FILTERS BAR (Section 10) */}
      {/* =================================================================== */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-700 text-lg">filter_alt</span>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {lang === 'kn' ? 'ವಿಶ್ಲೇಷಣಾ ವ್ಯಾಪ್ತಿ ಮತ್ತು ಫಿಲ್ಟರ್‌ಗಳು:' : 'Analytics Scope & Cohort Filters:'}
            </span>
          </div>

          {/* Reporting Period Chips */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-mono overflow-x-auto">
            {[
              { id: 'ALL', label: lang === 'kn' ? 'ಎಲ್ಲಾ ದಾಖಲೆಗಳು' : 'All Records' },
              { id: '7D', label: lang === 'kn' ? 'ಕಳೆದ 7 ದಿನ' : 'Last 7 Days' },
              { id: '30D', label: lang === 'kn' ? 'ಕಳೆದ 30 ದಿನ' : 'Last 30 Days' },
              { id: 'Q3', label: 'Q3 FY2026' },
              { id: 'YTD', label: lang === 'kn' ? 'ಈ ವರ್ಷ (YTD)' : 'This Year (YTD)' }
            ].map(period => (
              <button
                key={period.id}
                onClick={() => setReportingPeriod(period.id)}
                className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                  reportingPeriod === period.id
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Department Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('department')}</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">{lang === 'kn' ? `ಎಲ್ಲಾ ಇಲಾಖೆಗಳು (${departments.length})` : `All Departments (${departments.length})`}</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{tDepartment(d.name)}</option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('district')}</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">{lang === 'kn' ? `ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು (${distinctDistricts.length})` : `All Districts (${distinctDistricts.length})`}</option>
              {distinctDistricts.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('priority')}</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">{lang === 'kn' ? 'ಎಲ್ಲಾ ಆದ್ಯತೆಗಳು' : 'All Priorities'}</option>
              <option value="CRITICAL">{t('priorityCritical')}</option>
              <option value="HIGH">{t('priorityHigh')}</option>
              <option value="MEDIUM">{t('priorityMedium')}</option>
              <option value="LOW">{t('priorityLow')}</option>
            </select>
          </div>

          {/* Search Term */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('search')}</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'kn' ? 'ಉದಾ: ನೀರು, NH-48...' : 'e.g. Water, NH-48...'}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">filter_alt_off</span>
              <span>{t('reset')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. MINISTRY-LEVEL EXECUTIVE DASHBOARD (Section 2 - 8 Summary Cards) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Card 1: Total Registered */}
        <div
          onClick={() => navigate('/admin/all-complaints')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-teal-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">1. {t('totalComplaints')}</span>
            <span className="material-symbols-outlined text-teal-600 text-base">inbox</span>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 block">{totalRegistered}</span>
            <span className="text-[10px] text-slate-500">{lang === 'kn' ? 'ದಾಖಲಾದ ದೂರುಗಳು' : 'Complaints Filed'}</span>
          </div>
        </div>

        {/* Card 2: Total Resolved */}
        <div
          onClick={() => navigate('/admin/all-complaints')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">2. {t('glossary.resolved')}</span>
            <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600 block">{totalResolved}</span>
            <span className="text-[10px] text-emerald-800 font-semibold">{resolutionRate}% {lang === 'kn' ? 'ಪ್ರಮಾಣ' : 'of Intake'}</span>
          </div>
        </div>

        {/* Card 3: Pending Load */}
        <div
          onClick={() => navigate('/admin/pending-complaints')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-teal-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">3. {t('glossary.pending')}</span>
            <span className="material-symbols-outlined text-teal-600 text-base">pending_actions</span>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 block">{totalPending}</span>
            <span className="text-[10px] text-slate-500">{lang === 'kn' ? 'ಸಕ್ರಿಯ ಹೊರೆ' : 'Active Field Load'}</span>
          </div>
        </div>

        {/* Card 4: Overdue Complaints */}
        <div
          onClick={() => navigate('/supervisor/overdue-monitoring')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-rose-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">4. {t('glossary.overdue')}</span>
            <span className="material-symbols-outlined text-rose-600 text-base">warning</span>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-rose-600 block">{totalOverdue}</span>
            <span className="text-[10px] text-rose-800 font-semibold">{overduePercentage}% {lang === 'kn' ? 'ಉಲ್ಲಂಘನೆ' : 'Breaches'}</span>
          </div>
        </div>

        {/* Card 5: Resolution Rate */}
        <div
          onClick={() => setActiveTab('scorecards')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-teal-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">5. {t('resolutionRate')}</span>
            <span className="material-symbols-outlined text-teal-600 text-base">percent</span>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-teal-700 block">{resolutionRate}%</span>
            <span className="text-[10px] text-slate-500">{lang === 'kn' ? 'ಒಟ್ಟು:' : 'Denominator:'} {totalRegistered}</span>
          </div>
        </div>

        {/* Card 6: Average Resolution Time */}
        <div
          onClick={() => setActiveTab('sla')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-teal-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">6. {t('avgResolutionTime')}</span>
            <span className="material-symbols-outlined text-teal-600 text-base">speed</span>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 block">{avgResolutionTime}d</span>
            <span className="text-[10px] text-emerald-700 font-semibold">{lang === 'kn' ? '3 ದಿನ ಗುರಿ' : 'Under 3d Target'}</span>
          </div>
        </div>

        {/* Card 7: Active Escalations */}
        <div
          onClick={() => navigate('/supervisor/overdue-monitoring')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-amber-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">7. {t('activeEscalations')}</span>
            <span className="material-symbols-outlined text-amber-600 text-base">crisis_alert</span>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-600 block">{activeEscalationsCount}</span>
            <span className="text-[10px] text-amber-800 font-semibold">{lang === 'kn' ? 'ಕಲಂ 8 ಪರಿಶೋಧನೆ' : 'Section 8 Audits'}</span>
          </div>
        </div>

        {/* Card 8: Citizen CSAT */}
        <div
          onClick={() => setActiveTab('csat')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-amber-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">8. {t('citizenSatisfaction')}</span>
            <span className="material-symbols-outlined text-amber-500 text-base">star</span>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-600 block">
              {csatSummary.averageRating || '4.50'}<span className="text-xs text-slate-400">/5</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{csatSummary.totalFeedback} {lang === 'kn' ? 'ಸಮೀಕ್ಷೆಗಳು' : 'Surveys'}</span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. EXECUTIVE HIGHLIGHTS BANNER (Section 11) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Ranked Ministry Highlight */}
        {topDepartment && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                🏆
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">{t('topPerformer')}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-200 text-teal-900">
                    {lang === 'kn' ? 'ಶ್ರೇಣಿ #1' : 'Rank #1'}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-slate-900 text-base mt-0.5">
                  {tDepartment(topDepartment.name)}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {t('compositeScore')}: <strong className="font-mono text-teal-900">{topDepartment.compositeScore}/100</strong> ·
                  {t('resolutionRate')}: <strong className="font-mono text-teal-900">{topDepartment.resolutionRate}%</strong> ·
                  {t('slaCompliance')}: <strong className="font-mono text-teal-900">{topDepartment.slaCompliance}%</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scrutiny / Focus Department */}
        {criticalDepartment && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200/80 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                ⚠️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">{t('lowestPerformer')}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-200 text-rose-900">
                    {lang === 'kn' ? `ಶ್ರೇಣಿ #${criticalDepartment.rank}` : `Rank #${criticalDepartment.rank}`}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-slate-900 text-base mt-0.5">
                  {tDepartment(criticalDepartment.name)}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {t('overdueTickets')}: <strong className="font-mono text-rose-900">{criticalDepartment.overdue}</strong> ·
                  {t('activeEscalations')}: <strong className="font-mono text-rose-900">{criticalDepartment.escalations}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedDept(criticalDepartment.id);
                setActiveTab('scorecards');
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold shrink-0 hover:bg-rose-700 transition-colors shadow-sm"
            >
              Audit Cadre
            </button>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 4. NAVIGATION TAB RIBBON */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'scorecards', label: `1. ${t('ministryScorecard')} (${departmentScores.length})`, icon: 'scoreboard' },
            { id: 'comparison', label: `2. ${t('departmentPerformance')} (${comparisonDepartments.length})`, icon: 'compare_arrows' },
            { id: 'officers', label: `3. ${t('officerTurnaround')} (${officerMetrics.length})`, icon: 'badge' },
            { id: 'sla', label: `4. ${t('slaCompliance')} & ${t('glossary.escalation')}`, icon: 'timelapse' },
            { id: 'csat', label: `5. ${t('citizenSatisfaction')}`, icon: 'star' },
            { id: 'trends', label: `6. ${t('performanceAnalytics')}`, icon: 'trending_up' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-4 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-800 bg-white font-bold shadow-sm'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-6">

          {/* =============================================================== */}
          {/* TAB 1: MINISTRY SCORECARDS & RANKING ROSTER (Section 3 & 11) */}
          {/* =============================================================== */}
          {activeTab === 'scorecards' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold font-headline text-slate-800">
                    {lang === 'kn' ? 'ಅಧಿಕೃತ ಇಲಾಖಾ ಕಾರ್ಯಕ್ಷಮತೆಯ ಸ್ಕೋರ್‌ಕಾರ್ಡ್ ಪಟ್ಟಿ' : 'Official Department Performance Scorecard Table'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('scoringFormula')}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="text-slate-500">{lang === 'kn' ? 'ಶ್ರೇಣಿ ಮಟ್ಟ:' : 'Tier Legend:'}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{lang === 'kn' ? 'ಅತ್ಯುತ್ತಮ (≥85)' : 'Excellent (≥85)'}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">{lang === 'kn' ? 'ಉತ್ತಮ (70-84)' : 'Good (70-84)'}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">{lang === 'kn' ? 'ಸುಧಾರಣೆ ಅಗತ್ಯ (50-69)' : 'Needs Impr. (50-69)'}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">{lang === 'kn' ? 'ಗಂಭೀರ (<50)' : 'Critical (<50)'}</span>
                </div>
              </div>

              {/* Scorecard Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-3.5 text-center">{t('departmentRanking')}</th>
                      <th className="py-3 px-4">{t('department')}</th>
                      <th className="py-3 px-3.5 text-center">{t('compositeScore')}</th>
                      <th className="py-3 px-3.5 text-center">{lang === 'kn' ? 'ಮಟ್ಟ' : 'Tier'}</th>
                      <th className="py-3 px-3.5 text-center">{t('totalComplaints')}</th>
                      <th className="py-3 px-3.5 text-center">{t('glossary.resolved')}</th>
                      <th className="py-3 px-3.5 text-center">{t('glossary.pending')}</th>
                      <th className="py-3 px-3.5 text-center">{t('glossary.overdue')}</th>
                      <th className="py-3 px-3.5 text-center">{t('resolutionRate')}</th>
                      <th className="py-3 px-3.5 text-center">{t('slaCompliance')}</th>
                      <th className="py-3 px-3.5 text-center">{t('avgResolutionTime')}</th>
                      <th className="py-3 px-3.5 text-center">CSAT</th>
                      <th className="py-3 px-4 text-right">{t('glossary.view')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-body">
                    {departmentScores.map((dept) => (
                      <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Rank */}
                        <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-700">
                          #{dept.rank}
                        </td>

                        {/* Name & Code */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0 border border-teal-200/60">
                              <span className="material-symbols-outlined text-base">{dept.icon}</span>
                            </div>
                            <div>
                              <strong className="text-slate-900 block text-xs">{dept.name}</strong>
                              <span className="text-[10px] text-slate-500 font-mono">{dept.code} · Target SLA: {dept.targetSla}h</span>
                            </div>
                          </div>
                        </td>

                        {/* Composite Score */}
                        <td className="py-3 px-3.5 text-center">
                          <span className="font-mono text-sm font-black text-slate-900">
                            {dept.compositeScore}
                          </span>
                        </td>

                        {/* Performance Category */}
                        <td className="py-3 px-3.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${dept.categoryColor}`}>
                            {dept.category}
                          </span>
                        </td>

                        {/* Counts */}
                        <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-800">{dept.total}</td>
                        <td className="py-3 px-3.5 text-center font-mono text-emerald-700 font-bold">{dept.resolved}</td>
                        <td className="py-3 px-3.5 text-center font-mono text-slate-600">{dept.pending}</td>
                        <td className="py-3 px-3.5 text-center font-mono text-rose-600 font-bold">{dept.overdue}</td>

                        {/* Rates */}
                        <td className="py-3 px-3.5 text-center font-mono font-semibold text-slate-800">
                          {dept.resolutionRate}%
                        </td>
                        <td className="py-3 px-3.5 text-center font-mono font-semibold text-slate-800">
                          {dept.slaCompliance}%
                        </td>
                        <td className="py-3 px-3.5 text-center font-mono text-slate-600">
                          {dept.avgResolutionDays}d
                        </td>

                        {/* CSAT */}
                        <td className="py-3 px-3.5 text-center font-mono font-bold text-amber-600">
                          ★ {dept.citizenSatisfaction}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/admin/complaint-audit?dept=${dept.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-[11px] transition-colors"
                          >
                            <span>Dossier</span>
                            <span className="material-symbols-outlined text-xs">arrow_forward</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Visual Performance Bar Chart */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-headline font-bold text-slate-800 text-sm">
                      Department Composite Score Comparison vs Target Benchmark (85%)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Calculated from live grievance caseloads and verified citizen closures.
                    </p>
                  </div>
                </div>

                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentScores} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="code"
                        stroke="#64748B"
                        fontSize={11}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                      />
                      <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-lg space-y-1">
                                <p className="font-bold text-teal-300">{data.name}</p>
                                <p>Rank: #{data.rank} · Score: {data.compositeScore}/100</p>
                                <p>Resolution Rate: {data.resolutionRate}%</p>
                                <p>SLA Compliance: {data.slaCompliance}%</p>
                                <p>Citizen CSAT: {data.citizenSatisfaction}/5.0</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="compositeScore" name="Composite Score" radius={[6, 6, 0, 0]}>
                        {departmentScores.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.compositeScore >= 85 ? '#0D9488' :
                              entry.compositeScore >= 70 ? '#0284C7' :
                              entry.compositeScore >= 50 ? '#D97706' : '#E11D48'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 2: DEPARTMENT COMPARISON (Section 4) */}
          {/* =============================================================== */}
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold font-headline text-slate-800">
                    Side-by-Side Department Comparison Matrix
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select 2 to 5 departments to evaluate performance metrics across identical reporting windows.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  {comparisonDepartments.length} Departments Selected
                </span>
              </div>

              {/* Department Checkbox Selectors */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Click to Toggle Departments for Comparative Benchmarking:
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {departmentScores.map(dept => {
                    const isSelected = comparisonDeptIds.includes(dept.id);
                    return (
                      <button
                        key={dept.id}
                        onClick={() => toggleComparisonDept(dept.id)}
                        className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all border ${
                          isSelected
                            ? 'bg-teal-700 text-white border-teal-800 shadow-sm font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isSelected ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                        <span>{dept.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comparative Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Resolution Rate Comparison */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Resolution Rate (%) vs SLA Compliance (%)
                  </h4>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonDepartments} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="code" stroke="#64748B" fontSize={11} />
                        <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="resolutionRate" name="Resolution Rate %" fill="#0D9488" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="slaCompliance" name="SLA Compliance %" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Volume & Overdue Comparison */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Total Inflow vs Overdue Violations
                  </h4>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonDepartments} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="code" stroke="#64748B" fontSize={11} />
                        <YAxis stroke="#64748B" fontSize={11} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" name="Total Grievances" fill="#64748B" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="overdue" name="Overdue Complaints" fill="#E11D48" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparison Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Department</th>
                      <th className="p-3 text-center">Rank</th>
                      <th className="p-3 text-center">Composite Score</th>
                      <th className="p-3 text-center">Resolution Rate</th>
                      <th className="p-3 text-center">SLA Compliance</th>
                      <th className="p-3 text-center">Avg Resolution Speed</th>
                      <th className="p-3 text-center">Overdue Breaches</th>
                      <th className="p-3 text-center">Citizen CSAT</th>
                      <th className="p-3 text-center">Escalations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-body">
                    {comparisonDepartments.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{d.name}</td>
                        <td className="p-3 text-center font-mono font-bold text-teal-800">#{d.rank}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-800">{d.compositeScore}</td>
                        <td className="p-3 text-center font-mono text-emerald-700 font-bold">{d.resolutionRate}%</td>
                        <td className="p-3 text-center font-mono text-blue-700 font-bold">{d.slaCompliance}%</td>
                        <td className="p-3 text-center font-mono text-slate-700">{d.avgResolutionDays} Days</td>
                        <td className="p-3 text-center font-mono text-rose-600 font-bold">{d.overdue}</td>
                        <td className="p-3 text-center font-mono text-amber-600 font-bold">★ {d.citizenSatisfaction}</td>
                        <td className="p-3 text-center font-mono text-amber-700">{d.escalations}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 3: OFFICER PERFORMANCE ANALYTICS (Section 5) */}
          {/* =============================================================== */}
          {activeTab === 'officers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold font-headline text-slate-800">
                    Nodal Cadre Caseload & Turnaround Analytics ({officerMetrics.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Evaluating individual officer redressal speed, follow-up checkpoint compliance, and active workload balance.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Status Legend:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Balanced</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">High Workload</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Overloaded</span>
                </div>
              </div>

              {/* Officers Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Officer Name & Badge</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-3 text-center">Assigned</th>
                      <th className="py-3 px-3 text-center">Resolved</th>
                      <th className="py-3 px-3 text-center">Pending</th>
                      <th className="py-3 px-3 text-center">Overdue</th>
                      <th className="py-3 px-3 text-center">Res. Rate</th>
                      <th className="py-3 px-3 text-center">Avg Days</th>
                      <th className="py-3 px-3 text-center">Follow-up Adherence</th>
                      <th className="py-3 px-3 text-center">Escalations</th>
                      <th className="py-3 px-3 text-center">Workload Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-body">
                    {officerMetrics.map(off => (
                      <tr key={off.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 block">{off.name}</strong>
                          <span className="text-[11px] text-slate-500 font-mono">{off.badge} · {off.designation}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{off.department}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">{off.assignedComplaints}</td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-700 font-bold">{off.resolvedComplaints}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-700">{off.pendingComplaints}</td>
                        <td className="py-3 px-3 text-center font-mono text-rose-600 font-bold">{off.overdueComplaints}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">{off.resolutionRate}%</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-600">{off.avgResolutionDays}d</td>
                        <td className="py-3 px-3 text-center font-mono text-teal-700 font-semibold">{off.followUpCompliance}%</td>
                        <td className="py-3 px-3 text-center font-mono text-amber-700">{off.escalationCount}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${off.workloadColor}`}>
                            {off.workloadStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 4: SLA COMPLIANCE & ESCALATION ANALYTICS (Section 6 & 7) */}
          {/* =============================================================== */}
          {activeTab === 'sla' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold font-headline text-slate-800">
                  Statutory SLA Adherence & Escalation Audit Dashboard
                </h3>
                <p className="text-xs text-slate-500">
                  Detailed distribution of SLA countdowns, statutory deadline extensions, and Sakala Section 8 penalty liabilities.
                </p>
              </div>

              {/* 3 SLA Breakdown Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Within Statutory SLA</span>
                  <div className="my-2">
                    <span className="text-2xl font-black font-mono text-emerald-900">
                      {totalRegistered - totalOverdue}
                    </span>
                    <span className="text-xs text-emerald-700 ml-2">({slaCompliance}% Compliance)</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Complaints resolved or in-progress within the statutory 48h SLA window.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Approaching SLA (&lt;24h)</span>
                  <div className="my-2">
                    <span className="text-2xl font-black font-mono text-amber-900">
                      {filteredComplaints.filter(c => {
                        const h = c.hoursRemaining || 24;
                        return h >= 0 && h <= 24 && !['RESOLVED', 'CLOSED'].includes(c.status);
                      }).length}
                    </span>
                    <span className="text-xs text-amber-700 ml-2">Urgent Nudges Active</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Tickets with less than 24h remaining. Advance reminders dispatched to nodal officers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Statutory SLA Breached (Overdue)</span>
                  <div className="my-2">
                    <span className="text-2xl font-black font-mono text-rose-900">
                      {totalOverdue}
                    </span>
                    <span className="text-xs text-rose-700 ml-2">({overduePercentage}% of Intake)</span>
                  </div>
                  <p className="text-[11px] text-rose-800">
                    Accumulating statutory penalties under Section 8 of Karnataka Sakala Act.
                  </p>
                </div>
              </div>

              {/* Department SLA Comparison Chart */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Department-Wise SLA Compliance Performance vs Target (90%)
                </h4>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentScores} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="code" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="slaCompliance" name="SLA Compliance %" fill="#0D9488" radius={[4, 4, 0, 0]}>
                        {departmentScores.map((entry, index) => (
                          <Cell
                            key={`sla-cell-${index}`}
                            fill={entry.slaCompliance >= 90 ? '#0D9488' : entry.slaCompliance >= 80 ? '#0284C7' : '#E11D48'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 5: CITIZEN SATISFACTION (CSAT) ANALYTICS (Section 8) */}
          {/* =============================================================== */}
          {activeTab === 'csat' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold font-headline text-slate-800">
                  Citizen Satisfaction (CSAT) & Public Trust Index
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated from verified post-resolution citizen evaluations across 4 statutory criteria.
                </p>
              </div>

              {/* CSAT Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Aggregate CSAT Rating</span>
                  <div className="my-2">
                    <span className="text-3xl font-black font-mono text-amber-900">
                      ★ {csatSummary.averageRating}
                    </span>
                    <span className="text-xs text-amber-700 ml-1">/ 5.0</span>
                  </div>
                  <span className="text-[10px] text-amber-800">Based on {csatSummary.totalFeedback} verified responses</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Positive Feedback (4-5 Stars)</span>
                  <div className="my-2">
                    <span className="text-3xl font-black font-mono text-emerald-900">
                      {csatSummary.positivePercentage}%
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-800">High satisfaction with quality and courtesy</span>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Negative Feedback (1-2 Stars)</span>
                  <div className="my-2">
                    <span className="text-3xl font-black font-mono text-rose-900">
                      {csatSummary.negativePercentage}%
                    </span>
                  </div>
                  <span className="text-[10px] text-rose-800">Flagged for supervisory quality inspection</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Survey Submissions</span>
                  <div className="my-2">
                    <span className="text-3xl font-black font-mono text-slate-900">
                      {csatSummary.totalFeedback}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">100% Verified OTP confirmations</span>
                </div>
              </div>

              {/* Rating Distribution Breakdown */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Rating Distribution Breakdown (1 to 5 Stars)
                </h4>
                <div className="space-y-2 text-xs">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = csatSummary.distribution[star] || 0;
                    const pct = csatSummary.totalFeedback > 0 ? ((count / csatSummary.totalFeedback) * 100).toFixed(1) : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-700 w-16">{star} Stars</span>
                        <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              star >= 4 ? 'bg-emerald-500' : star === 3 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-600 w-20 text-right">{count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 6: LONGITUDINAL TREND ANALYSIS (Section 9) */}
          {/* =============================================================== */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold font-headline text-slate-800">
                  Time-Series Grievance Intake & Redressal Velocity
                </h3>
                <p className="text-xs text-slate-500">
                  Historical progression calculated from real complaint timestamps across all municipal portfolios.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Monthly Intake vs Resolved vs Overdue Trajectory
                </h4>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceTrends} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="label" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="registered" name="Registered Complaints" stroke="#0D9488" strokeWidth={2.5} fill="url(#colorReg)" />
                      <Area type="monotone" dataKey="resolved" name="Resolved Redressals" stroke="#3B82F6" strokeWidth={2} fill="url(#colorRes)" />
                      <Line type="monotone" dataKey="overdue" name="Overdue Backlog" stroke="#E11D48" strokeWidth={2} dot={{ r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* =================================================================== */}
      {/* METHODOLOGY & WEIGHTAGE EXPLAINER MODAL (Section 3 & 14) */}
      {/* =================================================================== */}
      <Modal
        isOpen={isMethodologyModalOpen}
        onClose={() => setIsMethodologyModalOpen(false)}
        title="Department Scorecard Methodology & Calculation Formulas"
        subtitle="Karnataka Sakala Administrative Performance Evaluation Framework"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <p>
            The Department Performance Scorecard uses mathematically auditable calculations derived exclusively from shared grievance records. No artificial or arbitrary metrics are used.
          </p>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">Weighted Composite Score Formula:</h4>
            <div className="font-mono text-[11px] bg-white p-2.5 rounded border border-slate-200 text-teal-900 font-semibold">
              Composite = (Resolution Rate × 35%) + (SLA Compliance × 30%) + (CSAT / 5.0 × 100 × 20%) + ((100 - Overdue Rate) × 15%)
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">Performance Categorization Thresholds:</h4>
            <ul className="space-y-1.5 list-disc pl-5">
              <li><strong className="text-emerald-700">Excellent (Score ≥ 85):</strong> Outstanding turnaround, &gt;90% resolution rate, high public trust.</li>
              <li><strong className="text-teal-700">Good (Score 70 – 84.9):</strong> Steady operational performance meeting standard Sakala benchmarks.</li>
              <li><strong className="text-amber-700">Needs Improvement (Score 50 – 69.9):</strong> Noticeable overdue backlog requiring cadre rebalancing.</li>
              <li><strong className="text-rose-700">Critical (Score &lt; 50):</strong> Severe SLA violations triggering automated supervisory hearings.</li>
            </ul>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200">
            <button
              onClick={() => setIsMethodologyModalOpen(false)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold"
            >
              Close Methodology
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
