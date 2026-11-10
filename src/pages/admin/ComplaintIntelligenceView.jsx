import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { Modal } from '../../components/common/Modal';
import { COMPLAINT_CATEGORIES } from '../../data/complaintCategories';
import {
  recommendDepartment,
  suggestComplaintCategory,
  detectPotentialDuplicates,
  findSimilarComplaints,
  recommendPriority,
  calculateComplaintHealth,
  assessEscalationRisk,
  recommendOfficer
} from '../../utils/intelligenceEngine';

export const ComplaintIntelligenceView = () => {
  const {
    complaints = [],
    departments = [],
    officers = [],
    reminders = [],
    escalations = [],
    intelligenceAlerts = [],
    intelligenceReviews = [],
    relatedComplaintPairs = [],
    markIntelligenceAlertReviewed,
    dismissIntelligenceAlert,
    refreshIntelligenceAlerts,
    markComplaintsRelated,
    recordIntelligenceDecision,
    assignComplaintOfficer,
    reassignOfficer,
    sendComplaintReminder,
    updateComplaintStatus
  } = useComplaints();

  const { lang, t, tDepartment, tCategory, tPriority } = useLanguage();
  const { currentRole, currentUser, USER_ROLES } = useAuth();
  const navigate = useNavigate();

  const isAuthorizedAdminOrSup =
    currentRole === USER_ROLES.ADMIN || currentRole === USER_ROLES.SUPERVISOR;

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('workbench'); // 'workbench' | 'duplicates' | 'risk' | 'alerts' | 'reviews'

  // Selected Ticket or Custom Sandbox Input
  const [selectedToken, setSelectedToken] = useState(complaints[0]?.token || '');
  const [workbenchMode, setWorkbenchMode] = useState('TICKET'); // 'TICKET' | 'SANDBOX'
  const [sandboxInput, setSandboxInput] = useState({
    title: 'Street lights are not working and sparking wire near MG Road',
    description: 'Several street light poles have failed and loose electrical cables are sparking near MG Road junction creating safety risk for commuters.',
    district: 'Bengaluru Urban',
    ward: 'MG Road'
  });

  // Similar Search States
  const [simSearchKeyword, setSimSearchKeyword] = useState('');
  const [simCategory, setSimCategory] = useState('ALL');
  const [simDept, setSimDept] = useState('ALL');
  const [simDistrict, setSimDistrict] = useState('ALL');
  const [simLocation, setSimLocation] = useState('');

  // Alert Centre Filters
  const [alertCategoryFilter, setAlertCategoryFilter] = useState('ALL');
  const [alertStatusFilter, setAlertStatusFilter] = useState('ALL');

  // Risk Monitor Filter
  const [riskLevelFilter, setRiskLevelFilter] = useState('ALL');

  // Override Modal State
  const [overrideModal, setOverrideModal] = useState({
    open: false,
    ruleType: '',
    originalRecommendation: '',
    newValue: '',
    reason: ''
  });

  // Alert Detail Modal
  const [inspectedAlert, setInspectedAlert] = useState(null);

  // Dismissed Duplicate Pairs in local UI session
  const [dismissedDupKeys, setDismissedDupKeys] = useState(new Set());

  // Toast Message
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Resolve selected ticket object
  const selectedTicket = useMemo(() => {
    return complaints.find(c => c.token === selectedToken || c.trackingId === selectedToken) || complaints[0] || null;
  }, [complaints, selectedToken]);

  // Target complaint payload for Workbench (either live ticket or custom sandbox text)
  const analysisTarget = useMemo(() => {
    if (workbenchMode === 'SANDBOX') {
      return {
        token: 'DRAFT-EVAL',
        title: sandboxInput.title,
        description: sandboxInput.description,
        district: sandboxInput.district,
        ward: sandboxInput.ward,
        priority: 'MEDIUM',
        status: 'SUBMITTED'
      };
    }
    return selectedTicket || {};
  }, [workbenchMode, sandboxInput, selectedTicket]);

  // Live Intelligence Computations across whole complaint dataset (for Dashboard Cards)
  const fleetMetrics = useMemo(() => {
    let deptRecCount = 0;
    let duplicatePairCount = 0;
    let highPriorityCount = 0;
    let atRiskCount = 0;

    complaints.forEach((c, idx) => {
      const deptRec = recommendDepartment(c, departments);
      if (deptRec.recommendedDepartment) deptRecCount++;

      const prioRec = recommendPriority(c);
      if (['HIGH', 'CRITICAL'].includes(c.priority) || ['HIGH', 'CRITICAL'].includes(prioRec.suggestedPriority)) {
        highPriorityCount++;
      }

      const health = calculateComplaintHealth(c, reminders, escalations);
      const escRisk = assessEscalationRisk(c, officers, reminders);
      if (health.score < 60 || ['HIGH', 'CRITICAL'].includes(escRisk.riskLevel)) {
        atRiskCount++;
      }

      if (idx < 25) {
        const dups = detectPotentialDuplicates(c, complaints, { minScore: 60, maxResults: 1 });
        if (dups.length > 0) duplicatePairCount++;
      }
    });

    const openAlertsCount = intelligenceAlerts.filter(a => a.reviewStatus === 'OPEN').length;

    return {
      totalAnalysed: complaints.length,
      deptRecCount,
      duplicatePairCount,
      highPriorityCount,
      atRiskCount,
      openAlertsCount
    };
  }, [complaints, departments, officers, reminders, escalations, intelligenceAlerts]);

  // Rule Engine Outputs for Active Workbench Target
  const deptRec = useMemo(() => recommendDepartment(analysisTarget, departments), [analysisTarget, departments]);
  const catRec = useMemo(() => suggestComplaintCategory(analysisTarget, COMPLAINT_CATEGORIES), [analysisTarget]);
  const prioRec = useMemo(() => recommendPriority(analysisTarget), [analysisTarget]);
  const healthAnalysis = useMemo(() => calculateComplaintHealth(analysisTarget, reminders, escalations), [analysisTarget, reminders, escalations]);
  const escRiskAnalysis = useMemo(() => assessEscalationRisk(analysisTarget, officers, reminders), [analysisTarget, officers, reminders]);
  const officerRec = useMemo(() => {
    const mergedTarget = {
      ...analysisTarget,
      departmentId: analysisTarget.departmentId || deptRec.recommendedDepartment?.id,
      departmentName: analysisTarget.departmentName || deptRec.recommendedDepartment?.name,
      category: analysisTarget.category || catRec.primaryCategory?.name
    };
    return recommendOfficer(mergedTarget, officers);
  }, [analysisTarget, deptRec, catRec, officers]);
  const duplicateCandidates = useMemo(
    () => detectPotentialDuplicates(analysisTarget, complaints, { minScore: 38, maxResults: 5 }),
    [analysisTarget, complaints]
  );

  // Similar Historical Complaint Search Results
  const similarSearchResults = useMemo(() => {
    return findSimilarComplaints(
      {
        keyword: simSearchKeyword,
        category: simCategory,
        departmentId: simDept,
        district: simDistrict,
        location: simLocation
      },
      complaints
    );
  }, [simSearchKeyword, simCategory, simDept, simDistrict, simLocation, complaints]);

  // Risk Monitor Cohort across all active complaints
  const riskCohort = useMemo(() => {
    return complaints
      .map(c => ({
        complaint: c,
        health: calculateComplaintHealth(c, reminders, escalations),
        risk: assessEscalationRisk(c, officers, reminders)
      }))
      .filter(item => riskLevelFilter === 'ALL' || item.risk.riskLevel === riskLevelFilter)
      .sort((a, b) => a.health.score - b.health.score);
  }, [complaints, reminders, escalations, officers, riskLevelFilter]);

  // Filtered Intelligence Alerts
  const filteredAlerts = useMemo(() => {
    return intelligenceAlerts.filter(a => {
      if (alertCategoryFilter !== 'ALL' && a.alertType !== alertCategoryFilter) return false;
      if (alertStatusFilter !== 'ALL' && a.reviewStatus !== alertStatusFilter) return false;
      return true;
    });
  }, [intelligenceAlerts, alertCategoryFilter, alertStatusFilter]);

  const distinctDistricts = useMemo(() => {
    return Array.from(new Set(complaints.map(c => c.district).filter(Boolean))).sort();
  }, [complaints]);

  // -------------------------------------------------------------------------
  // ADMIN ACTION HANDLERS (Shared State Mutations + Audit)
  // -------------------------------------------------------------------------
  const handleAcceptDepartment = () => {
    if (!isAuthorizedAdminOrSup) {
      showToast(lang === 'kn' ? 'ಕೇವಲ ಆಡಳಿತಾಧಿಕಾರಿ / ಮೇಲ್ವಿಚಾರಕರಿಗೆ ಅನುಮತಿ ಇದೆ.' : 'Only Administrators or Supervisors can apply recommendations.', 'error');
      return;
    }
    if (workbenchMode === 'SANDBOX' || !selectedTicket || !deptRec.recommendedDepartment) return;

    const targetDept = deptRec.recommendedDepartment;
    recordIntelligenceDecision({
      complaintId: selectedTicket.token,
      ruleType: 'DEPARTMENT_RECOMMENDATION',
      originalRecommendation: `${targetDept.name} (Score: ${deptRec.matchingScore})`,
      adminDecision: 'ACCEPTED',
      decisionReason: deptRec.explanation,
      reviewedBy: currentUser?.name || currentRole,
      applyUpdate: {
        departmentId: targetDept.id,
        departmentName: targetDept.name
      }
    });
    showToast(
      lang === 'kn'
        ? `#${selectedTicket.token} ದೂರನ್ನು "${tDepartment(targetDept.name)}" ಇಲಾಖೆಗೆ ಅನ್ವಯಿಸಲಾಗಿದೆ.`
        : `Department "${targetDept.name}" confirmed and applied to #${selectedTicket.token}.`
    );
  };

  const handleAcceptCategory = () => {
    if (!isAuthorizedAdminOrSup) {
      showToast(lang === 'kn' ? 'ಕೇವಲ ಆಡಳಿತಾಧಿಕಾರಿ / ಮೇಲ್ವಿಚಾರಕರಿಗೆ ಅನುಮತಿ ಇದೆ.' : 'Only Administrators or Supervisors can apply suggestions.', 'error');
      return;
    }
    if (workbenchMode === 'SANDBOX' || !selectedTicket || !catRec.primaryCategory) return;

    recordIntelligenceDecision({
      complaintId: selectedTicket.token,
      ruleType: 'CATEGORY_SUGGESTION',
      originalRecommendation: `${catRec.primaryCategory.name} → ${catRec.suggestedSubcategory}`,
      adminDecision: 'ACCEPTED',
      decisionReason: catRec.explanation,
      reviewedBy: currentUser?.name || currentRole,
      applyUpdate: {
        category: catRec.primaryCategory.name,
        subcategory: catRec.suggestedSubcategory
      }
    });
    showToast(
      lang === 'kn'
        ? `#${selectedTicket.token} ವರ್ಗವನ್ನು "${tCategory(catRec.primaryCategory.name)}" ಗೆ ನವೀಕರಿಸಲಾಗಿದೆ.`
        : `Category "${catRec.primaryCategory.name}" applied to #${selectedTicket.token}.`
    );
  };

  const handleConfirmPriority = () => {
    if (!isAuthorizedAdminOrSup) {
      showToast(lang === 'kn' ? 'ಕೇವಲ ಆಡಳಿತಾಧಿಕಾರಿ / ಮೇಲ್ವಿಚಾರಕರಿಗೆ ಅನುಮತಿ ಇದೆ.' : 'Authorization required to update priority.', 'error');
      return;
    }
    if (workbenchMode === 'SANDBOX' || !selectedTicket) return;

    recordIntelligenceDecision({
      complaintId: selectedTicket.token,
      ruleType: 'PRIORITY_RECOMMENDATION',
      originalRecommendation: `${prioRec.suggestedPriority} (${prioRec.reason})`,
      adminDecision: 'ACCEPTED',
      decisionReason: `Confirmed rule-based priority: ${prioRec.reason}`,
      reviewedBy: currentUser?.name || currentRole,
      applyUpdate: {
        priority: prioRec.suggestedPriority
      }
    });
    showToast(
      lang === 'kn'
        ? `#${selectedTicket.token} ಆದ್ಯತೆಯನ್ನು ${prioRec.suggestedPriority} ಗೆ ದೃಢೀಕರಿಸಲಾಗಿದೆ.`
        : `Priority updated to ${prioRec.suggestedPriority} for #${selectedTicket.token}.`
    );
  };

  const handleConfirmOfficerAssignment = (officerObj) => {
    if (!isAuthorizedAdminOrSup) {
      showToast(lang === 'kn' ? 'ಅಧಿಕಾರಿ ನಿಯೋಜಿಸಲು ಆಡಳಿತಾಧಿಕಾರಿ ಹಕ್ಕು ಅಗತ್ಯವಿದೆ.' : 'Admin or Supervisor role required to confirm officer assignment.', 'error');
      return;
    }
    if (workbenchMode === 'SANDBOX' || !selectedTicket || !officerObj) return;

    if (selectedTicket.assignedOfficer || selectedTicket.assignedOfficerId) {
      reassignOfficer(selectedTicket.token, officerObj.id, {
        reason: 'Smart Decision Support Workload-Balanced Recommendation',
        initiatedBy: currentUser?.name || currentRole,
        approvedBy: 'Complaint Intelligence Review Desk',
        notes: officerRec.reason
      });
    } else {
      assignComplaintOfficer(selectedTicket.token, officerObj.id, currentUser?.name || currentRole);
    }

    recordIntelligenceDecision({
      complaintId: selectedTicket.token,
      ruleType: 'OFFICER_RECOMMENDATION',
      originalRecommendation: `${officerObj.name} (${officerObj.activeCaseload || 0}/${officerObj.maxCapacity || 30})`,
      adminDecision: 'ACCEPTED',
      decisionReason: 'Confirmed balanced nodal assignment via Intelligence Workbench.',
      reviewedBy: currentUser?.name || currentRole
    });
    showToast(
      lang === 'kn'
        ? `#${selectedTicket.token} ದೂರನ್ನು ${officerObj.name} ಅವರಿಗೆ ನಿಯೋಜಿಸಲಾಗಿದೆ.`
        : `Assigned #${selectedTicket.token} to ${officerObj.name} and updated workload logs.`
    );
  };

  const handleOpenOverrideModal = (ruleType, originalRecommendation, defaultVal) => {
    setOverrideModal({
      open: true,
      ruleType,
      originalRecommendation,
      newValue: defaultVal,
      reason: ''
    });
  };

  const handleSaveOverride = (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    let applyUpdate = null;
    if (overrideModal.ruleType === 'DEPARTMENT_RECOMMENDATION') {
      const dept = departments.find(d => d.id === overrideModal.newValue);
      if (dept) applyUpdate = { departmentId: dept.id, departmentName: dept.name };
    } else if (overrideModal.ruleType === 'CATEGORY_SUGGESTION') {
      applyUpdate = { category: overrideModal.newValue };
    } else if (overrideModal.ruleType === 'PRIORITY_RECOMMENDATION') {
      applyUpdate = { priority: overrideModal.newValue };
    }

    recordIntelligenceDecision({
      complaintId: selectedTicket.token,
      ruleType: overrideModal.ruleType,
      originalRecommendation: overrideModal.originalRecommendation,
      adminDecision: `OVERRIDDEN → ${overrideModal.newValue}`,
      decisionReason: overrideModal.reason || 'Manual administrative override recorded.',
      reviewedBy: currentUser?.name || currentRole,
      applyUpdate
    });

    setOverrideModal({ open: false, ruleType: '', originalRecommendation: '', newValue: '', reason: '' });
    showToast(lang === 'kn' ? 'ಆಡಳಿತಾಧಿಕಾರಿ ನಿರ್ಧಾರವನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ.' : 'Administrative override applied and logged in audit history.');
  };

  const handleMarkRelatedDuplicate = (dupItem) => {
    if (!isAuthorizedAdminOrSup) {
      showToast(lang === 'kn' ? 'ದೂರುಗಳನ್ನು ಸಂಬಂಧಿಸಲು ಆಡಳಿತಾಧಿಕಾರಿ ಹಕ್ಕು ಅಗತ್ಯವಿದೆ.' : 'Authorization required to link related complaints.', 'error');
      return;
    }
    const res = markComplaintsRelated(
      dupItem.newComplaintId,
      dupItem.similarComplaintId,
      currentUser?.name || currentRole
    );
    if (res.success) {
      showToast(
        lang === 'kn'
          ? `#${dupItem.newComplaintId} ಮತ್ತು #${dupItem.similarComplaintId} ಸಂಬಂಧಿತ ದೂರುಗಳೆಂದು ಗುರುತಿಸಲಾಗಿದೆ.`
          : `Linked #${dupItem.newComplaintId} as related to #${dupItem.similarComplaintId}. Both tracking IDs remain preserved.`
      );
    } else {
      showToast(res.message, 'warning');
    }
  };

  const handleDismissDuplicateCandidate = (dupItem) => {
    const key = `${dupItem.newComplaintId}::${dupItem.similarComplaintId}`;
    setDismissedDupKeys(prev => new Set([...prev, key]));
    showToast(
      lang === 'kn'
        ? `#${dupItem.newComplaintId} ಅನ್ನು ಪ್ರತ್ಯೇಕ ದೂರಾಗಿ ಮುಂದುವರಿಸಲಾಗಿದೆ.`
        : `Continuing #${dupItem.newComplaintId} as a distinct, separate complaint.`
    );
  };

  const getRiskBadgeClass = (risk) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16">
      {/* Toast Banner */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl border flex items-center gap-2.5 text-xs font-semibold animate-in fade-in ${
            toast.type === 'error'
              ? 'bg-rose-900 border-rose-700 text-white'
              : toast.type === 'warning'
              ? 'bg-amber-900 border-amber-700 text-white'
              : 'bg-slate-900 border-slate-700 text-white'
          }`}
        >
          <span className="material-symbols-outlined text-teal-400">
            {toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'task_alt'}
          </span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. HEADER & TRANSPARENCY DISCLAIMER */}
      {/* =================================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <Breadcrumb
          items={[
            { label: t('navOverview'), to: '/admin/overview' },
            { label: t('intelligenceTitle') }
          ]}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">rule_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-headline text-2xl font-extrabold text-slate-900 tracking-tight">
                  {t('intelligenceTitle')}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-mono text-[10px] font-bold uppercase">
                  {lang === 'kn' ? 'ನಿಯಮ-ಆಧಾರಿತ ವಿವರಣೆ' : 'Rule-Based Explainability'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                {t('intelligenceSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                refreshIntelligenceAlerts();
                showToast(lang === 'kn' ? 'ಎಲ್ಲಾ ದೂರುಗಳ ನಿಯಮ ಪರಿಶೀಲನೆ ನವೀಕರಿಸಲಾಗಿದೆ.' : 'Rule engine scan refreshed across shared complaint dataset.');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-teal-700">refresh</span>
              <span>{t('refresh')}</span>
            </button>

            <Link
              to="/admin/heatmap"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-sm">map</span>
              <span>{t('navHeatmap')}</span>
            </Link>
          </div>
        </div>

        {/* Explainability & Human-in-the-loop Notice */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-teal-700 text-lg shrink-0 mt-0.5">info</span>
          <div>
            <strong className="text-slate-900">
              {lang === 'kn' ? 'ಪಾರದರ್ಶಕ ನಿರ್ಧಾರ ಬೆಂಬಲ ಸೂಚನೆ: ' : 'Transparent Rule-Based Decision Support: '}
            </strong>
            <span>{t('intelligenceDisclaimer')}</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. SIX INTELLIGENCE DASHBOARD SUMMARY CARDS (Shared State Driven) */}
        {/* ================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {/* 1. Total Complaints Analysed */}
          <div
            onClick={() => setActiveTab('workbench')}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-500 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase mb-1">
              <span>{t('intelTotalAnalysed')}</span>
              <span className="material-symbols-outlined text-teal-600 text-base">analytics</span>
            </div>
            <div className="font-mono text-2xl font-black text-slate-900">{fleetMetrics.totalAnalysed}</div>
            <div className="text-[10px] text-slate-500 mt-1">
              {lang === 'kn' ? 'ಸಕ್ರಿಯ ನೈಜ ದಾಖಲೆಗಳು' : 'Shared context records'}
            </div>
          </div>

          {/* 2. Department Recommendations Generated */}
          <div
            onClick={() => setActiveTab('workbench')}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-500 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase mb-1">
              <span>{t('intelDeptRecs')}</span>
              <span className="material-symbols-outlined text-teal-600 text-base">domain</span>
            </div>
            <div className="font-mono text-2xl font-black text-teal-700">{fleetMetrics.deptRecCount}</div>
            <div className="text-[10px] text-teal-700 mt-1 font-semibold">
              {lang === 'kn' ? 'ಕೀವರ್ಡ್ ನಿಯಮ ಹೊಂದಾಣಿಕೆ' : 'Keyword rule matches'}
            </div>
          </div>

          {/* 3. Potential Duplicate Complaints */}
          <div
            onClick={() => setActiveTab('duplicates')}
            className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex justify-between items-center text-amber-800 text-xs font-bold uppercase mb-1">
              <span>{t('intelDuplicates')}</span>
              <span className="material-symbols-outlined text-amber-600 text-base">content_copy</span>
            </div>
            <div className="font-mono text-2xl font-black text-amber-800">{fleetMetrics.duplicatePairCount}</div>
            <div className="text-[10px] text-amber-700 mt-1 font-semibold">
              {lang === 'kn' ? 'ಪರಿಶೀಲನೆಗೆ ಸಿದ್ಧ ಜೋಡಿಗಳು' : 'Similarity >= 60%'}
            </div>
          </div>

          {/* 4. High-Priority Complaints */}
          <div
            onClick={() => {
              setRiskLevelFilter('ALL');
              setActiveTab('risk');
            }}
            className="p-4 rounded-xl border border-orange-200 bg-orange-50/40 hover:border-orange-400 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex justify-between items-center text-orange-800 text-xs font-bold uppercase mb-1">
              <span>{t('intelHighPriority')}</span>
              <span className="material-symbols-outlined text-orange-600 text-base">priority_high</span>
            </div>
            <div className="font-mono text-2xl font-black text-orange-800">{fleetMetrics.highPriorityCount}</div>
            <div className="text-[10px] text-orange-700 mt-1 font-semibold">
              {lang === 'kn' ? 'ಹೆಚ್ಚಿನ / ತುರ್ತು ಆದ್ಯತೆ' : 'HIGH & CRITICAL flagged'}
            </div>
          </div>

          {/* 5. At-Risk Complaints */}
          <div
            onClick={() => {
              setRiskLevelFilter('HIGH');
              setActiveTab('risk');
            }}
            className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 hover:border-rose-400 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex justify-between items-center text-rose-800 text-xs font-bold uppercase mb-1">
              <span>{t('intelAtRisk')}</span>
              <span className="material-symbols-outlined text-rose-600 text-base">ecg_heart</span>
            </div>
            <div className="font-mono text-2xl font-black text-rose-700">{fleetMetrics.atRiskCount}</div>
            <div className="text-[10px] text-rose-700 mt-1 font-semibold">
              {lang === 'kn' ? 'ಆರೋಗ್ಯ ಅಂಕ <60 / ಅಪಾಯ' : 'Health < 60 or Escalation Risk'}
            </div>
          </div>

          {/* 6. Active Intelligence Alerts */}
          <div
            onClick={() => setActiveTab('alerts')}
            className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 hover:border-purple-400 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex justify-between items-center text-purple-800 text-xs font-bold uppercase mb-1">
              <span>{t('intelActiveAlerts')}</span>
              <span className="material-symbols-outlined text-purple-600 text-base">notifications_active</span>
            </div>
            <div className="font-mono text-2xl font-black text-purple-800">{fleetMetrics.openAlertsCount}</div>
            <div className="text-[10px] text-purple-700 mt-1 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
              <span>{lang === 'kn' ? 'ಪರಿಶೀಲನೆ ಬಾಕಿ ಇದೆ' : 'Pending admin review'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. MODULE TAB RIBBON */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'workbench', label: t('intelWorkbenchTab'), icon: 'tune' },
            { id: 'duplicates', label: `${t('intelDuplicatesTab')} (${duplicateCandidates.length})`, icon: 'find_in_page' },
            { id: 'risk', label: t('intelRiskHealthTab'), icon: 'health_and_safety' },
            { id: 'alerts', label: `${t('intelAlertsTab')} (${fleetMetrics.openAlertsCount})`, icon: 'crisis_alert' },
            { id: 'reviews', label: `${t('intelReviewHistoryTab')} (${intelligenceReviews.length})`, icon: 'history_edu' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-4 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-800 bg-white font-bold shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* =============================================================== */}
          {/* TAB 1: DECISION SUPPORT WORKBENCH */}
          {/* =============================================================== */}
          {activeTab === 'workbench' && (
            <div className="space-y-6">
              {/* Target Selector & Sandbox Toggle */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWorkbenchMode('TICKET')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      workbenchMode === 'TICKET' ? 'bg-teal-700 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-300'
                    }`}
                  >
                    {lang === 'kn' ? 'ದಾಖಲಾದ ದೂರನ್ನು ವಿಶ್ಲೇಷಿಸಿ' : 'Inspect Registered Complaint'}
                  </button>
                  <button
                    onClick={() => setWorkbenchMode('SANDBOX')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      workbenchMode === 'SANDBOX' ? 'bg-teal-700 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-300'
                    }`}
                  >
                    {lang === 'kn' ? 'ಕಸ್ಟಮ್ ಪಠ್ಯ ಪರೀಕ್ಷಿಸಿ (ಸ್ಯಾಂಡ್‌ಬಾಕ್ಸ್)' : 'Rule Sandbox (Custom Narrative)'}
                  </button>
                </div>

                {workbenchMode === 'TICKET' && (
                  <div className="flex items-center gap-2 flex-1 max-w-xl">
                    <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
                      {t('glossary.trackingId')}:
                    </label>
                    <select
                      value={selectedTicket?.token || ''}
                      onChange={(e) => setSelectedToken(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-teal-800 focus:outline-none focus:border-teal-600"
                    >
                      {complaints.map(c => (
                        <option key={c.token} value={c.token}>
                          #{c.token} — {(c.title || '').substring(0, 50)} ({c.status})
                        </option>
                      ))}
                    </select>
                    {selectedTicket && (
                      <Link
                        to={`/admin/complaints/${selectedTicket.token}`}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold whitespace-nowrap"
                      >
                        {t('glossary.view')}
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Actual Facts Panel vs Sandbox Editor */}
              {workbenchMode === 'SANDBOX' ? (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block">
                    {lang === 'kn' ? 'ನಿಯಮ-ಆಧಾರಿತ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ದೂರಿನ ಪಠ್ಯ ನಮೂದಿಸಿ (English / ಕನ್ನಡ)' : 'Enter Draft Grievance Text for Live Rule Evaluation (English / ಕನ್ನಡ)'}
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={sandboxInput.title}
                        onChange={(e) => setSandboxInput(prev => ({ ...prev, title: e.target.value }))}
                        placeholder={t('complaintTitle')}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:border-teal-600"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={sandboxInput.ward}
                        onChange={(e) => setSandboxInput(prev => ({ ...prev, ward: e.target.value }))}
                        placeholder={t('incidentLocation')}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={sandboxInput.description}
                    onChange={(e) => setSandboxInput(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t('complaintDescription')}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:outline-none focus:border-teal-600"
                  />
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="text-slate-500 font-semibold">{lang === 'kn' ? 'ಮಾದರಿಗಳು:' : 'Sample presets:'}</span>
                    {[
                      { title: 'Street lights are not working in our area', desc: 'Darkness and broken poles on main road', ward: 'Indiranagar' },
                      { title: 'Garbage has not been collected for several days near MG Road', desc: 'Overflowing trash bins creating stench', ward: 'MG Road' },
                      { title: 'Drinking water has not been supplied for three days', desc: 'Contaminated leakage in Ward 14 line', ward: 'Ward 14' },
                      { title: 'ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಬಿದ್ದಿದೆ ಮತ್ತು ನೀರು ನಿಂತಿದೆ', desc: 'ಹೆದ್ದಾರಿಯಲ್ಲಿ ಅಪಘಾತದ ಅಪಾಯವಿದೆ', ward: 'Jayanagar' }
                    ].map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSandboxInput(prev => ({ ...prev, title: preset.title, description: preset.desc, ward: preset.ward }))}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-teal-500 text-slate-700"
                      >
                        {preset.title.substring(0, 34)}...
                      </button>
                    ))}
                  </div>
                </div>
              ) : selectedTicket && (
                /* Actual Complaint Facts Bar */
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono text-[10px] font-bold uppercase border border-teal-500/30">
                        {lang === 'kn' ? 'ನೈಜ ದೂರು ದಾಖಲೆ (ಸತ್ಯಾಂಶ)' : 'ACTUAL COMPLAINT RECORD (FACTS)'}
                      </span>
                      <span className="font-mono font-bold text-sm text-white">#{selectedTicket.token}</span>
                      <StatusBadge status={selectedTicket.status} />
                      <PriorityBadge priority={selectedTicket.priority} />
                    </div>
                    <span className="text-xs font-mono text-slate-300">
                      {selectedTicket.ward}, {selectedTicket.district}
                    </span>
                  </div>
                  <h2 className="font-headline text-lg font-bold text-white">{selectedTicket.title}</h2>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedTicket.description}</p>
                  <div className="flex flex-wrap gap-4 pt-2 text-[11px] font-mono text-slate-300 border-t border-slate-800">
                    <span>{t('department')}: <strong className="text-white">{tDepartment(selectedTicket.departmentName)}</strong></span>
                    <span>{t('complaintCategory')}: <strong className="text-white">{tCategory(selectedTicket.category)}</strong></span>
                    <span>{t('assignedNodalOfficer')}: <strong className="text-teal-300">{selectedTicket.assignedOfficer?.name || (lang === 'kn' ? 'ನಿಯೋಜಿಸಲಾಗಿಲ್ಲ' : 'Unassigned')}</strong></span>
                  </div>
                </div>
              )}

              {/* 4 Core Explainable Rule-Based Decision Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel A: Intelligent Department Recommendation */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-700">account_balance</span>
                        <h3 className="font-headline font-bold text-sm text-slate-900">{t('intelRecommendedDept')}</h3>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-mono text-[11px] font-bold">
                        {t('intelMatchingScore')}: {deptRec.matchingScore}/100
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-200">
                      <p className="font-headline font-bold text-base text-teal-950">
                        {deptRec.recommendedDepartment ? tDepartment(deptRec.recommendedDepartment.name) : '—'}
                      </p>
                      <p className="text-xs text-slate-700 mt-1">
                        {lang === 'kn' ? deptRec.explanationKn : deptRec.explanation}
                      </p>
                    </div>

                    {deptRec.matchedKeywords.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="font-bold text-slate-500">{t('intelMatchingKeywords')}:</span>
                        {deptRec.matchedKeywords.map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-slate-700">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}

                    {deptRec.alternatives.length > 0 && (
                      <div className="text-xs text-slate-600">
                        <span className="font-bold text-slate-500 block mb-1">
                          {lang === 'kn' ? 'ಪರ್ಯಾಯ ಇಲಾಖೆಗಳು:' : 'Alternative Departments:'}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {deptRec.alternatives.map(alt => (
                            <span key={alt.id} className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
                              {tDepartment(alt.name)} ({alt.matchingScore})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {workbenchMode === 'TICKET' && selectedTicket && (
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={handleAcceptDepartment}
                        className="flex-1 py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        <span>{t('intelAcceptRecommendation')}</span>
                      </button>
                      <button
                        onClick={() => handleOpenOverrideModal(
                          'DEPARTMENT_RECOMMENDATION',
                          deptRec.recommendedDepartment?.name,
                          selectedTicket.departmentId || departments[0]?.id
                        )}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200"
                      >
                        {t('intelOverrideDecision')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Panel B: Complaint Category Suggestion */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-700">category</span>
                        <h3 className="font-headline font-bold text-sm text-slate-900">{t('intelSuggestedCategory')}</h3>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                        {catRec.matchingScore}/100
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase text-slate-500">
                          {lang === 'kn' ? 'ಪ್ರಾಥಮಿಕ ವರ್ಗ' : 'Primary Category'}
                        </span>
                        <strong className="text-sm text-slate-900">
                          {catRec.primaryCategory ? (lang === 'kn' ? catRec.primaryCategory.nameKn : catRec.primaryCategory.name) : '—'}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase text-slate-500">
                          {lang === 'kn' ? 'ಉಪ-ವರ್ಗ' : 'Subcategory'}
                        </span>
                        <span className="text-xs font-semibold text-teal-800">{catRec.suggestedSubcategory}</span>
                      </div>
                      {catRec.secondaryCategory && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/70">
                          <span className="text-[11px] font-bold uppercase text-slate-500">
                            {lang === 'kn' ? 'ದ್ವಿತೀಯ ವರ್ಗ' : 'Secondary Option'}
                          </span>
                          <span className="text-xs text-slate-600">
                            {lang === 'kn' ? catRec.secondaryCategory.nameKn : catRec.secondaryCategory.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-600">
                      {lang === 'kn' ? catRec.explanationKn : catRec.explanation}
                    </p>
                  </div>

                  {workbenchMode === 'TICKET' && selectedTicket && (
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={handleAcceptCategory}
                        className="flex-1 py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        <span>{t('intelAcceptRecommendation')}</span>
                      </button>
                      <button
                        onClick={() => handleOpenOverrideModal(
                          'CATEGORY_SUGGESTION',
                          catRec.primaryCategory?.name,
                          selectedTicket.category || COMPLAINT_CATEGORIES[0].name
                        )}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200"
                      >
                        {t('intelOverrideDecision')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Panel C: Priority Recommendation & Health Indicator */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-600">ecg_heart</span>
                        <h3 className="font-headline font-bold text-sm text-slate-900">
                          {t('intelSuggestedPriority')} & {t('avgHealthScore')}
                        </h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${healthAnalysis.badgeClass}`}>
                        {healthAnalysis.score}/100 · {lang === 'kn' ? healthAnalysis.labelKn : healthAnalysis.label}
                      </span>
                    </div>

                    {/* Priority Suggestion Box */}
                    <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">{t('intelSuggestedPriority')}:</span>
                        <PriorityBadge priority={prioRec.suggestedPriority} />
                      </div>
                      <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
                        {(lang === 'kn' ? prioRec.matchedRulesKn : prioRec.matchedRules).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Transparent Health Score Factors */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold uppercase text-slate-500 block">
                        {lang === 'kn' ? 'ಆರೋಗ್ಯ ಅಂಕದ ವಿವರಣೆ (ನಿಯಮ-ಆಧಾರಿತ):' : 'Explainable Health Score Factors:'}
                      </span>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {healthAnalysis.factors.map((f, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                            <span className="text-slate-700">{lang === 'kn' ? f.labelKn : f.label}</span>
                            <span className={`font-mono font-bold ${f.positive ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {f.impact}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {workbenchMode === 'TICKET' && selectedTicket && (
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={handleConfirmPriority}
                        className="flex-1 py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        <span>{t('intelAcceptRecommendation')} ({prioRec.suggestedPriority})</span>
                      </button>
                      <button
                        onClick={() => handleOpenOverrideModal(
                          'PRIORITY_RECOMMENDATION',
                          prioRec.suggestedPriority,
                          selectedTicket.priority || 'MEDIUM'
                        )}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200"
                      >
                        {t('intelOverrideDecision')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Panel D: Officer Recommendation & Escalation Risk */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-teal-700">person_search</span>
                        <h3 className="font-headline font-bold text-sm text-slate-900">{t('intelRecommendedOfficer')}</h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${getRiskBadgeClass(escRiskAnalysis.riskLevel)}`}>
                        {lang === 'kn' ? escRiskAnalysis.labelKn : escRiskAnalysis.label}
                      </span>
                    </div>

                    {/* Top Officer Card */}
                    {officerRec.recommendedOfficer && (
                      <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-200 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-headline font-bold text-sm text-slate-900">
                            {officerRec.recommendedOfficer.name}
                          </p>
                          <p className="text-[11px] text-slate-600">
                            {officerRec.recommendedOfficer.designation} · {tDepartment(officerRec.recommendedOfficer.department)}
                          </p>
                          <p className="text-[11px] text-teal-800 font-medium mt-1">
                            {lang === 'kn' ? officerRec.reasonKn : officerRec.reason}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-lg font-black text-teal-700">{officerRec.suitabilityScore}%</span>
                          <span className="block text-[10px] text-slate-500 font-mono">
                            {officerRec.recommendedOfficer.activeCaseload}/{officerRec.recommendedOfficer.maxCapacity || 30} load
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Comparison of Top Available Officers */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase text-slate-500 block">
                        {lang === 'kn' ? 'ಲಭ್ಯವಿರುವ ಅಧಿಕಾರಿಗಳ ಹೋಲಿಕೆ:' : 'Available Cadre Comparison:'}
                      </span>
                      <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                        {officerRec.comparisonList.slice(0, 3).map(item => (
                          <div key={item.officer.id} className="p-2.5 bg-white flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 block truncate">{item.officer.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {item.officer.availability} · {item.officer.activeCaseload}/{item.officer.maxCapacity || 30} cases
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono font-bold text-teal-700">{item.suitabilityScore}%</span>
                              {workbenchMode === 'TICKET' && selectedTicket && item.isEligible && (
                                <button
                                  onClick={() => handleConfirmOfficerAssignment(item.officer)}
                                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold"
                                >
                                  {t('glossary.assign') || (lang === 'kn' ? 'ನಿಯೋಜಿಸಿ' : 'Assign')}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Escalation Risk Summary */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{lang === 'kn' ? 'ಶಿಫಾರಸು ಕ್ರಮ:' : 'Escalation Mitigation Action:'}</span>
                        <span className="text-teal-800">
                          {lang === 'kn' ? escRiskAnalysis.recommendedActionKn : escRiskAnalysis.recommendedAction}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        {(lang === 'kn' ? escRiskAnalysis.reasonsKn : escRiskAnalysis.reasons).join(' · ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 2: DUPLICATE DETECTION & SIMILAR COMPLAINT SEARCH */}
          {/* =============================================================== */}
          {activeTab === 'duplicates' && (
            <div className="space-y-8">
              {/* Part A: Duplicate Candidates for Active Ticket / Sandbox */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-headline font-bold text-base text-slate-900">
                      {lang === 'kn' ? 'ಸಂಭಾವ್ಯ ನಕಲಿ / ಸಂಬಂಧಿತ ದೂರುಗಳ ಪತ್ತೆ' : 'Potential Duplicate Complaints Detection'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {lang === 'kn'
                        ? 'ವಿಷಯ ಪದಗಳು, ವರ್ಗ, ಇಲಾಖೆ ಮತ್ತು ಸ್ಥಳದ ಆಧಾರದ ಮೇಲೆ ಹೋಲಿಕೆ (ಯಾವುದೇ ದೂರನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ತಿರಸ್ಕರಿಸುವುದಿಲ್ಲ).'
                        : 'Compares normalized keywords, category, department, and ward location. Never automatically rejects or merges separate tracking IDs.'}
                    </p>
                  </div>
                  <select
                    value={selectedTicket?.token || ''}
                    onChange={(e) => {
                      setWorkbenchMode('TICKET');
                      setSelectedToken(e.target.value);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs font-bold text-teal-800"
                  >
                    {complaints.map(c => (
                      <option key={c.token} value={c.token}>
                        #{c.token} — {(c.title || '').substring(0, 36)}...
                      </option>
                    ))}
                  </select>
                </div>

                {duplicateCandidates.filter(d => !dismissedDupKeys.has(`${d.newComplaintId}::${d.similarComplaintId}`)).length === 0 ? (
                  <div className="p-8 rounded-2xl bg-emerald-50/40 border border-emerald-200 text-center text-xs text-emerald-800">
                    <span className="material-symbols-outlined text-3xl text-emerald-600 mb-1 block">verified</span>
                    <p className="font-bold">
                      {lang === 'kn'
                        ? `#${analysisTarget.token} ಗೆ ಯಾವುದೇ ಸಂಭಾವ್ಯ ನಕಲಿ ದೂರುಗಳು ಕಂಡುಬಂದಿಲ್ಲ.`
                        : `No potential duplicate clusters detected for #${analysisTarget.token}.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {duplicateCandidates
                      .filter(d => !dismissedDupKeys.has(`${d.newComplaintId}::${d.similarComplaintId}`))
                      .map((dup) => (
                        <div key={dup.similarComplaintId} className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-mono font-bold text-slate-600">
                                {lang === 'kn' ? 'ಪ್ರಸ್ತುತ:' : 'Target:'} #{dup.newComplaintId}
                              </span>
                              <span className="material-symbols-outlined text-sm text-amber-600">compare_arrows</span>
                              <span className="font-mono font-bold text-amber-900">
                                {lang === 'kn' ? 'ಸಮಾನ ದೂರು:' : 'Similar:'} #{dup.similarComplaintId}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-mono text-[11px] font-bold">
                                {dup.similarityScore}% Match
                              </span>
                              <StatusBadge status={dup.status} />
                            </div>
                            <h4 className="font-headline font-bold text-sm text-slate-900">{dup.title}</h4>
                            <p className="text-xs text-slate-600">
                              {tDepartment(dup.departmentName)} · {dup.location}
                            </p>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {(lang === 'kn' ? dup.matchingReasonsKn : dup.matchingReasons).map((r, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-white border border-amber-200 text-[11px] text-amber-900">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <Link
                              to={`/admin/complaints/${dup.similarComplaintId}`}
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold"
                            >
                              {t('glossary.view')}
                            </Link>
                            <button
                              onClick={() => handleMarkRelatedDuplicate(dup)}
                              className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold"
                            >
                              {t('intelMarkRelated')}
                            </button>
                            <button
                              onClick={() => handleDismissDuplicateCandidate(dup)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                            >
                              {t('intelContinueSeparate')}
                            </button>
                            <button
                              onClick={() => {
                                recordIntelligenceDecision({
                                  complaintId: dup.newComplaintId,
                                  ruleType: 'DUPLICATE_REVIEW',
                                  originalRecommendation: `Possible duplicate of #${dup.similarComplaintId} (${dup.similarityScore}%)`,
                                  adminDecision: 'REQUEST_ADMIN_REVIEW',
                                  decisionReason: 'Flagged for formal administrator duplicate verification.',
                                  reviewedBy: currentUser?.name || currentRole
                                });
                                showToast(lang === 'kn' ? 'ಆಡಳಿತಾಧಿಕಾರಿಗಳ ಪರಿಶೀಲನೆಗೆ ವಿನಂತಿ ಕಳುಹಿಸಲಾಗಿದೆ.' : 'Flagged for Administrator duplicate verification review.');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold"
                            >
                              {t('intelRequestReview')}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Part B: Similar Historical Complaint Search */}
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <div>
                  <h3 className="font-headline font-bold text-base text-slate-900">{t('intelSearchSimilar')}</h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'kn'
                      ? 'ಟ್ರ್ಯಾಕಿಂಗ್ ಐಡಿ, ಶೀರ್ಷಿಕೆ, ಕೀವರ್ಡ್‌ಗಳು, ವರ್ಗ, ಇಲಾಖೆ ಅಥವಾ ಜಿಲ್ಲೆಯ ಮೂಲಕ ಹಳೆಯ ದೂರುಗಳನ್ನು ಹುಡುಕಿ.'
                      : 'Query shared complaint archive by Tracking ID, keywords, category, department, district, or location.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <input
                    type="text"
                    value={simSearchKeyword}
                    onChange={(e) => setSimSearchKeyword(e.target.value)}
                    placeholder={lang === 'kn' ? 'ಕೀವರ್ಡ್ ಅಥವಾ ಟೋಕನ್ ಐಡಿ...' : 'Keywords or Tracking ID...'}
                    className="px-3 py-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-teal-600"
                  />
                  <select
                    value={simCategory}
                    onChange={(e) => setSimCategory(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white border border-slate-300"
                  >
                    <option value="ALL">{lang === 'kn' ? 'ಎಲ್ಲಾ ವರ್ಗಗಳು' : 'All Categories'}</option>
                    {COMPLAINT_CATEGORIES.map(c => (
                      <option key={c.id} value={c.name}>{tCategory(c.name)}</option>
                    ))}
                  </select>
                  <select
                    value={simDept}
                    onChange={(e) => setSimDept(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white border border-slate-300"
                  >
                    <option value="ALL">{lang === 'kn' ? 'ಎಲ್ಲಾ ಇಲಾಖೆಗಳು' : 'All Departments'}</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{tDepartment(d.name)}</option>
                    ))}
                  </select>
                  <select
                    value={simDistrict}
                    onChange={(e) => setSimDistrict(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white border border-slate-300"
                  >
                    <option value="ALL">{lang === 'kn' ? 'ಎಲ್ಲಾ ಜಿಲ್ಲೆಗಳು' : 'All Districts'}</option>
                    {distinctDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={simLocation}
                    onChange={(e) => setSimLocation(e.target.value)}
                    placeholder={lang === 'kn' ? 'ವಾರ್ಡ್ / ಸ್ಥಳ...' : 'Ward / Location...'}
                    className="px-3 py-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">{t('glossary.trackingId')}</th>
                        <th className="py-3 px-4">{t('complaintTitle')}</th>
                        <th className="py-3 px-4">{t('department')}</th>
                        <th className="py-3 px-4">{t('complaintCategory')}</th>
                        <th className="py-3 px-4">{t('incidentLocation')}</th>
                        <th className="py-3 px-4">{t('glossary.status')}</th>
                        <th className="py-3 px-4 text-center">{t('intelMatchingScore')}</th>
                        <th className="py-3 px-4 text-right">{t('glossary.view')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {similarSearchResults.slice(0, 12).map(({ complaint, similarityScore }) => (
                        <tr key={complaint.token} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-teal-800">{complaint.token}</td>
                          <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">{complaint.title}</td>
                          <td className="py-3 px-4 text-slate-600">{tDepartment(complaint.departmentName)}</td>
                          <td className="py-3 px-4 text-slate-600">{tCategory(complaint.category)}</td>
                          <td className="py-3 px-4 text-slate-600">{complaint.ward}, {complaint.district}</td>
                          <td className="py-3 px-4"><StatusBadge status={complaint.status} /></td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-teal-700">{similarityScore}%</td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              to={`/admin/complaints/${complaint.token}`}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-teal-700 hover:text-white font-semibold transition-colors"
                            >
                              {t('glossary.view')}
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {similarSearchResults.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-500">
                            {t('noRecords')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 3: HEALTH & ESCALATION RISK MONITOR */}
          {/* =============================================================== */}
          {activeTab === 'risk' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-headline font-bold text-base text-slate-900">
                    {lang === 'kn' ? 'ದೂರಿನ ಆರೋಗ್ಯ ಸೂಚ್ಯಂಕ & ಮೇಲ್ಮನವಿ ಅಪಾಯ ಮೇಲ್ವಿಚಾರಣೆ' : 'Complaint Health & Escalation Risk Monitor'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'kn'
                      ? '0–100 ಆರೋಗ್ಯ ಅಂಕಗಳು ಮತ್ತು ಮೇಲ್ಮನವಿ ಅಪಾಯದ ನಿಯಮಗಳು (ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಯಾವುದೇ ಮೇಲ್ಮನವಿ ಪ್ರಾರಂಭಿಸುವುದಿಲ್ಲ).'
                      : 'Rule-based 0–100 health score and escalation risk queue. Does not automatically trigger escalation without authorization.'}
                  </p>
                </div>
                <select
                  value={riskLevelFilter}
                  onChange={(e) => setRiskLevelFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800"
                >
                  <option value="ALL">{lang === 'kn' ? 'ಎಲ್ಲಾ ಅಪಾಯ ಮಟ್ಟಗಳು' : 'All Risk Levels'}</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">{t('glossary.trackingId')}</th>
                      <th className="py-3 px-4">{t('department')}</th>
                      <th className="py-3 px-4">{t('officerName')}</th>
                      <th className="py-3 px-4 text-center">{t('avgHealthScore')}</th>
                      <th className="py-3 px-4 text-center">{lang === 'kn' ? 'ಅಪಾಯ ಮಟ್ಟ' : 'Risk Level'}</th>
                      <th className="py-3 px-4">{lang === 'kn' ? 'ಕಾರಣಗಳು' : 'Risk Reasons'}</th>
                      <th className="py-3 px-4">{lang === 'kn' ? 'ಶಿಫಾರಸು ಕ್ರಮ' : 'Recommended Action'}</th>
                      <th className="py-3 px-4 text-right">{lang === 'kn' ? 'ಕ್ರಮಗಳು' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {riskCohort.slice(0, 20).map(({ complaint, health, risk }) => (
                      <tr key={complaint.token} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-teal-800">
                          <Link to={`/admin/complaints/${complaint.token}`} className="hover:underline">
                            {complaint.token}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{tDepartment(complaint.departmentName)}</td>
                        <td className="py-3 px-4 text-slate-700">{complaint.assignedOfficer?.name || 'Unassigned'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border ${health.badgeClass}`}>
                            {health.score}/100
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${getRiskBadgeClass(risk.riskLevel)}`}>
                            {lang === 'kn' ? risk.labelKn : risk.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs">
                          {(lang === 'kn' ? risk.reasonsKn : risk.reasons).slice(0, 2).join('; ')}
                        </td>
                        <td className="py-3 px-4 font-semibold text-teal-800">
                          {lang === 'kn' ? risk.recommendedActionKn : risk.recommendedAction}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              sendComplaintReminder({
                                complaintToken: complaint.token,
                                channel: 'IN_APP',
                                recipientName: complaint.assignedOfficer?.name || 'Assigned Cadre',
                                subject: `Risk Mitigation Reminder for #${complaint.token}`,
                                notes: risk.recommendedAction
                              });
                              showToast(lang === 'kn' ? `#${complaint.token} ಗೆ ಜ್ಞಾಪನೆ ಕಳುಹಿಸಲಾಗಿದೆ.` : `Proactive reminder dispatched for #${complaint.token}.`);
                            }}
                            className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold"
                          >
                            {t('glossary.reminder')}
                          </button>
                          <Link
                            to={`/admin/complaints/${complaint.token}`}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-teal-700 hover:text-white font-semibold transition-colors"
                          >
                            {t('glossary.view')}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 4: INTELLIGENCE ALERT CENTRE */}
          {/* =============================================================== */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-headline font-bold text-base text-slate-900">{t('intelAlertsTab')}</h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'kn'
                      ? 'ನಕಲು ದೂರು, ತಪ್ಪು ಇಲಾಖೆ, ಅತಿ ಆದ್ಯತೆ, ಗಂಭೀರ ಆರೋಗ್ಯ ಮತ್ತು ಕಾರ್ಯಭಾರ ಅಸಮತೋಲನ ಎಚ್ಚರಿಕೆಗಳು.'
                      : 'Deduplicated governance alerts across all rule engines. Mark as reviewed or dismiss after verification.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <select
                    value={alertCategoryFilter}
                    onChange={(e) => setAlertCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 font-semibold"
                  >
                    <option value="ALL">{lang === 'kn' ? 'ಎಲ್ಲಾ ಎಚ್ಚರಿಕೆ ವಿಧಗಳು' : 'All Alert Categories'}</option>
                    <option value="CRITICAL_HEALTH">Critical Complaint Health</option>
                    <option value="ESCALATION_RISK">Escalation Risk</option>
                    <option value="POTENTIAL_DUPLICATE">Potential Duplicate Complaint</option>
                    <option value="HIGH_PRIORITY_COMPLAINT">High-Priority Complaint</option>
                    <option value="DEPARTMENT_MISMATCH">Incorrect Department Recommendation</option>
                    <option value="OFFICER_WORKLOAD_IMBALANCE">Officer Workload Imbalance</option>
                  </select>
                  <select
                    value={alertStatusFilter}
                    onChange={(e) => setAlertStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 font-semibold"
                  >
                    <option value="ALL">{t('allStatuses')}</option>
                    <option value="OPEN">OPEN</option>
                    <option value="REVIEWED">REVIEWED</option>
                    <option value="DISMISSED">DISMISSED</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Alert ID</th>
                      <th className="py-3 px-4">{t('glossary.trackingId')}</th>
                      <th className="py-3 px-4">{lang === 'kn' ? 'ಎಚ್ಚರಿಕೆ ವಿಧ' : 'Alert Type'}</th>
                      <th className="py-3 px-4">{lang === 'kn' ? 'ಮಟ್ಟ' : 'Risk'}</th>
                      <th className="py-3 px-4">{lang === 'kn' ? 'ವಿವರಣೆ' : 'Description'}</th>
                      <th className="py-3 px-4">{t('glossary.date')}</th>
                      <th className="py-3 px-4">{t('glossary.status')}</th>
                      <th className="py-3 px-4 text-right">{lang === 'kn' ? 'ಕ್ರಮಗಳು' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{alert.id}</td>
                        <td className="py-3 px-4 font-mono font-bold text-teal-800">{alert.complaintId}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {lang === 'kn' ? alert.alertCategoryLabelKn : alert.alertCategoryLabel}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getRiskBadgeClass(alert.riskLevel)}`}>
                            {alert.riskLevel}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs">
                          {lang === 'kn' ? alert.descriptionKn : alert.description}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">{alert.generatedDate}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            alert.reviewStatus === 'OPEN'
                              ? 'bg-amber-100 text-amber-800'
                              : alert.reviewStatus === 'REVIEWED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {alert.reviewStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setInspectedAlert(alert)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                          >
                            {t('glossary.view')}
                          </button>
                          {alert.reviewStatus === 'OPEN' && (
                            <>
                              <button
                                onClick={() => {
                                  markIntelligenceAlertReviewed(alert.id, currentUser?.name || currentRole);
                                  showToast(`${alert.id} marked as Reviewed.`);
                                }}
                                className="px-2 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                              >
                                {t('intelMarkAlertReviewed')}
                              </button>
                              <button
                                onClick={() => {
                                  dismissIntelligenceAlert(alert.id, currentUser?.name || currentRole);
                                  showToast(`${alert.id} dismissed.`);
                                }}
                                className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold"
                              >
                                {t('intelDismissAlert')}
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 5: ADMINISTRATOR REVIEW HISTORY */}
          {/* =============================================================== */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-headline font-bold text-base text-slate-900">{t('intelReviewHistoryTab')}</h3>
                <p className="text-xs text-slate-500">
                  {lang === 'kn'
                    ? 'ಆಡಳಿತಾಧಿಕಾರಿಗಳು ಒಪ್ಪಿಕೊಂಡ ಅಥವಾ ಬದಲಾಯಿಸಿದ ಶಿಫಾರಸುಗಳ ಸಂಪೂರ್ಣ ದಾಖಲೆ.'
                    : 'Complete audit ledger of accepted and overridden decision support recommendations.'}
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Review ID</th>
                      <th className="py-3 px-4">{t('glossary.trackingId')}</th>
                      <th className="py-3 px-4">{lang === 'kn' ? 'ನಿಯಮ ವಿಧ' : 'Rule Engine'}</th>
                      <th className="py-3 px-4">{lang === 'kn' ? 'ಮೂಲ ಶಿಫಾರಸು' : 'Original Recommendation'}</th>
                      <th className="py-3 px-4">{lang === 'kn' ? 'ಆಡಳಿತಾಧಿಕಾರಿ ನಿರ್ಧಾರ' : 'Admin Decision'}</th>
                      <th className="py-3 px-4">{lang === 'kn' ? 'ಕಾರಣ' : 'Decision Reason'}</th>
                      <th className="py-3 px-4">{t('responsibleActor')}</th>
                      <th className="py-3 px-4">{t('eventTimestamp')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {intelligenceReviews.map(rev => (
                      <tr key={rev.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-600">{rev.id}</td>
                        <td className="py-3 px-4 font-mono font-bold text-teal-800">{rev.complaintId}</td>
                        <td className="py-3 px-4 font-mono text-[11px]">{rev.ruleType}</td>
                        <td className="py-3 px-4 text-slate-700">{rev.originalRecommendation}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            rev.adminDecision.includes('ACCEPTED')
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {rev.adminDecision}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs">{rev.decisionReason}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{rev.reviewedBy}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{rev.reviewDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* OVERRIDE DECISION MODAL */}
      {/* =================================================================== */}
      <Modal
        isOpen={overrideModal.open}
        onClose={() => setOverrideModal(prev => ({ ...prev, open: false }))}
        title={t('intelOverrideDecision')}
      >
        <form onSubmit={handleSaveOverride} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">
              {lang === 'kn' ? 'ಮೂಲ ಶಿಫಾರಸು' : 'Original Rule Suggestion'}
            </span>
            <p className="font-bold text-slate-900 mt-0.5">{overrideModal.originalRecommendation}</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === 'kn' ? 'ಆಡಳಿತಾಧಿಕಾರಿಯ ಹೊಸ ಆಯ್ಕೆ' : 'Authorized Selection'}
            </label>
            {overrideModal.ruleType === 'DEPARTMENT_RECOMMENDATION' && (
              <select
                value={overrideModal.newValue}
                onChange={(e) => setOverrideModal(prev => ({ ...prev, newValue: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{tDepartment(d.name)}</option>
                ))}
              </select>
            )}
            {overrideModal.ruleType === 'CATEGORY_SUGGESTION' && (
              <select
                value={overrideModal.newValue}
                onChange={(e) => setOverrideModal(prev => ({ ...prev, newValue: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              >
                {COMPLAINT_CATEGORIES.map(c => (
                  <option key={c.id} value={c.name}>{tCategory(c.name)}</option>
                ))}
              </select>
            )}
            {overrideModal.ruleType === 'PRIORITY_RECOMMENDATION' && (
              <select
                value={overrideModal.newValue}
                onChange={(e) => setOverrideModal(prev => ({ ...prev, newValue: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === 'kn' ? 'ಬದಲಾವಣೆಗೆ ಕಾರಣ (ಪರಿಶೋಧನಾ ದಾಖಲೆಗಾಗಿ)' : 'Reason for Override (Required for Audit Trail)'}
            </label>
            <textarea
              required
              rows={3}
              value={overrideModal.reason}
              onChange={(e) => setOverrideModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder={lang === 'kn' ? 'ನಿರ್ಧಾರವನ್ನು ಬದಲಾಯಿಸಲು ಕಾರಣವನ್ನು ನಮೂದಿಸಿ...' : 'Document jurisdictional or factual basis for overriding...'}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOverrideModal(prev => ({ ...prev, open: false }))}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* =================================================================== */}
      {/* INSPECT ALERT MODAL */}
      {/* =================================================================== */}
      <Modal
        isOpen={Boolean(inspectedAlert)}
        onClose={() => setInspectedAlert(null)}
        title={inspectedAlert ? `${inspectedAlert.id} — ${lang === 'kn' ? inspectedAlert.alertCategoryLabelKn : inspectedAlert.alertCategoryLabel}` : ''}
      >
        {inspectedAlert && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-teal-800">
                {t('glossary.trackingId')}: {inspectedAlert.complaintId}
              </span>
              <span className={`px-2 py-0.5 rounded-full font-mono font-bold border ${getRiskBadgeClass(inspectedAlert.riskLevel)}`}>
                {inspectedAlert.riskLevel}
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {lang === 'kn' ? inspectedAlert.descriptionKn : inspectedAlert.description}
            </p>
            <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200">
              <span className="font-bold text-teal-900 block mb-0.5">
                {lang === 'kn' ? 'ಶಿಫಾರಸು ಮಾಡಿದ ಮುಂದಿನ ಕ್ರಮ:' : 'Recommended Action:'}
              </span>
              <span className="text-teal-800">
                {lang === 'kn' ? inspectedAlert.recommendedActionKn : inspectedAlert.recommendedAction}
              </span>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              {inspectedAlert.complaintId && !inspectedAlert.complaintId.startsWith('off-') && (
                <button
                  onClick={() => {
                    const cid = inspectedAlert.complaintId;
                    setInspectedAlert(null);
                    navigate(`/admin/complaints/${cid}`);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
                >
                  {lang === 'kn' ? 'ದೂರಿನ ವಿವರ ತೆರೆಯಿರಿ' : 'Open Complaint Details'}
                </button>
              )}
              <button
                onClick={() => setInspectedAlert(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
              >
                {t('close')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ComplaintIntelligenceView;
