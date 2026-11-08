import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { Modal } from '../../components/common/Modal';

export const AssignedComplaintsView = () => {
  const { complaints, updateComplaintStatus } = useComplaints();
  const { lang } = useLanguage();

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTicket, setActiveTicket] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [remarks, setRemarks] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // For demo, show complaints assigned to nodal engineer Er. Sandeep Kulkarni or show all if none
  const assignedList = complaints.filter((c) => {
    const isAssigned = c.assignedOfficer?.name?.includes('Sandeep') || true;
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch =
      c.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.citizenName.toLowerCase().includes(searchQuery.toLowerCase());
    return isAssigned && matchesStatus && matchesSearch;
  });

  const handleOpenStatusModal = (ticket) => {
    setActiveTicket(ticket);
    setNewStatus(ticket.status);
    setRemarks('');
    setShowStatusModal(true);
  };

  const handleSaveStatus = (e) => {
    e.preventDefault();
    if (activeTicket) {
      updateComplaintStatus(activeTicket.token, newStatus, remarks, 'Er. Sandeep Kulkarni (GAZ-9014)');
      showToast(`Complaint #${activeTicket.token} status updated to ${newStatus}.`);
      setShowStatusModal(false);
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
            { label: 'Officer Workspace', to: '/officer/dashboard' },
            { label: 'Assigned Complaints Queue' },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-1">
          <div>
            <h1 className="font-headline text-headline-md font-bold text-on-surface tracking-tight">
              {lang === 'kn' ? 'ನಿಯೋಜಿಸಲಾದ ದೂರುಗಳ ಪಟ್ಟಿ' : 'My Assigned Complaints Queue'}
            </h1>
            <p className="font-body text-body-sm text-secondary">
              Active departmental grievance portfolio assigned to Er. Sandeep Kulkarni (Executive Engineer · Jal Shakti).
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assigned cases by token, subject, citizen..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-outline-variant/40 font-body text-body-sm text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'IN_PROGRESS', 'OVERDUE', 'RESOLVED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl font-body text-label-xs font-bold transition-all ${
                filterStatus === status
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              {status === 'ALL' ? 'All Assigned' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List Cards */}
      <div className="grid grid-cols-1 gap-4">
        {assignedList.map((ticket) => (
          <div
            key={ticket.token}
            className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-primary/40 transition-all"
          >
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-sm font-bold text-primary">
                  #{ticket.token}
                </span>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-secondary-fixed/40 text-secondary-fixed">
                  {ticket.ward}
                </span>
              </div>

              <h3 className="font-headline text-title-md font-bold text-on-surface">
                {ticket.title}
              </h3>

              <p className="font-body text-body-sm text-secondary">
                Citizen: <strong>{ticket.citizenName}</strong> ({ticket.citizenPhone}) · Location: {ticket.location}
              </p>

              {/* Next best action pill */}
              {ticket.nextBestAction && (
                <div className="flex items-center gap-2 font-body text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-lg self-start">
                  <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                  <span><strong>AI Next Action:</strong> {ticket.nextBestAction}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-start md:self-center shrink-0">
              <div className="text-right sm:mr-3">
                <span className="font-mono text-xs text-secondary block">SLA Remaining</span>
                <span className={`font-mono text-sm font-bold ${ticket.hoursRemaining < 0 ? 'text-error' : 'text-emerald-700'}`}>
                  {ticket.hoursRemaining < 0 ? `${Math.abs(ticket.hoursRemaining)}h Overdue` : `${ticket.hoursRemaining} hours`}
                </span>
              </div>

              <button
                onClick={() => handleOpenStatusModal(ticket)}
                className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-body text-label-sm font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-base">edit_note</span>
                Update Status
              </button>

              <Link
                to={`/officer/complaints/${ticket.token}`}
                className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body text-label-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-base">folder_open</span>
                View Dossier
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Update Status Modal */}
      {showStatusModal && activeTicket && (
        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title={`Update Status: #${activeTicket.token}`}
        >
          <form onSubmit={handleSaveStatus} className="flex flex-col gap-4">
            <div>
              <span className="font-body text-label-sm font-semibold text-secondary block mb-0.5">
                Grievance Title
              </span>
              <p className="font-body text-body-sm font-bold text-on-surface p-2.5 rounded-lg bg-surface-container-low">
                {activeTicket.title}
              </p>
            </div>

            <div>
              <label className="block font-body text-label-sm font-semibold text-on-surface mb-1">
                Select Action State
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 font-body text-body-sm text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="IN_PROGRESS">IN_PROGRESS (Remediation team on site)</option>
                <option value="ACTION_TAKEN">ACTION_TAKEN (Field repair completed)</option>
                <option value="RESOLVED">RESOLVED (Remediation verified by engineer)</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW (Supervisory audit required)</option>
              </select>
            </div>

            <div>
              <label className="block font-body text-label-sm font-semibold text-on-surface mb-1">
                Field Inspection Remarks / Work Order Reference
              </label>
              <textarea
                rows={3}
                required
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="State repair details, contractor work order number, or replacement parts installed..."
                className="w-full p-3 rounded-xl bg-surface border border-outline-variant/50 font-body text-body-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 rounded-xl hover:bg-surface-container font-body text-label-md font-semibold text-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-body text-label-md font-bold shadow-xs"
              >
                Submit Action Report
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

