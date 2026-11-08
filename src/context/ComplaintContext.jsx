import React, { createContext, useContext, useState, useMemo } from 'react';
import { COMPLAINTS_DATA } from '../data/complaintsData';
import { DEPARTMENTS_DATA } from '../data/departmentsData';
import { OFFICERS_DATA } from '../data/officersData';
import { CITIZENS_DATA } from '../data/citizensData';
import { REMINDERS_DATA } from '../data/remindersData';
import { ESCALATIONS_DATA } from '../data/escalationsData';
import { NOTIFICATIONS_DATA } from '../data/notificationsData';
import { COMMUNICATIONS_DATA } from '../data/communicationsData';
import { INITIAL_OVERDUE_COMPLAINTS } from '../data/overdueComplaints';
import { INITIAL_ESCALATION_RECORDS } from '../data/escalationRecords';
import { INITIAL_REMINDER_RECORDS } from '../data/reminderRecords';
import { INITIAL_COMPLAINT_HISTORY } from '../data/complaintHistory';
import { COMPLAINT_CATEGORIES } from '../data/complaintCategories';
import { PRIORITY_CONFIG, isValidStatusTransition } from '../utils/constants';
import { generateNextTrackingId } from '../utils/trackingIdGenerator';

const MERGED_COMPLAINTS = (() => {
  const map = new Map();
  COMPLAINTS_DATA.forEach(c => {
    map.set(c.token, { ...c });
    if (c.legacyToken) map.set(c.legacyToken, { ...c });
    if (c.id && c.id !== c.token) map.set(c.id, { ...c });
  });
  INITIAL_OVERDUE_COMPLAINTS.forEach(oc => {
    if (map.has(oc.token)) {
      const existing = map.get(oc.token);
      map.set(oc.token, { ...existing, ...oc });
    } else {
      map.set(oc.token, { ...oc });
    }
  });
  const unique = new Map();
  for (const item of map.values()) {
    unique.set(item.token, item);
  }
  return Array.from(unique.values());
})();

export const INITIAL_REASSIGNMENTS = [
  {
    id: 'REASSIGN-2024-089',
    complaintId: 'GRV-2024-8839',
    complaintTitle: 'Pothole crater accident hazard on NH-48 flyover descent',
    previousOfficer: 'V. R. Chandrashekar',
    previousOfficerId: 'off-2',
    previousOfficerDesignation: 'Assistant Executive Engineer',
    newOfficer: 'Sri Rajeshwari Hegde',
    newOfficerId: 'off-8',
    newOfficerDesignation: 'Executive Road Safety Officer',
    department: 'Ministry of Road Transport & Highways',
    reason: 'Caseload Rebalancing & Section 8 Critical SLA Intervention',
    initiatedBy: 'Zonal Administrator',
    approvedBy: 'Shri Vikram Malhotra, IAS',
    timestamp: '2026-11-06 14:30',
    status: 'COMPLETED',
    notes: 'Transferred due to acute bottleneck in South Zone PWD division to avert public safety hazard.'
  },
  {
    id: 'REASSIGN-2024-088',
    complaintId: 'GRV-2024-8835',
    complaintTitle: 'Overbilling dispute on 3-phase LT commercial connection',
    previousOfficer: 'Praveen Kumar',
    previousOfficerId: 'off-5',
    previousOfficerDesignation: 'Revenue Inspector (Zone 8)',
    newOfficer: 'Naveen Kumar Swamy',
    newOfficerId: 'off-3',
    newOfficerDesignation: 'Assistant Engineer (Metering & Vigilance)',
    department: 'Power & Energy Distribution (HESCOM)',
    reason: 'Subject Matter Expertise in High-Tension Metering',
    initiatedBy: 'GovOps AI Triage',
    approvedBy: 'Executive Supervisor R. Rao',
    timestamp: '2026-11-05 11:15',
    status: 'COMPLETED',
    notes: 'Automated skill-affinity transfer to vigilance metering specialist.'
  },
  {
    id: 'REASSIGN-2024-087',
    complaintId: 'GRV-2024-8828',
    complaintTitle: 'Damaged water pipeline valve near bus terminus',
    previousOfficer: 'Er. Sandeep Kulkarni',
    previousOfficerId: 'off-1',
    previousOfficerDesignation: 'Senior Executive Nodal Engineer',
    newOfficer: 'Er. Gururaj Patil',
    newOfficerId: 'off-10',
    newOfficerDesignation: 'Sub-Divisional Water Quality Engineer',
    department: 'Ministry of Jal Shakti (Water Supply)',
    reason: 'Special Medical Sanitation Emergency & Priority Rebalancing',
    initiatedBy: 'Supervisor S. Chandran',
    approvedBy: 'Director (Grievance Redressal)',
    timestamp: '2026-11-04 16:45',
    status: 'COMPLETED',
    notes: 'Approved under Fast-Track Citizen Redressal Cadre Clause 4(b).'
  },
  {
    id: 'REASSIGN-2024-086',
    complaintId: 'GRV-2024-8821',
    complaintTitle: 'Encroachment of storm water drain buffering culvert',
    previousOfficer: 'Sri Anand Murthy',
    previousOfficerId: 'off-9',
    previousOfficerDesignation: 'Assistant Chief Town Planner',
    newOfficer: 'Praveen Kumar',
    newOfficerId: 'off-5',
    newOfficerDesignation: 'Revenue Inspector (Zone 8)',
    department: 'Urban Development & Municipal Corp (BBMP)',
    reason: 'Officer on Medical Leave (Temporary Cadre Proxy)',
    initiatedBy: 'BBMP Administrative Head',
    approvedBy: 'Pending Ombudsman Approval',
    timestamp: '2026-11-07 09:20',
    status: 'PENDING_APPROVAL',
    notes: 'Temporary transfer requested pending formal clearance.'
  }
];

const ComplaintContext = createContext();

export const ComplaintProvider = ({ children }) => {
  const [complaints, setComplaints] = useState(MERGED_COMPLAINTS);
  const [departments, setDepartments] = useState(DEPARTMENTS_DATA);
  const [officers, setOfficers] = useState(OFFICERS_DATA);
  const [citizens, setCitizens] = useState(CITIZENS_DATA);
  const [reminders, setReminders] = useState(INITIAL_REMINDER_RECORDS);
  const [escalations, setEscalations] = useState(INITIAL_ESCALATION_RECORDS);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);
  const [communications, setCommunications] = useState(COMMUNICATIONS_DATA);
  const [reassignments, setReassignments] = useState(INITIAL_REASSIGNMENTS);
  const [complaintHistory, setComplaintHistory] = useState(INITIAL_COMPLAINT_HISTORY);

  // Generate Unique Canonical Token ID (RTK-2026-XXXXXX)
  const generateTrackingId = () => {
    return generateNextTrackingId(complaints);
  };

  // Duplicate Complaint Detection heuristic
  const checkDuplicate = (title, departmentId, district) => {
    if (!title || title.length < 5) return null;
    const normalized = title.trim().toLowerCase();
    const matches = complaints.filter(c => {
      const sameDept = departmentId ? c.departmentId === departmentId : true;
      const sameDistrict = district ? (c.district || '').toLowerCase() === district.toLowerCase() : true;
      const wordsA = normalized.split(/\s+/).filter(w => w.length > 3);
      const wordsB = (c.title || '').toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const common = wordsA.filter(w => wordsB.includes(w));
      const textSimilarity = wordsA.length > 0 ? (common.length / wordsA.length) : 0;
      return (sameDept && sameDistrict && textSimilarity > 0.35);
    });
    return matches.length > 0 ? matches[0] : null;
  };

  // Automated Department Identification
  const autoIdentifyDepartment = (text) => {
    const lower = (text || '').toLowerCase();
    if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe') || lower.includes('drinking') || lower.includes('ನೀರು')) {
      return departments.find(d => d.code === 'JAL') || departments[1];
    }
    if (lower.includes('road') || lower.includes('pothole') || lower.includes('highway') || lower.includes('traffic') || lower.includes('ರಸ್ತೆ') || lower.includes('ಗುಂಡಿ')) {
      return departments.find(d => d.code === 'MORTH') || departments[0];
    }
    if (lower.includes('meter') || lower.includes('power') || lower.includes('bill') || lower.includes('electric') || lower.includes('ವಿದ್ಯುತ್')) {
      return departments.find(d => d.code === 'POWER') || departments[3];
    }
    if (lower.includes('sewage') || lower.includes('drain') || lower.includes('tax') || lower.includes('garbage') || lower.includes('ಖಾತಾ')) {
      return departments.find(d => d.code === 'URBAN') || departments[2];
    }
    if (lower.includes('pension') || lower.includes('welfare') || lower.includes('scheme') || lower.includes('old age') || lower.includes('ಪಿಂಚಣಿ')) {
      return departments.find(d => d.code === 'WELFARE') || departments[5];
    }
    return departments[0];
  };

  // Compute Health Score (0 - 100)
  const computeHealthScore = (c) => {
    let score = 100;
    if (c.status === 'OVERDUE') score -= 50;
    if (c.escalationTier === 'TIER_1') score -= 15;
    if (c.escalationTier === 'TIER_2') score -= 30;
    if (c.escalationTier === 'TIER_3') score -= 45;
    if (c.priority === 'CRITICAL') score -= 20;
    if (c.priority === 'HIGH') score -= 10;
    if (c.hoursRemaining < 0) score -= Math.min(25, Math.abs(c.hoursRemaining));
    return Math.max(10, Math.min(100, score));
  };

  // Register New Complaint with Full Intake Workflow
  const registerNewComplaint = (formData) => {
    const trackingId = generateNextTrackingId(complaints);
    const nowIso = new Date().toISOString();
    const nowStr = nowIso.replace('T', ' ').substring(0, 16);

    // Resolve Category mapping
    let matchedCategory = null;
    if (formData.category) {
      matchedCategory = COMPLAINT_CATEGORIES.find(c => c.name.toLowerCase() === formData.category.toLowerCase() || c.id === formData.category);
    }

    const dept = (formData.departmentId ? departments.find(d => d.id === formData.departmentId) : null)
      || (matchedCategory ? departments.find(d => d.id === matchedCategory.departmentId) : null)
      || autoIdentifyDepartment((formData.title || '') + ' ' + (formData.description || ''))
      || departments[0];

    const priority = formData.priority || 'MEDIUM';
    const slaHours = PRIORITY_CONFIG[priority]?.slaHours || (matchedCategory?.defaultSlaHours || 72);
    const slaDeadline = new Date(Date.now() + slaHours * 3600 * 1000).toISOString();
    const followUpDeadline = new Date(Date.now() + Math.max(24, Math.floor(slaHours * 0.6)) * 3600 * 1000).toISOString().slice(0, 10);

    const isDraft = formData.isDraft === true;
    const initialStatus = isDraft ? 'DRAFT' : 'NEWLY_REGISTERED';
    const initialVerification = isDraft ? 'DRAFT' : 'PENDING';

    const newTicket = {
      id: trackingId,
      token: trackingId,
      trackingId: trackingId,
      legacyToken: null,
      citizenId: formData.citizenId || `cit-${Date.now().toString().slice(-4)}`,
      citizenName: formData.citizenName || 'Citizen Redressal Applicant',
      citizenPhone: formData.citizenPhone || formData.mobileNumber || '+91 98000 00000',
      citizenEmail: formData.citizenEmail || formData.email || 'citizen@resolvetrack.gov.in',
      gender: formData.gender || 'Not Disclosed',
      citizenIdType: formData.citizenId ? 'Citizen ID Verified' : 'Standard Web Intake',
      address: formData.address || 'Karnataka',
      district: formData.district || 'Bengaluru Urban',
      taluk: formData.taluk || 'Bengaluru South',
      ward: formData.ward || formData.village || 'Ward 14',
      pincode: formData.pincode || formData.pinCode || '560001',
      location: formData.location || '12.9716° N, 77.5946° E',
      category: matchedCategory ? matchedCategory.name : (formData.category || 'General Administration'),
      subcategory: formData.subcategory || 'General Inquiry',
      departmentId: dept.id,
      departmentName: dept.name,
      title: formData.title || formData.complaintTitle || 'Civic Grievance',
      titleKn: formData.titleKn || null,
      description: formData.description || formData.complaintDescription || '',
      descriptionKn: formData.descriptionKn || null,
      priority,
      status: initialStatus,
      verificationStatus: initialVerification,
      verificationNotes: null,
      rejectionReason: null,
      additionalInfoPrompt: null,
      escalationTier: 'NONE',
      slaDeadline,
      followUpDeadline,
      hoursRemaining: slaHours,
      daysOverdue: 0,
      healthScore: 98,
      assignedOfficer: null,
      preferredLanguage: formData.preferredLanguage || 'English',
      submissionChannel: formData.submissionChannel || 'Citizen Web Portal',
      actions: [
        {
          id: 1,
          type: isDraft ? 'DRAFT_SAVED' : 'SUBMITTED',
          date: nowStr,
          user: formData.citizenName || 'Citizen',
          text: isDraft
            ? 'Complaint draft initialized and saved to local citizen session.'
            : 'Grievance submitted via ResolveTrack Civic Intake with verified citizen declaration and location pin.'
        }
      ],
      nextBestAction: isDraft ? 'Complete draft sections and submit' : 'Jurisdictional scrutiny by Central Admin Desk',
      attachments: Array.isArray(formData.attachments) ? formData.attachments : [],
      audioTranscript: formData.audioTranscript || null,
      csatRating: null,
      resolutionSummary: null,
      similarCount: 0,
      declarationConfirmed: formData.declarationConfirmed !== false,
      privacyConsent: formData.privacyConsent !== false,
      createdAt: nowStr,
      updatedAt: nowStr
    };

    setComplaints(prev => [newTicket, ...prev]);

    // Record in global chronological complaintHistory
    setComplaintHistory(prev => [
      {
        id: `HIST-${Date.now().toString().slice(-6)}`,
        complaintId: trackingId,
        eventType: isDraft ? 'Draft Saved' : 'Complaint Registration',
        description: `${newTicket.title} registered by ${newTicket.citizenName} under ${newTicket.category}.`,
        responsibleUser: newTicket.citizenName,
        timestamp: nowStr,
        previousValue: 'NONE',
        newValue: initialStatus
      },
      ...prev
    ]);

    // Dispatch system notification
    if (!isDraft) {
      const newNotif = {
        id: `NOTIF-${Date.now().toString().slice(-4)}`,
        token: trackingId,
        type: 'NEW_REGISTRATION',
        title: 'New Grievance Registered',
        message: `${newTicket.trackingId}: ${newTicket.title} (${newTicket.district}) awaiting scrutiny.`,
        time: 'Just now',
        unread: true,
        severity: 'info',
        actionRoute: `/admin/all-complaints`
      };
      setNotifications(prev => [newNotif, ...prev]);
    }

    return newTicket;
  };

  // Add Complaint (backward compatibility alias)
  const addComplaint = (formData) => {
    return registerNewComplaint(formData);
  };

  // Save or Update Complaint Draft
  const saveDraftComplaint = (draftData) => {
    const existing = complaints.find(c => c.token === draftData.token || c.id === draftData.id);
    if (existing) {
      setComplaints(prev => prev.map(c => {
        if (c.token === draftData.token || c.id === draftData.id) {
          return {
            ...c,
            ...draftData,
            status: 'DRAFT',
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
        }
        return c;
      }));
      return existing;
    }
    return registerNewComplaint({ ...draftData, isDraft: true });
  };

  // Update Complaint Permitted Details
  const updateComplaintDetails = (complaintId, fields = {}, officerUser = 'Central Admin Desk') => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId || c.token === complaintId || c.trackingId === complaintId || c.legacyToken === complaintId) {
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        return {
          ...c,
          ...fields,
          // Guarantee trackingId is immutable
          id: c.id,
          token: c.token,
          trackingId: c.trackingId,
          legacyToken: c.legacyToken,
          updatedAt: nowStr,
          actions: [
            ...curActions,
            {
              id: curActions.length + 1,
              type: 'EDIT_DETAILS',
              date: nowStr,
              user: officerUser,
              text: `Permitted complaint details updated: ${Object.keys(fields).join(', ')}.`
            }
          ]
        };
      }
      return c;
    }));
  };

  // Verify Complaint Workflow
  const verifyComplaint = (complaintId, verificationNotes = '', adminUser = 'Central Admin Desk') => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let matchedTicket = null;

    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId || c.token === complaintId || c.trackingId === complaintId || c.legacyToken === complaintId) {
        matchedTicket = c;
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        return {
          ...c,
          status: 'VERIFIED',
          verificationStatus: 'VERIFIED',
          verificationNotes: verificationNotes || 'Jurisdictional and factual scrutiny completed successfully. Approved for officer allocation.',
          updatedAt: nowStr,
          nextBestAction: 'Assign to department nodal officer via Workload Allocator',
          actions: [
            ...curActions,
            {
              id: curActions.length + 1,
              type: 'VERIFIED',
              date: nowStr,
              user: adminUser,
              text: `Verification completed: ${verificationNotes || 'Document & jurisdictional validity certified.'}`
            }
          ]
        };
      }
      return c;
    }));

    if (matchedTicket) {
      setComplaintHistory(prev => [
        {
          id: `HIST-${Date.now().toString().slice(-6)}`,
          complaintId: matchedTicket.token,
          eventType: 'Complaint Verified',
          description: `Grievance verified by ${adminUser}. Ready for nodal officer assignment.`,
          responsibleUser: adminUser,
          timestamp: nowStr,
          previousValue: matchedTicket.status,
          newValue: 'VERIFIED'
        },
        ...prev
      ]);

      setNotifications(prev => [
        {
          id: `NOTIF-${Date.now().toString().slice(-4)}`,
          token: matchedTicket.token,
          type: 'STATUS_UPDATE',
          title: 'Complaint Verified',
          message: `${matchedTicket.token} has been verified and is ready for nodal officer assignment.`,
          time: 'Just now',
          unread: true,
          severity: 'success',
          actionRoute: `/admin/officer-workload`
        },
        ...prev
      ]);
    }
  };

  // Request Additional Information Workflow
  const requestAdditionalInfo = (complaintId, message, adminUser = 'Central Admin Desk') => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let matchedTicket = null;

    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId || c.token === complaintId || c.trackingId === complaintId || c.legacyToken === complaintId) {
        matchedTicket = c;
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        return {
          ...c,
          status: 'ADDITIONAL_INFO_REQUIRED',
          verificationStatus: 'ADDITIONAL_INFO_REQUIRED',
          additionalInfoPrompt: message,
          updatedAt: nowStr,
          nextBestAction: 'Awaiting citizen evidence / supplementary response',
          actions: [
            ...curActions,
            {
              id: curActions.length + 1,
              type: 'INFO_REQUESTED',
              date: nowStr,
              user: adminUser,
              text: `Additional information requested from citizen: "${message}"`
            }
          ]
        };
      }
      return c;
    }));

    if (matchedTicket) {
      // Record communication log
      setCommunications(prev => [
        {
          id: `COMM-${Date.now().toString().slice(-5)}`,
          token: matchedTicket.token,
          channel: 'SMS & Civic App Nudge',
          recipient: `${matchedTicket.citizenName} (${matchedTicket.citizenPhone})`,
          subject: `Additional Information Needed for Grievance ${matchedTicket.token}`,
          message: message,
          timestamp: nowStr,
          status: 'SENT',
          delivered: true
        },
        ...prev
      ]);

      setComplaintHistory(prev => [
        {
          id: `HIST-${Date.now().toString().slice(-6)}`,
          complaintId: matchedTicket.token,
          eventType: 'Information Requested',
          description: `Clarification prompt dispatched to citizen: ${message}`,
          responsibleUser: adminUser,
          timestamp: nowStr,
          previousValue: matchedTicket.status,
          newValue: 'ADDITIONAL_INFO_REQUIRED'
        },
        ...prev
      ]);
    }
  };

  // Reject Complaint with Mandatory Reason (Preserved in state)
  const rejectComplaint = (complaintId, rejectionReason, adminUser = 'Central Admin Desk') => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let matchedTicket = null;

    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId || c.token === complaintId || c.trackingId === complaintId || c.legacyToken === complaintId) {
        matchedTicket = c;
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        return {
          ...c,
          status: 'REJECTED',
          verificationStatus: 'REJECTED',
          rejectionReason: rejectionReason,
          updatedAt: nowStr,
          nextBestAction: 'Case rejected. Retained in immutable records for audit and citizen appeal.',
          actions: [
            ...curActions,
            {
              id: curActions.length + 1,
              type: 'REJECTED',
              date: nowStr,
              user: adminUser,
              text: `Complaint rejected: "${rejectionReason}". Docket retained in audit gazette.`
            }
          ]
        };
      }
      return c;
    }));

    if (matchedTicket) {
      setComplaintHistory(prev => [
        {
          id: `HIST-${Date.now().toString().slice(-6)}`,
          complaintId: matchedTicket.token,
          eventType: 'Complaint Rejected',
          description: `Rejected with reason: ${rejectionReason}`,
          responsibleUser: adminUser,
          timestamp: nowStr,
          previousValue: matchedTicket.status,
          newValue: 'REJECTED'
        },
        ...prev
      ]);

      setNotifications(prev => [
        {
          id: `NOTIF-${Date.now().toString().slice(-4)}`,
          token: matchedTicket.token,
          type: 'STATUS_UPDATE',
          title: 'Complaint Rejected',
          message: `${matchedTicket.token} was rejected by scrutiny desk: ${rejectionReason}`,
          time: 'Just now',
          unread: true,
          severity: 'warning',
          actionRoute: `/admin/all-complaints`
        },
        ...prev
      ]);
    }
  };

  // Assign Officer to Complaint (Integrated with Officer Workload & Reminders)
  const assignComplaintOfficer = (complaintId, officerId, meta = {}) => {
    const targetOfficer = officers.find(o => o.id === officerId || o.employeeId === officerId);
    if (!targetOfficer) return false;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let updatedTicket = null;

    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId || c.token === complaintId || c.trackingId === complaintId || c.legacyToken === complaintId) {
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        const nextStatus = (c.status === 'NEWLY_REGISTERED' || c.status === 'VERIFIED' || c.status === 'SUBMITTED') ? 'ASSIGNED' : c.status;
        updatedTicket = {
          ...c,
          status: nextStatus,
          assignedOfficer: targetOfficer,
          departmentId: targetOfficer.departmentId || c.departmentId,
          departmentName: targetOfficer.department || c.departmentName,
          updatedAt: nowStr,
          nextBestAction: 'Conduct field inspection and issue preliminary status note',
          actions: [
            ...curActions,
            {
              id: curActions.length + 1,
              type: 'ASSIGNED',
              date: nowStr,
              user: meta.assignedBy || 'Central Admin Allocator',
              text: `Assigned to Nodal Officer ${targetOfficer.name} (${targetOfficer.badge || targetOfficer.employeeId} - ${targetOfficer.designation}). Note: ${meta.notes || 'Normal cadence allocation.'}`
            }
          ]
        };
        return updatedTicket;
      }
      return c;
    }));

    // Update Officer Workload: increment activeCaseload and add complaint
    setOfficers(prev => prev.map(o => {
      if (o.id === targetOfficer.id) {
        return {
          ...o,
          activeCaseload: (o.activeCaseload || 0) + 1,
          pendingCount: (o.pendingCount || 0) + 1,
          recentActivity: `Assigned new grievance #${complaintId} on ${nowStr}`
        };
      }
      return o;
    }));

    if (updatedTicket) {
      setComplaintHistory(prev => [
        {
          id: `HIST-${Date.now().toString().slice(-6)}`,
          complaintId: updatedTicket.token,
          eventType: 'Officer Assigned',
          description: `Assigned to ${targetOfficer.name} (${targetOfficer.department}).`,
          responsibleUser: meta.assignedBy || 'Central Admin Allocator',
          timestamp: nowStr,
          previousValue: 'Unassigned',
          newValue: targetOfficer.name
        },
        ...prev
      ]);

      // Schedule eligible advance reminder in Reminder Centre
      const newRem = {
        id: `REM-${Math.floor(2000 + Math.random() * 8000)}`,
        token: updatedTicket.token,
        type: 'ADVANCE_NOTICE',
        channel: 'EMAIL',
        recipientName: `${targetOfficer.name} (Nodal Officer)`,
        recipientRole: 'Nodal Officer',
        department: targetOfficer.department || updatedTicket.departmentName,
        subject: `New Grievance Assigned: #${updatedTicket.token} - ${updatedTicket.title}`,
        scheduledTime: nowStr,
        dispatchedTime: nowStr,
        status: 'DELIVERED',
        isOverdue: false,
        cadenceStage: 'Cadre Assignment',
        nudgeCount: 1,
        statutoryLiability: 'Section 4 SLA Target'
      };
      setReminders(prev => [newRem, ...prev]);
    }

    return true;
  };

  // Update Status
  const updateComplaintStatus = (id, newStatus, remarks, officerName = 'Nodal Officer') => {
    setComplaints(prev => prev.map(c => {
      if (c.id === id || c.token === id) {
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        const newActions = [
          ...curActions,
          {
            id: curActions.length + 1,
            type: 'STATUS_UPDATE',
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            user: officerName,
            text: `Status updated to ${newStatus}. Remarks: ${remarks || 'Routine operational update.'}`
          }
        ];
        return {
          ...c,
          status: newStatus,
          actions: newActions,
          healthScore: computeHealthScore({ ...c, status: newStatus }),
          resolutionSummary: newStatus === 'RESOLVED' || newStatus === 'ACTION_TAKEN' ? (remarks || c.resolutionSummary) : c.resolutionSummary
        };
      }
      return c;
    }));
  };

  // Reassign Officer with Full Audit Trail & Cadre Notification
  const reassignOfficer = (complaintId, officerId, meta = {}) => {
    const targetOfficer = officers.find(o => o.id === officerId);
    if (!targetOfficer) return false;

    const matchedComplaint = complaints.find(c => c.id === complaintId || c.token === complaintId);
    const oldOfficer = matchedComplaint?.assignedOfficer;
    const oldOfficerId = oldOfficer?.id;

    const reason = meta.reason || 'Caseload Rebalancing & Optimal Cadre Allocation';
    const initiatedBy = meta.initiatedBy || 'Zonal Administrator';
    const approvedBy = meta.approvedBy || 'Shri Vikram Malhotra, IAS';
    const notes = meta.notes || 'Reassigned in accordance with GovOps Rule 14-B workload mitigation guidelines.';
    const status = meta.status || 'COMPLETED';

    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId || c.token === complaintId) {
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        const newActions = [
          ...curActions,
          {
            id: curActions.length + 1,
            type: 'OFFICER_REASSIGNMENT',
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            user: initiatedBy,
            text: `Docket reassigned from ${c.assignedOfficer?.name || 'Unassigned'} to ${targetOfficer.name} (${targetOfficer.badge || targetOfficer.employeeId} - ${targetOfficer.designation}). Reason: ${reason}. Authorized by: ${approvedBy}.`
          }
        ];
        return {
          ...c,
          assignedOfficer: targetOfficer,
          actions: newActions
        };
      }
      return c;
    }));

    // Rebalance officers active caseload
    setOfficers(prev => prev.map(o => {
      if (o.id === officerId) {
        return {
          ...o,
          activeCaseload: (o.activeCaseload || 0) + 1,
          pendingCount: (o.pendingCount || 0) + 1
        };
      }
      if (oldOfficerId && o.id === oldOfficerId) {
        return {
          ...o,
          activeCaseload: Math.max(0, (o.activeCaseload || 1) - 1),
          pendingCount: Math.max(0, (o.pendingCount || 1) - 1)
        };
      }
      return o;
    }));

    // Record in Reassignment History
    const newRecord = {
      id: `REASSIGN-${Date.now().toString().slice(-4)}`,
      complaintId: matchedComplaint?.token || complaintId,
      complaintTitle: matchedComplaint?.title || 'Public Grievance Docket',
      previousOfficer: oldOfficer?.name || 'Unassigned',
      previousOfficerId: oldOfficer?.id || 'none',
      previousOfficerDesignation: oldOfficer?.designation || 'Zonal Officer',
      newOfficer: targetOfficer.name,
      newOfficerId: targetOfficer.id,
      newOfficerDesignation: targetOfficer.designation,
      department: targetOfficer.department || matchedComplaint?.departmentName || 'General Administration',
      reason,
      initiatedBy,
      approvedBy,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status,
      notes
    };
    setReassignments(prev => [newRecord, ...prev]);

    // Record in Complaint Action History
    setComplaintHistory(prev => [
      {
        id: `HIST-${Date.now().toString().slice(-4)}`,
        complaintToken: matchedComplaint?.token || complaintId,
        eventType: 'Officer Reassigned',
        description: `Docket transferred from ${oldOfficer?.name || 'Unassigned'} to ${targetOfficer.name} (${targetOfficer.badge || targetOfficer.employeeId}). Reason: ${reason}`,
        responsibleUser: initiatedBy,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        previousValue: oldOfficer?.name || 'Unassigned',
        newValue: targetOfficer.name
      },
      ...prev
    ]);

    // Dispatch notifications to target officer and previous officer
    const notifTarget = {
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      token: matchedComplaint?.token || complaintId,
      type: 'OFFICER_REASSIGNMENT',
      title: 'New Complaint Reassigned to Your Queue',
      message: `Dossier #${matchedComplaint?.token || complaintId} (${matchedComplaint?.title || 'Complaint'}) transferred to you. Reason: ${reason}`,
      time: 'Just now',
      unread: true,
      severity: 'info',
      actionRoute: `/officer/complaints/${matchedComplaint?.token || complaintId}`
    };

    setNotifications(prev => [notifTarget, ...prev]);

    return true;
  };

  // Escalate Complaint
  const escalateComplaint = (id, targetTier = 'TIER_2', reason = 'SLA Breach Mandate') => {
    setComplaints(prev => prev.map(c => {
      if (c.id === id || c.token === id) {
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        const newActions = [
          ...curActions,
          {
            id: curActions.length + 1,
            type: 'ESCALATION',
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            user: 'Apex Vigilance Matrix',
            text: `Autonomous escalation triggered to ${targetTier}. Reason: ${reason}`
          }
        ];
        return {
          ...c,
          escalationTier: targetTier,
          status: 'OVERDUE',
          actions: newActions,
          healthScore: computeHealthScore({ ...c, escalationTier: targetTier, status: 'OVERDUE' })
        };
      }
      return c;
    }));

    // Add to Escalations data
    const matched = complaints.find(c => c.id === id || c.token === id);
    const newEsc = {
      id: `ESC-${Date.now().toString().slice(-4)}`,
      token: id,
      title: matched ? matched.title : 'Grievance Breach',
      department: matched ? matched.departmentName : 'Department',
      nodalOfficer: matched ? matched.assignedOfficer?.name : 'Nodal Officer',
      level: targetTier,
      daysOverdue: 2,
      hoursOverdue: 48,
      status: 'ACTIVE_ESCALATION',
      penaltyExposure: '₹1,500 pending',
      rootCause: reason,
      mandatedAction: 'Executive ombudsman hearing scheduled.',
      timeline: [
        { time: new Date().toISOString().replace('T', ' ').substring(0, 16), text: `Escalated to ${targetTier}: ${reason}` }
      ]
    };
    setEscalations(prev => [newEsc, ...prev]);

    // Dispatch notification
    const newNotif = {
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      token: id,
      type: 'CRITICAL_BREACH',
      title: `${targetTier} Escalation Triggered`,
      message: `Statutory Show-Cause notice generated for ticket #${id}. Reason: ${reason}`,
      time: 'Just now',
      unread: true,
      severity: 'error',
      actionRoute: `/supervisor/escalations?token=${id}`
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Create Reminder / Nudge
  const createReminder = (remData) => {
    const newRem = {
      id: `REM-${Math.floor(2000 + Math.random() * 8000)}`,
      token: remData.token,
      type: remData.type || 'SLA_BREACH_WARNING',
      channel: remData.channel || 'WHATSAPP & SMS',
      recipientName: remData.recipientName || 'Nodal Officer',
      recipientRole: remData.recipientRole || 'Department Officer',
      department: remData.department || 'Department',
      subject: remData.subject || 'Reminder notification',
      scheduledTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      dispatchedTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'DELIVERED',
      isOverdue: false,
      cadenceStage: remData.cadenceStage || 'Tier 1 Warning',
      nudgeCount: 1,
      statutoryLiability: remData.statutoryLiability || 'None'
    };
    setReminders(prev => [newRem, ...prev]);

    // Also append to communications log
    const newComm = {
      id: `COMM-${Date.now().toString().slice(-4)}`,
      token: remData.token,
      channel: remData.channel?.includes('WHATSAPP') ? 'WHATSAPP' : remData.channel?.includes('SMS') ? 'SMS' : 'EMAIL',
      channelLabel: remData.channel || 'Automated Dispatch Gateway',
      recipient: remData.recipientName,
      subject: remData.subject,
      bodySnippet: remData.subject,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      deliveryStatus: 'DELIVERED',
      isSimulated: true
    };
    setCommunications(prev => [newComm, ...prev]);
  };

  // Citizen Resolution Verification Loop & CSAT
  const verifyResolution = (id, csatRating, feedback, reopen = false) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === id || c.token === id) {
        const status = reopen ? 'REOPENED' : 'RESOLVED';
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        const newActions = [
          ...curActions,
          {
            id: curActions.length + 1,
            type: reopen ? 'CITIZEN_REOPEN' : 'CITIZEN_VERIFIED',
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            user: c.citizenName || 'Citizen',
            text: reopen
              ? `Citizen dissatisfied. Grievance re-opened. Feedback: ${feedback || 'No remarks provided.'}`
              : `Citizen confirmed resolution. Rated CSAT: ${csatRating || 5}/5 stars. Feedback: ${feedback || 'Satisfactory redressal.'}`
          }
        ];
        return {
          ...c,
          status,
          csatRating,
          actions: newActions,
          healthScore: reopen ? 20 : 100
        };
      }
      return c;
    }));
  };

  // Send Demonstration Reminder with Idempotency Safeguard
  const sendComplaintReminder = ({ complaintToken, channel = 'IN_APP', recipientName, recipientRole = 'Department Officer', subject, notes = '' }) => {
    const now = new Date();
    const dateStr = now.toISOString().substring(0, 10);
    // Safeguard: Check if same complaint and channel has already received a reminder today
    const existing = reminders.find(r => r.complaintToken === complaintToken && r.channel === channel && (r.dispatchedDate || '').startsWith(dateStr));
    if (existing) {
      return { success: false, duplicate: true, message: `A demonstration reminder via ${channel} was already generated for #${complaintToken} today. Duplicate prevented.` };
    }

    const matched = complaints.find(c => c.token === complaintToken || c.id === complaintToken);
    const officerName = recipientName || matched?.assignedOfficer?.name || 'Department Officer';

    const newRem = {
      id: `REM-${Date.now().toString().slice(-4)}`,
      complaintId: complaintToken,
      complaintToken,
      type: 'SLA_BREACH_WARNING',
      channel,
      recipientName: officerName,
      recipientRole,
      recipientContact: matched?.assignedOfficer?.mobile || 'portal-alert',
      department: matched?.departmentName || 'General Administration',
      subject: subject || `Urgent Follow-up Notice for Grievance #${complaintToken}`,
      scheduledDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      dispatchedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'DELIVERED',
      isSimulated: true,
      notes: notes || `Mock reminder simulated via ${channel}. Real external delivery requires provider integration.`
    };

    setReminders(prev => [newRem, ...prev]);

    // Update complaint reminderStatus
    setComplaints(prev => prev.map(c => {
      if (c.token === complaintToken || c.id === complaintToken) {
        return { ...c, reminderStatus: 'SENT' };
      }
      return c;
    }));

    // Record in Action History
    setComplaintHistory(prev => [
      {
        id: `HIST-${Date.now().toString().slice(-4)}`,
        complaintToken,
        eventType: 'Reminder Generated',
        description: `Demonstration reminder queued and dispatched via ${channel} to ${officerName}. Subject: ${subject || 'Urgent Follow-up Notice'}`,
        responsibleUser: 'Supervisor / Administrator',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        previousValue: matched?.reminderStatus || 'NONE',
        newValue: 'SENT'
      },
      ...prev
    ]);

    // Dispatch notification
    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now().toString().slice(-4)}`,
        token: complaintToken,
        type: 'STATUS_UPDATE',
        title: `Reminder Dispatched (${channel})`,
        message: `Notice sent to ${officerName} for docket #${complaintToken}.`,
        time: 'Just now',
        unread: true,
        severity: 'info',
        actionRoute: `/supervisor/escalation-review`
      },
      ...prev
    ]);

    return { success: true, reminder: newRem };
  };

  // Escalate Complaint Level with Level 0-3 Support & Deduplication Safeguard
  const escalateComplaintLevel = ({ complaintToken, targetLevel, reason, reviewingAuthority, remarks, initiatedBy = 'Supervisor Oversight' }) => {
    const matched = complaints.find(c => c.token === complaintToken || c.id === complaintToken);
    if (!matched) return { success: false, message: 'Complaint not found' };

    // Safeguard: Check if complaint is already at or above targetLevel actively
    const existingEsc = escalations.find(e => e.complaintToken === complaintToken && e.escalationLevel === targetLevel && e.currentStatus === 'ACTIVE_ESCALATION');
    if (existingEsc) {
      return { success: false, duplicate: true, message: `Complaint #${complaintToken} is already actively escalated at Level ${targetLevel}. Duplicate prevented.` };
    }

    const tierMap = { 1: 'TIER_1', 2: 'TIER_2', 3: 'TIER_3', 0: 'NONE' };
    const labelMap = {
      0: 'Level 0: Normal Monitoring',
      1: 'Level 1: Officer Reminder',
      2: 'Level 2: Supervisor Escalation',
      3: 'Level 3: Department Head Review'
    };
    const targetTier = tierMap[targetLevel] || 'TIER_2';
    const levelLabel = labelMap[targetLevel] || `Level ${targetLevel}`;
    const authority = reviewingAuthority || (targetLevel === 3 ? 'District Magistrate & Zonal Ombudsman' : 'Zonal Supervisor');

    // Update complaint
    setComplaints(prev => prev.map(c => {
      if (c.token === complaintToken || c.id === complaintToken) {
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        const newActions = [
          ...curActions,
          {
            id: curActions.length + 1,
            type: 'ESCALATION',
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            user: initiatedBy,
            text: `Escalated to ${levelLabel}. Reason: ${reason}. Authority: ${authority}. Remarks: ${remarks || 'None'}`
          }
        ];
        return {
          ...c,
          status: 'OVERDUE',
          escalationLevel: targetLevel,
          escalationStatus: 'ACTIVE_ESCALATION',
          escalationTier: targetTier,
          escalationReason: reason,
          reviewingAuthority: authority,
          actions: newActions,
          healthScore: computeHealthScore({ ...c, escalationTier: targetTier, status: 'OVERDUE' })
        };
      }
      return c;
    }));

    // Add to Escalations
    const newEsc = {
      id: `ESC-${Date.now().toString().slice(-4)}`,
      complaintId: complaintToken,
      complaintToken,
      complaintTitle: matched.title,
      department: matched.departmentName,
      departmentId: matched.departmentId,
      escalationLevel: targetLevel,
      levelLabel,
      escalationReason: reason,
      previousOfficer: matched.assignedOfficer?.name || 'Unassigned',
      previousOfficerId: matched.assignedOfficer?.id || 'none',
      currentOfficer: matched.assignedOfficer?.name || 'Unassigned',
      currentOfficerId: matched.assignedOfficer?.id || 'none',
      escalationDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      reviewingAuthority: authority,
      currentStatus: 'ACTIVE_ESCALATION',
      penaltyExposure: targetLevel === 3 ? '₹1,500 pending (Sec 4 Sakala Act)' : '₹500 pending',
      mandatedAction: remarks || `Expedite resolution under ${levelLabel} directive.`,
      decisions: [
        {
          id: 1,
          author: initiatedBy,
          role: 'Supervisor',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          decision: `Escalated to ${levelLabel}`,
          note: remarks || reason
        }
      ]
    };
    setEscalations(prev => [newEsc, ...prev]);

    // Record in Action History
    setComplaintHistory(prev => [
      {
        id: `HIST-${Date.now().toString().slice(-4)}`,
        complaintToken,
        eventType: 'Supervisor Escalation',
        description: `Escalated to ${levelLabel}: ${reason}. Authority: ${authority}.`,
        responsibleUser: initiatedBy,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        previousValue: `Level ${matched.escalationLevel || 0}`,
        newValue: levelLabel
      },
      ...prev
    ]);

    // Dispatch notification
    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now().toString().slice(-4)}`,
        token: complaintToken,
        type: 'CRITICAL_BREACH',
        title: `${levelLabel} Directive Triggered`,
        message: `Grievance #${complaintToken} escalated. Reason: ${reason}`,
        time: 'Just now',
        unread: true,
        severity: targetLevel >= 3 ? 'error' : 'warning',
        actionRoute: `/supervisor/escalation-review`
      },
      ...prev
    ]);

    return { success: true, escalation: newEsc };
  };

  // Add Review Note (Supervisor / Officer)
  const addComplaintReviewNote = ({ complaintToken, noteText, authorName = 'Reviewing Authority', authorRole = 'Supervisor' }) => {
    if (!noteText?.trim()) return { success: false, message: 'Note text required' };

    setComplaints(prev => prev.map(c => {
      if (c.token === complaintToken || c.id === complaintToken) {
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        return {
          ...c,
          actions: [
            ...curActions,
            {
              id: curActions.length + 1,
              type: 'NOTE',
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              user: `${authorName} (${authorRole})`,
              text: noteText
            }
          ]
        };
      }
      return c;
    }));

    setComplaintHistory(prev => [
      {
        id: `HIST-${Date.now().toString().slice(-4)}`,
        complaintToken,
        eventType: 'Officer Action Recorded',
        description: `Review note recorded: "${noteText}"`,
        responsibleUser: `${authorName} (${authorRole})`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        previousValue: null,
        newValue: noteText
      },
      ...prev
    ]);

    return { success: true };
  };

  // Update Follow-up Deadline & Compute Days Overdue/Remaining
  const updateFollowUpDeadline = ({ complaintToken, nextFollowUpDate, dueDate, status }) => {
    const matched = complaints.find(c => c.token === complaintToken || c.id === complaintToken);
    if (!matched) return { success: false };

    const newNextDate = nextFollowUpDate || matched.nextFollowUpDate;
    const newDueDate = dueDate || matched.dueDate || matched.slaDeadline;

    const now = new Date();
    const parsedDue = new Date(newDueDate);
    const isPastDue = !isNaN(parsedDue) && parsedDue < now;
    const isResolved = status === 'RESOLVED' || matched.status === 'RESOLVED' || status === 'CLOSED' || matched.status === 'CLOSED';

    let updatedStatus = status || matched.status;
    if (!isResolved && isPastDue) {
      updatedStatus = 'OVERDUE';
    } else if (!isResolved && !isPastDue && updatedStatus === 'OVERDUE') {
      updatedStatus = 'IN_PROGRESS';
    }

    const daysRemaining = !isNaN(parsedDue) ? Math.ceil((parsedDue - now) / (1000 * 60 * 60 * 24)) : 0;
    const daysOverdue = daysRemaining < 0 ? Math.abs(daysRemaining) : 0;

    setComplaints(prev => prev.map(c => {
      if (c.token === complaintToken || c.id === complaintToken) {
        return {
          ...c,
          nextFollowUpDate: newNextDate,
          dueDate: newDueDate,
          slaDeadline: newDueDate,
          status: updatedStatus,
          daysRemaining: isResolved ? 0 : daysRemaining,
          daysOverdue: isResolved ? 0 : daysOverdue,
          hoursRemaining: isResolved ? 0 : daysRemaining * 24
        };
      }
      return c;
    }));

    setComplaintHistory(prev => [
      {
        id: `HIST-${Date.now().toString().slice(-4)}`,
        complaintToken,
        eventType: isPastDue && !isResolved ? 'Deadline Missed' : 'Follow-up Date Set',
        description: `Follow-up schedule updated. Next Follow-up: ${newNextDate}, Due Date: ${newDueDate}`,
        responsibleUser: 'Administrator / Supervisor',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        previousValue: matched.dueDate || matched.slaDeadline,
        newValue: newDueDate
      },
      ...prev
    ]);

    return { success: true };
  };

  // Create Manual Reminder (Section 5) with Deduplication Safeguard
  const createManualReminder = (formData) => {
    const {
      complaintToken,
      type = 'UPCOMING_FOLLOW_UP',
      typeLabel = 'Upcoming Follow-up',
      channel = 'WHATSAPP',
      recipientName,
      recipientRole = 'Department Officer',
      recipientContact,
      subject,
      message,
      messageKn,
      priority = 'NORMAL',
      scheduledDate,
      notes = ''
    } = formData;

    const matched = complaints.find(c => c.token === complaintToken || c.id === complaintToken);

    // Safeguard 1: Do not generate reminders for closed / resolved complaints
    if (matched && (matched.status === 'RESOLVED' || matched.status === 'CLOSED')) {
      return {
        success: false,
        message: `Complaint #${complaintToken} is already marked as ${matched.status}. Reminders cannot be generated for resolved complaints.`
      };
    }

    // Safeguard 2: Duplicate check
    const existing = reminders.find(
      r => r.complaintToken === complaintToken && r.type === type && r.channel === channel && r.scheduledDate === scheduledDate
    );
    if (existing) {
      return {
        success: false,
        duplicate: true,
        message: `An identical reminder for #${complaintToken} via ${channel} scheduled for ${scheduledDate} already exists. Duplicate prevented.`
      };
    }

    const now = new Date();
    const scheduledTime = scheduledDate ? new Date(scheduledDate) : now;
    const isFuture = !isNaN(scheduledTime) && scheduledTime > now;
    const status = isFuture ? 'SCHEDULED' : 'DELIVERED';

    const officerName = recipientName || matched?.assignedOfficer?.name || 'Department Officer';

    const newRem = {
      id: `REM-${Date.now().toString().slice(-4)}`,
      complaintId: complaintToken,
      complaintToken,
      complaintTitle: matched?.title || 'Public Grievance',
      citizenName: matched?.citizenName || 'Citizen Resident',
      assignedOfficer: officerName,
      department: matched?.departmentName || 'General Administration',
      departmentId: matched?.departmentId || 'dept-1',
      type,
      typeLabel,
      priority,
      channel,
      recipientName: officerName,
      recipientRole,
      recipientContact: recipientContact || matched?.assignedOfficer?.mobile || 'portal-gateway',
      subject: subject || `Statutory Notice for Complaint #${complaintToken}`,
      message: message || `Follow-up reminder for complaint #${complaintToken}.`,
      messageKn: messageKn || `ದೂರು #${complaintToken} ಗಾಗಿ ಅನುಸರಣಾ ಸೂಚನೆ.`,
      createdDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      scheduledDate: scheduledDate || new Date().toISOString().replace('T', ' ').substring(0, 16),
      dispatchedDate: isFuture ? null : new Date().toISOString().replace('T', ' ').substring(0, 16),
      status,
      isSimulated: true,
      failureReason: null,
      notes: notes || `Created manually via Intelligent Reminder Centre. Channel: ${channel}.`
    };

    setReminders(prev => [newRem, ...prev]);

    // Record in Action History
    setComplaintHistory(prev => [
      {
        id: `HIST-${Date.now().toString().slice(-4)}`,
        complaintToken,
        eventType: 'Reminder Generated',
        description: `Manual reminder (${typeLabel}) queued via ${channel} to ${officerName}. Priority: ${priority}.`,
        responsibleUser: 'Administrator',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        previousValue: null,
        newValue: `Scheduled: ${status}`
      },
      ...prev
    ]);

    // Dispatch in-app notification
    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now().toString().slice(-4)}`,
        token: complaintToken,
        type: 'STATUS_UPDATE',
        title: `Reminder Queued: ${typeLabel}`,
        message: `Notice scheduled via ${channel} for #${complaintToken}.`,
        time: 'Just now',
        unread: true,
        severity: priority === 'CRITICAL' ? 'error' : priority === 'HIGH' ? 'warning' : 'info',
        actionRoute: `/supervisor/reminder-centre`
      },
      ...prev
    ]);

    return { success: true, reminder: newRem };
  };

  // Retry Failed Reminder
  const retryFailedReminder = (reminderId) => {
    const target = reminders.find(r => r.id === reminderId);
    if (!target) return { success: false };

    setReminders(prev => prev.map(r => {
      if (r.id === reminderId) {
        return {
          ...r,
          status: 'DELIVERED',
          failureReason: null,
          dispatchedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          notes: `${r.notes || ''} [Retried successfully at ${new Date().toLocaleTimeString()} via simulated fallback gateway]`
        };
      }
      return r;
    }));

    setComplaintHistory(prev => [
      {
        id: `HIST-${Date.now().toString().slice(-4)}`,
        complaintToken: target.complaintToken,
        eventType: 'Reminder Generated',
        description: `Retried failed reminder ${reminderId} via simulated ${target.channel} fallback route. Marked DELIVERED.`,
        responsibleUser: 'Administrator / Reminder Centre Daemon',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        previousValue: 'FAILED',
        newValue: 'DELIVERED'
      },
      ...prev
    ]);

    return { success: true };
  };

  // Automated Reminder Engine (Section 4)
  // Scans active complaints and generates advance, due-today, and overdue notices with duplicate prevention
  const runAutomatedReminderEngine = ({ advanceHours = 24 } = {}) => {
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);
    let count = 0;

    // Filter open complaints (excluding closed & resolved)
    const openComplaints = complaints.filter(
      c => c.status !== 'RESOLVED' && c.status !== 'CLOSED'
    );

    const newGeneratedReminders = [];
    const newHistoryRecords = [];

    openComplaints.forEach(c => {
      const dueDate = c.dueDate ? new Date(c.dueDate) : c.slaDeadline ? new Date(c.slaDeadline) : null;
      const nextFollowUp = c.nextFollowUpDate ? new Date(c.nextFollowUpDate) : null;

      // Condition 1: Overdue Complaint (due date passed)
      const isOverdue = (dueDate && !isNaN(dueDate) && dueDate < now) || c.status === 'OVERDUE' || (c.daysOverdue && c.daysOverdue > 0);
      if (isOverdue) {
        const hasOverdueReminderToday = reminders.some(
          r => r.complaintToken === c.token && r.type === 'OVERDUE_COMPLAINT' && (r.createdDate || '').startsWith(todayStr)
        );
        if (!hasOverdueReminderToday) {
          const remId = `REM-AUTO-${Date.now().toString().slice(-4)}-${count}`;
          newGeneratedReminders.push({
            id: remId,
            complaintId: c.token,
            complaintToken: c.token,
            complaintTitle: c.title,
            citizenName: c.citizenName,
            assignedOfficer: c.assignedOfficer?.name || 'Responsible Nodal Engineer',
            department: c.departmentName,
            departmentId: c.departmentId,
            type: 'OVERDUE_COMPLAINT',
            typeLabel: 'Overdue SLA Breach Notice',
            priority: 'CRITICAL',
            channel: 'WHATSAPP',
            recipientName: c.assignedOfficer?.name || 'Nodal Officer',
            recipientRole: 'Department Officer',
            recipientContact: c.assignedOfficer?.mobile || '+91 94480 00000',
            subject: `Automated Statutory Notice: Complaint #${c.token} Past Resolution Deadline`,
            message: `Automated Rule Evaluation: Grievance #${c.token} has breached statutory deadline by ${c.daysOverdue || 1} days. Under Section 4 Guarantee of Services Act, immediate explanation mandated.`,
            messageKn: `ಸ್ವಯಂಚಾಲಿತ ನೋಟಿಸ್: ದೂರು #${c.token} ಶಾಸನಬದ್ಧ ಗಡುವನ್ನು ಮೀರಿದೆ. ತಕ್ಷಣ ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.`,
            createdDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
            scheduledDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
            dispatchedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: 'DELIVERED',
            isSimulated: true,
            failureReason: null,
            notes: 'Generated automatically by Cadre Chrono-Engine rule 3: Deadline missed.'
          });

          newHistoryRecords.push({
            id: `HIST-AUTO-${Date.now().toString().slice(-4)}-${count}`,
            complaintToken: c.token,
            eventType: 'Reminder Generated',
            description: `Automated overdue notice dispatched via WhatsApp to ${c.assignedOfficer?.name || 'Nodal Lead'}.`,
            responsibleUser: 'Autonomous SLA Chrono-Bot',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            previousValue: c.reminderStatus || 'NONE',
            newValue: 'SENT (Overdue Notice)'
          });

          count++;
          return;
        }
      }

      // Condition 2: Follow-up Due Today (same calendar day or <24h)
      const isDueToday =
        (nextFollowUp && nextFollowUp.toDateString() === now.toDateString()) ||
        (dueDate && dueDate.toDateString() === now.toDateString()) ||
        (dueDate && dueDate - now > 0 && dueDate - now <= 24 * 3600 * 1000);

      if (isDueToday) {
        const hasDueTodayReminder = reminders.some(
          r => r.complaintToken === c.token && r.type === 'FOLLOW_UP_DUE_TODAY' && (r.createdDate || '').startsWith(todayStr)
        );
        if (!hasDueTodayReminder) {
          const remId = `REM-AUTO-${Date.now().toString().slice(-4)}-${count}`;
          newGeneratedReminders.push({
            id: remId,
            complaintId: c.token,
            complaintToken: c.token,
            complaintTitle: c.title,
            citizenName: c.citizenName,
            assignedOfficer: c.assignedOfficer?.name || 'Nodal Engineer',
            department: c.departmentName,
            departmentId: c.departmentId,
            type: 'FOLLOW_UP_DUE_TODAY',
            typeLabel: 'Follow-up Due Today',
            priority: 'HIGH',
            channel: 'WHATSAPP',
            recipientName: c.assignedOfficer?.name || 'Nodal Engineer',
            recipientRole: 'Department Officer',
            recipientContact: c.assignedOfficer?.mobile || '+91 94480 00000',
            subject: `Urgent: Action Due Today for Complaint #${c.token}`,
            message: `URGENT: Inspection and follow-up logging for Complaint #${c.token} is due TODAY. Please record field progress in ResolveTrack.`,
            messageKn: `ತುರ್ತು: ದೂರು #${c.token} ಗಾಗಿ ಇಂದು ಪರಿಶೀಲನಾ ವರದಿ ಸಲ್ಲಿಸುವುದು ಬಾಕಿಯಿದೆ.`,
            createdDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
            scheduledDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
            dispatchedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: 'DELIVERED',
            isSimulated: true,
            failureReason: null,
            notes: 'Generated automatically by Cadre Chrono-Engine rule 2: Action due today.'
          });

          newHistoryRecords.push({
            id: `HIST-AUTO-${Date.now().toString().slice(-4)}-${count}`,
            complaintToken: c.token,
            eventType: 'Reminder Generated',
            description: `Automated Due-Today reminder dispatched via WhatsApp to ${c.assignedOfficer?.name || 'Officer'}.`,
            responsibleUser: 'Autonomous SLA Chrono-Bot',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            previousValue: c.reminderStatus || 'NONE',
            newValue: 'SENT (Due Today)'
          });

          count++;
          return;
        }
      }

      // Condition 3: Advance Upcoming Follow-up (<48h)
      const isUpcoming = dueDate && dueDate - now > 24 * 3600 * 1000 && dueDate - now <= (advanceHours + 24) * 3600 * 1000;
      if (isUpcoming) {
        const hasUpcomingReminder = reminders.some(
          r => r.complaintToken === c.token && r.type === 'UPCOMING_FOLLOW_UP' && (r.createdDate || '').startsWith(todayStr)
        );
        if (!hasUpcomingReminder) {
          const remId = `REM-AUTO-${Date.now().toString().slice(-4)}-${count}`;
          newGeneratedReminders.push({
            id: remId,
            complaintId: c.token,
            complaintToken: c.token,
            complaintTitle: c.title,
            citizenName: c.citizenName,
            assignedOfficer: c.assignedOfficer?.name || 'Nodal Engineer',
            department: c.departmentName,
            departmentId: c.departmentId,
            type: 'UPCOMING_FOLLOW_UP',
            typeLabel: 'Upcoming Follow-up Notice',
            priority: 'NORMAL',
            channel: 'EMAIL',
            recipientName: c.assignedOfficer?.name || 'Nodal Engineer',
            recipientRole: 'Department Officer',
            recipientContact: c.assignedOfficer?.email || 'officer@resolvetrack.gov.in',
            subject: `Advance Notice: Upcoming Milestone for Complaint #${c.token}`,
            message: `Advance Notice: Complaint #${c.token} has an approaching milestone. Please ensure preliminary verification is on track.`,
            messageKn: `ಮುನ್ಸೂಚನೆ: ದೂರು #${c.token} ಗಾಗಿ ನಿಗದಿತ ಪರಿಶೀಲನೆ ಸಮೀಪಿಸುತ್ತಿದೆ.`,
            createdDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
            scheduledDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
            dispatchedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: 'DELIVERED',
            isSimulated: true,
            failureReason: null,
            notes: 'Generated automatically by Cadre Chrono-Engine rule 1: Advance follow-up.'
          });

          newHistoryRecords.push({
            id: `HIST-AUTO-${Date.now().toString().slice(-4)}-${count}`,
            complaintToken: c.token,
            eventType: 'Reminder Generated',
            description: `Advance upcoming follow-up reminder dispatched via Email to ${c.assignedOfficer?.name || 'Officer'}.`,
            responsibleUser: 'Autonomous SLA Chrono-Bot',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            previousValue: c.reminderStatus || 'NONE',
            newValue: 'SENT (Advance Notice)'
          });

          count++;
        }
      }
    });

    if (newGeneratedReminders.length > 0) {
      setReminders(prev => [...newGeneratedReminders, ...prev]);
      setComplaintHistory(prev => [...newHistoryRecords, ...prev]);
    }

    return {
      success: true,
      generatedCount: count,
      message: `Cadre Auto-Engine scanned ${openComplaints.length} active complaints: Generated ${count} new statutory reminders without duplicates.`
    };
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const markNotificationRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, unread: false } : n));
  };

  // Computed Key Metrics
  const metrics = useMemo(() => {
    const total = complaints.length;
    const overdue = complaints.filter(c => c.status === 'OVERDUE' || c.daysOverdue > 0 || (c.hoursRemaining !== undefined && c.hoursRemaining < 0)).length;
    const pending = complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length;
    const resolved = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'ACTION_TAKEN' || c.status === 'CLOSED').length;
    const escalationsCount = complaints.filter(c => (c.escalationLevel && c.escalationLevel > 0) || (c.escalationTier && c.escalationTier !== 'NONE')).length;
    const avgHealthScore = Math.round(complaints.reduce((acc, c) => acc + (c.healthScore || 80), 0) / (total || 1));

    return {
      total: total + 48285,
      newToday: 1842,
      inProgress: pending + 3415,
      pending: pending + 1200,
      overdue: overdue + 180,
      resolved: resolved + 41640,
      escalations: escalationsCount + 40,
      slaCompliance: '92.4%',
      firstContactResolution: '41.8%',
      avgHealthScore
    };
  }, [complaints]);

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        departments,
        officers,
        citizens,
        reminders,
        escalations,
        notifications,
        communications,
        reassignments,
        setReassignments,
        complaintHistory,
        notices: reminders,
        metrics,
        generateTrackingId,
        registerNewComplaint,
        addComplaint,
        saveDraftComplaint,
        updateComplaintDetails,
        verifyComplaint,
        requestAdditionalInfo,
        rejectComplaint,
        assignComplaintOfficer,
        checkDuplicate,
        autoIdentifyDepartment,
        updateComplaintStatus,
        reassignOfficer,
        escalateComplaint,
        escalateComplaintLevel,
        sendComplaintReminder,
        createManualReminder,
        retryFailedReminder,
        runAutomatedReminderEngine,
        addComplaintReviewNote,
        updateFollowUpDeadline,
        resolveComplaintDirect,
        createReminder,
        verifyResolution,
        markNotificationRead,
        markAllNotificationsRead
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => useContext(ComplaintContext);
