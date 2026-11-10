import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';

export const TrackComplaint = () => {
  const {
    complaints,
    verifyCitizenAccess,
    getCitizenComplaints,
    submitCitizenResponse,
    acceptResolution,
    requestFurtherAction,
    submitCitizenFeedback,
    citizenNotifications,
    markCitizenNotificationRead,
    markAllCitizenNotificationsRead
  } = useComplaints();

  const { lang, t, tDepartment, tCategory, tPriority, tStatus } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search Verification Form State
  const [searchTrackingId, setSearchTrackingId] = useState(searchParams.get('token') || '');
  const [searchMobile, setSearchMobile] = useState('');
  const [verificationError, setVerificationError] = useState(null);
  const [verifiedTicket, setVerifiedTicket] = useState(null);
  const [myComplaintsList, setMyComplaintsList] = useState([]);
  const [activeTab, setActiveTab] = useState('docket'); // 'docket', 'timeline', 'notifications', 'my_complaints'

  // Additional Information Response Form State
  const [additionalInfoText, setAdditionalInfoText] = useState('');
  const [additionalInfoAttachments, setAdditionalInfoAttachments] = useState([]);
  const [infoSuccessToast, setInfoSuccessToast] = useState(null);
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);

  // Resolution Decision Modals / States
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptRemarks, setAcceptRemarks] = useState('');
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenCategory, setReopenCategory] = useState('Work Incomplete');
  const [reopenDetails, setReopenDetails] = useState('');
  const [reopenAttachments, setReopenAttachments] = useState([]);
  const [decisionSuccessMessage, setDecisionSuccessMessage] = useState(null);

  // Feedback Form State (Section 9: 4 Criteria CSAT)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    overallRating: 5,
    qualityRating: 5,
    responsivenessRating: 5,
    timelinessRating: 5,
    category: 'Satisfactory',
    comments: '',
    isAnonymous: false
  });
  const [feedbackSuccessToast, setFeedbackSuccessToast] = useState(null);

  // My Complaints Filters & Pagination
  const [myComplaintsQuery, setMyComplaintsQuery] = useState('');
  const [myComplaintsStatus, setMyComplaintsStatus] = useState('ALL');
  const [myComplaintsPage, setMyComplaintsPage] = useState(1);

  // Notifications Filter
  const [notificationFilter, setNotificationFilter] = useState('ALL');

  // Pre-seed demo check if token in URL query
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken && !verifiedTicket) {
      // Find matching complaint to pre-fill mobile for demo convenience
      const match = complaints.find(c =>
        (c.token && c.token.toLowerCase() === urlToken.toLowerCase().trim()) ||
        (c.trackingId && c.trackingId.toLowerCase() === urlToken.toLowerCase().trim()) ||
        (c.legacyToken && c.legacyToken.toLowerCase() === urlToken.toLowerCase().trim()) ||
        (c.id && c.id.toLowerCase() === urlToken.toLowerCase().trim())
      );
      if (match) {
        setSearchTrackingId(match.trackingId || match.token);
        const cleanDigits = (match.citizenPhone || match.mobileNumber || '').replace(/\D/g, '');
        setSearchMobile(cleanDigits.slice(-10));
        // Auto-verify for URL direct links
        setVerifiedTicket(match);
        const userAll = getCitizenComplaints(cleanDigits.slice(-10));
        setMyComplaintsList(userAll);
      }
    } else if (complaints.length > 0 && !verifiedTicket && !searchTrackingId) {
      // Pre-seed with default demo docket for ease of evaluation
      const first = complaints[0];
      setSearchTrackingId(first.trackingId || first.token);
      const cleanDigits = (first.citizenPhone || first.mobileNumber || '').replace(/\D/g, '');
      setSearchMobile(cleanDigits.slice(-10));
    }
  }, [searchParams, complaints]);

  // Handle Form Tracking Submission
  const handleTrackSubmit = (e) => {
    e.preventDefault();
    setVerificationError(null);

    const result = verifyCitizenAccess(searchTrackingId, searchMobile);
    if (!result.success) {
      setVerificationError(result.message);
      setVerifiedTicket(null);
      setMyComplaintsList([]);
    } else {
      setVerifiedTicket(result.ticket);
      setSearchParams({ token: result.ticket.trackingId || result.ticket.token });
      const userAll = getCitizenComplaints(searchMobile);
      setMyComplaintsList(userAll);
    }
  };

  // Quick Demo Autofill Helper
  const handleAutofillDemo = (docketToken, mobile) => {
    setSearchTrackingId(docketToken);
    setSearchMobile(mobile);
    setVerificationError(null);
    const result = verifyCitizenAccess(docketToken, mobile);
    if (result.success) {
      setVerifiedTicket(result.ticket);
      setSearchParams({ token: result.ticket.trackingId || result.ticket.token });
      const userAll = getCitizenComplaints(mobile);
      setMyComplaintsList(userAll);
    }
  };

  // Submit Supplementary Information
  const handleSubmitAdditionalInfo = (e) => {
    e.preventDefault();
    if (!additionalInfoText.trim()) return;

    setIsSubmittingInfo(true);
    setTimeout(() => {
      const res = submitCitizenResponse(
        verifiedTicket.trackingId || verifiedTicket.token,
        additionalInfoText,
        additionalInfoAttachments
      );
      if (res.success) {
        setVerifiedTicket(res.ticket);
        setInfoSuccessToast('Supplementary evidence successfully delivered to scrutiny officer!');
        setAdditionalInfoText('');
        setAdditionalInfoAttachments([]);
        setTimeout(() => setInfoSuccessToast(null), 4000);
      }
      setIsSubmittingInfo(false);
    }, 600);
  };

  // Accept Resolution
  const handleConfirmAccept = () => {
    const res = acceptResolution(verifiedTicket.trackingId || verifiedTicket.token, acceptRemarks);
    if (res.success) {
      setVerifiedTicket(res.ticket);
      setShowAcceptModal(false);
      setDecisionSuccessMessage('Thank you! Resolution has been accepted and docket is officially closed.');
      setTimeout(() => {
        setDecisionSuccessMessage(null);
        setShowFeedbackModal(true);
      }, 1800);
    }
  };

  // Request Further Action (Reopen)
  const handleConfirmReopen = () => {
    if (!reopenDetails.trim()) {
      alert('Please describe why the resolution was unsatisfactory.');
      return;
    }
    const res = requestFurtherAction(
      verifiedTicket.trackingId || verifiedTicket.token,
      reopenCategory,
      reopenDetails,
      reopenAttachments
    );
    if (res.success) {
      setVerifiedTicket(res.ticket);
      setShowReopenModal(false);
      setDecisionSuccessMessage(`Grievance #${verifiedTicket.trackingId || verifiedTicket.token} reopened for re-inspection.`);
      setReopenDetails('');
      setReopenAttachments([]);
      setTimeout(() => setDecisionSuccessMessage(null), 3500);
    }
  };

  // Submit Feedback
  const handleSaveFeedback = (e) => {
    e.preventDefault();
    const res = submitCitizenFeedback(verifiedTicket.trackingId || verifiedTicket.token, feedbackData);
    if (!res.success) {
      alert(res.message);
      return;
    }
    setShowFeedbackModal(false);
    setFeedbackSuccessToast('Thank you! Your feedback has been delivered to departmental supervisors.');
    setTimeout(() => setFeedbackSuccessToast(null), 4000);
  };

  // Citizen-specific notifications for this docket/mobile
  const relevantNotifications = citizenNotifications.filter(n => {
    const matchDocket = n.complaintId === (verifiedTicket?.trackingId || verifiedTicket?.token);
    const cleanDigits = (searchMobile || '').replace(/\D/g, '');
    const matchMobile = cleanDigits && n.mobileNumber?.endsWith(cleanDigits);
    const matchesCategory = notificationFilter === 'ALL' || n.category === notificationFilter;
    return (matchDocket || matchMobile) && matchesCategory;
  });

  // Lifecycle Step Index
  const getLifecycleIndex = (status) => {
    switch (status) {
      case 'DRAFT': return 0;
      case 'NEWLY_REGISTERED': return 1;
      case 'PENDING_VERIFICATION': return 1;
      case 'ADDITIONAL_INFO_REQUIRED': return 1;
      case 'VERIFIED': return 2;
      case 'ASSIGNED': return 3;
      case 'IN_PROGRESS': return 4;
      case 'PENDING_CITIZEN_RESPONSE': return 4;
      case 'UNDER_REVIEW': return 4;
      case 'ACTION_TAKEN': return 4;
      case 'RESOLVED': return 5;
      case 'CLOSED': return 6;
      case 'REOPENED': return 4;
      case 'REJECTED': return 1;
      default: return 3;
    }
  };

  const lifecycleStages = [
    { label: lang === 'kn' ? 'ದಾಖಲಾಗಿದೆ' : 'Registered', icon: 'edit_note' },
    { label: lang === 'kn' ? 'ಪರಿಶೀಲನೆ' : 'Verification', icon: 'fact_check' },
    { label: lang === 'kn' ? 'ಅಂಗೀಕೃತ' : 'Verified', icon: 'verified' },
    { label: lang === 'kn' ? 'ಅಧಿಕಾರಿ ನಿಯೋಜನೆ' : 'Cadre Assigned', icon: 'person_pin' },
    { label: lang === 'kn' ? 'ಪ್ರಗತಿಯಲ್ಲಿದೆ' : 'In Progress', icon: 'engineering' },
    { label: lang === 'kn' ? 'ಪರಿಹಾರ ಸಿದ್ಧ' : 'Resolution Ready', icon: 'task_alt' },
    { label: lang === 'kn' ? 'ಮುಕ್ತಾಯಗೊಂಡಿದೆ' : 'Citizen Closed', icon: 'lock' }
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      {/* Toast Notifications */}
      {infoSuccessToast && (
        <div className="fixed top-5 right-5 z-50 bg-teal-900 text-white px-5 py-3 rounded-xl shadow-xl border border-teal-700 flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-teal-300">task_alt</span>
          <span className="text-sm font-semibold">{infoSuccessToast}</span>
        </div>
      )}

      {decisionSuccessMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-teal-400">check_circle</span>
          <span className="text-sm font-semibold">{decisionSuccessMessage}</span>
        </div>
      )}

      {feedbackSuccessToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-900 text-white px-5 py-3 rounded-xl shadow-xl border border-emerald-700 flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-emerald-300">reviews</span>
          <span className="text-sm font-semibold">{feedbackSuccessToast}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. TRACKING ACCESS VERIFICATION GATEWAY (Section 3) */}
      {/* =================================================================== */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-mono font-bold uppercase">
                Citizen Identity Gate
              </span>
              <span className="text-xs text-slate-500">Karnataka Sakala Citizen Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-headline text-slate-900 mt-1">
              {lang === 'kn' ? 'ದೂರು ಟ್ರ್ಯಾಕಿಂಗ್ ಮತ್ತು ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ' : 'Live Grievance Tracking & Verification'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              {lang === 'kn'
                ? 'ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಅಧಿಕೃತ ಆಡಳಿತ ಲಾಗ್‌ಗಳು ಮತ್ತು ಪರಿಹಾರ ಪ್ರಗತಿಯನ್ನು ವೀಕ್ಷಿಸಲು ನಿಮ್ಮ ಟ್ರ್ಯಾಕಿಂಗ್ ಐಡಿ ಮತ್ತು ನೋಂದಾಯಿತ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.'
                : 'Enter your unique tracking token and your registered 10-digit mobile number to inspect authenticated departmental audit logs.'}
            </p>
          </div>

          <Link
            to="/citizen/register"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            <span>{lang === 'kn' ? 'ಹೊಸ ದೂರು ದಾಖಲಿಸಿ' : 'File New Grievance'}</span>
          </Link>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleTrackSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          {/* Tracking ID Input */}
          <div className="sm:col-span-5 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              qr_code_2
            </span>
            <input
              type="text"
              required
              placeholder={lang === 'kn' ? 'ಟ್ರ್ಯಾಕಿಂಗ್ ಐಡಿ (ಉದಾ: RTK-2026-000001)' : 'Tracking ID (e.g. RTK-2026-000001)'}
              value={searchTrackingId}
              onChange={(e) => setSearchTrackingId(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-none text-xs font-mono font-bold uppercase transition-all"
            />
          </div>

          {/* Registered Mobile Number Input */}
          <div className="sm:col-span-4 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              phone_android
            </span>
            <input
              type="tel"
              required
              maxLength={10}
              placeholder={lang === 'kn' ? 'ನೋಂದಾಯಿತ 10-ಅಂಕಿಯ ಮೊಬೈಲ್' : 'Registered 10-Digit Mobile'}
              value={searchMobile}
              onChange={(e) => setSearchMobile(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-none text-xs font-mono font-semibold transition-all"
            />
          </div>

          {/* Track Button */}
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full h-11 px-5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-headline font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">search</span>
              <span>{lang === 'kn' ? 'ಪರಿಶೀಲಿಸಿ & ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' : 'Verify & Track'}</span>
            </button>
          </div>
        </form>

        {/* Quick Demo Pre-fill Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-500">
          <span className="font-bold font-mono text-[11px] text-slate-600">Quick Demo Credentials:</span>
          <button
            type="button"
            onClick={() => handleAutofillDemo('RTK-2026-000001', '9840211928')}
            className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-mono text-[11px] font-bold border border-teal-200 transition-all"
          >
            RTK-2026-000001 (In Progress)
          </button>
          <button
            type="button"
            onClick={() => handleAutofillDemo('RTK-2026-000005', '9900344129')}
            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-mono text-[11px] font-bold border border-amber-200 transition-all"
          >
            RTK-2026-000005 (Info Needed)
          </button>
          <button
            type="button"
            onClick={() => handleAutofillDemo('RTK-2026-000030', '9840211928')}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold border border-emerald-200 transition-all"
          >
            RTK-2026-000030 (Resolved)
          </button>
          <button
            type="button"
            onClick={() => handleAutofillDemo('RTK-2026-000036', '9840211928')}
            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-mono text-[11px] font-bold border border-indigo-200 transition-all"
          >
            RTK-2026-000036 (Reopened)
          </button>
        </div>

        {/* Identity Verification Error Alert */}
        {verificationError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 animate-in fade-in">
            <span className="material-symbols-outlined text-rose-600 text-xl shrink-0 mt-0.5">error</span>
            <div className="text-xs">
              <p className="font-bold text-sm">Identity Verification Notice</p>
              <p className="mt-0.5">{verificationError}</p>
              <p className="text-[11px] text-rose-700 mt-1">
                Please verify that the 10-digit mobile number matches the exact phone provided during complaint registration.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* If Ticket is Verified, Display the Citizen Experience Tabs */}
      {verifiedTicket && (
        <div className="space-y-6 animate-in fade-in">
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto no-scrollbar text-xs font-bold">
            <button
              onClick={() => setActiveTab('docket')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'docket'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm">assignment</span>
              <span>{lang === 'kn' ? 'ದೂರಿನ ವಿವರಗಳು' : 'Grievance Dossier'}</span>
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm">timeline</span>
              <span>{lang === 'kn' ? 'ಪ್ರಗತಿಯ ಕಾಲಾವಧಿ' : 'Activity Timeline'}</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 relative ${
                activeTab === 'notifications'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm">notifications</span>
              <span>
                {lang === 'kn'
                  ? `ಅಧಿಸೂಚನೆಗಳು (${relevantNotifications.length})`
                  : `Notifications (${relevantNotifications.length})`}
              </span>
              {relevantNotifications.some(n => !n.read) && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('my_complaints')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'my_complaints'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm">history_edu</span>
              <span>
                {lang === 'kn'
                  ? `ನನ್ನ ಎಲ್ಲಾ ದೂರುಗಳು (${myComplaintsList.length})`
                  : `My Registered Grievances (${myComplaintsList.length})`}
              </span>
            </button>
          </div>

          {/* =============================================================== */}
          {/* TAB 1: DOCKET DETAILS, PROGRESS STEPPER & ACTIONS */}
          {/* =============================================================== */}
          {activeTab === 'docket' && (
            <div className="space-y-6">
              {/* Docket Status Banner */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-teal-800">
                        #{verifiedTicket.trackingId || verifiedTicket.token}
                      </span>
                      <StatusBadge status={verifiedTicket.status} />
                      <PriorityBadge priority={verifiedTicket.priority} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold font-headline text-slate-900 mt-1">
                      {verifiedTicket.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Registered on {verifiedTicket.createdAt || verifiedTicket.regDate} · {verifiedTicket.category} · {verifiedTicket.subcategory}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Expected Follow-Up Target</span>
                    <span className="text-sm font-mono font-bold text-slate-800">
                      {verifiedTicket.followUpDeadline || verifiedTicket.slaDeadline?.slice(0, 10) || 'Within 48 Hours'}
                    </span>
                  </div>
                </div>

                {/* Visual Lifecycle Stepper (Section 4) */}
                <div className="py-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-4">
                    Grievance Lifecycle Progression
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {lifecycleStages.map((stage, idx) => {
                      const curIdx = getLifecycleIndex(verifiedTicket.status);
                      const isComplete = idx < curIdx;
                      const isCurrent = idx === curIdx;

                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                            isCurrent
                              ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 text-teal-900 font-bold'
                              : isComplete
                              ? 'bg-slate-50 border-slate-200 text-slate-700'
                              : 'bg-white border-dashed border-slate-200 text-slate-400 opacity-60'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs mb-1.5 ${
                            isComplete
                              ? 'bg-teal-600 text-white'
                              : isCurrent
                              ? 'bg-teal-700 text-white animate-pulse'
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            <span className="material-symbols-outlined text-sm">
                              {isComplete ? 'done' : stage.icon}
                            </span>
                          </div>
                          <span className="text-[10px] leading-tight">{stage.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Key Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-400 uppercase tracking-wider block">Assigned Department</span>
                    <p className="font-bold text-teal-900 text-sm mt-0.5">{verifiedTicket.departmentName}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Statutory Nodal Authority</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-400 uppercase tracking-wider block">Assigned Nodal Officer</span>
                    {verifiedTicket.assignedOfficer ? (
                      <div>
                        <p className="font-bold text-slate-900 text-sm mt-0.5">{verifiedTicket.assignedOfficer.name}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5 font-mono">
                          {verifiedTicket.assignedOfficer.badge || verifiedTicket.assignedOfficer.employeeId} · {verifiedTicket.assignedOfficer.designation}
                        </p>
                      </div>
                    ) : (
                      <p className="text-amber-800 font-semibold text-sm mt-0.5">Awaiting Cadre Allocation</p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-400 uppercase tracking-wider block">Applicant Location</span>
                    <p className="font-semibold text-slate-900 text-sm mt-0.5">{verifiedTicket.ward || 'Ward 14'}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">{verifiedTicket.taluk}, {verifiedTicket.district}</p>
                  </div>
                </div>
              </div>

              {/* ============================================================= */}
              {/* SECTION 6: ADDITIONAL INFORMATION REQUEST PROMPT (IF PENDING) */}
              {/* ============================================================= */}
              {(verifiedTicket.status === 'ADDITIONAL_INFO_REQUIRED' || verifiedTicket.additionalInfoPrompt) && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-xl">contact_support</span>
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-mono text-[10px] font-bold uppercase">
                        Action Required from Citizen
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-amber-950 font-headline mt-1">
                        Supplementary Information Requested by Department
                      </h3>
                      <p className="text-xs text-amber-800 mt-1">
                        "{verifiedTicket.additionalInfoPrompt || 'Please upload recent photographs or site billing documents to allow field engineers to proceed with inspection.'}"
                      </p>
                    </div>
                  </div>

                  {/* Citizen Response Form */}
                  <form onSubmit={handleSubmitAdditionalInfo} className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider">
                      Your Response / Clarification *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={additionalInfoText}
                      onChange={(e) => setAdditionalInfoText(e.target.value)}
                      placeholder="Type your explanation or specify clarification details..."
                      className="w-full p-3 rounded-xl border border-amber-300 bg-white text-xs text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20"
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-amber-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">attach_file</span>
                        <span>Attach supporting proof (Photo, PDF):</span>
                        <input
                          type="file"
                          onChange={(e) => {
                            const f = e.target.files[0];
                            if (f) setAdditionalInfoAttachments([...additionalInfoAttachments, { name: f.name, size: '1.5 MB' }]);
                          }}
                          className="text-xs text-slate-600"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingInfo}
                        className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        {isSubmittingInfo ? (
                          <>
                            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">send</span>
                            <span>Submit Supplementary Evidence</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ============================================================= */}
              {/* SECTION 8: RESOLUTION REVIEW BANNER (IF RESOLVED OR ACTION TAKEN) */}
              {/* ============================================================= */}
              {(verifiedTicket.status === 'RESOLVED' || verifiedTicket.status === 'ACTION_TAKEN') && (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-200 text-emerald-900 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-xl">fact_check</span>
                      </div>
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-mono text-[10px] font-bold uppercase">
                          Action Completed by Nodal Officer
                        </span>
                        <h3 className="text-lg font-bold text-emerald-950 font-headline mt-1">
                          Resolution Submitted: Please Inspect & Confirm
                        </h3>
                        <p className="text-xs text-emerald-800 mt-0.5">
                          The assigned nodal officer has submitted physical completion report. Under Karnataka Citizen Service rules, this complaint will only close upon your verification.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-xs space-y-2">
                    <span className="font-bold text-slate-500 uppercase tracking-wider block">Departmental Closure Summary:</span>
                    <p className="text-slate-800 font-medium">
                      {verifiedTicket.resolutionSummary || 'Physical field rectification completed on-site by sub-divisional maintenance crew. Photo evidence and quality report verified.'}
                    </p>
                  </div>

                  {/* Accept vs Reopen Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAcceptModal(true)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">thumb_up</span>
                      <span>Accept Resolution & Close Ticket</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowReopenModal(true)}
                      className="px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">replay</span>
                      <span>Request Further Action (Reopen)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Closed Ticket Confirmation */}
              {verifiedTicket.status === 'CLOSED' && (
                <div className="p-5 rounded-2xl bg-slate-100 border border-slate-300 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-xs text-slate-700">
                    <span className="material-symbols-outlined text-teal-700 text-xl">task_alt</span>
                    <div>
                      <p className="font-bold text-sm text-slate-900">Docket Officially Closed</p>
                      <p>Closed on {verifiedTicket.closureDate || 'recent date'} with verified citizen satisfaction.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    View / Update Feedback
                  </button>
                </div>
              )}

              {/* Reopened Ticket Notice */}
              {verifiedTicket.status === 'REOPENED' && (
                <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-300 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-xs text-indigo-950">
                    <span className="material-symbols-outlined text-indigo-700 text-xl">replay</span>
                    <div>
                      <p className="font-bold text-sm">Docket Reopened for Re-Inspection</p>
                      <p className="mt-0.5">Departmental supervisor and nodal engineer have been alerted to re-inspect site.</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-indigo-200 text-indigo-900 font-mono text-[11px] font-bold">
                    Section 4 Active
                  </span>
                </div>
              )}

              {/* Full Complaint Narrative */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Original Grievance Narrative
                </span>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {verifiedTicket.description}
                </p>

                {/* Evidence Attachments */}
                {verifiedTicket.attachments?.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Submitted Evidence Documents ({verifiedTicket.attachments.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {verifiedTicket.attachments.map((att, i) => (
                        <div key={i} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-2 text-xs font-medium text-slate-700">
                          <span className="material-symbols-outlined text-teal-700 text-base">attach_file</span>
                          <span>{att.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({att.size || '1.2 MB'})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 2: CHRONOLOGICAL ACTIVITY TIMELINE (Section 5) */}
          {/* =============================================================== */}
          {activeTab === 'timeline' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider font-mono">
                  Audit Gazette
                </span>
                <h3 className="text-xl font-bold font-headline text-slate-900 mt-0.5">
                  Chronological Complaint Progression
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete tamper-evident log of registration, verification, field inspections, and status transitions.
                </p>
              </div>

              <div className="relative border-l-2 border-teal-200 pl-5 ml-2 space-y-6">
                {(verifiedTicket.actions || []).map((action, i) => (
                  <div key={i} className="relative group">
                    <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-teal-600 border-2 border-white ring-2 ring-teal-200" />
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 uppercase tracking-wider">
                          {action.type}
                        </span>
                        <span className="font-mono text-slate-500">{action.date}</span>
                      </div>
                      <p className="text-slate-700 text-sm">{action.text}</p>
                      <p className="text-[11px] text-teal-700 font-semibold font-mono">Logged by: {action.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 3: CITIZEN NOTIFICATIONS CENTRE (Section 7) */}
          {/* =============================================================== */}
          {activeTab === 'notifications' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-teal-700 uppercase tracking-wider font-mono">
                    Omnichannel Alert Stream
                  </span>
                  <h3 className="text-xl font-bold font-headline text-slate-900 mt-0.5">
                    Citizen Notification Centre
                  </h3>
                  <p className="text-xs text-slate-500">
                    Simulated SMS, Email & App notifications dispatched for your grievances.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => markAllCitizenNotificationsRead(searchMobile)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
                  >
                    Mark All as Read
                  </button>
                </div>
              </div>

              {/* Notification Category Filters */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                {['ALL', 'Registration', 'Verification', 'Assignment', 'Info Request', 'Escalation', 'Resolution', 'Feedback', 'Reopened'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setNotificationFilter(cat)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      notificationFilter === cat
                        ? 'bg-teal-700 text-white font-bold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Notifications List */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {relevantNotifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    <span className="material-symbols-outlined text-3xl text-slate-300 block mb-1">notifications_off</span>
                    No notifications matching this category.
                  </div>
                ) : (
                  relevantNotifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => markCitizenNotificationRead(notif.id)}
                      className={`p-4 transition-colors flex items-start justify-between gap-4 cursor-pointer ${
                        notif.read ? 'bg-white hover:bg-slate-50' : 'bg-teal-50/50 hover:bg-teal-50'
                      }`}
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                            {notif.category}
                          </span>
                          <span className="font-mono text-teal-800 font-bold">#{notif.complaintId}</span>
                          <span className="text-slate-400 font-mono">{notif.timestamp}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{notif.title}</h4>
                        <p className="text-slate-600 leading-relaxed">{notif.message}</p>
                      </div>

                      {!notif.read && (
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-600 shrink-0 mt-1" title="Unread" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* TAB 4: MY COMPLAINTS LEDGER (Section 10) */}
          {/* =============================================================== */}
          {activeTab === 'my_complaints' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-teal-700 uppercase tracking-wider font-mono">
                    Citizen Dossier Hub
                  </span>
                  <h3 className="text-xl font-bold font-headline text-slate-900 mt-0.5">
                    All Grievances Registered Under {searchMobile}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Switch between your complaints to monitor resolution progress across departments.
                  </p>
                </div>
              </div>

              {/* Complaints Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Tracking ID</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Reg Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myComplaintsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No complaints found under this phone number.
                        </td>
                      </tr>
                    ) : (
                      myComplaintsList.map(ticket => (
                        <tr key={ticket.token} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-teal-800">
                            #{ticket.trackingId || ticket.token}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800 max-w-xs truncate">
                            {ticket.title}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{ticket.departmentName}</td>
                          <td className="py-3 px-4 font-mono text-slate-500">{ticket.createdAt || ticket.regDate}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={ticket.status} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setVerifiedTicket(ticket);
                                setActiveTab('docket');
                                setSearchTrackingId(ticket.trackingId || ticket.token);
                                setSearchParams({ token: ticket.trackingId || ticket.token });
                              }}
                              className="px-3 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px]"
                            >
                              Track Live
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* ACCEPT RESOLUTION MODAL */}
      {/* =================================================================== */}
      {showAcceptModal && verifiedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">thumb_up</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-headline">Confirm Grievance Resolution</h3>
              <p className="text-xs text-slate-600 mt-1">
                By accepting, you confirm that the departmental work has been inspected on-site and satisfies your grievance. The docket will officially close.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Citizen Confirmation Remarks (Optional)
              </label>
              <textarea
                rows={3}
                value={acceptRemarks}
                onChange={(e) => setAcceptRemarks(e.target.value)}
                placeholder="e.g. Verified water pipeline repaired and water is clear. Satisfied with officer response."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAccept}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
              >
                Accept & Proceed to Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* REQUEST FURTHER ACTION (REOPEN) MODAL */}
      {/* =================================================================== */}
      {showReopenModal && verifiedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">replay</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-headline">Request Further Action (Reopen)</h3>
              <p className="text-xs text-slate-600 mt-1">
                Explain why the submitted resolution is incomplete or unsatisfactory. The original Tracking ID will be preserved and the ticket will be re-assigned.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Defect Reason Category *
                </label>
                <select
                  value={reopenCategory}
                  onChange={(e) => setReopenCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 outline-none cursor-pointer"
                >
                  <option value="Work Incomplete">Work Incomplete / Partially Executed</option>
                  <option value="Recurring Problem">Issue Re-emerged Within 24 Hours</option>
                  <option value="Substandard Material Quality">Substandard Materials / Shoddy Repair</option>
                  <option value="Wrong Location Addressed">Wrong Street / Culvert Addressed</option>
                  <option value="False Resolution Claim">False Completion Claim by Contractor</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description of Grievance Defect *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reopenDetails}
                  onChange={(e) => setReopenDetails(e.target.value)}
                  placeholder="Detail what remains unfinished or defective on the ground..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Attach Evidence of Incomplete Work (Photo)
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) setReopenAttachments([...reopenAttachments, { name: f.name, size: '2.1 MB' }]);
                  }}
                  className="text-xs text-slate-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowReopenModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReopen}
                className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-md"
              >
                Submit Reopening Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4-CRITERIA CSAT CITIZEN FEEDBACK MODAL (Section 9) */}
      {/* =================================================================== */}
      {showFeedbackModal && verifiedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">star</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-headline">Citizen Redressal Feedback</h3>
                <p className="text-xs text-slate-500">Docket #{verifiedTicket.trackingId || verifiedTicket.token}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Your feedback directly evaluates department accountability and officer performance scorecards under the Karnataka Sakala Mission.
            </p>

            <form onSubmit={handleSaveFeedback} className="space-y-4 text-xs">
              {/* 1. Overall Satisfaction */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  1. Overall Satisfaction Rating: ({feedbackData.overallRating}/5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackData({ ...feedbackData, overallRating: star })}
                      className="p-1 focus:outline-none"
                    >
                      <span className={`material-symbols-outlined text-2xl ${
                        star <= feedbackData.overallRating ? 'text-amber-500 fill-current' : 'text-slate-300'
                      }`}>
                        star
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Resolution Quality */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  2. Resolution Quality Rating: ({feedbackData.qualityRating}/5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackData({ ...feedbackData, qualityRating: star })}
                      className="p-1 focus:outline-none"
                    >
                      <span className={`material-symbols-outlined text-xl ${
                        star <= feedbackData.qualityRating ? 'text-amber-500 fill-current' : 'text-slate-300'
                      }`}>
                        star
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Officer Responsiveness */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  3. Officer Responsiveness Rating: ({feedbackData.responsivenessRating}/5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackData({ ...feedbackData, responsivenessRating: star })}
                      className="p-1 focus:outline-none"
                    >
                      <span className={`material-symbols-outlined text-xl ${
                        star <= feedbackData.responsivenessRating ? 'text-amber-500 fill-current' : 'text-slate-300'
                      }`}>
                        star
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Timeliness Rating */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  4. Redressal Turnaround & Timeliness: ({feedbackData.timelinessRating}/5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackData({ ...feedbackData, timelinessRating: star })}
                      className="p-1 focus:outline-none"
                    >
                      <span className={`material-symbols-outlined text-xl ${
                        star <= feedbackData.timelinessRating ? 'text-amber-500 fill-current' : 'text-slate-300'
                      }`}>
                        star
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Category */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Feedback Category
                </label>
                <select
                  value={feedbackData.category}
                  onChange={(e) => setFeedbackData({ ...feedbackData, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 outline-none"
                >
                  <option value="Exemplary Service">Exemplary Service · Rapid Redressal</option>
                  <option value="Satisfactory">Satisfactory Redressal</option>
                  <option value="Delayed Resolution">Delayed Resolution (Crossed SLA)</option>
                  <option value="Needs Improvement">Needs Improvement in Communication</option>
                  <option value="Critical Feedback">Critical Feedback for Ministry Review</option>
                </select>
              </div>

              {/* Written Comments */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Written Comments / Suggestions
                </label>
                <textarea
                  rows={3}
                  value={feedbackData.comments}
                  onChange={(e) => setFeedbackData({ ...feedbackData, comments: e.target.value })}
                  placeholder="Share details of your experience with the nodal officer and field team..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Anonymous Checkbox */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={feedbackData.isAnonymous}
                  onChange={(e) => setFeedbackData({ ...feedbackData, isAnonymous: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                />
                <span className="text-slate-700">Submit feedback anonymously to departmental audit desk</span>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md"
                >
                  Submit Official Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackComplaint;
