import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Modal } from '../../components/common/Modal';

export const ResolutionApprovalView = () => {
  const { complaints, updateComplaintStatus } = useComplaints();
  const { lang } = useLanguage();

  const [activeTicket, setActiveTicket] = useState(null);
  const [showRemandModal, setShowRemandModal] = useState(false);
  const [remandRemarks, setRemandRemarks] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Candidates for resolution approval: RESOLVED, ACTION_TAKEN, or UNDER_REVIEW
  const pendingApprovals = complaints.filter((c) =>
    ['RESOLVED', 'ACTION_TAKEN', 'UNDER_REVIEW'].includes(c.status)
  );

  const handleApprove = (ticket) => {
    updateComplaintStatus(
      ticket.token,
      'CLOSED',
      'Remediation verified and signed off by Zonal Supervisor. Final closure certificate issued.'
    );
    showToast(`Docket #${ticket.token} successfully approved and closed.`);
  };

  const handleOpenRemand = (ticket) => {
    setActiveTicket(ticket);
    setRemandRemarks('');
    setShowRemandModal(true);
  };

  const handleExecuteRemand = (e) => {
    e.preventDefault();
    if (activeTicket) {
      updateComplaintStatus(
        activeTicket.token,
        'IN_PROGRESS',
        `Supervisory Remand: ${remandRemarks}. Returned to field engineer for corrective remediation.`
      );
      showToast(`Docket #${activeTicket.token} remanded back to field engineer.`);
      setShowRemandModal(false);
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
            { label: 'Supervisor Oversight', to: '/supervisor/dashboard' },
            { label: 'Remediation Sign-off & Resolution Approvals' },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-1">
          <div>
            <h1 className="font-headline text-headline-md font-bold text-on-surface tracking-tight">
              {lang === 'kn' ? 'ಪರಿಹಾರ ಅನುಮೋದನೆ ಮತ್ತು ಪ್ರಮಾಣೀಕರಣ' : 'Resolution Sign-off & Remediation Approval Gate'}
            </h1>
            <p className="font-body text-body-sm text-secondary">
              Statutory verification gate under Sakala Act 2026. Review field engineer proof before final grievance closure.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-body text-label-sm text-secondary font-semibold">Pending Approval Gate</span>
            <div className="font-headline text-headline-sm font-extrabold text-on-surface mt-1">
              {pendingApprovals.length} Dockets
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-body text-label-sm text-secondary font-semibold">Remediation Proofs Uploaded</span>
            <div className="font-headline text-headline-sm font-extrabold text-emerald-700 mt-1">
              100% Certified
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">photo_camera</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-body text-label-sm text-secondary font-semibold">Average Supervisor Audit Time</span>
            <div className="font-headline text-headline-sm font-extrabold text-secondary mt-1">
              1.4 Hours
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">timelapse</span>
          </div>
        </div>
      </div>

      {/* Approvals Docket Queue */}
      <div className="flex flex-col gap-4">
        {pendingApprovals.length === 0 ? (
          <div className="bg-surface-container-lowest p-12 rounded-2xl border border-outline-variant/30 text-center text-secondary font-body">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">assignment_turned_in</span>
            <p className="font-semibold">All field resolutions have been reviewed and approved.</p>
          </div>
        ) : (
          pendingApprovals.map((ticket) => (
            <div
              key={ticket.token}
              className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="flex flex-col gap-2 flex-1 font-body">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-sm font-bold text-primary">
                    #{ticket.token}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                    AWAITING SIGN-OFF
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed/30 font-mono text-[10px] font-bold text-secondary-fixed">
                    {ticket.departmentName}
                  </span>
                </div>

                <h3 className="font-headline text-title-md font-bold text-on-surface">
                  {ticket.title}
                </h3>

                <p className="text-body-sm text-secondary">
                  Filed by <strong>{ticket.citizenName}</strong> · Investigated by <strong>{ticket.assignedOfficer?.name || 'Nodal Engineer'}</strong>
                </p>

                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-body-xs text-on-surface mt-1">
                  <span className="font-bold text-emerald-800 block mb-0.5">
                    Field Engineer Completion Declaration:
                  </span>
                  {ticket.resolutionSummary || 'Remediation completed as per departmental technical specifications. Citizen inspection verified on site.'}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-start md:self-center shrink-0">
                <button
                  onClick={() => handleOpenRemand(ticket)}
                  className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-body text-label-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">replay</span>
                  Remand (Reject Proof)
                </button>

                <button
                  onClick={() => handleApprove(ticket)}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-body text-label-sm font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">verified</span>
                  Approve & Issue Certificate
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Remand Modal */}
      {showRemandModal && activeTicket && (
        <Modal
          isOpen={showRemandModal}
          onClose={() => setShowRemandModal(false)}
          title={`Remand Resolution: #${activeTicket.token}`}
        >
          <form onSubmit={handleExecuteRemand} className="flex flex-col gap-4 font-body">
            <div>
              <span className="text-label-sm font-semibold text-secondary block mb-0.5">Docket</span>
              <p className="text-body-sm font-bold text-on-surface p-2.5 rounded-lg bg-surface-container-low">
                {activeTicket.title}
              </p>
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">
                Reason for Rejecting Field Proof & Remanding to Cadre
              </label>
              <textarea
                rows={3}
                required
                value={remandRemarks}
                onChange={(e) => setRemandRemarks(e.target.value)}
                placeholder="State specific deficiency (e.g. Inadequate asphalt thickness, water sample purity certificate missing, uncompacted trench)..."
                className="w-full p-3 rounded-xl bg-surface border border-outline-variant/50 text-body-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setShowRemandModal(false)}
                className="px-4 py-2 rounded-xl hover:bg-surface-container text-label-md font-semibold text-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-label-md font-bold shadow-xs"
              >
                Send Remand Order
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

