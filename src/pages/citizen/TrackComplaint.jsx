import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const TrackComplaint = () => {
  const { complaints, verifyResolution } = useComplaints();
  const { t, lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchToken, setSearchToken] = useState(searchParams.get('token') || '');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Verification modal state
  const [csatRating, setCsatRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isReopenMode, setIsReopenMode] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setSearchToken(token);
      const clean = token.toLowerCase().trim();
      const match = complaints.find(c =>
        (c.token && c.token.toLowerCase() === clean) ||
        (c.trackingId && c.trackingId.toLowerCase() === clean) ||
        (c.legacyToken && c.legacyToken.toLowerCase() === clean) ||
        (c.id && c.id.toLowerCase() === clean)
      );
      if (match) setSelectedTicket(match);
    } else if (complaints.length > 0 && !selectedTicket) {
      setSelectedTicket(complaints[0]);
      setSearchToken(complaints[0].trackingId || complaints[0].token);
    }
  }, [searchParams, complaints]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchToken.trim()) return;

    const clean = searchToken.toLowerCase().trim();
    const match = complaints.find(c =>
      (c.token && c.token.toLowerCase() === clean) ||
      (c.trackingId && c.trackingId.toLowerCase() === clean) ||
      (c.legacyToken && c.legacyToken.toLowerCase() === clean) ||
      (c.id && c.id.toLowerCase() === clean)
    );
    if (match) {
      setSelectedTicket(match);
      setSearchParams({ token: match.trackingId || match.token });
    } else {
      alert(`No grievance ticket found for "${searchToken}". Please verify token (e.g. RTK-2026-000001, GRV-2024-8841)`);
    }
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    verifyResolution(selectedTicket.token, csatRating, feedback, isReopenMode);
    setShowVerifyModal(false);
    setVerifiedSuccess(true);
    setTimeout(() => setVerifiedSuccess(false), 5000);
  };

  // Lifecycle steps for timeline
  const lifecycleSteps = [
    { key: 'SUBMITTED', label: '1. Registered' },
    { key: 'ASSIGNED', label: '2. Auto-Triage' },
    { key: 'IN_PROGRESS', label: '3. Field Inspection' },
    { key: 'ACTION_TAKEN', label: '4. Action Executed' },
    { key: 'RESOLVED', label: '5. Citizen Verified' }
  ];

  const getStepIndex = (status) => {
    if (status === 'SUBMITTED') return 0;
    if (status === 'ASSIGNED') return 1;
    if (status === 'IN_PROGRESS' || status === 'UNDER_REVIEW' || status === 'OVERDUE') return 2;
    if (status === 'ACTION_TAKEN') return 3;
    if (status === 'RESOLVED' || status === 'CLOSED') return 4;
    return 2;
  };

  return (
    <div className="max-w-5xl mx-auto py-4 flex flex-col gap-8">
      {/* Search Header Banner */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <span className="font-mono text-xs uppercase font-bold text-primary tracking-wider">
            Public Redressal Telemetry Gate
          </span>
          <h1 className="font-headline text-headline-lg font-bold text-on-surface mt-1">
            {lang === 'kn' ? 'ದೂರು ಟ್ರ್ಯಾಕಿಂಗ್ ಮತ್ತು ಪರಿಶೀಲನೆ' : 'Live Complaint Tracking & Resolution Verification'}
          </h1>
          <p className="font-body text-body-sm text-secondary mt-1">
            Enter your unique grievance token number to inspect real-time departmental audit logs and statutory SLA deadlines.
          </p>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              type="text"
              required
              placeholder="e.g. GRV-2024-8841"
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none text-body-md font-mono uppercase font-bold transition-all"
            />
          </div>
          <button
            type="submit"
            className="h-11 px-5 rounded-xl bg-primary text-on-primary font-headline text-label-md font-bold shadow-md hover:bg-primary-container transition-all"
          >
            Track
          </button>
        </form>
      </div>

      {verifiedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3">
          <span className="material-symbols-outlined text-emerald-600 text-2xl">verified</span>
          <p className="font-body text-body-md font-semibold">
            Thank you! Your citizen resolution feedback and CSAT rating have been recorded in the departmental audit gazette.
          </p>
        </div>
      )}

      {/* Selected Ticket Dashboard */}
      {selectedTicket && (
        <div className="flex flex-col gap-6">
          {/* Ticket Header & Status Pill Bar */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="font-headline text-2xl font-bold font-mono text-primary">
                  #{selectedTicket.token}
                </span>
                <StatusBadge status={selectedTicket.status} />
                {selectedTicket.escalationTier !== 'NONE' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-error text-on-error font-mono text-[11px] font-bold animate-pulse">
                    {selectedTicket.escalationTier} ESCALATED
                  </span>
                )}
              </div>
              <h2 className="font-headline text-headline-sm font-bold text-on-surface mt-1">
                {lang === 'kn' && selectedTicket.titleKn ? selectedTicket.titleKn : selectedTicket.title}
              </h2>
              <span className="font-body text-body-sm text-secondary">
                {selectedTicket.departmentName} · {selectedTicket.ward}, {selectedTicket.district}
              </span>
            </div>

            {/* SLA Timer Pill */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col items-end">
              <span className="font-mono text-[11px] uppercase text-secondary font-bold">
                Statutory SLA Window
              </span>
              <div
                className={`font-mono text-lg font-bold mt-0.5 ${
                  selectedTicket.hoursRemaining < 0
                    ? 'text-error animate-pulse'
                    : selectedTicket.hoursRemaining <= 4
                    ? 'text-amber-600'
                    : 'text-primary'
                }`}
              >
                {selectedTicket.hoursRemaining < 0
                  ? `Overdue by ${Math.abs(selectedTicket.hoursRemaining)}h`
                  : `${selectedTicket.hoursRemaining} Hours Remaining`}
              </div>
              <span className="text-[11px] text-secondary font-mono">
                Deadline: {new Date(selectedTicket.slaDeadline).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Visual Lifecycle Stepper */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30">
            <h3 className="font-headline font-bold text-on-surface text-label-lg mb-6">
              Resolution Cadence Milestones
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative">
              {lifecycleSteps.map((s, idx) => {
                const currentIdx = getStepIndex(selectedTicket.status);
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div
                    key={s.key}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isCurrent
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : isPassed
                        ? 'border-emerald-300 bg-emerald-50/50'
                        : 'border-outline-variant/30 bg-surface-container-low/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[11px] font-bold text-secondary">Step {idx + 1}</span>
                      <span
                        className={`material-symbols-outlined text-base ${
                          isPassed ? 'text-emerald-600' : 'text-outline'
                        }`}
                      >
                        {isPassed ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </div>
                    <span
                      className={`font-body text-body-sm font-semibold ${
                        isCurrent ? 'text-primary' : isPassed ? 'text-emerald-900' : 'text-secondary'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two-Column Details: Nodal Officer & Actions Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Officer & Citizen Card (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Assigned Officer Card */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
                <span className="font-mono text-[11px] uppercase font-bold text-secondary">
                  Designated Nodal Officer
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold font-mono text-lg">
                    {selectedTicket.assignedOfficer?.name?.slice(0, 2).toUpperCase() || 'OFF'}
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-on-surface text-label-lg">
                      {selectedTicket.assignedOfficer?.name}
                    </h4>
                    <span className="text-secondary font-body text-body-sm block">
                      {selectedTicket.assignedOfficer?.designation}
                    </span>
                    <span className="font-mono text-[11px] text-primary font-semibold">
                      Badge: {selectedTicket.assignedOfficer?.badge}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant/20 flex flex-col gap-2 font-body text-body-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary">Official Phone:</span>
                    <span className="font-mono font-medium text-on-surface">{selectedTicket.assignedOfficer?.mobile}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary">Officer SLA Score:</span>
                    <span className="font-mono font-bold text-emerald-700">94.2% on-time</span>
                  </div>
                </div>
              </div>

              {/* Citizen Verification & CSAT Trigger */}
              <div className="bg-gradient-to-br from-surface-container-low to-primary-container/10 p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">rate_review</span>
                  <h4 className="font-headline font-bold text-on-surface text-label-lg">
                    Citizen Redressal Verification
                  </h4>
                </div>
                <p className="font-body text-body-sm text-secondary">
                  If the nodal officer has addressed the issue, you can confirm satisfaction and close the ticket, or request a re-open review within 7 statutory days.
                </p>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => {
                      setIsReopenMode(false);
                      setShowVerifyModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-body text-label-sm font-bold shadow-sm hover:bg-primary-container transition-all flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-lg">thumb_up</span>
                    <span>Verify Resolution & Submit CSAT</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsReopenMode(true);
                      setShowVerifyModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-surface-container-lowest text-error border border-error/30 hover:bg-error-container/20 font-body text-label-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-lg">replay</span>
                    <span>Dispute & Reopen Grievance</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Immutable Action Audit History (8 cols) */}
            <div className="lg:col-span-8 bg-surface-container-lowest p-6 sm:p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                <div>
                  <h3 className="font-headline text-headline-sm font-bold text-on-surface">
                    Immutable Audit Trail & Timeline Logs
                  </h3>
                  <p className="font-body text-body-sm text-secondary mt-0.5">
                    Statutory chronological record of all officer actions, automated notices, and citizen remarks
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded bg-surface-container font-mono text-[11px] font-bold text-secondary">
                  {selectedTicket.actions.length} Events Logged
                </span>
              </div>

              {/* Timeline Items */}
              <div className="relative pl-6 sm:pl-8 flex flex-col gap-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/50">
                {selectedTicket.actions.map((act) => (
                  <div key={act.id} className="relative flex flex-col gap-1.5">
                    {/* Timeline bullet */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface-container-lowest shadow-sm ${
                        act.type === 'ESCALATION' || act.type === 'SHOW_CAUSE'
                          ? 'bg-error text-white'
                          : act.type === 'ACTION_TAKEN'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-primary text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[10px]">
                        {act.type === 'ESCALATION' ? 'priority_high' : act.type === 'ACTION_TAKEN' ? 'task_alt' : 'circle'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-headline font-bold text-on-surface text-label-md">
                        {act.user}
                      </span>
                      <span className="font-mono text-xs text-secondary">
                        {act.date}
                      </span>
                    </div>

                    <p className="font-body text-body-md text-on-surface-variant bg-surface-container-low/60 p-3.5 rounded-xl border border-outline-variant/20 leading-relaxed">
                      {act.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Audio Transcript / Proof callout if available */}
              {selectedTicket.audioTranscript && (
                <div className="p-4 rounded-xl bg-tertiary-container/15 border border-tertiary/20 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-tertiary font-headline font-bold text-label-sm">
                    <span className="material-symbols-outlined text-base">record_voice_over</span>
                    <span>Citizen Audio Evidence AI Transcript</span>
                  </div>
                  <p className="font-body text-body-sm text-on-surface italic">
                    "{selectedTicket.audioTranscript}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resolution & CSAT Verification Modal Dialog */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm" onClick={() => setShowVerifyModal(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg w-full z-10 border border-outline-variant/40">
            <h3 className="font-headline text-headline-sm font-bold text-on-surface">
              {isReopenMode ? 'Dispute & Reopen Grievance' : 'Citizen Verification & CSAT Rating'}
            </h3>
            <p className="font-body text-body-sm text-secondary mt-1">
              {isReopenMode
                ? 'Your grievance will be re-assigned to the Zonal Commissioner with priority oversight.'
                : 'Rate your satisfaction with the resolution provided by the department.'}
            </p>

            <form onSubmit={handleVerifySubmit} className="mt-6 flex flex-col gap-5">
              {!isReopenMode && (
                <div>
                  <label className="block font-body text-label-sm font-bold text-on-surface mb-2">
                    Citizen Satisfaction Score (1 to 5 Stars):
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCsatRating(star)}
                        className={`p-2 rounded-xl transition-all ${
                          csatRating >= star ? 'text-amber-500 scale-110' : 'text-outline/40'
                        }`}
                      >
                        <span className="material-symbols-outlined text-3xl fill-current">star</span>
                      </button>
                    ))}
                    <span className="ml-2 font-mono font-bold text-on-surface text-lg">
                      {csatRating} / 5 Stars
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-body text-label-sm font-bold text-on-surface mb-1.5">
                  {isReopenMode ? 'Reason for Reopening *' : 'Citizen Feedback Comments'}
                </label>
                <textarea
                  required={isReopenMode}
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    isReopenMode
                      ? 'e.g. The leak was only temporarily covered with mud; water is still brown...'
                      : 'e.g. Fixed promptly within 24 hours. The inspection engineer was courteous.'
                  }
                  className="w-full p-3 rounded-lg bg-surface-container-low border border-outline-variant/50 focus:border-primary outline-none font-body text-body-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-body text-label-sm font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl font-headline text-label-sm font-bold shadow-md transition-all ${
                    isReopenMode
                      ? 'bg-error text-on-error hover:bg-error/90'
                      : 'bg-primary text-on-primary hover:bg-primary-container'
                  }`}
                >
                  {isReopenMode ? 'Submit Reopen Demand' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

