import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { ComplaintDetailsModal } from '../../components/complaints/ComplaintDetailsModal';

export const PendingComplaintsView = () => {
  const {
    complaints,
    officers,
    verifyComplaint,
    requestAdditionalInfo,
    rejectComplaint,
    assignComplaintOfficer,
    updateComplaintStatus
  } = useComplaints();

  const { lang } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL_PENDING'); // 'ALL_PENDING', 'NEEDS_VERIFICATION', 'NEEDS_ASSIGNMENT', 'ADDITIONAL_INFO'
  const [activeTicket, setActiveTicket] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isRequestInfoModalOpen, setIsRequestInfoModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [verificationNotes, setVerificationNotes] = useState('');
  const [requestInfoMessage, setRequestInfoMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter complaints in pending/verification stages
  const pendingComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const isPendingStage = ['NEWLY_REGISTERED', 'PENDING_VERIFICATION', 'SUBMITTED', 'ADDITIONAL_INFO_REQUIRED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'UNDER_REVIEW'].includes(c.status);
      if (!isPendingStage) return false;

      const q = searchQuery.toLowerCase().trim();
      const token = (c.trackingId || c.token || c.id || '').toLowerCase();
      const title = (c.title || '').toLowerCase();
      const citizenName = (c.citizenName || '').toLowerCase();
      const dept = (c.departmentName || '').toLowerCase();

      const matchesSearch = !q || token.includes(q) || title.includes(q) || citizenName.includes(q) || dept.includes(q);

      if (stageFilter === 'NEEDS_VERIFICATION') {
        return matchesSearch && (c.status === 'NEWLY_REGISTERED' || c.status === 'PENDING_VERIFICATION' || c.status === 'SUBMITTED');
      }
      if (stageFilter === 'NEEDS_ASSIGNMENT') {
        return matchesSearch && (c.status === 'VERIFIED' || !c.assignedOfficer);
      }
      if (stageFilter === 'ADDITIONAL_INFO') {
        return matchesSearch && c.status === 'ADDITIONAL_INFO_REQUIRED';
      }
      return matchesSearch;
    });
  }, [complaints, searchQuery, stageFilter]);

  const needsVerificationCount = complaints.filter(c => ['NEWLY_REGISTERED', 'PENDING_VERIFICATION', 'SUBMITTED'].includes(c.status)).length;
  const unassignedCount = complaints.filter(c => !c.assignedOfficer && c.status !== 'REJECTED' && c.status !== 'RESOLVED').length;
  const additionalInfoCount = complaints.filter(c => c.status === 'ADDITIONAL_INFO_REQUIRED').length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-teal-400">check_circle</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Admin Console', path: '/admin/overview' },
            { label: 'Grievance Verification & Triage Desk' }
          ]}
        />
        <h1 className="text-2xl sm:text-3xl font-bold font-headline text-slate-900 mt-1">
          Grievance Verification & Triage Desk
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Inspect newly submitted grievances, certify jurisdictional validity, request supplementary proofs, or assign to authorized nodal cadre.
        </p>
      </div>

      {/* Quick Summary Pill Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setStageFilter('ALL_PENDING')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            stageFilter === 'ALL_PENDING' ? 'border-teal-500 bg-teal-50/50 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total in Triage Queue</span>
          <p className="text-2xl font-mono font-bold text-slate-900 mt-1">{pendingComplaints.length}</p>
        </div>

        <div
          onClick={() => setStageFilter('NEEDS_VERIFICATION')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            stageFilter === 'NEEDS_VERIFICATION' ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Awaiting Verification</span>
          <p className="text-2xl font-mono font-bold text-amber-900 mt-1">{needsVerificationCount}</p>
        </div>

        <div
          onClick={() => setStageFilter('NEEDS_ASSIGNMENT')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            stageFilter === 'NEEDS_ASSIGNMENT' ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Awaiting Cadre Assignment</span>
          <p className="text-2xl font-mono font-bold text-blue-900 mt-1">{unassignedCount}</p>
        </div>

        <div
          onClick={() => setStageFilter('ADDITIONAL_INFO')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            stageFilter === 'ADDITIONAL_INFO' ? 'border-orange-500 bg-orange-50/50 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Citizen Info Requested</span>
          <p className="text-2xl font-mono font-bold text-orange-900 mt-1">{additionalInfoCount}</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter triage by Tracking ID, applicant name, department, or keyword..."
          className="w-full text-xs outline-none bg-transparent"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-slate-600">
            Clear
          </button>
        )}
      </div>

      {/* Verification Queue Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Tracking ID</th>
                <th className="py-3.5 px-4">Citizen Information</th>
                <th className="py-3.5 px-4">Grievance Description</th>
                <th className="py-3.5 px-4">Category & Department</th>
                <th className="py-3.5 px-4">Evidence</th>
                <th className="py-3.5 px-4">Triage Status</th>
                <th className="py-3.5 px-4 text-right">Verification Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-sm">No complaints currently awaiting verification in this stage.</p>
                  </td>
                </tr>
              ) : (
                pendingComplaints.map((ticket) => {
                  const token = ticket.trackingId || ticket.token || ticket.id;
                  const isNewlySubmitted = ticket.status === 'NEWLY_REGISTERED' || ticket.status === 'PENDING_VERIFICATION' || ticket.status === 'SUBMITTED';

                  return (
                    <tr key={token} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-800 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setActiveTicket(ticket);
                            setIsDossierOpen(true);
                          }}
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{token}</span>
                        </button>
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {(ticket.createdAt || ticket.regDate || '').slice(0, 10)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-900">{ticket.citizenName}</p>
                        <p className="font-mono text-[11px] text-slate-500">{ticket.citizenPhone}</p>
                        <p className="text-[10px] text-slate-500">{ticket.district}</p>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-slate-900 truncate">{ticket.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{ticket.description}</p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-medium text-teal-800">{ticket.category}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[140px]">{ticket.departmentName}</p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        {ticket.attachments?.length ? `${ticket.attachments.length} attached` : 'None'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={ticket.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isNewlySubmitted && (
                            <>
                              <button
                                onClick={() => {
                                  setActiveTicket(ticket);
                                  setVerificationNotes('');
                                  setIsVerifyModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] transition-all"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => {
                                  setActiveTicket(ticket);
                                  setRequestInfoMessage('');
                                  setIsRequestInfoModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition-all"
                              >
                                Request Info
                              </button>
                              <button
                                onClick={() => {
                                  setActiveTicket(ticket);
                                  setRejectionReason('');
                                  setIsRejectModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] transition-all"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => {
                              setActiveTicket(ticket);
                              setSelectedOfficerId(ticket.assignedOfficer?.id || officers[0]?.id || '');
                              setIsAssignModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition-all"
                          >
                            Assign Cadre
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dossier Modal */}
      {isDossierOpen && activeTicket && (
        <ComplaintDetailsModal
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
          ticket={activeTicket}
          onAssignOfficer={() => {
            setIsDossierOpen(false);
            setSelectedOfficerId(activeTicket.assignedOfficer?.id || officers[0]?.id || '');
            setIsAssignModalOpen(true);
          }}
          onVerify={() => {
            setIsDossierOpen(false);
            setIsVerifyModalOpen(true);
          }}
          onRequestInfo={() => {
            setIsDossierOpen(false);
            setIsRequestInfoModalOpen(true);
          }}
          onReject={() => {
            setIsDossierOpen(false);
            setIsRejectModalOpen(true);
          }}
        />
      )}

      {/* Verify Modal */}
      {isVerifyModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900">Verify Grievance #{activeTicket.token}</h3>
            <textarea
              rows={3}
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Verification scrutiny notes..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsVerifyModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs font-bold text-slate-600">Cancel</button>
              <button
                onClick={() => {
                  verifyComplaint(activeTicket.token, verificationNotes, 'Triage Officer');
                  showToast(`Complaint #${activeTicket.token} marked as Verified.`);
                  setIsVerifyModalOpen(false);
                }}
                className="px-4 py-1.5 bg-teal-700 text-white rounded-lg text-xs font-bold"
              >
                Certify & Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Info Modal */}
      {isRequestInfoModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900">Request Clarification from Citizen</h3>
            <textarea
              rows={3}
              value={requestInfoMessage}
              onChange={(e) => setRequestInfoMessage(e.target.value)}
              placeholder="Enter message for citizen..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsRequestInfoModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs font-bold text-slate-600">Cancel</button>
              <button
                onClick={() => {
                  if (!requestInfoMessage.trim()) return;
                  requestAdditionalInfo(activeTicket.token, requestInfoMessage, 'Triage Officer');
                  showToast(`Information requested for #${activeTicket.token}.`);
                  setIsRequestInfoModalOpen(false);
                }}
                className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-rose-900">Reject Grievance #{activeTicket.token}</h3>
            <p className="text-xs text-slate-600">Rejection reason is mandatory and recorded permanently.</p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Mandatory rejection reason..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsRejectModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs font-bold text-slate-600">Cancel</button>
              <button
                onClick={() => {
                  if (!rejectionReason.trim()) return;
                  rejectComplaint(activeTicket.token, rejectionReason, 'Triage Officer');
                  showToast(`Complaint #${activeTicket.token} rejected.`);
                  setIsRejectModalOpen(false);
                }}
                className="px-4 py-1.5 bg-rose-700 text-white rounded-lg text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {isAssignModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">Assign Officer for #{activeTicket.token}</h3>
            <div className="space-y-2 border rounded-xl p-2 max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
              {officers.map(o => (
                <div
                  key={o.id}
                  onClick={() => setSelectedOfficerId(o.id)}
                  className={`p-2.5 rounded cursor-pointer flex justify-between ${
                    selectedOfficerId === o.id ? 'bg-teal-50 border border-teal-300' : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="font-bold">{o.name}</p>
                    <p className="text-slate-500 font-mono text-[10px]">{o.badge} · {o.designation}</p>
                  </div>
                  <span className="font-mono text-[10px] text-slate-600">{o.activeCaseload || 0} active</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsAssignModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs font-bold text-slate-600">Cancel</button>
              <button
                onClick={() => {
                  if (!selectedOfficerId) return;
                  assignComplaintOfficer(activeTicket.token, selectedOfficerId, { assignedBy: 'Triage Desk' });
                  showToast(`Assigned #${activeTicket.token} to nodal officer.`);
                  setIsAssignModalOpen(false);
                }}
                className="px-4 py-1.5 bg-teal-700 text-white rounded-lg text-xs font-bold"
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingComplaintsView;
