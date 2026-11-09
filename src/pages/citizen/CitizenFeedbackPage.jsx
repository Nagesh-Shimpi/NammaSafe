import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';

export const CitizenFeedbackPage = () => {
  const { id } = useParams();
  const {
    complaints,
    feedbackRecords,
    acceptResolution,
    requestFurtherAction,
    submitCitizenFeedback
  } = useComplaints();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  // Find candidate tickets
  const [selectedToken, setSelectedToken] = useState(id || '');

  useEffect(() => {
    if (!selectedToken && complaints.length > 0) {
      // Prefer a resolved ticket if available, else first ticket
      const resolved = complaints.find(c => c.status === 'RESOLVED' || c.status === 'CLOSED');
      setSelectedToken(resolved ? resolved.token : complaints[0].token);
    }
  }, [complaints, selectedToken]);

  const ticket = complaints.find(c =>
    c.token === selectedToken ||
    c.trackingId === selectedToken ||
    c.id === selectedToken ||
    c.legacyToken === selectedToken
  );

  // Check if feedback already exists for this complaint
  const existingFeedback = feedbackRecords?.find(f =>
    f.complaintId === selectedToken ||
    (ticket && (f.complaintId === ticket.token || f.complaintId === ticket.trackingId))
  );

  // Form states
  const [activeMode, setActiveMode] = useState('ACCEPT'); // 'ACCEPT' | 'REOPEN'
  const [overallRating, setOverallRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [responsivenessRating, setResponsivenessRating] = useState(5);
  const [timelinessRating, setTimelinessRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('Satisfactory Resolution');
  const [comments, setComments] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Reopen form states
  const [reopenCategory, setReopenCategory] = useState('Work Incomplete or Superficial');
  const [reopenDetails, setReopenDetails] = useState('');
  const [reopenAttachments, setReopenAttachments] = useState([]);
  const [uploadName, setUploadName] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState(null);

  if (!ticket) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center px-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <span className="material-symbols-outlined text-3xl">search_off</span>
        </div>
        <h2 className="font-headline text-headline-md font-bold text-slate-800">
          {lang === 'kn' ? 'ದೂರು ಪತ್ತೆಯಾಗಿಲ್ಲ' : 'Grievance Record Not Found'}
        </h2>
        <p className="text-slate-600 mt-2 text-sm">
          {lang === 'kn'
            ? 'ನೀವು ನಮೂದಿಸಿದ ಟ್ರ್ಯಾಕಿಂಗ್ ಐಡಿ ಅಥವಾ ಟೋಕನ್‌ಗೆ ಸೂಕ್ತ ದಾಖಲೆ ಲಭ್ಯವಿಲ್ಲ.'
            : 'No matching grievance could be found for the specified identifier.'}
        </p>
        <Link
          to="/citizen/track"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>{lang === 'kn' ? 'ಟ್ರ್ಯಾಕಿಂಗ್ ಪೋರ್ಟಲ್‌ಗೆ ಹಿಂತಿರುಗಿ' : 'Return to Tracking Portal'}</span>
        </Link>
      </div>
    );
  }

  // Handle simulated attachment upload for reopening
  const handleAddAttachment = () => {
    if (!uploadName.trim()) return;
    const newFile = {
      name: uploadName.trim(),
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      type: 'image/jpeg',
      uploadedAt: new Date().toISOString()
    };
    setReopenAttachments(prev => [...prev, newFile]);
    setUploadName('');
  };

  const handleRemoveAttachment = (idx) => {
    setReopenAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  // Submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (activeMode === 'REOPEN') {
      if (!reopenDetails.trim()) {
        setNotificationMsg({ type: 'error', text: 'Please explain in detail why the resolution is incomplete or unsatisfactory.' });
        setIsSubmitting(false);
        return;
      }

      const res = requestFurtherAction(
        ticket.token,
        reopenCategory,
        reopenDetails,
        reopenAttachments
      );

      if (res.success) {
        setNotificationMsg({
          type: 'success',
          text: lang === 'kn'
            ? 'ದೂರನ್ನು ಮರುಪರಿಶೀಲನೆಗೆ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ. ಅಧಿಕಾರಿಗೆ ಸೂಚನೆ ರವಾನಿಸಲಾಗಿದೆ.'
            : `Grievance #${ticket.token} has been reopened for statutory re-inspection.`
        });
        setTimeout(() => {
          navigate(`/citizen/track?token=${ticket.token}`);
        }, 2200);
      } else {
        setNotificationMsg({ type: 'error', text: res.message || 'Failed to submit reopening request.' });
        setIsSubmitting(false);
      }
    } else {
      // 1. Accept resolution
      acceptResolution(ticket.token, comments);

      // 2. Submit CSAT feedback
      const fbRes = submitCitizenFeedback(ticket.token, {
        overallRating,
        qualityRating,
        responsivenessRating,
        timelinessRating,
        category: feedbackCategory,
        comments: comments.trim() || 'Satisfactory departmental redressal verified by citizen.',
        isAnonymous
      });

      if (fbRes.success) {
        setNotificationMsg({
          type: 'success',
          text: lang === 'kn'
            ? 'ನಿಮ್ಮ ತೃಪ್ತಿ ದೃಢೀಕರಣ ಮತ್ತು ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಇಲಾಖಾ ಮೌಲ್ಯಮಾಪನ ದಾಖಲೆಗೆ ಸೇರಿಸಲಾಗಿದೆ.'
            : 'Resolution accepted and 4-criteria CSAT feedback submitted successfully.'
        });
        setTimeout(() => {
          navigate(`/citizen/track?token=${ticket.token}`);
        }, 2200);
      } else {
        setNotificationMsg({
          type: fbRes.duplicate ? 'warning' : 'error',
          text: fbRes.message || 'Feedback recording error.'
        });
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: lang === 'kn' ? 'ಮುಖಪುಟ' : 'Citizen Home', to: '/citizen' },
          { label: lang === 'kn' ? 'ಟ್ರ್ಯಾಕಿಂಗ್' : 'Tracking Portal', to: '/citizen/track' },
          { label: `Feedback #${ticket.token}` }
        ]}
      />

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                {lang === 'kn' ? 'ಸಕಾಲ ನಾಗರಿಕ ಮೌಲ್ಯಮಾಪನ' : 'Sakala Citizen Verification'}
              </span>
              <span className="font-mono text-xs font-semibold text-slate-500">
                #{ticket.token}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-headline text-slate-900 mt-1.5">
              {activeMode === 'REOPEN'
                ? (lang === 'kn' ? 'ಪರಿಹಾರವನ್ನು ಪ್ರಶ್ನಿಸಿ / ಮರುತೆರೆಯಿರಿ' : 'Dispute Resolution & Request Further Action')
                : (lang === 'kn' ? 'ಪರಿಹಾರ ದೃಢೀಕರಣ ಮತ್ತು ಮೌಲ್ಯಮಾಪನ' : 'Confirm Resolution & Submit CSAT Feedback')}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              {ticket.title} · <span className="font-medium text-slate-700">{ticket.departmentName || ticket.category}</span>
            </p>
          </div>

          {/* Quick Ticket Switcher */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shrink-0">
            <span className="text-[11px] font-semibold text-slate-500">
              {lang === 'kn' ? 'ಟಿಕೆಟ್ ಬದಲಿಸಿ:' : 'Select Ticket:'}
            </span>
            <select
              value={ticket.token}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {complaints.map(c => (
                <option key={c.token} value={c.token}>
                  #{c.token} ({c.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Existing Feedback Notice */}
        {existingFeedback && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-600 text-2xl shrink-0">verified</span>
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm">
                {lang === 'kn' ? 'ಈ ದೂರಿಗೆ ಮೊದಲೇ ಪ್ರತಿಕ್ರಿಯೆ ದಾಖಲಿಸಲಾಗಿದೆ' : 'Feedback Already Registered for this Complaint'}
              </p>
              <p className="text-emerald-800">
                Overall Rating: <span className="font-bold">{existingFeedback.overallRating}/5 Stars</span> ·
                Quality: <span className="font-bold">{existingFeedback.qualityRating}/5</span> ·
                Responsiveness: <span className="font-bold">{existingFeedback.responsivenessRating}/5</span> ·
                Timeliness: <span className="font-bold">{existingFeedback.timelinessRating}/5</span>
              </p>
              {existingFeedback.comments && (
                <p className="italic text-emerald-700 mt-1">"{existingFeedback.comments}"</p>
              )}
              <p className="text-[10px] text-emerald-600 mt-1">Logged on: {existingFeedback.createdAt}</p>
            </div>
          </div>
        )}

        {/* Status Toast */}
        {notificationMsg && (
          <div className={`mt-4 p-4 rounded-xl flex items-center gap-2 text-xs font-medium ${
            notificationMsg.type === 'success'
              ? 'bg-teal-50 text-teal-900 border border-teal-300'
              : notificationMsg.type === 'warning'
                ? 'bg-amber-50 text-amber-900 border border-amber-300'
                : 'bg-rose-50 text-rose-900 border border-rose-300'
          }`}>
            <span className="material-symbols-outlined text-lg">
              {notificationMsg.type === 'success' ? 'check_circle' : 'info'}
            </span>
            <span>{notificationMsg.text}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
          {/* Action Choice Mode Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveMode('ACCEPT')}
              className={`py-3 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeMode === 'ACCEPT'
                  ? 'bg-white text-teal-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-lg text-teal-600">thumb_up</span>
              <span>{lang === 'kn' ? 'ಪರಿಹಾರ ತೃಪ್ತಿಕರವಾಗಿದೆ (ದೃಢೀಕರಿಸಿ)' : 'Satisfied (Confirm & Close)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('REOPEN')}
              className={`py-3 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeMode === 'REOPEN'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-lg">replay</span>
              <span>{lang === 'kn' ? 'ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ (ದೂರು ಮರುತೆರೆಯಿರಿ)' : 'Dispute / Request Further Action'}</span>
            </button>
          </div>

          {activeMode === 'ACCEPT' ? (
            /* SATISFACTION / CSAT SECTION */
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/60 text-teal-900 text-xs">
                <p className="font-semibold text-teal-950">
                  {lang === 'kn'
                    ? 'ನಿಮ್ಮ ರೇಟಿಂಗ್ ಇಲಾಖೆಯ ಸೇವಾ ಗುಣಮಟ್ಟ ಮತ್ತು ಅಧಿಕಾರಿಗಳ ಕಾರ್ಯಕ್ಷಮತೆಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡುತ್ತದೆ.'
                    : 'Your 4-criteria evaluation is recorded under Karnataka Sakala Mission benchmarks to assess officer turnaround and quality.'}
                </p>
              </div>

              {/* 4 CSAT Criteria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Overall */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      1. {lang === 'kn' ? 'ಒಟ್ಟಾರೆ ತೃಪ್ತಿ' : 'Overall Satisfaction'}
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {lang === 'kn' ? 'ಸಮಗ್ರ ಪರಿಹಾರದ ಅನುಭವ' : 'General experience with grievance redressal'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setOverallRating(star)}
                        className={`text-2xl transition-transform hover:scale-110 ${
                          star <= overallRating ? 'text-amber-500' : 'text-slate-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-auto text-xs font-mono font-bold text-slate-700">
                      {overallRating}/5
                    </span>
                  </div>
                </div>

                {/* 2. Quality */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      2. {lang === 'kn' ? 'ಕೆಲಸದ ಗುಣಮಟ್ಟ' : 'Resolution Quality'}
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {lang === 'kn' ? 'ಸ್ಥಳೀಯ ತಪಾಸಣೆ ಮತ್ತು ಪರಿಹಾರದ ಗುಣಮಟ್ಟ' : 'Durability and thoroughness of work performed'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setQualityRating(star)}
                        className={`text-2xl transition-transform hover:scale-110 ${
                          star <= qualityRating ? 'text-amber-500' : 'text-slate-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-auto text-xs font-mono font-bold text-slate-700">
                      {qualityRating}/5
                    </span>
                  </div>
                </div>

                {/* 3. Responsiveness */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      3. {lang === 'kn' ? 'ಅಧಿಕಾರಿಯ ಸ್ಪಂದನೆ' : 'Officer Responsiveness'}
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {lang === 'kn' ? 'ಸಂವಹನ ಮತ್ತು ವಿನಮ್ರತೆ' : 'Clear updates and respectful communication'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setResponsivenessRating(star)}
                        className={`text-2xl transition-transform hover:scale-110 ${
                          star <= responsivenessRating ? 'text-amber-500' : 'text-slate-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-auto text-xs font-mono font-bold text-slate-700">
                      {responsivenessRating}/5
                    </span>
                  </div>
                </div>

                {/* 4. Timeliness */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      4. {lang === 'kn' ? 'ಸಮಯಪಾಲನೆ' : 'Redressal Timeliness'}
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {lang === 'kn' ? 'ಸಕಾಲ ನಿಗದಿತ ಗಡುವಿನೊಳಗೆ ಇತ್ಯರ್ಥ' : 'Adherence to statutory SLA deadline'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setTimelinessRating(star)}
                        className={`text-2xl transition-transform hover:scale-110 ${
                          star <= timelinessRating ? 'text-amber-500' : 'text-slate-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-auto text-xs font-mono font-bold text-slate-700">
                      {timelinessRating}/5
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedback Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'kn' ? 'ಪ್ರತಿಕ್ರಿಯೆ ವರ್ಗ' : 'Feedback Category'}
                </label>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="Excellent Service">Excellent Service - Rapid & Professional</option>
                  <option value="Satisfactory Resolution">Satisfactory Resolution - Issue Addressed</option>
                  <option value="Adequate with Delays">Adequate Redressal but Delayed</option>
                  <option value="Needs Quality Improvement">Resolved but Needs Better Quality</option>
                  <option value="Critical Feedback">Critical Feedback for Supervisory Review</option>
                </select>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'kn' ? 'ನಾಗರಿಕ ಅಭಿಪ್ರಾಯ / ಕಾಮೆಂಟ್‌ಗಳು' : 'Citizen Comments & Experience'}
                </label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={
                    lang === 'kn'
                      ? 'ನಿಮ್ಮ ಅನುಭವ, ಕೆಲಸದ ಗುಣಮಟ್ಟ ಅಥವಾ ಅಧಿಕಾರಿಯ ಸ್ಪಂದನೆಯ ಬಗ್ಗೆ ಬರೆಯಿರಿ...'
                      : 'Share your remarks on the resolution quality, on-site visit, or overall service...'
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Anonymity Option */}
              <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <span className="text-slate-700">
                  {lang === 'kn'
                    ? 'ನನ್ನ ಹೆಸರನ್ನು ಇಲಾಖಾ ಮೌಲ್ಯಮಾಪನ ವರದಿಯಲ್ಲಿ ಗೌಪ್ಯವಾಗಿಡಿ'
                    : 'Submit feedback anonymously to departmental audit desk'}
                </span>
              </label>
            </div>
          ) : (
            /* REOPEN / DISPUTE SECTION */
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs flex items-start gap-3">
                <span className="material-symbols-outlined text-rose-600 text-xl shrink-0 mt-0.5">warning</span>
                <div>
                  <p className="font-bold">
                    {lang === 'kn' ? 'ಶಾಸನಬದ್ಧ ಮರುಪರಿಶೀಲನೆ ಸೂಚನೆ' : 'Statutory Re-inspection Audit Notice'}
                  </p>
                  <p className="text-rose-800 mt-1">
                    {lang === 'kn'
                      ? 'ದೂರನ್ನು ಮರುತೆರೆಯುವುದರಿಂದ ನಿಯೋಜಿತ ಅಧಿಕಾರಿಯ ಬಾಕಿ ಹೊರೆ ಹೆಚ್ಚಾಗುತ್ತದೆ ಮತ್ತು ವಿಭಾಗೀಯ ಮೇಲ್ವಿಚಾರಕರಿಗೆ ತನಿಖಾ ಎಚ್ಚರಿಕೆ ರವಾನೆಯಾಗುತ್ತದೆ.'
                      : 'Reopening this grievance returns the status to REOPENED, triggers a high-priority supervisor escalation, and increments the assigned officer\'s pending caseload.'}
                  </p>
                </div>
              </div>

              {/* Reason Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'kn' ? 'ಮರುತೆರೆಯುವಿಕೆಯ ಕಾರಣ ವರ್ಗ *' : 'Reason for Disputing Resolution *'}
                </label>
                <select
                  value={reopenCategory}
                  onChange={(e) => setReopenCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="Work Incomplete or Superficial">Work Incomplete or Superficial</option>
                  <option value="Problem Recurred Shortly After">Problem Recurred Shortly After Closure</option>
                  <option value="False Resolution Claimed">False Resolution Claimed Without Site Visit</option>
                  <option value="Wrong Location or Defect Inspected">Wrong Location / Sub-task Inspected</option>
                  <option value="Hazardous Condition Persists">Hazardous Condition or Safety Risk Persists</option>
                </select>
              </div>

              {/* Dispute Explanation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'kn' ? 'ವಿವರವಾದ ಕಾರಣ ಮತ್ತು ಬಾಕಿ ಉಳಿದ ಕೆಲಸ *' : 'Detailed Explanation of Missing Redressal *'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={reopenDetails}
                  onChange={(e) => setReopenDetails(e.target.value)}
                  placeholder={
                    lang === 'kn'
                      ? 'ಸಮಸ್ಯೆ ಏಕೆ ಬಗೆಹರಿದಿಲ್ಲ ಎಂಬುದನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ವಿವರಿಸಿ. ಉದಾ: ಪೈಪ್ ದುರಸ್ತಿ ಅಪೂರ್ಣವಾಗಿದೆ ಮತ್ತು ನೀರು ಸೋರುತ್ತಿದೆ...'
                      : 'Please provide concrete details explaining why the grievance is not resolved. e.g. The leak was only patched with temporary tape and broke open again this morning...'
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Upload Supporting Evidence Simulator */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'kn' ? 'ಸಾಕ್ಷ್ಯ ಫೋಟೋ / ದಾಖಲೆ ಲಗತ್ತಿಸಿ (ಐಚ್ಛಿಕ)' : 'Attach Re-inspection Evidence Photos (Optional)'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="e.g. photo_current_defect_site.jpg"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-xl transition-colors shrink-0"
                  >
                    Add Evidence
                  </button>
                </div>

                {reopenAttachments.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {reopenAttachments.map((f, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-slate-100 rounded-lg text-xs border border-slate-200">
                        <span className="font-mono text-slate-700">📎 {f.name} ({f.size})</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(i)}
                          className="text-rose-600 hover:text-rose-800 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate(`/citizen/track?token=${ticket.token}`)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              {lang === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel & Back'}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow transition-all ${
                activeMode === 'REOPEN'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {isSubmitting
                ? (lang === 'kn' ? 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Submitting...')
                : activeMode === 'REOPEN'
                  ? (lang === 'kn' ? 'ಮರುಪರಿಶೀಲನೆಗೆ ಸಲ್ಲಿಸಿ' : 'Submit Reopening Request')
                  : (lang === 'kn' ? 'ಪರಿಹಾರ ದೃಢೀಕರಿಸಿ ಮತ್ತು ಸಲ್ಲಿಸಿ' : 'Confirm Resolution & Submit CSAT')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
