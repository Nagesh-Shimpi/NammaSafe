import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { Modal } from '../../components/common/Modal';

export const TeamComplaintsView = () => {
  const { complaints, officers, reassignOfficer, updateComplaintStatus } = useComplaints();
  const { lang } = useLanguage();

  const [selectedOfficerId, setSelectedOfficerId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTicket, setActiveTicket] = useState(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [targetOfficerId, setTargetOfficerId] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredTeamComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchOfficer =
        selectedOfficerId === 'ALL' || c.assignedOfficer?.id === selectedOfficerId;
      const matchStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
      const matchSearch =
        c.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.citizenName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchOfficer && matchStatus && matchSearch;
    });
  }, [complaints, selectedOfficerId, selectedStatus, searchQuery]);

  const handleOpenReassign = (ticket) => {
    setActiveTicket(ticket);
    const otherOfficer = officers.find(o => o.id !== ticket.assignedOfficer?.id) || officers[0];
    setTargetOfficerId(otherOfficer?.id || '');
    setShowReassignModal(true);
  };

  const handleExecuteReassignment = (e) => {
    e.preventDefault();
    if (activeTicket && targetOfficerId) {
      reassignOfficer(activeTicket.token, targetOfficerId);
      const recipient = officers.find(o => o.id === targetOfficerId);
      showToast(`Complaint #${activeTicket.token} reassigned to ${recipient?.name || 'Nodal Officer'}.`);
      setShowReassignModal(false);
    }
  };

  const handleElevatePriority = (ticket) => {
    updateComplaintStatus(ticket.token, ticket.status, 'Priority elevated to CRITICAL by Zonal Supervisor due to public sensitivity.');
    showToast(`Priority of #${ticket.token} escalated to CRITICAL.`);
  };

  const columns = [
    {
      header: 'Tracking Token',
      width: '130px',
      render: (row) => (
        <div className="flex flex-col">
          <Link
            to={`/officer/complaints/${row.token}`}
            className="font-mono text-xs font-bold text-primary hover:underline"
          >
            {row.token}
          </Link>
          <span className="font-mono text-[10px] text-secondary">
            {row.district}
          </span>
        </div>
      ),
    },
    {
      header: 'Subject & Citizen',
      render: (row) => (
        <div className="flex flex-col max-w-sm">
          <span className="font-body text-xs font-bold text-on-surface line-clamp-1">
            {row.title}
          </span>
          <span className="font-body text-[11px] text-secondary">
            {row.citizenName} · {row.ward}
          </span>
        </div>
      ),
    },
    {
      header: 'Assigned Cadre',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-body text-xs font-semibold text-on-surface">
            {row.assignedOfficer?.name || 'Unassigned'}
          </span>
          <span className="font-mono text-[10px] text-secondary">
            Badge: {row.assignedOfficer?.badge || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      header: 'Priority',
      width: '110px',
      render: (row) => <PriorityBadge priority={row.priority} />,
    },
    {
      header: 'Status',
      width: '130px',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'SLA Window',
      width: '130px',
      render: (row) => (
        <span className={`font-mono text-xs font-bold ${row.hoursRemaining < 0 ? 'text-error' : 'text-emerald-700'}`}>
          {row.hoursRemaining < 0 ? `${Math.abs(row.hoursRemaining)}h Breached` : `${row.hoursRemaining}h left`}
        </span>
      ),
    },
    {
      header: 'Supervisory Action',
      width: '140px',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenReassign(row)}
            title="Reassign Cadre"
            className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary font-body text-[11px] font-bold transition-colors"
          >
            Reassign
          </button>
          <button
            onClick={() => handleElevatePriority(row)}
            title="Elevate Priority"
            className="p-1 rounded hover:bg-error-container/30 text-secondary hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-base">priority_high</span>
          </button>
        </div>
      ),
    },
  ];

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
            { label: 'Team Complaints Master Caseload' },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-1">
          <div>
            <h1 className="font-headline text-headline-md font-bold text-on-surface tracking-tight">
              {lang === 'kn' ? 'ತಂಡದ ದೂರುಗಳ ವಿಲೇವಾರಿ ನಿಯಂತ್ರಣ' : 'Team Complaints Master Caseload'}
            </h1>
            <p className="font-body text-body-sm text-secondary">
              Zone 1 aggregate active dossiers, officer rebalancing controls, and priority elevation authority.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team dossiers by token, subject, citizen..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-outline-variant/40 font-body text-body-sm text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedOfficerId}
            onChange={(e) => setSelectedOfficerId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 font-body text-label-sm font-semibold text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Team Officers</option>
            {officers.map((off) => (
              <option key={off.id} value={off.id}>
                {off.name} ({off.badge})
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 font-body text-label-sm font-semibold text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="OVERDUE">Overdue</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs">
        <DataTable
          columns={columns}
          data={filteredTeamComplaints}
          pageSize={8}
          emptyMessage="No grievances match the specified team filters."
        />
      </div>

      {/* Reassign Modal */}
      {showReassignModal && activeTicket && (
        <Modal
          isOpen={showReassignModal}
          onClose={() => setShowReassignModal(false)}
          title={`Reassign Team Dossier: #${activeTicket.token}`}
        >
          <form onSubmit={handleExecuteReassignment} className="flex flex-col gap-4 font-body">
            <div>
              <span className="text-label-sm font-semibold text-secondary block mb-0.5">Title</span>
              <p className="text-body-sm font-bold text-on-surface p-2.5 rounded-lg bg-surface-container-low">
                {activeTicket.title}
              </p>
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">
                Select Destination Officer
              </label>
              <select
                value={targetOfficerId}
                onChange={(e) => setTargetOfficerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/50 text-body-sm text-on-surface focus:outline-none focus:border-primary"
              >
                {officers.map((off) => (
                  <option key={off.id} value={off.id}>
                    {off.name} ({off.badge}) · Caseload: {off.activeCaseload}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setShowReassignModal(false)}
                className="px-4 py-2 rounded-xl hover:bg-surface-container text-label-md font-semibold text-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-label-md font-bold shadow-xs"
              >
                Confirm Reassignment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

