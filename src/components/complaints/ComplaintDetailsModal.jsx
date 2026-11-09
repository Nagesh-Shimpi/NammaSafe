import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';

export const ComplaintDetailsModal = ({ isOpen, onClose, ticket, onAssignOfficer, onUpdateStatus, onVerify, onRequestInfo, onReject }) => {
  if (!isOpen || !ticket) return null;

  const [activeTab, setActiveTab] = useState('overview');
  const { reminders, escalations, communications, complaintHistory } = useComplaints();

  const token = ticket.trackingId || ticket.token || ticket.id;

  // Filter linked records from shared state
  const ticketReminders = reminders.filter(r => r.token === ticket.token || r.token === ticket.id || r.token === ticket.trackingId || r.token === ticket.legacyToken);
  const ticketEscalations = escalations.filter(e => e.complaintId === ticket.token || e.complaintId === ticket.id || e.complaintId === ticket.trackingId || e.complaintId === ticket.legacyToken);
  const ticketCommunications = communications.filter(c => c.token === ticket.token || c.token === ticket.id || c.token === ticket.trackingId || c.token === ticket.legacyToken);
  const ticketHistories = complaintHistory.filter(h => h.complaintId === ticket.token || h.complaintId === ticket.id || h.complaintId === ticket.trackingId || h.complaintId === ticket.legacyToken);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'citizen', label: 'Citizen Info', icon: 'person' },
    { id: 'description', label: 'Description', icon: 'description' },
    { id: 'attachments', label: `Attachments (${ticket.attachments?.length || 0})`, icon: 'attach_file' },
    { id: 'assignment', label: 'Dept & Cadre', icon: 'badge' },
    { id: 'reminders', label: `Reminders (${ticketReminders.length})`, icon: 'notification_important' },
    { id: 'escalations', label: `Escalations (${ticketEscalations.length})`, icon: 'crisis_alert' },
    { id: 'communications', label: `Communications (${ticketCommunications.length})`, icon: 'forum' },
    { id: 'timeline', label: 'Activity Timeline', icon: 'history' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">folder_open</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-teal-300">#{token}</span>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
              <h1 className="text-base sm:text-lg font-bold font-headline truncate max-w-xl text-white mt-0.5">
                {ticket.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/admin/complaints/${token}`}
              onClick={onClose}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-sm"
            >
              <span>Full Audit Dossier</span>
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </Link>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="px-5 bg-slate-50 border-b border-slate-200 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-3 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-800 bg-white font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body / Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Status Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Status</span>
                  <div className="mt-1">
                    <StatusBadge status={ticket.status} />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Priority / Urgency</span>
                  <div className="mt-1">
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Follow-Up Deadline</span>
                  <p className="mt-1 text-sm font-mono font-bold text-slate-900">
                    {ticket.followUpDeadline || 'Within 48h'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Verification State</span>
                  <p className="mt-1 text-xs font-mono font-bold text-teal-700">
                    {ticket.verificationStatus || 'VERIFIED'}
                  </p>
                </div>
              </div>

              {/* Summary Metadata Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Citizen Applicant</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{ticket.citizenName}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{ticket.citizenPhone} · {ticket.citizenEmail}</p>
                  <p className="text-xs text-slate-600 mt-1">{ticket.ward}, {ticket.taluk}, {ticket.district}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Administrative Routing</span>
                  <p className="font-semibold text-teal-800 mt-0.5">{ticket.departmentName}</p>
                  <p className="text-xs text-slate-600 mt-0.5">Category: {ticket.category} · {ticket.subcategory}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Assigned Officer: <strong className="text-slate-800">{ticket.assignedOfficer ? ticket.assignedOfficer.name : 'Unassigned (Awaiting Cadre Allocation)'}</strong>
                  </p>
                </div>
              </div>

              {/* Next Best Action Banner */}
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-teal-700 text-xl">psychology</span>
                  <div>
                    <span className="text-xs font-bold text-teal-950 uppercase tracking-wider">Recommended Next Action:</span>
                    <p className="text-xs text-teal-900 mt-0.5">{ticket.nextBestAction || 'Conduct field inspection and issue status notice'}</p>
                  </div>
                </div>
                {ticket.status === 'NEWLY_REGISTERED' || ticket.status === 'PENDING_VERIFICATION' ? (
                  <button
                    onClick={() => onVerify?.(ticket)}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-sm shrink-0"
                  >
                    Verify Docket Now
                  </button>
                ) : (
                  <button
                    onClick={() => onAssignOfficer?.(ticket)}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-sm shrink-0"
                  >
                    Assign / Reassign Officer
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CITIZEN INFORMATION */}
          {activeTab === 'citizen' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-sm">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{ticket.citizenName}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Number</span>
                  <p className="font-mono text-slate-900 mt-0.5">{ticket.citizenPhone}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                  <p className="text-slate-700 mt-0.5">{ticket.citizenEmail || 'Not Provided'}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gender</span>
                  <p className="text-slate-800 mt-0.5">{ticket.gender || 'Not Disclosed'}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">District</span>
                  <p className="font-medium text-slate-900 mt-0.5">{ticket.district}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taluk</span>
                  <p className="text-slate-800 mt-0.5">{ticket.taluk}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Village / Ward</span>
                  <p className="text-slate-800 mt-0.5">{ticket.ward}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">PIN Code</span>
                  <p className="font-mono text-slate-800 mt-0.5">{ticket.pincode}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Intake Channel</span>
                  <p className="text-slate-800 mt-0.5">{ticket.submissionChannel || 'Citizen Web Portal'}</p>
                </div>
                <div className="sm:col-span-2 md:col-span-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Street Address</span>
                  <p className="text-slate-800 mt-0.5">{ticket.address || 'Karnataka, India'}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPLAINT DESCRIPTION */}
          {activeTab === 'description' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Title</span>
                <p className="text-base font-bold text-slate-900 mt-1">{ticket.title}</p>
                {ticket.titleKn && (
                  <p className="text-sm font-medium text-slate-600 mt-1 font-kannada">{ticket.titleKn}</p>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Narrative Description</span>
                <p className="text-sm text-slate-800 mt-2 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Incident Date</span>
                  <p className="text-sm font-mono text-slate-800 mt-1">{ticket.incidentDate || '2026-11-04'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location / GPS Stamp</span>
                  <p className="text-sm font-mono text-slate-800 mt-1">{ticket.location || '12.9716° N, 77.5946° E'}</p>
                </div>
              </div>

              {ticket.rejectionReason && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Official Rejection Justification:</span>
                  <p className="text-xs mt-1">{ticket.rejectionReason}</p>
                </div>
              )}

              {ticket.additionalInfoPrompt && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Information Requested From Citizen:</span>
                  <p className="text-xs mt-1">{ticket.additionalInfoPrompt}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ATTACHMENTS */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              {(!ticket.attachments || ticket.attachments.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                  <span className="material-symbols-outlined text-4xl text-slate-300">attach_file_off</span>
                  <p className="text-sm mt-2 font-medium">No supporting evidence documents attached to this docket.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ticket.attachments.map((file, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-xl">
                            {file.type?.includes('pdf') ? 'picture_as_pdf' : 'image'}
                          </span>
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{file.type || 'Document'} · {file.size || '1.8 MB'}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold shrink-0">
                        VERIFIED
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DEPARTMENT & OFFICER ASSIGNMENT */}
          {activeTab === 'assignment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Department Info */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Designated Department</span>
                  <h3 className="text-base font-bold text-teal-900">{ticket.departmentName}</h3>
                  <p className="text-xs text-slate-600">ID: <span className="font-mono">{ticket.departmentId}</span></p>
                  <p className="text-xs text-slate-500">
                    Statutory jurisdictional authority for {ticket.category} grievances.
                  </p>
                </div>

                {/* Assigned Officer Info */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Nodal Officer</span>
                    {ticket.assignedOfficer && (
                      <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono text-[10px] font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  {ticket.assignedOfficer ? (
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{ticket.assignedOfficer.name}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {ticket.assignedOfficer.badge || ticket.assignedOfficer.employeeId} · {ticket.assignedOfficer.designation}
                      </p>
                      <p className="text-xs font-mono text-slate-500 mt-1">{ticket.assignedOfficer.mobile}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-amber-700">Currently Unassigned</p>
                      <p className="text-xs text-slate-500 mt-0.5">This ticket requires supervisory cadre allocation.</p>
                    </div>
                  )}
                  <div className="pt-2">
                    <button
                      onClick={() => onAssignOfficer?.(ticket)}
                      className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      <span>{ticket.assignedOfficer ? 'Reassign to Another Officer' : 'Assign Officer'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: REMINDER HISTORY */}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              {ticketReminders.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                  <span className="material-symbols-outlined text-4xl text-slate-300">notifications_off</span>
                  <p className="text-sm mt-2 font-medium">No statutory reminders generated for this ticket yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {ticketReminders.map((rem) => (
                    <div key={rem.id} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-teal-800">{rem.id}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-700">
                            {rem.channel}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rem.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {rem.status}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800 mt-1">{rem.subject}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Recipient: {rem.recipientName} ({rem.recipientRole}) · Scheduled: {rem.scheduledTime}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: ESCALATION HISTORY */}
          {activeTab === 'escalations' && (
            <div className="space-y-4">
              {ticketEscalations.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                  <span className="material-symbols-outlined text-4xl text-slate-300">verified</span>
                  <p className="text-sm mt-2 font-medium">No escalation breaches recorded for this grievance.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ticketEscalations.map((esc) => (
                    <div key={esc.id} className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-200 text-purple-900 font-bold font-mono">
                          {esc.escalationTier} · Level {esc.currentLevel || 1}
                        </span>
                        <span className="text-slate-500 font-mono">{esc.timestamp || '2026-11-06'}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">{esc.reason}</p>
                      <p className="text-[11px] text-slate-600">
                        Target Authority: <strong className="text-slate-800">{esc.targetAuthority || 'Zonal Joint Commissioner'}</strong> · Penalty Exposure: <span className="text-rose-700 font-mono font-bold">{esc.penaltyExposure || 'None'}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: COMMUNICATION HISTORY */}
          {activeTab === 'communications' && (
            <div className="space-y-4">
              {ticketCommunications.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                  <span className="material-symbols-outlined text-4xl text-slate-300">chat</span>
                  <p className="text-sm mt-2 font-medium">No direct citizen communications logged yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {ticketCommunications.map((comm) => (
                    <div key={comm.id} className="p-4 bg-white text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-teal-800">{comm.channel}</span>
                        <span className="text-slate-500 font-mono">{comm.timestamp}</span>
                      </div>
                      <p className="font-semibold text-slate-800">{comm.subject || 'Citizen Notification'}</p>
                      <p className="text-slate-600">{comm.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: COMPLAINT ACTIVITY TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="relative border-l-2 border-teal-200 pl-4 ml-2 space-y-6">
                {(ticket.actions || []).map((action, i) => (
                  <div key={i} className="relative group">
                    <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-teal-600 border-2 border-white ring-2 ring-teal-200" />
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 uppercase tracking-wider">{action.type}</span>
                        <span className="font-mono text-slate-500">{action.date}</span>
                      </div>
                      <p className="text-slate-700">{action.text}</p>
                      <p className="text-[11px] text-teal-700 font-semibold font-mono">By: {action.user}</p>
                    </div>
                  </div>
                ))}

                {ticketHistories.map((hist, i) => (
                  <div key={'h-' + i} className="relative group">
                    <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-slate-400 border-2 border-white ring-2 ring-slate-200" />
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{hist.eventType}</span>
                        <span className="font-mono text-slate-500">{hist.timestamp}</span>
                      </div>
                      <p className="text-slate-700">{hist.description}</p>
                      <p className="text-[11px] text-slate-500 font-mono">User: {hist.responsibleUser}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {ticket.verificationStatus === 'PENDING' && (
              <>
                <button
                  onClick={() => onVerify?.(ticket)}
                  className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>Verify Complaint</span>
                </button>
                <button
                  onClick={() => onRequestInfo?.(ticket)}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">contact_support</span>
                  <span>Request Info</span>
                </button>
                <button
                  onClick={() => onReject?.(ticket)}
                  className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  <span>Reject</span>
                </button>
              </>
            )}

            <button
              onClick={() => onAssignOfficer?.(ticket)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">person_pin</span>
              <span>{ticket.assignedOfficer ? 'Reassign Officer' : 'Assign Officer'}</span>
            </button>

            <button
              onClick={() => onUpdateStatus?.(ticket)}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">sync_alt</span>
              <span>Update Status</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailsModal;

