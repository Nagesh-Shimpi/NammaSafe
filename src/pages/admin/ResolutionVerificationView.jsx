import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const ResolutionVerificationView = () => {
  const { complaints, updateComplaintStatus } = useComplaints();
  const { lang } = useLanguage();

  const [activeTicket, setActiveTicket] = useState(null);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Tickets that are RESOLVED, ACTION_TAKEN, or CLOSED
  const resolvedList = complaints.filter(c =>
    ['RESOLVED', 'ACTION_TAKEN', 'CLOSED'].includes(c.status)
  );

  const handleApproveClosure = (ticket) => {
    updateComplaintStatus(ticket.token, 'CLOSED', 'Resolution verified and closed by Vigilance Supervisor.');
    showToast(`Grievance #${ticket.token} officially confirmed and closed.`);
  };

  const handleOpenReopen = (ticket) => {
    setActiveTicket(ticket);
    setReopenReason('');
    setShowReopenModal(true);
  };

  const handleExecuteReopen = (e) => {
    e.preventDefault();
    if (activeTicket) {
      updateComplaintStatus(
        activeTicket.token,
        'IN_PROGRESS',
        `Dispute Re-opened: ${reopenReason}. Sent back to ${activeTicket.assignedOfficer?.name || 'Nodal Officer'} for corrective work.`
      );
      showToast(`Grievance #${activeTicket.token} reopened and remanded back for remediation.`);
      setShowReopenModal(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-lg border border-outline/30 flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span className="font-body text-body-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header and Breadcrumbs */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Admin Command', to: '/admin/overview' },
            { label: 'Citizen Resolution Verification & CSAT Audit' },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-1">
          <div>
            <h1 className="font-headline text-headline-md font-bold text-on-surface tracking-tight">
              {lang === 'kn' ? 'ಪರಿಹಾರ ದೃಢೀಕರಣ ಮತ್ತು ನಾಗರಿಕ ತೃಪ್ತಿ ಆಡಿಟ್' : 'Resolution Verification & Citizen CSAT Audit'}
            </h1>
            <p className="font-body text-body-sm text-secondary">
              Review remediation proofs submitted by field cadres, inspect citizen satisfaction scores, and approve closure or dispute appeals.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
          <span className="font-body text-label-sm text-secondary font-semibold">Total Remedied</span>
          <div className="font-headline text-headline-sm font-extrabold text-on-surface mt-1">
            {resolvedList.length} Grievances
          </div>
          <span className="font-mono text-[10px] text-emerald-700 font-semibold">Field proof attached</span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
          <span className="font-body text-label-sm text-secondary font-semibold">Citizen Satisfaction (CSAT)</span>
          <div className="font-headline text-headline-sm font-extrabold text-emerald-700 mt-1">
            4.6 / 5.0
          </div>
          <span className="font-mono text-[10px] text-secondary">92% Positive Citizen Ratings</span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
          <span className="font-body text-label-sm text-secondary font-semibold">Citizen Dispute Appeals</span>
          <div className="font-headline text-headline-sm font-extrabold text-amber-700 mt-1">
            1 Under Dispute
          </div>
          <span className="font-mono text-[10px] text-secondary">Requires Supervisory Hearing</span>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs">
          <span className="font-body text-label-sm text-secondary font-semibold">Official Closure Rate</span>
          <div className="font-headline text-headline-sm font-extrabold text-primary mt-1">
            96.8%
          </div>
          <span className="font-mono text-[10px] text-secondary">No secondary reopening</span>
        </div>
      </div>

      {/* Verification Ledger Cards */}
      <div className="flex flex-col gap-4">
        {resolvedList.length === 0 ? (
          <div className="bg-surface-container-lowest p-12 rounded-2xl border border-outline-variant/30 text-center text-secondary">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">fact_check</span>
            <p className="font-semibold">No complaints currently awaiting resolution verification.</p>
          </div>
        ) : (
          resolvedList.map((ticket) => (
            <div
              key={ticket.token}
              className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-bold text-primary">
                    #{ticket.token}
                  </span>
                  <StatusBadge status={ticket.status} />
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed/40 font-mono text-[10px] font-bold text-secondary-fixed">
                    {ticket.departmentName}
                  </span>
                </div>

                <h3 className="font-headline text-title-md font-bold text-on-surface">
                  {ticket.title}
                </h3>
                <p className="font-body text-body-sm text-secondary">
                  Citizen: <strong>{ticket.citizenName}</strong> · District: {ticket.district} · Officer: {ticket.assignedOfficer?.name || 'Nodal Lead'}
                </p>

                {ticket.resolutionSummary && (
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 font-body text-body-xs text-on-surface">
                    <span className="font-bold text-emerald-800 block mb-0.5">Remediation Certificate Summary:</span>
                    {ticket.resolutionSummary}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-start md:self-center shrink-0">
                <Link
                  to={`/citizen/feedback/${ticket.token}`}
                  className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body text-label-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">reviews</span>
                  Citizen Feedback View
                </Link>

                <button
                  onClick={() => handleOpenReopen(ticket)}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-body text-label-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">replay</span>
                  Dispute & Reopen
                </button>

                {ticket.status !== 'CLOSED' && (
                  <button
                    onClick={() => handleApproveClosure(ticket)}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-body text-label-sm font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span className="material-symbols-outlined text-base">verified</span>
                    Confirm Closure
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dispute Reopen Modal */}
      {showReopenModal && activeTicket && (
        <Modal
          isOpen={showReopenModal}
          onClose={() => setShowReopenModal(false)}
          title={`Dispute Resolution & Reopen: #${activeTicket.token}`}
        >
          <form onSubmit={handleExecuteReopen} className="flex flex-col gap-4">
            <div>
              <span className="font-body text-label-sm font-semibold text-secondary block mb-0.5">
                Ticket Title
              </span>
              <p className="font-body text-body-sm font-bold text-on-surface p-2.5 rounded-lg bg-surface-container-low">
                {activeTicket.title}
              </p>
            </div>

            <div>
              <label className="block font-body text-label-sm font-semibold text-on-surface mb-1">
                Reason for Reopening / Incomplete Work Audit
              </label>
              <textarea
                rows={3}
                required
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="Explain why the field resolution is unsatisfactory (e.g. Citizen confirmed water is still murky, road resurfacing uneven)..."
                className="w-full p-3 rounded-xl bg-surface border border-outline-variant/50 font-body text-body-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setShowReopenModal(false)}
                className="px-4 py-2 rounded-xl hover:bg-surface-container font-body text-label-md font-semibold text-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-body text-label-md font-bold shadow-xs"
              >
                Remand for Corrective Work
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

