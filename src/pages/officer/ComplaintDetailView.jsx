import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { Modal } from '../../components/common/Modal';

export const ComplaintDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { currentRole, USER_ROLES } = useAuth();

  const {
    complaints,
    officers,
    departments,
    getComplaintDetails,
    getComplaintActivities,
    submitOfficerAction,
    submitResolution,
    recordCitizenAcceptance,
    recordReopening,
    recordFinalClosure,
    updateComplaintStatus,
    updateComplaintDetails,
    reassignOfficer,
    sendComplaintReminder,
    addAuditRecord
  } = useComplaints();

  // Find candidate ticket
  const ticket = useMemo(() => {
    const norm = String(id || '').toUpperCase().trim();
    return complaints.find(c =>
      (c.token && c.token.toUpperCase() === norm) ||
      (c.trackingId && c.trackingId.toUpperCase() === norm) ||
      (c.id && c.id.toUpperCase() === norm) ||
      (c.legacyToken && c.legacyToken.toUpperCase() === norm)
    ) || complaints[0];
  }, [complaints, id]);

  const token = ticket?.trackingId || ticket?.token || ticket?.id || '';

  // Get full enriched details and activities from context
  const details = useMemo(() => getComplaintDetails(token), [getComplaintDetails, token, ticket]);
  const activities = useMemo(() => getComplaintActivities(token), [getComplaintActivities, token, ticket]);

  // Tab State
  const [activeTab, setActiveTab] = useState('overview');

  // PII Masking State
  const [unmaskPII, setUnmaskPII] = useState(currentRole === USER_ROLES.ADMIN || currentRole === USER_ROLES.SUPERVISOR);

  // Timeline Filters (Section 4)
  const [timelineTypeFilter, setTimelineTypeFilter] = useState('ALL');
  const [timelineActorFilter, setTimelineActorFilter] = useState('ALL');

  // Toast / Banner Notifications
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // -------------------------------------------------------------------------
  // MODAL STATES
  // -------------------------------------------------------------------------

  // 1. Submit Resolution Modal (Section 5)
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [resolutionForm, setResolutionForm] = useState({
    title: '',
    description: '',
    actionTaken: '',
    category: 'Physical Repair & Reconstruction',
    completionDate: new Date().toISOString().substring(0, 10),
    officerRemarks: '',
    documents: []
  });
  const [newResDocName, setNewResDocName] = useState('');

  // 2. Record Officer Action Modal (Section 3 Tab 4)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionForm, setActionForm] = useState({
    actionType: 'FIELD_INSPECTION',
    description: '',
    officerName: details?.assignedOfficer?.name || 'Er. Sandeep Kulkarni',
    nextStep: '',
    statusUpdate: ticket?.status || 'IN_PROGRESS',
    documents: []
  });
  const [newActionDocName, setNewActionDocName] = useState('');

  // 3. Status Update Modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusForm, setStatusForm] = useState({
    newStatus: ticket?.status || 'IN_PROGRESS',
    remarks: ''
  });

  // 4. Reassign Officer Modal (Section 3 Tab 3)
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignForm, setReassignForm] = useState({
    targetOfficerId: '',
    reason: 'Caseload Rebalancing & Optimal Cadre Allocation',
    notes: 'Reassigned per GovOps Section 14 workload protocols.'
  });

  // 5. Create Reminder Modal (Section 3 Tab 5)
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    channel: 'IN_APP',
    recipientName: details?.assignedOfficer?.name || 'Assigned Officer',
    subject: `Follow-up SLA Check for #${token}`,
    notes: 'Urgent reminder regarding approaching statutory deadline.'
  });

  // 6. Citizen Resolution Review Modal (Section 6)
  const [isCitizenReviewModalOpen, setIsCitizenReviewModalOpen] = useState(false);
  const [citizenReviewMode, setCitizenReviewMode] = useState('ACCEPT'); // 'ACCEPT' | 'REOPEN'
  const [citizenReviewNotes, setCitizenReviewNotes] = useState('');
  const [reopenReasonCategory, setReopenReasonCategory] = useState('Work Incomplete or Superficial');
  const [reopenEvidenceName, setReopenEvidenceName] = useState('');
  const [reopenEvidenceList, setReopenEvidenceList] = useState([]);

  // 7. Edit Complaint Details Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: ticket?.title || '',
    description: ticket?.description || '',
    priority: ticket?.priority || 'HIGH',
    ward: ticket?.ward || '',
    district: ticket?.district || ''
  });

  // 8. Document Upload Modal (Section 9)
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [uploadDocForm, setUploadDocForm] = useState({
    name: '',
    type: 'Image (JPEG/PNG)',
    relatedActivity: 'Site Inspection Report'
  });

  if (!ticket || !details) {
    return (
      <div className="py-20 text-center max-w-xl mx-auto px-4">
        <span className="material-symbols-outlined text-5xl text-slate-400">folder_off</span>
        <h2 className="text-xl font-bold font-headline text-slate-800 mt-2">Complaint Docket Not Found</h2>
        <p className="text-slate-500 text-xs mt-1">The requested tracking token could not be located in the audit records.</p>
        <Link
          to="/admin/all-complaints"
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>Return to Complaints Ledger</span>
        </Link>
      </div>
    );
  }

  // Filter activities
  const filteredActivities = activities.filter(act => {
    const matchType = timelineTypeFilter === 'ALL' || act.eventType === timelineTypeFilter;
    const matchActor = timelineActorFilter === 'ALL' || act.actor === timelineActorFilter;
    return matchType && matchActor;
  });

  // Unique activity types and actors for filters
  const uniqueActivityTypes = Array.from(new Set(activities.map(a => a.eventType))).filter(Boolean);
  const uniqueActors = Array.from(new Set(activities.map(a => a.actor))).filter(Boolean);

  // -------------------------------------------------------------------------
  // ACTION HANDLERS
  // -------------------------------------------------------------------------

  // 1. Submit Resolution Handler (Section 5)
  const handleResolutionSubmit = (e) => {
    e.preventDefault();
    if (!resolutionForm.title || !resolutionForm.description) {
      showToast('Please provide a resolution title and description.', 'error');
      return;
    }
    const res = submitResolution(token, {
      resolutionTitle: resolutionForm.title,
      resolutionDescription: resolutionForm.description,
      actionTaken: resolutionForm.actionTaken || 'Remediation completed per technical specifications.',
      resolutionCategory: resolutionForm.category,
      completionDate: resolutionForm.completionDate,
      supportingDocuments: resolutionForm.documents,
      officerRemarks: resolutionForm.officerRemarks,
      submittedBy: details.assignedOfficer?.name || 'Er. Sandeep Kulkarni'
    });

    if (res.success) {
      showToast(`Resolution successfully submitted for #${token}. Citizen notified for verification!`);
      setIsResolutionModalOpen(false);
      setResolutionForm({ title: '', description: '', actionTaken: '', category: 'Physical Repair & Reconstruction', completionDate: new Date().toISOString().substring(0, 10), officerRemarks: '', documents: [] });
    }
  };

  // 2. Submit Officer Action Handler (Section 3 Tab 4)
  const handleActionSubmit = (e) => {
    e.preventDefault();
    if (!actionForm.description) {
      showToast('Please describe the field inspection or action taken.', 'error');
      return;
    }

    const res = submitOfficerAction(token, {
      actionType: actionForm.actionType,
      description: actionForm.description,
      officerName: actionForm.officerName || details.assignedOfficer?.name,
      nextStep: actionForm.nextStep,
      statusUpdate: actionForm.statusUpdate,
      supportingDocuments: actionForm.documents
    });

    if (res.success) {
      showToast(`Action recorded and committed to the immutable audit gazette.`);
      setIsActionModalOpen(false);
      setActionForm({ actionType: 'FIELD_INSPECTION', description: '', officerName: details.assignedOfficer?.name || '', nextStep: '', statusUpdate: 'IN_PROGRESS', documents: [] });
    }
  };

  // 3. Status Update Handler
  const handleStatusSubmit = (e) => {
    e.preventDefault();
    updateComplaintStatus(token, statusForm.newStatus, statusForm.remarks, details.assignedOfficer?.name || 'Nodal Cadre');
    addAuditRecord({
      complaintId: token,
      action: 'Operational Status Change',
      performedBy: details.assignedOfficer?.name || 'Nodal Officer',
      userRole: 'OFFICER',
      previousValue: ticket.status,
      newValue: statusForm.newStatus,
      remarks: statusForm.remarks || 'Routine operational status progression.',
      category: 'GOVERNANCE'
    });
    showToast(`Status updated to ${statusForm.newStatus}.`);
    setIsStatusModalOpen(false);
    setStatusForm({ newStatus: ticket.status, remarks: '' });
  };

  // 4. Reassign Officer Handler (Section 3 Tab 3)
  const handleReassignSubmit = (e) => {
    e.preventDefault();
    if (!reassignForm.targetOfficerId) {
      showToast('Please select a target nodal officer.', 'error');
      return;
    }
    const success = reassignOfficer(token, reassignForm.targetOfficerId, {
      reason: reassignForm.reason,
      notes: reassignForm.notes,
      initiatedBy: 'Central Admin Desk',
      approvedBy: 'Shri Vikram Malhotra, IAS'
    });
    if (success) {
      showToast(`Docket #${token} successfully reassigned with full audit trail!`);
      setIsReassignModalOpen(false);
    }
  };

  // 5. Send Reminder Handler
  const handleReminderSubmit = (e) => {
    e.preventDefault();
    const res = sendComplaintReminder({
      complaintToken: token,
      channel: reminderForm.channel,
      recipientName: reminderForm.recipientName,
      subject: reminderForm.subject,
      notes: reminderForm.notes
    });
    if (res.duplicate) {
      showToast(res.message, 'warning');
    } else {
      showToast(`Reminder dispatched via ${reminderForm.channel} to ${reminderForm.recipientName}!`);
      setIsReminderModalOpen(false);
    }
  };

  // 6. Citizen Resolution Review Handler (Section 6)
  const handleCitizenReviewSubmit = (e) => {
    e.preventDefault();
    if (citizenReviewMode === 'ACCEPT') {
      recordCitizenAcceptance(token, citizenReviewNotes);
      showToast(`Resolution officially confirmed as satisfactory. Grievance closed.`);
      setIsCitizenReviewModalOpen(false);
    } else {
      if (!citizenReviewNotes.trim()) {
        showToast('Please provide details explaining why the resolution is incomplete.', 'error');
        return;
      }
      recordReopening(token, reopenReasonCategory, citizenReviewNotes, reopenEvidenceList);
      showToast(`Resolution disputed. Grievance #${token} reopened for re-inspection.`);
      setIsCitizenReviewModalOpen(false);
    }
  };

  // 7. Edit Complaint Details Handler
  const handleEditDetailsSubmit = (e) => {
    e.preventDefault();
    updateComplaintDetails(token, editForm, 'Central Admin Desk');
    addAuditRecord({
      complaintId: token,
      action: 'Complaint Permitted Fields Edited',
      performedBy: 'Central Admin Desk',
      userRole: 'ADMIN',
      previousValue: `Title: ${ticket.title}, Priority: ${ticket.priority}`,
      newValue: `Title: ${editForm.title}, Priority: ${editForm.priority}`,
      remarks: 'Administrative update of complaint classification and narrative.',
      category: 'GOVERNANCE'
    });
    showToast('Complaint details updated and version recorded.');
    setIsEditModalOpen(false);
  };

  // 8. Upload Document Handler (Section 9)
  const handleUploadDocSubmit = (e) => {
    e.preventDefault();
    if (!uploadDocForm.name) {
      showToast('Please enter document filename.', 'error');
      return;
    }
    const newDoc = {
      name: uploadDocForm.name,
      size: `${(Math.random() * 2 + 0.8).toFixed(1)} MB`,
      type: uploadDocForm.type,
      uploadedBy: currentRole === USER_ROLES.CITIZEN ? ticket.citizenName : 'Nodal Engineer',
      uploadDate: new Date().toISOString().substring(0, 10),
      relatedActivity: uploadDocForm.relatedActivity
    };

    updateComplaintDetails(token, {
      attachments: [...(ticket.attachments || []), newDoc]
    });

    addAuditRecord({
      complaintId: token,
      action: 'Supporting Document Uploaded',
      performedBy: newDoc.uploadedBy,
      userRole: currentRole === USER_ROLES.CITIZEN ? 'CITIZEN' : 'OFFICER',
      previousValue: 'None',
      newValue: newDoc.name,
      remarks: `Uploaded ${newDoc.type} for ${newDoc.relatedActivity}.`,
      category: 'CADRE_ACTION'
    });

    showToast(`Document "${newDoc.name}" uploaded successfully.`);
    setIsUploadDocModalOpen(false);
    setUploadDocForm({ name: '', type: 'Image (JPEG/PNG)', relatedActivity: 'Site Inspection Report' });
  };

  const tabs = [
    { id: 'overview', label: '1. Overview', icon: 'dashboard' },
    { id: 'citizen', label: '2. Citizen Info', icon: 'person' },
    { id: 'assignment', label: '3. Dept & Cadre', icon: 'badge' },
    { id: 'actions', label: `4. Officer Actions (${ticket.actions?.length || 0})`, icon: 'engineering' },
    { id: 'reminders', label: `5. Reminders (${details.reminders?.length || 0})`, icon: 'notification_important' },
    { id: 'escalations', label: `6. Escalations (${details.escalations?.length || 0})`, icon: 'crisis_alert' },
    { id: 'communications', label: `7. Communications (${details.communications?.length || 0})`, icon: 'forum' },
    { id: 'resolution', label: '8. Resolution & CSAT', icon: 'verified' },
    { id: 'timeline', label: `9. Timeline (${activities.length})`, icon: 'history' },
    { id: 'audit', label: `10. Audit Gazette (${details.auditLogs?.length || 0})`, icon: 'gavel' },
    { id: 'documents', label: `11. Documents (${ticket.attachments?.length || 0})`, icon: 'attach_file' }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold ${
          toastMessage.type === 'error'
            ? 'bg-rose-50 border-rose-300 text-rose-900'
            : toastMessage.type === 'warning'
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-emerald-50 border-emerald-300 text-emerald-900'
        }`}>
          <span className="material-symbols-outlined text-lg">
            {toastMessage.type === 'error' ? 'error' : toastMessage.type === 'warning' ? 'warning' : 'check_circle'}
          </span>
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Top Breadcrumb & Return Route */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumb
          items={[
            { label: currentRole === USER_ROLES.SUPERVISOR ? 'Supervisor' : 'Admin Command', to: currentRole === USER_ROLES.SUPERVISOR ? '/supervisor/dashboard' : '/admin/overview' },
            { label: 'Complaints Ledger', to: '/admin/all-complaints' },
            { label: `Audit Dossier #${token}` }
          ]}
        />

        <div className="flex items-center gap-2">
          <Link
            to="/admin/complaint-audit"
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-200"
          >
            <span className="material-symbols-outlined text-sm">manage_search</span>
            <span>Audit Search</span>
          </Link>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-200"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            <span>Print Gazette</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 1. PROMINENT COMPLAINT HEADER (Section 2) */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xl sm:text-2xl font-black text-teal-800 tracking-tight">
                #{token}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
              {ticket.legacyToken && ticket.legacyToken !== token && (
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Legacy: #{ticket.legacyToken}
                </span>
              )}
              {ticket.escalationTier && ticket.escalationTier !== 'NONE' && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono text-[11px] font-bold border border-rose-200 animate-pulse">
                  ⚡ {ticket.escalationTier} ESCALATION
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-headline text-slate-900 leading-snug">
              {ticket.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-slate-400">domain</span>
                <strong className="text-slate-800">{ticket.departmentName || ticket.category}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-slate-400">calendar_today</span>
                <span>Registered: <strong className="font-mono text-slate-700">{ticket.createdAt || 'N/A'}</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-slate-400">update</span>
                <span>Last Updated: <strong className="font-mono text-slate-700">{ticket.updatedAt || 'Recent'}</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-slate-400">location_on</span>
                <span>{ticket.ward}, {ticket.district}</span>
              </span>
            </div>
          </div>

          {/* Officer & Health Gauge Widget */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0">
            {/* Assigned Officer Mini Card */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0">
                {details.assignedOfficer?.name ? details.assignedOfficer.name.slice(0, 2).toUpperCase() : '??'}
              </div>
              <div className="text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Assigned Nodal Cadre</span>
                <span className="font-bold text-slate-900 block">
                  {details.assignedOfficer?.name || 'Unassigned Cadre'}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {details.assignedOfficer?.badge || details.assignedOfficer?.designation || 'Pending allocation'}
                </span>
              </div>
            </div>

            <div className="w-px h-10 bg-slate-200" />

            {/* Health Score */}
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Health Score</span>
              <div className={`font-mono text-2xl font-black mt-0.5 ${
                (ticket.healthScore || 80) >= 70 ? 'text-emerald-600' : (ticket.healthScore || 80) >= 40 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {ticket.healthScore || 80}/100
              </div>
              <span className="text-[10px] font-semibold text-slate-500">
                {details.healthIndicators?.escalationRisk?.label || 'Monitored'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Ribbon (Section 2) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Quick Actions:</span>

          {/* Edit Complaint */}
          {(currentRole === USER_ROLES.ADMIN || currentRole === USER_ROLES.SUPERVISOR) && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              <span>Edit Details</span>
            </button>
          )}

          {/* Assign / Reassign Officer */}
          {(currentRole === USER_ROLES.ADMIN || currentRole === USER_ROLES.SUPERVISOR) && (
            <button
              onClick={() => setIsReassignModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold flex items-center gap-1 transition-colors border border-teal-200/60"
            >
              <span className="material-symbols-outlined text-sm">sync_alt</span>
              <span>{details.assignedOfficer ? 'Reassign Officer' : 'Assign Officer'}</span>
            </button>
          )}

          {/* Update Status */}
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">published_with_changes</span>
            <span>Update Status</span>
          </button>

          {/* Record Officer Action */}
          {(currentRole === USER_ROLES.OFFICER || currentRole === USER_ROLES.SUPERVISOR || currentRole === USER_ROLES.ADMIN) && (
            <button
              onClick={() => setIsActionModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add_task</span>
              <span>Record Action</span>
            </button>
          )}

          {/* Submit Resolution */}
          {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
            <button
              onClick={() => setIsResolutionModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-sm">task_alt</span>
              <span>Submit Resolution</span>
            </button>
          )}

          {/* Citizen Verification Review */}
          {['RESOLVED', 'ACTION_TAKEN', 'CLOSED', 'REOPENED'].includes(ticket.status) && (
            <button
              onClick={() => setIsCitizenReviewModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold flex items-center gap-1 transition-colors border border-purple-200"
            >
              <span className="material-symbols-outlined text-sm">rate_review</span>
              <span>Citizen Review & Dispute</span>
            </button>
          )}

          {/* Send Reminder */}
          {(currentRole === USER_ROLES.SUPERVISOR || currentRole === USER_ROLES.ADMIN) && (
            <button
              onClick={() => setIsReminderModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold flex items-center gap-1 transition-colors border border-amber-200"
            >
              <span className="material-symbols-outlined text-sm">notifications_active</span>
              <span>Issue Reminder</span>
            </button>
          )}

          {/* Final Closure Certificate */}
          {ticket.status === 'RESOLVED' && (currentRole === USER_ROLES.SUPERVISOR || currentRole === USER_ROLES.ADMIN) && (
            <button
              onClick={() => {
                recordFinalClosure(token, 'Administrative vigilance sign-off completed.', 'Vigilance Supervisor');
                showToast(`Formal closure certificate issued for #${token}.`);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold flex items-center gap-1 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span>Approve Final Closure</span>
            </button>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. EXPLAINABLE COMPLAINT HEALTH INDICATORS (Section 8) */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold font-headline text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600 text-lg">ecg_heart</span>
              <span>Explainable Complaint Health & Compliance Indicators</span>
            </h3>
            <p className="text-slate-500 text-xs">
              Algorithmic compliance metrics derived from Karnataka Sakala SLA timers, reminder nudges, and citizen responses.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Rule-based Telemetry</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
          {/* 1. Deadline Health */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">1. SLA Deadline</span>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  details.healthIndicators.deadlineHealth.status === 'RED' ? 'bg-rose-500' :
                  details.healthIndicators.deadlineHealth.status === 'AMBER' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
              </div>
              <p className={`font-mono font-bold mt-1.5 text-sm ${
                details.healthIndicators.deadlineHealth.status === 'RED' ? 'text-rose-700' :
                details.healthIndicators.deadlineHealth.status === 'AMBER' ? 'text-amber-700' : 'text-emerald-700'
              }`}>
                {details.healthIndicators.deadlineHealth.label}
              </p>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                {details.healthIndicators.deadlineHealth.reason}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/80 font-mono text-[10px] text-slate-500">
              Hours Remaining: {details.healthIndicators.deadlineHealth.hoursRemaining}h
            </div>
          </div>

          {/* 2. Follow-Up Health */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">2. Follow-Up Health</span>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  details.healthIndicators.followUpHealth.status === 'DUE_TODAY' ? 'bg-amber-500' :
                  details.healthIndicators.followUpHealth.status === 'OVERDUE' ? 'bg-rose-500' : 'bg-emerald-500'
                }`} />
              </div>
              <p className="font-bold mt-1.5 text-sm text-slate-800">
                {details.healthIndicators.followUpHealth.label}
              </p>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                {details.healthIndicators.followUpHealth.reason}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/80 font-mono text-[10px] text-slate-500">
              Checkpoint: {details.healthIndicators.followUpHealth.date}
            </div>
          </div>

          {/* 3. Escalation Risk */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">3. Escalation Risk</span>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  details.healthIndicators.escalationRisk.riskLevel === 'CRITICAL' ? 'bg-purple-600' :
                  details.healthIndicators.escalationRisk.riskLevel === 'HIGH' ? 'bg-rose-500' :
                  details.healthIndicators.escalationRisk.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
              </div>
              <p className="font-bold mt-1.5 text-sm text-slate-800">
                {details.healthIndicators.escalationRisk.label}
              </p>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                {details.healthIndicators.escalationRisk.reason}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/80 font-mono text-[10px] text-slate-500">
              Tier: {details.healthIndicators.escalationRisk.tier}
            </div>
          </div>

          {/* 4. Citizen Satisfaction */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">4. Citizen CSAT</span>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  details.healthIndicators.citizenSatisfaction.status === 'RATED' ? 'bg-emerald-500' :
                  details.healthIndicators.citizenSatisfaction.status === 'DISPUTED' ? 'bg-rose-500' : 'bg-slate-400'
                }`} />
              </div>
              <p className="font-bold mt-1.5 text-sm text-slate-800">
                {details.healthIndicators.citizenSatisfaction.label}
              </p>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                {details.healthIndicators.citizenSatisfaction.reason}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/80 font-mono text-[10px] text-slate-500">
              Status: {details.healthIndicators.citizenSatisfaction.status}
            </div>
          </div>

          {/* 5. Resolution Progress Gauge */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">5. Progress Bar</span>
                <span className="font-mono font-bold text-teal-700">
                  {details.healthIndicators.resolutionProgress.percentage}%
                </span>
              </div>
              <p className="font-bold mt-1.5 text-sm text-slate-800">
                {details.healthIndicators.resolutionProgress.stage}
              </p>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${details.healthIndicators.resolutionProgress.percentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-600 mt-2 leading-snug">
                {details.healthIndicators.resolutionProgress.reason}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/80 font-mono text-[10px] text-slate-500">
              Lifecycle Stage {details.healthIndicators.resolutionProgress.stage}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. INFORMATION SECTIONS / TABS CONTAINER (Section 3) */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Tab Navigation Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-800 bg-white font-bold shadow-sm'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 sm:p-8">

          {/* TAB 1: COMPLAINT OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Grievance Particulars</span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Tracking ID:</span>
                      <strong className="font-mono text-teal-800">#{token}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Category:</span>
                      <strong className="text-slate-800">{ticket.category}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Subcategory:</span>
                      <span className="text-slate-700">{ticket.subcategory || 'Standard Service Defect'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Urgency Priority:</span>
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Filing Channel:</span>
                      <span className="font-medium text-slate-700">{ticket.submissionChannel || 'Citizen Web Portal'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Preferred Language:</span>
                      <span className="font-medium text-slate-700">{ticket.preferredLanguage || 'English'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Jurisdictional Location</span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">District:</span>
                      <strong className="text-slate-800">{ticket.district}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Taluk / Tehsil:</span>
                      <span className="text-slate-700">{ticket.taluk || 'Bengaluru South'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Ward / Village:</span>
                      <span className="text-slate-700">{ticket.ward || 'Ward 14'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">PIN Code:</span>
                      <span className="font-mono font-bold text-slate-700">{ticket.pincode || '560041'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">GPS Coordinates:</span>
                      <span className="font-mono text-xs text-teal-700 font-bold">{ticket.location || '12.9716° N, 77.5946° E'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Comprehensive Grievance Narrative</span>
                <p className="text-sm text-slate-800 leading-relaxed font-body">
                  {ticket.description}
                </p>
                {ticket.titleKn && (
                  <p className="text-xs text-slate-500 italic pt-2 border-t border-slate-200">
                    ಕನ್ನಡ ವಿವರಣೆ: {ticket.titleKn}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CITIZEN INFORMATION (Section 3 Tab 2 & Section 11 PII Protection) */}
          {activeTab === 'citizen' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="material-symbols-outlined text-teal-600 text-lg">shield</span>
                  <span className="text-slate-700 font-medium">
                    Aadhaar Act & Digital Personal Data Protection (DPDP) compliance: Sensitive PII is masked by default.
                  </span>
                </div>
                {(currentRole === USER_ROLES.ADMIN || currentRole === USER_ROLES.SUPERVISOR) && (
                  <button
                    onClick={() => setUnmaskPII(!unmaskPII)}
                    className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">{unmaskPII ? 'visibility_off' : 'visibility'}</span>
                    <span>{unmaskPII ? 'Mask Citizen PII' : 'Unmask PII (Authorized)'}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Identity & Contact</span>
                  <div className="space-y-2.5">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Citizen Full Name:</span>
                      <strong className="text-slate-900">{ticket.citizenName}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Mobile Phone:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {unmaskPII ? ticket.citizenPhone : `${ticket.citizenPhone?.substring(0, 7)} •••• ${ticket.citizenPhone?.slice(-2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Email Address:</span>
                      <span className="font-mono text-slate-700">
                        {unmaskPII ? ticket.citizenEmail || 'Not Provided' : `${ticket.citizenEmail?.substring(0, 3)}••••@domain.gov`}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Identity Verification:</span>
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        {ticket.citizenIdType || 'Aadhaar OTP Verified'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Residential Jurisdiction</span>
                  <div className="space-y-2.5">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Address:</span>
                      <span className="text-slate-800 font-medium">{ticket.address || '42, 5th Cross'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">District:</span>
                      <strong className="text-slate-800">{ticket.district}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Taluk:</span>
                      <span className="text-slate-700">{ticket.taluk || 'Bengaluru South'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Village / Ward:</span>
                      <span className="text-slate-700">{ticket.ward}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DEPARTMENT & OFFICER ASSIGNMENT (Section 3 Tab 3) */}
          {activeTab === 'assignment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department Card */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Assigned Ministry / Department</span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Department Name:</span>
                      <strong className="text-slate-900">{ticket.departmentName || ticket.category}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Standard SLA:</span>
                      <span className="font-mono font-bold text-teal-700">48 Hours (Sakala Act)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Assigned Cadre Count:</span>
                      <span className="text-slate-700">{officers.filter(o => o.department === ticket.departmentName).length} Active Officers</span>
                    </div>
                  </div>
                </div>

                {/* Officer Card */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned Nodal Officer</span>
                    {(currentRole === USER_ROLES.ADMIN || currentRole === USER_ROLES.SUPERVISOR) && (
                      <button
                        onClick={() => setIsReassignModalOpen(true)}
                        className="text-xs text-teal-700 font-bold hover:underline"
                      >
                        Reassign Officer →
                      </button>
                    )}
                  </div>

                  {details.assignedOfficer ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                          {details.assignedOfficer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-sm">{details.assignedOfficer.name}</span>
                          <span className="text-slate-500 font-mono text-[11px]">{details.assignedOfficer.badge || details.assignedOfficer.employeeId} · {details.assignedOfficer.designation}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex justify-between">
                        <span className="text-slate-500">Active Caseload:</span>
                        <strong className="font-mono text-slate-800">{details.assignedOfficer.activeCaseload || 5} dockets</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Workload Threshold:</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Balanced Capacity
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-slate-500 text-xs">
                      <span className="material-symbols-outlined text-3xl text-amber-500">warning</span>
                      <p className="mt-1 font-bold text-slate-700">No Nodal Officer Currently Assigned</p>
                      <button
                        onClick={() => setIsReassignModalOpen(true)}
                        className="mt-2 px-3 py-1 bg-teal-600 text-white rounded-lg font-bold"
                      >
                        Assign Now
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Reassignment History Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 font-headline uppercase tracking-wider block">
                  Reassignment & Caseload Balancing History ({details.reassignments.length})
                </span>
                {details.reassignments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-200">
                    No nodal reassignments recorded for this docket. Handled by initial cadre assignment.
                  </p>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Previous Officer</th>
                          <th className="p-3">New Officer</th>
                          <th className="p-3">Reason</th>
                          <th className="p-3">Authorized By</th>
                          <th className="p-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {details.reassignments.map(r => (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-700">{r.previousOfficer}</td>
                            <td className="p-3 font-bold text-teal-800">{r.newOfficer}</td>
                            <td className="p-3 text-slate-600">{r.reason}</td>
                            <td className="p-3 text-slate-600">{r.approvedBy}</td>
                            <td className="p-3 font-mono text-slate-500">{r.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: OFFICER ACTIONS (Section 3 Tab 4) */}
          {activeTab === 'actions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold font-headline text-slate-800">
                    Departmental Actions Ledger ({ticket.actions?.length || 0})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Certified on-site inspections, contractor notices, material procurements, and progress notes.
                  </p>
                </div>
                <button
                  onClick={() => setIsActionModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Record New Action</span>
                </button>
              </div>

              {/* Action Cards List */}
              <div className="space-y-3">
                {(!ticket.actions || ticket.actions.length === 0) ? (
                  <p className="text-xs text-slate-500 italic p-4 text-center">No actions recorded yet.</p>
                ) : (
                  ticket.actions.map((act, idx) => (
                    <div key={act.id || idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">{act.user}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
                            {act.type || 'ACTION_LOG'}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">{act.date}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-body leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80">
                        {act.text}
                      </p>
                      {act.documents && act.documents.length > 0 && (
                        <div className="flex items-center gap-2 text-[11px] text-teal-800 font-mono">
                          <span className="material-symbols-outlined text-sm">attach_file</span>
                          <span>Attached Proofs: {act.documents.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: REMINDER HISTORY (Section 3 Tab 5) */}
          {activeTab === 'reminders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold font-headline text-slate-800">
                    SLA Chrono-Bot & Reminder Centre Logs ({details.reminders.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Multi-channel nudge dispatch log for nodal officers and supervisory escalation alerts.
                  </p>
                </div>
                {(currentRole === USER_ROLES.SUPERVISOR || currentRole === USER_ROLES.ADMIN) && (
                  <button
                    onClick={() => setIsReminderModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">add_alert</span>
                    <span>Issue New Reminder</span>
                  </button>
                )}
              </div>

              {details.reminders.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                  <span className="material-symbols-outlined text-3xl text-slate-300">notifications_off</span>
                  <p className="mt-1 font-semibold">No statutory reminders generated for this ticket.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Reminder ID</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Recipient</th>
                        <th className="p-3">Channel</th>
                        <th className="p-3">Delivery Status</th>
                        <th className="p-3">Scheduled / Dispatched</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {details.reminders.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-teal-800">{r.id}</td>
                          <td className="p-3 font-semibold text-slate-800">{r.type || r.subject}</td>
                          <td className="p-3 text-slate-700">{r.recipientName || 'Nodal Officer'}</td>
                          <td className="p-3 font-mono text-[11px] font-bold text-slate-600">{r.channel}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              r.status === 'FAILED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {r.status || 'DELIVERED'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-500">{r.dispatchedTime || r.scheduledTime || r.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ESCALATION HISTORY (Section 3 Tab 6) */}
          {activeTab === 'escalations' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold font-headline text-slate-800">
                  Supervisory Escalation & Statutory Penalty Audit ({details.escalations.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Karnataka Sakala Act Section 8 compliance tracking and Level 1–3 hierarchical escalations.
                </p>
              </div>

              {details.escalations.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                  <span className="material-symbols-outlined text-3xl text-emerald-500">verified</span>
                  <p className="mt-1 font-semibold text-slate-700">No Supervisory Escalations Triggered</p>
                  <p className="text-slate-500 text-[11px]">Docket is running without formal breach notices.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {details.escalations.map(esc => (
                    <div key={esc.id} className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 text-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-rose-900 text-sm">#{esc.id}</span>
                          <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]">
                            {esc.level || esc.escalationTier || 'TIER 2'}
                          </span>
                        </div>
                        <span className="font-mono text-slate-500">{esc.timestamp || esc.escalatedDate}</span>
                      </div>
                      <div className="text-slate-800">
                        <strong>Trigger Reason:</strong> {esc.reason || esc.triggerReason || 'Statutory SLA Elapsed'}
                      </div>
                      <div className="text-slate-700">
                        <strong>Supervisory Desk:</strong> {esc.responsibleOfficer || esc.supervisor || 'Zonal Commissioner'}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-rose-200/60 text-[11px]">
                        <span className="text-rose-800 font-bold">
                          Statutory Penalty Accrual: ₹{esc.penaltyAccrued || (ticket.daysOverdue ? ticket.daysOverdue * 250 : 0)}
                        </span>
                        <span className="font-semibold text-slate-600">Status: {esc.status || 'Active Under Review'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: COMMUNICATION HISTORY (Section 3 Tab 7) */}
          {activeTab === 'communications' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold font-headline text-slate-800">
                  Citizen & Cadre Communication Records ({details.communications.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Integrated omnichannel logs across SMS, WhatsApp, Email, and Citizen Web Portal.
                </p>
              </div>

              {details.communications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                  <span className="material-symbols-outlined text-3xl text-slate-300">chat_bubble_outline</span>
                  <p className="mt-1 font-semibold">No communications logged for this tracking token.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {details.communications.map(c => (
                    <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-200 text-slate-700">
                            {c.channel || 'SMS'}
                          </span>
                          <span className="font-bold text-slate-800">
                            {c.sender || 'ResolveTrack Gateway'} → {c.recipient || ticket.citizenName}
                          </span>
                        </div>
                        <span className="font-mono text-slate-500 text-[11px]">{c.timestamp || c.date}</span>
                      </div>
                      <p className="p-3 bg-white rounded-lg border border-slate-200/80 font-mono text-[11px] text-slate-700 leading-relaxed">
                        "{c.message || c.preview || 'Grievance progress notification'}"
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Gateway: Karnataka State WAN</span>
                        <span className="text-emerald-700 font-bold">● {c.status || 'Delivered'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: RESOLUTION & CITIZEN FEEDBACK (Section 3 Tab 8 & Section 5/6) */}
          {activeTab === 'resolution' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold font-headline text-slate-800">
                    Resolution Dossier & Citizen Verification Audit
                  </h3>
                  <p className="text-xs text-slate-500">
                    Officer remediation summary, work completion receipts, and 4-criteria CSAT evaluation.
                  </p>
                </div>
                {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                  <button
                    onClick={() => setIsResolutionModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">add_task</span>
                    <span>Submit Official Resolution</span>
                  </button>
                )}
              </div>

              {/* Resolution Details Card */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Remediation Record
                  </span>
                  <StatusBadge status={ticket.status} />
                </div>

                {ticket.resolutionDetails || ticket.resolutionSummary ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Resolution Summary:</span>
                      <p className="text-slate-900 font-medium text-xs mt-0.5">
                        {ticket.resolutionDetails?.title || 'Corrective Redressal Completed'}
                      </p>
                      <p className="text-slate-700 mt-1 leading-relaxed">
                        {ticket.resolutionDetails?.description || ticket.resolutionSummary}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">Action Taken:</span>
                        <span className="font-semibold text-slate-800">
                          {ticket.resolutionDetails?.actionTaken || 'Field Repair & Reconstruction'}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">Certified Date:</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {ticket.resolutionDetails?.completionDate || ticket.resolvedAt || 'Recent'}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">Submitted By:</span>
                        <span className="font-semibold text-slate-800">
                          {ticket.resolutionDetails?.submittedBy || details.assignedOfficer?.name || 'Nodal Engineer'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    <span className="material-symbols-outlined text-3xl text-slate-300">hourglass_top</span>
                    <p className="mt-1 font-semibold">Remediation works are currently in progress.</p>
                    <p className="text-slate-400 text-[11px]">Official resolution summary has not yet been submitted by field cadre.</p>
                  </div>
                )}
              </div>

              {/* Citizen Verification & CSAT Card */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Citizen Verification & 4-Criteria CSAT Feedback
                </span>

                {details.feedback ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-600 text-2xl shrink-0">verified</span>
                      <div className="space-y-1">
                        <p className="font-bold text-sm">Resolution Confirmed by Citizen</p>
                        <p className="text-emerald-800">
                          Overall Satisfaction: <strong className="text-emerald-950 font-mono">{details.feedback.overallRating}/5 Stars</strong> ·
                          Quality: <strong className="font-mono">{details.feedback.qualityRating}/5</strong> ·
                          Responsiveness: <strong className="font-mono">{details.feedback.responsivenessRating}/5</strong> ·
                          Timeliness: <strong className="font-mono">{details.feedback.timelinessRating}/5</strong>
                        </p>
                        {details.feedback.comments && (
                          <p className="italic text-emerald-900 mt-1.5 bg-white/70 p-2 rounded border border-emerald-200">
                            "{details.feedback.comments}"
                          </p>
                        )}
                        <p className="text-[10px] text-emerald-600 mt-1">Logged on: {details.feedback.createdAt}</p>
                      </div>
                    </div>
                  </div>
                ) : ticket.status === 'REOPENED' ? (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs flex items-start gap-3">
                    <span className="material-symbols-outlined text-rose-600 text-2xl shrink-0">warning</span>
                    <div className="space-y-1">
                      <p className="font-bold text-sm">Citizen Disputed Resolution (Grievance Reopened)</p>
                      <p className="text-rose-800">
                        The applicant reported that the issue remains unresolved. Retained in re-inspection queue.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-100 text-slate-600 text-xs flex items-center justify-between">
                    <span>Awaiting citizen feedback submission on the tracking portal.</span>
                    <button
                      onClick={() => setIsCitizenReviewModalOpen(true)}
                      className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-bold text-teal-800 hover:bg-slate-50"
                    >
                      Record Citizen Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: COMPLETE ACTIVITY TIMELINE (Section 4) */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold font-headline text-slate-800">
                    Chronological Lifecycle Audit Timeline ({filteredActivities.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive ledger tracking all 19 statutory events across the complaint's lifecycle.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <select
                    value={timelineTypeFilter}
                    onChange={(e) => setTimelineTypeFilter(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 text-xs focus:outline-none"
                  >
                    <option value="ALL">All Event Types</option>
                    {uniqueActivityTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>

                  <select
                    value={timelineActorFilter}
                    onChange={(e) => setTimelineActorFilter(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 text-xs focus:outline-none"
                  >
                    <option value="ALL">All Actors</option>
                    {uniqueActors.map(actor => (
                      <option key={actor} value={actor}>{actor}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Timeline Tree */}
              <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2.5 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {filteredActivities.map((act, index) => (
                  <div key={act.id || index} className="relative flex flex-col gap-1.5">
                    <div className="absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center border-2 border-white shadow-sm">
                      <span className="material-symbols-outlined text-[10px]">circle</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{act.actor}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-700 border border-slate-200">
                          {act.eventType}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">{act.timestamp}</span>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed font-body">
                      {act.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: AUDIT LOG & VERSION HISTORY (Sections 7 & 10) */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold font-headline text-slate-800">
                  Immutable Audit Gazette & Field Version History
                </h3>
                <p className="text-xs text-slate-500">
                  Strictly append-only record tracking all modifications, transitions, and dispatches per Karnataka Public Records Act.
                </p>
              </div>

              {details.auditLogs.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 text-center">No audit records logged yet.</p>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Audit ID</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Actor & Role</th>
                        <th className="p-3">Previous Value</th>
                        <th className="p-3">New Value</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {details.auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-teal-800">{log.id}</td>
                          <td className="p-3 font-semibold text-slate-800">{log.action}</td>
                          <td className="p-3 text-slate-700">
                            <span className="font-medium block">{log.performedBy}</span>
                            <span className="text-[10px] text-slate-500 font-mono uppercase">{log.userRole}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-500 max-w-[120px] truncate">{log.previousValue}</td>
                          <td className="p-3 font-mono text-slate-800 max-w-[140px] truncate">{log.newValue}</td>
                          <td className="p-3">
                            {log.isSimulatedDelivery ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Simulated Gateway
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Certified Event
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 11: DOCUMENT & EVIDENCE VAULT (Section 9) */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold font-headline text-slate-800">
                    Centralized Document & Evidence Vault ({ticket.attachments?.length || 0})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Geotagged photographic proofs, citizen supporting PDFs, and certified resolution documents.
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadDocModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  <span>Upload Document</span>
                </button>
              </div>

              {(!ticket.attachments || ticket.attachments.length === 0) ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                  <span className="material-symbols-outlined text-3xl text-slate-300">folder_off</span>
                  <p className="mt-1 font-semibold">No supporting evidence attached to this complaint.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ticket.attachments.map((doc, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-xl">
                            {doc.name?.endsWith('.pdf') ? 'picture_as_pdf' : 'image'}
                          </span>
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-800 text-xs truncate" title={doc.name}>
                            {doc.name}
                          </p>
                          <span className="text-[11px] text-slate-500 block">{doc.size || '1.8 MB'} · {doc.type || 'Attachment'}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Uploaded by {doc.uploadedBy || ticket.citizenName}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px]">
                        <span className="text-slate-500">{doc.uploadDate || 'Verified'}</span>
                        <button
                          onClick={() => showToast(`Downloaded simulated file: ${doc.name}`)}
                          className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* =================================================================== */}
      {/* MODALS */}
      {/* =================================================================== */}

      {/* 1. Submit Resolution Modal (Section 5) */}
      <Modal
        isOpen={isResolutionModalOpen}
        onClose={() => setIsResolutionModalOpen(false)}
        title="Submit Grievance Resolution & Work Completion Dossier"
        subtitle={`Tracking Docket #${token} · ${ticket.departmentName}`}
      >
        <form onSubmit={handleResolutionSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Resolution Title *</label>
            <input
              type="text"
              required
              value={resolutionForm.title}
              onChange={(e) => setResolutionForm({ ...resolutionForm, title: e.target.value })}
              placeholder="e.g. Pipeline Joint Replaced & Water Tested Potable"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Action Taken Details *</label>
            <input
              type="text"
              required
              value={resolutionForm.actionTaken}
              onChange={(e) => setResolutionForm({ ...resolutionForm, actionTaken: e.target.value })}
              placeholder="e.g. Dispatched emergency crew, excavated damaged 110mm pipe, replaced joint, conducted pressure test"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Resolution Category</label>
              <select
                value={resolutionForm.category}
                onChange={(e) => setResolutionForm({ ...resolutionForm, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="Physical Repair & Reconstruction">Physical Repair & Reconstruction</option>
                <option value="Component Replacement">Component Replacement</option>
                <option value="Sanitation & Clearing">Sanitation & Clearing</option>
                <option value="Administrative Enforcement">Administrative Enforcement</option>
                <option value="Testing & Verification Passed">Testing & Verification Passed</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Completion Date</label>
              <input
                type="date"
                required
                value={resolutionForm.completionDate}
                onChange={(e) => setResolutionForm({ ...resolutionForm, completionDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Technical Resolution Description *</label>
            <textarea
              required
              rows={3}
              value={resolutionForm.description}
              onChange={(e) => setResolutionForm({ ...resolutionForm, description: e.target.value })}
              placeholder="Provide comprehensive details of work carried out, materials used, and on-site testing..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Add Supporting Proof Simulator */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Supporting Completion Documents</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newResDocName}
                onChange={(e) => setNewResDocName(e.target.value)}
                placeholder="e.g. work_completion_receipt.pdf"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (newResDocName.trim()) {
                    setResolutionForm({ ...resolutionForm, documents: [...resolutionForm.documents, newResDocName.trim()] });
                    setNewResDocName('');
                  }
                }}
                className="px-3 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Add File
              </button>
            </div>
            {resolutionForm.documents.length > 0 && (
              <div className="mt-2 space-y-1">
                {resolutionForm.documents.map((d, i) => (
                  <span key={i} className="inline-block mr-2 px-2.5 py-1 bg-slate-100 rounded text-slate-700 font-mono text-[11px]">
                    📎 {d}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-[11px]">
            <strong>Important Notice:</strong> Submitting resolution transitions the docket to <strong>RESOLVED</strong> (not CLOSED). An automated verification alert will be dispatched to citizen {ticket.citizenPhone}. Formal closure occurs upon citizen acceptance.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsResolutionModalOpen(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow"
            >
              Submit Official Resolution
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Record Officer Action Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title="Record Field Officer Action"
        subtitle={`Tracking Docket #${token} · ${details.assignedOfficer?.name || 'Nodal Officer'}`}
      >
        <form onSubmit={handleActionSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Action Type</label>
            <select
              value={actionForm.actionType}
              onChange={(e) => setActionForm({ ...actionForm, actionType: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="FIELD_INSPECTION">Site / Field Inspection Conducted</option>
              <option value="CONTRACTOR_SUMMONED">Notice Issued to Contractor</option>
              <option value="MATERIALS_DISPATCHED">Emergency Materials Dispatched</option>
              <option value="TESTING_INITIATED">Lab Testing / Quality Sampling</option>
              <option value="WORK_IN_PROGRESS">Physical Works in Progress</option>
              <option value="INTERIM_STATUS">Interim Technical Progress Note</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Action Narrative & Findings *</label>
            <textarea
              required
              rows={4}
              value={actionForm.description}
              onChange={(e) => setActionForm({ ...actionForm, description: e.target.value })}
              placeholder="Detail observations, measurements, equipment deployed, or contractors instructed..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Next Operational Step / Target</label>
            <input
              type="text"
              value={actionForm.nextStep}
              onChange={(e) => setActionForm({ ...actionForm, nextStep: e.target.value })}
              placeholder="e.g. Conduct hydraulic pressure test by tomorrow 14:00"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsActionModalOpen(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow"
            >
              Commit Action to Ledger
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Status Update Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Operational Status"
        subtitle={`Current Status: ${ticket.status}`}
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">New Operational Status</label>
            <select
              value={statusForm.newStatus}
              onChange={(e) => setStatusForm({ ...statusForm, newStatus: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="IN_PROGRESS">IN_PROGRESS (Crew Dispatched)</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW (Technical Scrutiny)</option>
              <option value="ACTION_TAKEN">ACTION_TAKEN (Work Executed on Site)</option>
              <option value="RESOLVED">RESOLVED (Ready for Citizen Verification)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Remarks & Reason for Status Change *</label>
            <textarea
              required
              rows={3}
              value={statusForm.remarks}
              onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
              placeholder="State the justification for updating the status..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow"
            >
              Update Status
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. Reassign Officer Modal */}
      <Modal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        title="Nodal Officer Reassignment & Workload Rebalancing"
        subtitle={`Currently assigned: ${details.assignedOfficer?.name || 'Unassigned'}`}
      >
        <form onSubmit={handleReassignSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Target Nodal Officer *</label>
            <select
              required
              value={reassignForm.targetOfficerId}
              onChange={(e) => setReassignForm({ ...reassignForm, targetOfficerId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="">Select Officer Roster...</option>
              {officers.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.badge || o.employeeId}) · Caseload: {o.activeCaseload || 0}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reassignment Reason</label>
            <select
              value={reassignForm.reason}
              onChange={(e) => setReassignForm({ ...reassignForm, reason: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none"
            >
              <option value="Caseload Rebalancing & Optimal Cadre Allocation">Caseload Rebalancing & Optimal Cadre Allocation</option>
              <option value="Officer Leave or Temporary Absence">Officer Leave or Temporary Absence</option>
              <option value="Technical Specialization Required">Technical Specialization Required</option>
              <option value="Supervisory Escaped SLA Remediation">Supervisory Escaped SLA Remediation</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Administrative Notes</label>
            <textarea
              rows={2}
              value={reassignForm.notes}
              onChange={(e) => setReassignForm({ ...reassignForm, notes: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsReassignModalOpen(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow"
            >
              Execute Reassignment
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. Create Reminder Modal */}
      <Modal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        title="Schedule SLA Follow-up Reminder"
        subtitle={`Tracking Token #${token}`}
      >
        <form onSubmit={handleReminderSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Notification Channel</label>
            <select
              value={reminderForm.channel}
              onChange={(e) => setReminderForm({ ...reminderForm, channel: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none"
            >
              <option value="IN_APP">In-App Dashboard Nudge</option>
              <option value="SMS">Official SMS Gateway</option>
              <option value="EMAIL">Departmental Email</option>
              <option value="WHATSAPP">WhatsApp Business API</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Recipient Name</label>
            <input
              type="text"
              value={reminderForm.recipientName}
              onChange={(e) => setReminderForm({ ...reminderForm, recipientName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Subject / Warning Level</label>
            <input
              type="text"
              value={reminderForm.subject}
              onChange={(e) => setReminderForm({ ...reminderForm, subject: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsReminderModalOpen(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow"
            >
              Dispatch Reminder
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Citizen Review & Dispute Modal */}
      <Modal
        isOpen={isCitizenReviewModalOpen}
        onClose={() => setIsCitizenReviewModalOpen(false)}
        title="Citizen Resolution Verification Review"
        subtitle={`Tracking Docket #${token}`}
      >
        <form onSubmit={handleCitizenReviewSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setCitizenReviewMode('ACCEPT')}
              className={`py-2 rounded-lg font-bold transition-all ${
                citizenReviewMode === 'ACCEPT' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              Confirm Satisfactory (Close)
            </button>
            <button
              type="button"
              onClick={() => setCitizenReviewMode('REOPEN')}
              className={`py-2 rounded-lg font-bold transition-all ${
                citizenReviewMode === 'REOPEN' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Dispute Resolution (Reopen)
            </button>
          </div>

          {citizenReviewMode === 'REOPEN' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason for Reopening *</label>
              <select
                value={reopenReasonCategory}
                onChange={(e) => setReopenReasonCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none"
              >
                <option value="Work Incomplete or Superficial">Work Incomplete or Superficial</option>
                <option value="Problem Recurred Shortly After">Problem Recurred Shortly After</option>
                <option value="False Resolution Claimed">False Resolution Claimed Without Site Visit</option>
                <option value="Wrong Location Inspected">Wrong Location Inspected</option>
              </select>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {citizenReviewMode === 'ACCEPT' ? 'Citizen Confirmation Remarks' : 'Explanation of Unresolved Issue *'}
            </label>
            <textarea
              required={citizenReviewMode === 'REOPEN'}
              rows={3}
              value={citizenReviewNotes}
              onChange={(e) => setCitizenReviewNotes(e.target.value)}
              placeholder={citizenReviewMode === 'ACCEPT' ? 'Confirmed on-site by resident...' : 'State why the work is defective...'}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCitizenReviewModalOpen(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-white rounded-xl font-bold shadow ${
                citizenReviewMode === 'ACCEPT' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {citizenReviewMode === 'ACCEPT' ? 'Accept Resolution' : 'Reopen Grievance'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 7. Edit Complaint Details Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Permitted Complaint Details"
        subtitle={`Tracking Token #${token}`}
      >
        <form onSubmit={handleEditDetailsSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Priority</label>
            <select
              value={editForm.priority}
              onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none"
            >
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description Narrative</label>
            <textarea
              rows={4}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* 8. Upload Document Modal (Section 9) */}
      <Modal
        isOpen={isUploadDocModalOpen}
        onClose={() => setIsUploadDocModalOpen(false)}
        title="Upload Document or Evidence"
        subtitle={`Tracking Docket #${token}`}
      >
        <form onSubmit={handleUploadDocSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Document File Name *</label>
            <input
              type="text"
              required
              value={uploadDocForm.name}
              onChange={(e) => setUploadDocForm({ ...uploadDocForm, name: e.target.value })}
              placeholder="e.g. soil_bearing_test_report.pdf"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Document Classification</label>
            <select
              value={uploadDocForm.type}
              onChange={(e) => setUploadDocForm({ ...uploadDocForm, type: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none"
            >
              <option value="Image (JPEG/PNG)">Image (JPEG/PNG)</option>
              <option value="PDF Document">PDF Document</option>
              <option value="Resolution Completion Proof">Resolution Completion Proof</option>
              <option value="Citizen Supporting Evidence">Citizen Supporting Evidence</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Related Activity / Purpose</label>
            <input
              type="text"
              value={uploadDocForm.relatedActivity}
              onChange={(e) => setUploadDocForm({ ...uploadDocForm, relatedActivity: e.target.value })}
              placeholder="e.g. Initial Site Inspection Verification"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsUploadDocModalOpen(false)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow"
            >
              Upload Document
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
