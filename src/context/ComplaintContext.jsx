import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
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
import { INITIAL_FEEDBACK_RECORDS } from '../data/feedbackData';
import { INITIAL_CITIZEN_NOTIFICATIONS } from '../data/citizenNotificationsData';
import { INITIAL_AUDIT_LOGS } from '../data/auditLogsData';
import { PRIORITY_CONFIG, isValidStatusTransition } from '../utils/constants';
import { generateNextTrackingId } from '../utils/trackingIdGenerator';
import {
  recommendDepartment,
  detectPotentialDuplicates,
  generateIntelligenceAlerts,
  calculateComplaintHealth
} from '../utils/intelligenceEngine';
import {
  calculateResolutionRate,
  calculateSLACompliance,
  calculateCitizenSatisfaction,
  calculateAverageResolutionTime
} from '../utils/analyticsCalculations';
import { detectTextLanguage } from '../utils/languageDetector';

const DEMO_STORAGE_KEY = 'resolvetrack_demo_state_v2';

function loadPersistedDemoState() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.complaints) || parsed.complaints.length === 0) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

const MERGED_COMPLAINTS = (() => {
  const list = [];
  const aliasToIndex = new Map();

  const registerAliases = (record, idx) => {
    [record.token, record.trackingId, record.legacyToken, record.id]
      .filter(Boolean)
      .forEach((k) => aliasToIndex.set(String(k).toUpperCase(), idx));
  };

  COMPLAINTS_DATA.forEach((c) => {
    const existingIdx = [c.token, c.trackingId, c.legacyToken, c.id]
      .filter(Boolean)
      .map((k) => aliasToIndex.get(String(k).toUpperCase()))
      .find((i) => i !== undefined);

    if (existingIdx !== undefined) {
      list[existingIdx] = { ...list[existingIdx], ...c };
      registerAliases(list[existingIdx], existingIdx);
    } else {
      const idx = list.length;
      const normalized = { ...c, id: c.token || c.trackingId || c.id };
      list.push(normalized);
      registerAliases(normalized, idx);
    }
  });

  INITIAL_OVERDUE_COMPLAINTS.forEach((oc) => {
    const existingIdx = [oc.token, oc.trackingId, oc.legacyToken, oc.id]
      .filter(Boolean)
      .map((k) => aliasToIndex.get(String(k).toUpperCase()))
      .find((i) => i !== undefined);

    if (existingIdx !== undefined) {
      const canonical = list[existingIdx];
      list[existingIdx] = {
        ...canonical,
        ...oc,
        id: canonical.id || canonical.token,
        token: canonical.token,
        trackingId: canonical.trackingId || canonical.token,
        legacyToken: canonical.legacyToken || (oc.token !== canonical.token ? oc.token : canonical.legacyToken)
      };
      registerAliases(list[existingIdx], existingIdx);
    } else {
      const idx = list.length;
      const normalized = { ...oc, id: oc.token || oc.id };
      list.push(normalized);
      registerAliases(normalized, idx);
    }
  });

  return list;
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
  const initialPersisted = useMemo(() => loadPersistedDemoState(), []);

  const [complaints, setComplaints] = useState(() => initialPersisted?.complaints || MERGED_COMPLAINTS);
  const [departments, setDepartments] = useState(DEPARTMENTS_DATA);
  const [officers, setOfficers] = useState(() => initialPersisted?.officers || OFFICERS_DATA);
  const [citizens, setCitizens] = useState(CITIZENS_DATA);
  const [reminders, setReminders] = useState(() => initialPersisted?.reminders || INITIAL_REMINDER_RECORDS);
  const [escalations, setEscalations] = useState(() => initialPersisted?.escalations || INITIAL_ESCALATION_RECORDS);
  const [notifications, setNotifications] = useState(() => initialPersisted?.notifications || NOTIFICATIONS_DATA);
  const [communications, setCommunications] = useState(() => initialPersisted?.communications || COMMUNICATIONS_DATA);
  const [reassignments, setReassignments] = useState(() => initialPersisted?.reassignments || INITIAL_REASSIGNMENTS);
  const [complaintHistory, setComplaintHistory] = useState(() => initialPersisted?.complaintHistory || INITIAL_COMPLAINT_HISTORY);
  const [feedbackRecords, setFeedbackRecords] = useState(() => initialPersisted?.feedbackRecords || INITIAL_FEEDBACK_RECORDS);
  const [citizenNotifications, setCitizenNotifications] = useState(() => initialPersisted?.citizenNotifications || INITIAL_CITIZEN_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState(() => initialPersisted?.auditLogs || INITIAL_AUDIT_LOGS);

  // Complaint Intelligence & Decision Support Shared State
  const [intelligenceAlerts, setIntelligenceAlerts] = useState(() =>
    initialPersisted?.intelligenceAlerts ||
    generateIntelligenceAlerts(MERGED_COMPLAINTS, OFFICERS_DATA, INITIAL_REMINDER_RECORDS, INITIAL_ESCALATION_RECORDS)
  );
  const [intelligenceReviews, setIntelligenceReviews] = useState(() => initialPersisted?.intelligenceReviews || [
    {
      id: 'REV-INT-101',
      complaintId: 'RTK-2026-000001',
      ruleType: 'PRIORITY_RECOMMENDATION',
      originalRecommendation: 'HIGH Priority (Drinking Water Pipeline Contamination)',
      adminDecision: 'ACCEPTED',
      decisionReason: 'Confirmed public health hazard under Ward 14 municipal oversight.',
      reviewedBy: 'Shri Vikram Malhotra, IAS',
      reviewDate: '2026-11-08 11:20'
    },
    {
      id: 'REV-INT-102',
      complaintId: 'GRV-2024-8839',
      ruleType: 'OFFICER_WORKLOAD_IMBALANCE',
      originalRecommendation: 'Reassign from V. R. Chandrashekar (27/30 load) to Rajeshwari Hegde',
      adminDecision: 'ACCEPTED',
      decisionReason: 'Rebalanced road safety backlog to prevent Section 8 penalty.',
      reviewedBy: 'Zonal Administrator',
      reviewDate: '2026-11-06 14:35'
    }
  ]);
  const [relatedComplaintPairs, setRelatedComplaintPairs] = useState(() => initialPersisted?.relatedComplaintPairs || []);

  // Persist complete interactive workspace state in browser localStorage across reloads
  useEffect(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const snapshot = {
        complaints,
        officers,
        reminders,
        escalations,
        notifications,
        communications,
        reassignments,
        complaintHistory,
        feedbackRecords,
        citizenNotifications,
        auditLogs,
        intelligenceAlerts,
        intelligenceReviews,
        relatedComplaintPairs,
        savedAt: new Date().toISOString()
      };
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) {
      // Ignore storage quota warnings in headless/private sessions
    }
  }, [
    complaints,
    officers,
    reminders,
    escalations,
    notifications,
    communications,
    reassignments,
    complaintHistory,
    feedbackRecords,
    citizenNotifications,
    auditLogs,
    intelligenceAlerts,
    intelligenceReviews,
    relatedComplaintPairs
  ]);

  const resetDemoState = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(DEMO_STORAGE_KEY);
      }
    } catch (e) {
      // ignore
    }
    setComplaints(MERGED_COMPLAINTS);
    setOfficers(OFFICERS_DATA);
    setReminders(INITIAL_REMINDER_RECORDS);
    setEscalations(INITIAL_ESCALATION_RECORDS);
    setNotifications(NOTIFICATIONS_DATA);
    setCommunications(COMMUNICATIONS_DATA);
    setReassignments(INITIAL_REASSIGNMENTS);
    setComplaintHistory(INITIAL_COMPLAINT_HISTORY);
    setFeedbackRecords(INITIAL_FEEDBACK_RECORDS);
    setCitizenNotifications(INITIAL_CITIZEN_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setIntelligenceAlerts(
      generateIntelligenceAlerts(MERGED_COMPLAINTS, OFFICERS_DATA, INITIAL_REMINDER_RECORDS, INITIAL_ESCALATION_RECORDS)
    );
    setRelatedComplaintPairs([]);
  };

  // Generate Unique Canonical Token ID (RTK-2026-XXXXXX)
  const generateTrackingId = () => {
    return generateNextTrackingId(complaints);
  };

  // Duplicate Complaint Detection heuristic (Upgraded via intelligenceEngine)
  const checkDuplicate = (title, departmentId, district, description = '') => {
    if (!title || title.length < 5) return null;
    const matches = detectPotentialDuplicates(
      { title, description, departmentId, district },
      complaints,
      { minScore: 45, maxResults: 1 }
    );
    return matches.length > 0 ? matches[0].similarComplaint : null;
  };

  // Automated Department Identification (Upgraded via intelligenceEngine)
  const autoIdentifyDepartment = (text) => {
    const rec = recommendDepartment({ title: text, description: '' }, departments);
    return rec.recommendedDepartment || departments[0];
  };

  // Intelligence Alert Review Actions
  const markIntelligenceAlertReviewed = (alertId, reviewedBy = 'Central Administrator') => {
    const today = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setIntelligenceAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? { ...a, reviewStatus: 'REVIEWED', reviewedBy, reviewedDate: today }
          : a
      )
    );
  };

  const dismissIntelligenceAlert = (alertId, reviewedBy = 'Central Administrator') => {
    const today = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setIntelligenceAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? { ...a, reviewStatus: 'DISMISSED', reviewedBy, reviewedDate: today }
          : a
      )
    );
  };

  const refreshIntelligenceAlerts = () => {
    setIntelligenceAlerts(prev =>
      generateIntelligenceAlerts(complaints, officers, reminders, escalations, prev)
    );
  };

  // Link Related / Duplicate Complaints without auto-rejecting
  const markComplaintsRelated = (primaryToken, relatedToken, linkedBy = 'Administrator') => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const exists = relatedComplaintPairs.some(
      p => (p.primaryToken === primaryToken && p.relatedToken === relatedToken) ||
           (p.primaryToken === relatedToken && p.relatedToken === primaryToken)
    );
    if (exists) return { success: false, message: 'Complaints are already marked as related.' };

    const newPair = {
      id: `REL-${Date.now().toString().slice(-5)}`,
      primaryToken,
      relatedToken,
      linkedBy,
      timestamp
    };
    setRelatedComplaintPairs(prev => [newPair, ...prev]);

    setComplaintHistory(prev => [
      {
        id: `HIST-${Date.now().toString().slice(-4)}`,
        complaintToken: primaryToken,
        eventType: 'Related Complaint Linked',
        description: `Marked as related to historical grievance #${relatedToken} via Smart Decision Support review.`,
        responsibleUser: linkedBy,
        timestamp,
        previousValue: 'Unlinked',
        newValue: `Related to #${relatedToken}`
      },
      ...prev
    ]);
    return { success: true, pair: newPair };
  };

  // Record Admin Intelligence Decision (Accept / Override Recommendation) & optionally mutate complaint
  const recordIntelligenceDecision = ({
    complaintId,
    ruleType,
    originalRecommendation,
    adminDecision,
    decisionReason = 'Reviewed via Complaint Intelligence Workbench',
    reviewedBy = 'Administrator',
    applyUpdate = null
  }) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const reviewRecord = {
      id: `REV-INT-${Date.now().toString().slice(-4)}`,
      complaintId,
      ruleType,
      originalRecommendation,
      adminDecision,
      decisionReason,
      reviewedBy,
      reviewDate: timestamp
    };

    setIntelligenceReviews(prev => [reviewRecord, ...prev]);

    if (applyUpdate && complaintId) {
      setComplaints(prev =>
        prev.map(c => {
          if (c.token === complaintId || c.trackingId === complaintId || c.id === complaintId) {
            return { ...c, ...applyUpdate, updatedAt: timestamp };
          }
          return c;
        })
      );

      setComplaintHistory(prev => [
        {
          id: `HIST-${Date.now().toString().slice(-4)}`,
          complaintToken: complaintId,
          eventType: `Intelligence Review (${ruleType})`,
          description: `Decision: ${adminDecision}. ${decisionReason}`,
          responsibleUser: reviewedBy,
          timestamp,
          previousValue: originalRecommendation,
          newValue: JSON.stringify(applyUpdate)
        },
        ...prev
      ]);
    }

    return { success: true, reviewRecord };
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
    const detectedLangInfo = detectTextLanguage(
      `${formData.title || formData.complaintTitle || ''} ${formData.description || formData.complaintDescription || ''}`
    );

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
      detectedLanguage: formData.detectedLanguage || detectedLangInfo.code,
      intakeMode: formData.intakeMode || 'DIRECT_WEB',
      inwardRefNumber: formData.inwardRefNumber || null,
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
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const matched = complaints.find(c => c.id === id || c.token === id || c.trackingId === id || c.legacyToken === id);
    if (!matched) return { success: false, message: 'Complaint not found.' };

    const wasActive = !['RESOLVED', 'CLOSED', 'REJECTED'].includes(matched.status);
    const becomesResolvedOrClosed = ['RESOLVED', 'CLOSED'].includes(newStatus);

    setComplaints(prev => prev.map(c => {
      if (c.id === matched.id || c.token === matched.token) {
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        const newActions = [
          ...curActions,
          {
            id: curActions.length + 1,
            type: 'STATUS_UPDATE',
            date: nowStr,
            user: officerName,
            text: `Status updated to ${newStatus}. Remarks: ${remarks || 'Routine operational update.'}`
          }
        ];
        return {
          ...c,
          status: newStatus,
          updatedAt: nowStr,
          resolvedAt: newStatus === 'RESOLVED' ? (c.resolvedAt || nowStr) : c.resolvedAt,
          closureDate: newStatus === 'CLOSED' ? (c.closureDate || nowStr) : c.closureDate,
          daysOverdue: becomesResolvedOrClosed ? 0 : c.daysOverdue,
          actions: newActions,
          healthScore: computeHealthScore({ ...c, status: newStatus }),
          resolutionSummary: newStatus === 'RESOLVED' || newStatus === 'ACTION_TAKEN' ? (remarks || c.resolutionSummary) : c.resolutionSummary
        };
      }
      return c;
    }));

    if (wasActive && becomesResolvedOrClosed && matched.assignedOfficer?.id) {
      setOfficers(prev => prev.map(o => {
        if (o.id === matched.assignedOfficer.id) {
          return {
            ...o,
            activeCaseload: Math.max(0, (o.activeCaseload || 1) - 1),
            pendingCount: Math.max(0, (o.pendingCount || 1) - 1),
            resolvedCount: (o.resolvedCount || 0) + 1
          };
        }
        return o;
      }));
    }

    return { success: true };
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

  // -------------------------------------------------------------------------
  // CITIZEN TRACKING & FEEDBACK PORTAL SHARED STATE FUNCTIONS
  // -------------------------------------------------------------------------

  // 1. Identity Verification for Complaint Tracking
  const verifyCitizenAccess = (trackingId, mobileNumber) => {
    if (!trackingId?.trim() || !mobileNumber?.trim()) {
      return {
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Both Complaint Tracking ID and Registered Mobile Number are required.'
      };
    }

    const cleanToken = trackingId.trim().toUpperCase();
    const cleanInputDigits = mobileNumber.replace(/\D/g, '');

    const matched = complaints.find(c => {
      const cToken = (c.token || '').toUpperCase();
      const cTrackingId = (c.trackingId || '').toUpperCase();
      const cId = (c.id || '').toUpperCase();
      const cLegacy = (c.legacyToken || '').toUpperCase();
      return cToken === cleanToken || cTrackingId === cleanToken || cId === cleanToken || cLegacy === cleanToken;
    });

    if (!matched) {
      return {
        success: false,
        error: 'COMPLAINT_NOT_FOUND',
        message: `No grievance ticket found for Tracking ID "${trackingId}". Please verify your docket token.`
      };
    }

    const citizenPhoneDigits = (matched.citizenPhone || matched.mobileNumber || '').replace(/\D/g, '');
    const isMobileMatch = citizenPhoneDigits.endsWith(cleanInputDigits) || cleanInputDigits.endsWith(citizenPhoneDigits);

    if (!isMobileMatch) {
      return {
        success: false,
        error: 'MOBILE_MISMATCH',
        message: 'The mobile number entered does not match the registration records for this complaint.'
      };
    }

    return {
      success: true,
      ticket: matched
    };
  };

  // 2. Retrieve All Complaints for a Citizen Mobile Number
  const getCitizenComplaints = (mobileNumber) => {
    if (!mobileNumber) return [];
    const cleanDigits = mobileNumber.replace(/\D/g, '');
    if (cleanDigits.length < 5) return [];

    return complaints.filter(c => {
      const cDigits = (c.citizenPhone || c.mobileNumber || '').replace(/\D/g, '');
      return cDigits.endsWith(cleanDigits) || cleanDigits.endsWith(cDigits);
    });
  };

  // 3. Citizen Response to Additional Information Requests
  const submitCitizenResponse = (trackingId, responseText, attachments = []) => {
    if (!responseText?.trim()) {
      return { success: false, message: 'Response description is required.' };
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let updatedTicket = null;

    setComplaints(prev => prev.map(c => {
      const isMatch = c.token === trackingId || c.trackingId === trackingId || c.id === trackingId || c.legacyToken === trackingId;
      if (isMatch) {
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        const curResponses = Array.isArray(c.citizenResponses) ? c.citizenResponses : [];
        const nextStatus = (c.status === 'ADDITIONAL_INFO_REQUIRED') ? 'PENDING_VERIFICATION' : c.status;

        updatedTicket = {
          ...c,
          status: nextStatus,
          verificationStatus: 'PENDING',
          updatedAt: nowStr,
          citizenResponses: [
            ...curResponses,
            {
              id: `RESP-${Date.now()}`,
              text: responseText,
              attachments: attachments || [],
              timestamp: nowStr
            }
          ],
          actions: [
            ...curActions,
            {
              id: curActions.length + 1,
              type: 'CITIZEN_RESPONSE',
              date: nowStr,
              user: `${c.citizenName} (Citizen)`,
              text: `Citizen submitted supplementary information: "${responseText}". Attached files: ${(attachments || []).length}.`
            }
          ]
        };
        return updatedTicket;
      }
      return c;
    }));

    if (updatedTicket) {
      // Record in complaint history
      setComplaintHistory(prev => [
        {
          id: `HIST-RESP-${Date.now().toString().slice(-4)}`,
          complaintId: updatedTicket.token,
          complaintToken: updatedTicket.token,
          eventType: 'Citizen Information Submitted',
          description: `Citizen uploaded supplementary evidence: "${responseText}"`,
          responsibleUser: updatedTicket.citizenName,
          timestamp: nowStr,
          previousValue: 'ADDITIONAL_INFO_REQUIRED',
          newValue: updatedTicket.status
        },
        ...prev
      ]);

      // Add to citizen notifications
      const cleanPhone = (updatedTicket.citizenPhone || '').replace(/\D/g, '');
      setCitizenNotifications(prev => [
        {
          id: `CNOTIF-${Date.now().toString().slice(-4)}`,
          complaintId: updatedTicket.token,
          mobileNumber: cleanPhone,
          type: 'INFO_SUBMITTED',
          category: 'Info Request',
          title: 'Supplementary Information Received',
          message: `Your information regarding #${updatedTicket.token} has been logged and routed to the scrutiny officer.`,
          timestamp: nowStr,
          read: false,
          severity: 'success'
        },
        ...prev
      ]);

      // Add administrative notification for officer
      setNotifications(prev => [
        {
          id: `NOTIF-${Date.now().toString().slice(-4)}`,
          token: updatedTicket.token,
          type: 'STATUS_UPDATE',
          title: 'Citizen Response Submitted',
          message: `${updatedTicket.citizenName} submitted supplementary information for #${updatedTicket.token}.`,
          time: 'Just now',
          unread: true,
          severity: 'info',
          actionRoute: `/admin/pending-complaints`
        },
        ...prev
      ]);
    }

    return { success: true, ticket: updatedTicket };
  };

  // 4. Accept Resolution Workflow (Citizen Satisfaction -> Closure)
  const acceptResolution = (trackingId, citizenNotes = '') => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let updatedTicket = null;

    setComplaints(prev => prev.map(c => {
      const isMatch = c.token === trackingId || c.trackingId === trackingId || c.id === trackingId || c.legacyToken === trackingId;
      if (isMatch) {
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        updatedTicket = {
          ...c,
          status: 'CLOSED',
          closureDate: nowStr,
          updatedAt: nowStr,
          citizenConfirmation: {
            accepted: true,
            notes: citizenNotes || 'Resolution confirmed on-site by applicant.',
            date: nowStr
          },
          actions: [
            ...curActions,
            {
              id: curActions.length + 1,
              type: 'CITIZEN_ACCEPTED',
              date: nowStr,
              user: `${c.citizenName} (Citizen)`,
              text: `Citizen accepted departmental resolution as satisfactory. Case officially closed. Notes: "${citizenNotes || 'Confirmed satisfactory.'}"`
            }
          ]
        };
        return updatedTicket;
      }
      return c;
    }));

    if (updatedTicket) {
      setComplaintHistory(prev => [
        {
          id: `HIST-CLOSE-${Date.now().toString().slice(-4)}`,
          complaintId: updatedTicket.token,
          complaintToken: updatedTicket.token,
          eventType: 'Complaint Closed',
          description: `Docket closed with citizen acceptance. Notes: ${citizenNotes || 'Satisfactory redressal.'}`,
          responsibleUser: updatedTicket.citizenName,
          timestamp: nowStr,
          previousValue: 'RESOLVED',
          newValue: 'CLOSED'
        },
        ...prev
      ]);

      const cleanPhone = (updatedTicket.citizenPhone || '').replace(/\D/g, '');
      setCitizenNotifications(prev => [
        {
          id: `CNOTIF-${Date.now().toString().slice(-4)}`,
          complaintId: updatedTicket.token,
          mobileNumber: cleanPhone,
          type: 'CASE_CLOSED',
          category: 'Resolution',
          title: 'Grievance Formally Closed',
          message: `Docket #${updatedTicket.token} has been formally closed with your confirmation. Thank you for your feedback!`,
          timestamp: nowStr,
          read: false,
          severity: 'success'
        },
        ...prev
      ]);
    }

    return { success: true, ticket: updatedTicket };
  };

  // 5. Request Further Action (Reopen Grievance with Reason & Attachments)
  const requestFurtherAction = (trackingId, reasonCategory, reasonDetails, attachments = []) => {
    if (!reasonDetails?.trim()) {
      return { success: false, message: 'Please provide details explaining why the resolution was unsatisfactory.' };
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let updatedTicket = null;

    setComplaints(prev => prev.map(c => {
      const isMatch = c.token === trackingId || c.trackingId === trackingId || c.id === trackingId || c.legacyToken === trackingId;
      if (isMatch) {
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        const curReopenings = Array.isArray(c.reopeningRequests) ? c.reopeningRequests : [];

        updatedTicket = {
          ...c,
          status: 'REOPENED',
          updatedAt: nowStr,
          healthScore: 25,
          daysOverdue: 0,
          reopeningRequests: [
            ...curReopenings,
            {
              id: `REOPEN-${Date.now()}`,
              category: reasonCategory || 'Work Incomplete',
              details: reasonDetails,
              attachments: attachments || [],
              date: nowStr
            }
          ],
          actions: [
            ...curActions,
            {
              id: curActions.length + 1,
              type: 'REOPENED',
              date: nowStr,
              user: `${c.citizenName} (Citizen)`,
              text: `Citizen requested further action. Reason: [${reasonCategory || 'Incomplete'}] "${reasonDetails}". Docket reopened for re-inspection.`
            }
          ]
        };
        return updatedTicket;
      }
      return c;
    }));

    if (updatedTicket) {
      // Update assigned officer workload count
      if (updatedTicket.assignedOfficer) {
        setOfficers(prev => prev.map(o => {
          if (o.id === updatedTicket.assignedOfficer.id) {
            return {
              ...o,
              pendingCount: (o.pendingCount || 0) + 1,
              activeCaseload: (o.activeCaseload || 0) + 1,
              recentActivity: `Grievance #${updatedTicket.token} reopened by citizen for re-inspection on ${nowStr}.`
            };
          }
          return o;
        }));
      }

      setComplaintHistory(prev => [
        {
          id: `HIST-REOPEN-${Date.now().toString().slice(-4)}`,
          complaintId: updatedTicket.token,
          complaintToken: updatedTicket.token,
          eventType: 'Complaint Reopened',
          description: `Reopened by citizen: ${reasonCategory} - "${reasonDetails}"`,
          responsibleUser: updatedTicket.citizenName,
          timestamp: nowStr,
          previousValue: 'RESOLVED',
          newValue: 'REOPENED'
        },
        ...prev
      ]);

      const cleanPhone = (updatedTicket.citizenPhone || '').replace(/\D/g, '');
      setCitizenNotifications(prev => [
        {
          id: `CNOTIF-${Date.now().toString().slice(-4)}`,
          complaintId: updatedTicket.token,
          mobileNumber: cleanPhone,
          type: 'REOPENED_CONFIRMATION',
          category: 'Reopened',
          title: 'Grievance Reopened for Re-Inspection',
          message: `Your request for further action on #${updatedTicket.token} has been registered. The assigned officer and supervisor have been alerted.`,
          timestamp: nowStr,
          read: false,
          severity: 'info'
        },
        ...prev
      ]);

      // Alert supervisor and officer
      setNotifications(prev => [
        {
          id: `NOTIF-${Date.now().toString().slice(-4)}`,
          token: updatedTicket.token,
          type: 'STATUS_UPDATE',
          title: 'Grievance Reopened by Citizen',
          message: `Citizen disputed resolution for #${updatedTicket.token} (${reasonCategory}). Re-inspection mandated.`,
          time: 'Just now',
          unread: true,
          severity: 'warning',
          actionRoute: `/supervisor/escalation-review`
        },
        ...prev
      ]);
    }

    return { success: true, ticket: updatedTicket };
  };

  // 6. Submit Structured Citizen Feedback (4 Criteria)
  const submitCitizenFeedback = (trackingId, feedbackData) => {
    const matched = complaints.find(c => c.token === trackingId || c.trackingId === trackingId || c.id === trackingId || c.legacyToken === trackingId);
    if (!matched) return { success: false, message: 'Complaint not found.' };

    // Prevent duplicate feedback
    const alreadySubmitted = feedbackRecords.some(f => f.complaintId === trackingId || f.complaintId === matched.token);
    if (alreadySubmitted) {
      return { success: false, duplicate: true, message: `Feedback has already been submitted for grievance #${trackingId}.` };
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newFeedback = {
      id: `FB-${Date.now().toString().slice(-4)}`,
      complaintId: matched.token,
      legacyToken: matched.legacyToken || null,
      citizenName: feedbackData.isAnonymous ? 'Anonymous Citizen' : matched.citizenName,
      citizenPhone: feedbackData.isAnonymous ? '••••••••••' : matched.citizenPhone,
      overallRating: feedbackData.overallRating || 5,
      qualityRating: feedbackData.qualityRating || 5,
      responsivenessRating: feedbackData.responsivenessRating || 5,
      timelinessRating: feedbackData.timelinessRating || 5,
      category: feedbackData.category || 'Satisfactory',
      comments: feedbackData.comments || 'No written remarks.',
      isAnonymous: feedbackData.isAnonymous || false,
      createdAt: nowStr,
      departmentId: matched.departmentId,
      departmentName: matched.departmentName
    };

    setFeedbackRecords(prev => [newFeedback, ...prev]);

    // Update ticket's CSAT rating
    setComplaints(prev => prev.map(c => {
      if (c.token === matched.token || c.id === matched.id) {
        return {
          ...c,
          csatRating: feedbackData.overallRating || 5
        };
      }
      return c;
    }));

    return { success: true, feedback: newFeedback };
  };

  // 7. Citizen Notifications Management
  const markCitizenNotificationRead = (notifId) => {
    setCitizenNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const markAllCitizenNotificationsRead = (mobileNumber) => {
    const cleanDigits = (mobileNumber || '').replace(/\D/g, '');
    setCitizenNotifications(prev => prev.map(n => {
      const match = !cleanDigits || n.mobileNumber?.endsWith(cleanDigits);
      return match ? { ...n, read: true } : n;
    }));
  };

  // -------------------------------------------------------------------------
  // COMPLAINT DETAILS & RESOLUTION AUDIT MODULE
  // -------------------------------------------------------------------------

  // 1. Add Immutable Audit Record (Append-Only)
  const addAuditRecord = (auditData) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newRecord = {
      id: auditData.id || `AUD-${Date.now().toString().slice(-5)}`,
      complaintId: auditData.complaintId || auditData.complaintToken || 'UNKNOWN',
      legacyToken: auditData.legacyToken || null,
      action: auditData.action || 'System Action Recorded',
      performedBy: auditData.performedBy || 'System Administrator',
      userRole: auditData.userRole || 'SYSTEM',
      previousValue: auditData.previousValue !== undefined ? String(auditData.previousValue) : 'N/A',
      newValue: auditData.newValue !== undefined ? String(auditData.newValue) : 'N/A',
      timestamp: auditData.timestamp || nowStr,
      remarks: auditData.remarks || 'Audit entry recorded into immutable gazette.',
      isSimulatedDelivery: Boolean(auditData.isSimulatedDelivery),
      category: auditData.category || 'GOVERNANCE'
    };
    setAuditLogs(prev => [newRecord, ...prev]);
    return newRecord;
  };

  // 2. Get Comprehensive Complaint Details
  const getComplaintDetails = (complaintId) => {
    if (!complaintId) return null;
    const norm = String(complaintId).toUpperCase().trim();
    const complaint = complaints.find(c =>
      (c.token && c.token.toUpperCase() === norm) ||
      (c.trackingId && c.trackingId.toUpperCase() === norm) ||
      (c.id && c.id.toUpperCase() === norm) ||
      (c.legacyToken && c.legacyToken.toUpperCase() === norm)
    );
    if (!complaint) return null;

    const token = complaint.token || complaint.trackingId || complaint.id;

    // Resolve matching records
    const matchedOfficer = officers.find(o =>
      o.id === complaint.assignedOfficer?.id ||
      o.name === complaint.assignedOfficer?.name ||
      o.employeeId === complaint.assignedOfficer?.badge
    ) || complaint.assignedOfficer || null;

    const matchedDepartment = departments.find(d =>
      d.id === complaint.departmentId ||
      d.name === complaint.departmentName
    ) || null;

    const matchedReminders = reminders.filter(r =>
      r.token === token || r.complaintId === token || r.complaintToken === token ||
      (complaint.legacyToken && (r.token === complaint.legacyToken || r.complaintToken === complaint.legacyToken))
    );

    const matchedEscalations = escalations.filter(e =>
      e.complaintId === token || e.token === token ||
      (complaint.legacyToken && e.complaintId === complaint.legacyToken)
    );

    const matchedCommunications = communications.filter(c =>
      c.token === token || c.complaintId === token ||
      (complaint.legacyToken && c.token === complaint.legacyToken)
    );

    const matchedReassignments = reassignments.filter(r =>
      r.complaintId === token || (complaint.legacyToken && r.complaintId === complaint.legacyToken)
    );

    const matchedAuditLogs = auditLogs.filter(a =>
      a.complaintId === token || a.complaintToken === token ||
      (complaint.legacyToken && (a.complaintId === complaint.legacyToken || a.legacyToken === complaint.legacyToken))
    );

    const matchedFeedback = feedbackRecords.find(f =>
      f.complaintId === token || (complaint.legacyToken && f.complaintId === complaint.legacyToken)
    ) || null;

    const cleanPhone = (complaint.citizenPhone || '').replace(/\D/g, '').slice(-10);
    const matchedNotifications = citizenNotifications.filter(n =>
      n.complaintId === token || (cleanPhone && n.mobileNumber?.endsWith(cleanPhone))
    );

    // Compute explainable health indicators
    const hours = typeof complaint.hoursRemaining === 'number' ? complaint.hoursRemaining : 24;
    const isOverdue = hours < 0 || complaint.status === 'OVERDUE' || (complaint.daysOverdue || 0) > 0;
    const isApproaching = hours >= 0 && hours <= 24 && !['RESOLVED', 'CLOSED'].includes(complaint.status);

    const deadlineHealth = {
      status: isOverdue ? 'RED' : isApproaching ? 'AMBER' : 'GREEN',
      label: isOverdue ? 'Overdue Breach' : isApproaching ? 'Approaching Deadline' : 'Within Statutory SLA',
      hoursRemaining: hours,
      daysOverdue: complaint.daysOverdue || (hours < 0 ? Math.ceil(Math.abs(hours) / 24) : 0),
      deadline: complaint.slaDeadline || 'Standard 48-Hour SLA',
      reason: isOverdue
        ? `Statutory resolution deadline elapsed ${Math.abs(hours)}h ago. Accruing statutory non-compliance exposure under Section 8.`
        : isApproaching
          ? `Less than 24 hours remaining (${hours}h left). Urgent field remediation required before automated escalation.`
          : `Grievance is well within statutory timeframe with ${hours}h remaining.`
    };

    const followUpHealth = {
      status: !complaint.followUpDeadline ? 'SCHEDULED' : complaint.followUpDeadline === new Date().toISOString().substring(0, 10) ? 'DUE_TODAY' : isOverdue ? 'OVERDUE' : 'ON_TRACK',
      label: !complaint.followUpDeadline ? 'Standard Cycle' : complaint.followUpDeadline === new Date().toISOString().substring(0, 10) ? 'Follow-up Due Today' : isOverdue ? 'Follow-up Overdue' : 'Follow-up On Track',
      date: complaint.followUpDeadline || 'Next operational cycle',
      reason: complaint.followUpDeadline === new Date().toISOString().substring(0, 10)
        ? 'Scheduled nodal progress inspection is due today. Officer report required by 18:00.'
        : isOverdue
          ? 'Mandatory inspection checkpoint missed by assigned nodal officer.'
          : 'Follow-up timeline is synchronized with department field schedule.'
    };

    const isEscalated = complaint.escalationTier && complaint.escalationTier !== 'NONE';
    const escalationRisk = {
      tier: complaint.escalationTier || 'NONE',
      riskLevel: isEscalated ? 'CRITICAL' : (complaint.healthScore || 80) < 40 ? 'HIGH' : (complaint.healthScore || 80) < 70 ? 'MODERATE' : 'LOW',
      label: isEscalated ? `${complaint.escalationTier} Escalated` : (complaint.healthScore || 80) < 40 ? 'High Escalation Risk' : (complaint.healthScore || 80) < 70 ? 'Moderate Alert' : 'Low Risk',
      reason: isEscalated
        ? `Complaint currently under active supervisory escalation (${complaint.escalationTier}). Direct attention of Division Chief mandated.`
        : (complaint.healthScore || 80) < 40
          ? 'Health score dropped below 40. High risk of breach and penalty if no action is taken today.'
          : 'Normal workflow progression. Escalation probability remains below 15%.'
    };

    const citizenSatisfaction = {
      status: matchedFeedback ? 'RATED' : complaint.status === 'REOPENED' ? 'DISPUTED' : ['RESOLVED', 'CLOSED'].includes(complaint.status) ? 'AWAITING_VERIFICATION' : 'PENDING_REDRESSAL',
      label: matchedFeedback ? `${matchedFeedback.overallRating}/5 Stars CSAT` : complaint.status === 'REOPENED' ? 'Resolution Disputed' : ['RESOLVED', 'CLOSED'].includes(complaint.status) ? 'Awaiting Citizen CSAT' : 'In Service Pipeline',
      rating: matchedFeedback?.overallRating || complaint.csatRating || null,
      feedback: matchedFeedback || null,
      reason: matchedFeedback
        ? `Citizen verified resolution and recorded an overall satisfaction rating of ${matchedFeedback.overallRating}/5 stars.`
        : complaint.status === 'REOPENED'
          ? 'Citizen was dissatisfied with remediation work and requested statutory re-inspection.'
          : ['RESOLVED', 'CLOSED'].includes(complaint.status)
            ? 'Department has submitted work completion; awaiting citizen satisfaction review on public portal.'
            : 'Grievance is currently in progress; citizen feedback loop opens upon resolution submission.'
    };

    const stageMap = {
      'NEWLY_REGISTERED': { pct: 15, stage: 'Registered' },
      'DRAFT': { pct: 5, stage: 'Draft' },
      'PENDING_VERIFICATION': { pct: 25, stage: 'Under Verification' },
      'ADDITIONAL_INFO_REQUIRED': { pct: 20, stage: 'Clarification Needed' },
      'REJECTED': { pct: 100, stage: 'Rejected' },
      'VERIFIED': { pct: 35, stage: 'Verified' },
      'ASSIGNED': { pct: 50, stage: 'Cadre Assigned' },
      'IN_PROGRESS': { pct: 75, stage: 'In Progress' },
      'OVERDUE': { pct: 60, stage: 'Overdue / Escalated' },
      'ACTION_TAKEN': { pct: 85, stage: 'Action Taken' },
      'UNDER_REVIEW': { pct: 85, stage: 'Under Supervisory Review' },
      'RESOLVED': { pct: 90, stage: 'Resolution Ready' },
      'REOPENED': { pct: 45, stage: 'Reopened for Remediation' },
      'CLOSED': { pct: 100, stage: 'Formally Closed' }
    };

    const progressInfo = stageMap[complaint.status] || { pct: 50, stage: 'In Progress' };
    const resolutionProgress = {
      percentage: progressInfo.pct,
      stage: progressInfo.stage,
      reason: `Current stage is "${progressInfo.stage}" with estimated lifecycle completion at ${progressInfo.pct}%.`
    };

    return {
      complaint,
      token,
      assignedOfficer: matchedOfficer,
      department: matchedDepartment,
      reminders: matchedReminders,
      escalations: matchedEscalations,
      communications: matchedCommunications,
      reassignments: matchedReassignments,
      auditLogs: matchedAuditLogs,
      feedback: matchedFeedback,
      citizenNotifications: matchedNotifications,
      healthIndicators: {
        deadlineHealth,
        followUpHealth,
        escalationRisk,
        citizenSatisfaction,
        resolutionProgress
      }
    };
  };

  // 3. Get Complete Complaint Activities (Central Chronological Timeline)
  const getComplaintActivities = (complaintId) => {
    if (!complaintId) return [];
    const norm = String(complaintId).toUpperCase().trim();
    const complaint = complaints.find(c =>
      (c.token && c.token.toUpperCase() === norm) ||
      (c.trackingId && c.trackingId.toUpperCase() === norm) ||
      (c.id && c.id.toUpperCase() === norm) ||
      (c.legacyToken && c.legacyToken.toUpperCase() === norm)
    );
    if (!complaint) return [];

    const token = complaint.token || complaint.trackingId || complaint.id;
    const list = [];

    // 1. Actions stored on the complaint itself
    if (Array.isArray(complaint.actions)) {
      complaint.actions.forEach((act, idx) => {
        list.push({
          id: `ACT-${act.id || idx}`,
          eventType: act.type || 'Officer Action',
          description: act.text || act.description || 'Action recorded.',
          actor: act.user || act.actor || 'Nodal Cadre',
          timestamp: act.date || act.timestamp || complaint.createdAt,
          previousStatus: act.previousStatus || null,
          newStatus: act.newStatus || complaint.status,
          relatedRecordId: token,
          isInternal: Boolean(act.isInternal)
        });
      });
    }

    // 2. Complaint History records
    const histMatches = complaintHistory.filter(h =>
      h.complaintId === token || h.complaintToken === token ||
      (complaint.legacyToken && (h.complaintId === complaint.legacyToken || h.complaintToken === complaint.legacyToken))
    );
    histMatches.forEach(h => {
      list.push({
        id: h.id,
        eventType: h.eventType,
        description: h.description,
        actor: h.responsibleUser,
        timestamp: h.timestamp,
        previousStatus: h.previousValue,
        newStatus: h.newValue,
        relatedRecordId: token,
        isInternal: false
      });
    });

    // 3. Reassignment history
    const reassignMatches = reassignments.filter(r =>
      r.complaintId === token || (complaint.legacyToken && r.complaintId === complaint.legacyToken)
    );
    reassignMatches.forEach(r => {
      list.push({
        id: r.id,
        eventType: 'Officer Reassigned',
        description: `Reassigned from ${r.previousOfficer} to ${r.newOfficer}. Reason: ${r.reason}`,
        actor: r.initiatedBy || 'Administrator',
        timestamp: r.timestamp,
        previousStatus: r.previousOfficer,
        newStatus: r.newOfficer,
        relatedRecordId: r.id,
        isInternal: false
      });
    });

    // Deduplicate entries by unique signature (eventType + timestamp + description snippet)
    const seen = new Set();
    const deduped = [];
    for (const item of list) {
      const key = `${item.eventType}__${(item.timestamp || '').slice(0, 16)}__${(item.description || '').slice(0, 30)}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(item);
      }
    }

    // Sort newest first
    return deduped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // 4. Add Complaint Activity
  const addComplaintActivity = (complaintId, activityData) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newAct = {
      id: activityData.id || `ACT-${Date.now().toString().slice(-5)}`,
      type: activityData.eventType || 'OFFICER_ACTION',
      date: activityData.timestamp || nowStr,
      user: activityData.actor || 'Nodal Officer',
      text: activityData.description || 'Activity recorded.',
      isInternal: Boolean(activityData.isInternal)
    };

    setComplaints(prev => prev.map(c => {
      if (c.token === complaintId || c.trackingId === complaintId || c.id === complaintId || c.legacyToken === complaintId) {
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        return {
          ...c,
          actions: [newAct, ...curActions],
          updatedAt: nowStr
        };
      }
      return c;
    }));

    setComplaintHistory(prev => [
      {
        id: `HIST-${Date.now().toString().slice(-5)}`,
        complaintId: complaintId,
        eventType: activityData.eventType || 'Officer Action Recorded',
        description: activityData.description,
        responsibleUser: activityData.actor || 'Nodal Officer',
        timestamp: nowStr,
        previousValue: activityData.previousStatus || 'IN_PROGRESS',
        newValue: activityData.newStatus || 'IN_PROGRESS'
      },
      ...prev
    ]);

    addAuditRecord({
      complaintId,
      action: activityData.eventType || 'Officer Action Recorded',
      performedBy: activityData.actor || 'Nodal Officer',
      userRole: activityData.userRole || 'OFFICER',
      previousValue: activityData.previousStatus || 'N/A',
      newValue: activityData.newStatus || 'N/A',
      remarks: activityData.description,
      category: 'CADRE_ACTION'
    });
  };

  // 5. Submit Structured Officer Action (Field Inspection, Material Dispatch, etc.)
  const submitOfficerAction = (complaintId, actionData) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const officerName = actionData.officerName || 'Nodal Officer';
    const actionDesc = actionData.description || 'Field remediation action recorded.';
    const actionType = actionData.actionType || 'FIELD_INSPECTION';

    let updatedTicket = null;

    setComplaints(prev => prev.map(c => {
      if (c.token === complaintId || c.trackingId === complaintId || c.id === complaintId || c.legacyToken === complaintId) {
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        const nextStatus = actionData.statusUpdate || (c.status === 'ASSIGNED' ? 'IN_PROGRESS' : c.status);
        const docs = Array.isArray(actionData.supportingDocuments) ? actionData.supportingDocuments : [];
        const curAttachments = Array.isArray(c.attachments) ? c.attachments : [];

        updatedTicket = {
          ...c,
          status: nextStatus,
          updatedAt: nowStr,
          nextBestAction: actionData.nextStep || c.nextBestAction,
          attachments: [...curAttachments, ...docs],
          actions: [
            {
              id: curActions.length + 1,
              type: actionType,
              date: nowStr,
              user: officerName,
              text: `[${actionType}] ${actionDesc}`,
              documents: docs
            },
            ...curActions
          ]
        };
        return updatedTicket;
      }
      return c;
    }));

    if (updatedTicket) {
      setComplaintHistory(prev => [
        {
          id: `HIST-${Date.now().toString().slice(-5)}`,
          complaintId: updatedTicket.token,
          eventType: `Officer Action: ${actionType}`,
          description: actionDesc,
          responsibleUser: officerName,
          timestamp: nowStr,
          previousValue: updatedTicket.status,
          newValue: updatedTicket.status
        },
        ...prev
      ]);

      addAuditRecord({
        complaintId: updatedTicket.token,
        action: `Officer Action: ${actionType}`,
        performedBy: officerName,
        userRole: 'OFFICER',
        previousValue: 'IN_PROGRESS',
        newValue: updatedTicket.status,
        remarks: actionDesc,
        category: 'CADRE_ACTION'
      });
    }

    return { success: true, ticket: updatedTicket };
  };

  // 6. Submit Structured Resolution (Section 5)
  const submitResolution = (complaintId, resolutionData) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const officerName = resolutionData.submittedBy || 'Senior Nodal Engineer';
    const resTitle = resolutionData.resolutionTitle || 'Grievance Remediation Completed';
    const resDesc = resolutionData.resolutionDescription || 'On-site corrective works completed.';
    const actionTaken = resolutionData.actionTaken || 'Remediation completed per technical specifications.';
    const category = resolutionData.resolutionCategory || 'Physical Repair';
    const preMatch = complaints.find(
      c => c.token === complaintId || c.trackingId === complaintId || c.id === complaintId || c.legacyToken === complaintId
    );
    const wasActiveBefore = preMatch ? !['RESOLVED', 'CLOSED', 'REJECTED'].includes(preMatch.status) : false;

    let updatedTicket = null;

    setComplaints(prev => prev.map(c => {
      if (c.token === complaintId || c.trackingId === complaintId || c.id === complaintId || c.legacyToken === complaintId) {
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        const docs = Array.isArray(resolutionData.supportingDocuments) ? resolutionData.supportingDocuments : [];
        const curAttachments = Array.isArray(c.attachments) ? c.attachments : [];

        updatedTicket = {
          ...c,
          status: 'RESOLVED', // Strictly NOT CLOSED! Citizen verification determines closure.
          updatedAt: nowStr,
          resolvedAt: nowStr,
          resolutionSummary: resDesc,
          resolutionDetails: {
            title: resTitle,
            description: resDesc,
            actionTaken: actionTaken,
            category: category,
            completionDate: resolutionData.completionDate || nowStr.substring(0, 10),
            supportingDocuments: docs,
            officerRemarks: resolutionData.officerRemarks || 'Works verified in accordance with municipal standards.',
            submittedBy: officerName,
            resolvedAt: nowStr
          },
          nextBestAction: 'Awaiting citizen verification and CSAT feedback on citizen portal',
          attachments: [...curAttachments, ...docs],
          actions: [
            {
              id: curActions.length + 1,
              type: 'RESOLUTION_SUBMITTED',
              date: nowStr,
              user: officerName,
              text: `Resolution Submitted: "${resTitle}". Action Taken: ${actionTaken}. Work completion proofs attached. Awaiting citizen confirmation.`
            },
            ...curActions
          ]
        };
        return updatedTicket;
      }
      return c;
    }));

    if (updatedTicket) {
      if (wasActiveBefore && updatedTicket.assignedOfficer?.id) {
        setOfficers(prev => prev.map(o => {
          if (o.id === updatedTicket.assignedOfficer.id) {
            return {
              ...o,
              activeCaseload: Math.max(0, (o.activeCaseload || 1) - 1),
              pendingCount: Math.max(0, (o.pendingCount || 1) - 1),
              resolvedCount: (o.resolvedCount || 0) + 1
            };
          }
          return o;
        }));
      }

      setComplaintHistory(prev => [
        {
          id: `HIST-${Date.now().toString().slice(-5)}`,
          complaintId: updatedTicket.token,
          eventType: 'Resolution Submitted',
          description: `${resTitle} - ${actionTaken}`,
          responsibleUser: officerName,
          timestamp: nowStr,
          previousValue: 'IN_PROGRESS',
          newValue: 'RESOLVED'
        },
        ...prev
      ]);

      const cleanPhone = (updatedTicket.citizenPhone || '').replace(/\D/g, '');
      setCitizenNotifications(prev => [
        {
          id: `CNOTIF-${Date.now().toString().slice(-4)}`,
          complaintId: updatedTicket.token,
          mobileNumber: cleanPhone,
          type: 'RESOLUTION_AVAILABLE',
          category: 'Resolution',
          title: 'Resolution Submitted for Verification',
          message: `The department has resolved grievance #${updatedTicket.token} ("${resTitle}"). Please inspect and confirm satisfaction.`,
          timestamp: nowStr,
          read: false,
          severity: 'success'
        },
        ...prev
      ]);

      addAuditRecord({
        complaintId: updatedTicket.token,
        action: 'Resolution Submitted',
        performedBy: officerName,
        userRole: 'OFFICER',
        previousValue: 'IN_PROGRESS',
        newValue: 'RESOLVED',
        remarks: `Resolution submitted: ${resTitle}. Category: ${category}. Completion proofs logged.`,
        category: 'RESOLUTION'
      });
    }

    return { success: true, ticket: updatedTicket };
  };

  // 7. Record Citizen Acceptance (Section 6)
  const recordCitizenAcceptance = (complaintId, notes = '') => {
    const res = acceptResolution(complaintId, notes);
    if (res.success && res.ticket) {
      addAuditRecord({
        complaintId: res.ticket.token,
        action: 'Citizen Resolution Acceptance & Formal Closure',
        performedBy: res.ticket.citizenName || 'Citizen',
        userRole: 'CITIZEN',
        previousValue: 'RESOLVED',
        newValue: 'CLOSED',
        remarks: `Citizen accepted resolution. Notes: "${notes || 'Confirmed satisfactory on site.'}"`,
        category: 'RESOLUTION'
      });
    }
    return res;
  };

  // 8. Record Reopening (Section 6)
  const recordReopening = (complaintId, reasonCategory, reasonDetails, attachments = []) => {
    const res = requestFurtherAction(complaintId, reasonCategory, reasonDetails, attachments);
    if (res.success && res.ticket) {
      addAuditRecord({
        complaintId: res.ticket.token,
        action: 'Grievance Reopened by Citizen',
        performedBy: res.ticket.citizenName || 'Citizen',
        userRole: 'CITIZEN',
        previousValue: 'RESOLVED',
        newValue: 'REOPENED',
        remarks: `Disputed resolution: [${reasonCategory}] "${reasonDetails}". Preserved previous resolution in history.`,
        category: 'RESOLUTION'
      });
    }
    return res;
  };

  // 9. Record Final Administrative Closure
  const recordFinalClosure = (complaintId, remarks = '', officerUser = 'Zonal Vigilance Supervisor') => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let updatedTicket = null;

    setComplaints(prev => prev.map(c => {
      if (c.token === complaintId || c.trackingId === complaintId || c.id === complaintId || c.legacyToken === complaintId) {
        const curActions = Array.isArray(c.actions) ? c.actions : [];
        updatedTicket = {
          ...c,
          status: 'CLOSED',
          closureDate: nowStr,
          updatedAt: nowStr,
          closureCertificate: {
            issuedBy: officerUser,
            issuedAt: nowStr,
            remarks: remarks || 'Officially verified and closed by vigilance audit authority.'
          },
          actions: [
            {
              id: curActions.length + 1,
              type: 'FINAL_CLOSURE',
              date: nowStr,
              user: officerUser,
              text: `Final administrative closure certified. Remarks: "${remarks || 'Approved and archived.'}"`
            },
            ...curActions
          ]
        };
        return updatedTicket;
      }
      return c;
    }));

    if (updatedTicket) {
      addAuditRecord({
        complaintId: updatedTicket.token,
        action: 'Final Administrative Closure',
        performedBy: officerUser,
        userRole: 'SUPERVISOR',
        previousValue: updatedTicket.status,
        newValue: 'CLOSED',
        remarks: remarks || 'Official closure certified in municipal audit records.',
        category: 'GOVERNANCE'
      });
    }

    return { success: true, ticket: updatedTicket };
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
    const matched = complaints.find(c => c.token === complaintToken || c.trackingId === complaintToken || c.id === complaintToken);
    if (!matched) return { success: false, message: 'Complaint not found' };

    if (matched.status === 'CLOSED' || matched.status === 'RESOLVED') {
      return { success: false, message: `Complaint #${complaintToken} is already ${matched.status} and cannot be escalated.` };
    }

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

  // Direct Resolution Utility (supports token string or payload object)
  const resolveComplaintDirect = (tokenOrPayload, remarks = 'Complaint marked as resolved directly by nodal authority.') => {
    if (tokenOrPayload && typeof tokenOrPayload === 'object') {
      const targetToken = tokenOrPayload.complaintToken || tokenOrPayload.token || tokenOrPayload.id;
      const summary = tokenOrPayload.resolutionSummary || remarks;
      const actor = tokenOrPayload.resolvedBy || 'Nodal Authority';
      return updateComplaintStatus(targetToken, 'RESOLVED', summary, actor);
    }
    return updateComplaintStatus(tokenOrPayload, 'RESOLVED', remarks);
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

  // Computed Key Metrics (Derived strictly from shared complaint, escalation & feedback state)
  const metrics = useMemo(() => {
    const total = complaints.length;
    const todayPrefix = new Date().toISOString().substring(0, 10);
    const newToday = complaints.filter(
      c => (c.createdAt || '').startsWith(todayPrefix) || c.status === 'NEWLY_REGISTERED' || c.status === 'SUBMITTED'
    ).length;
    const inProgress = complaints.filter(c =>
      ['IN_PROGRESS', 'ASSIGNED', 'REOPENED', 'ADDITIONAL_INFO_REQUIRED'].includes(c.status)
    ).length;
    const overdue = complaints.filter(
      c => c.status === 'OVERDUE' || (c.daysOverdue || 0) > 0 || (typeof c.hoursRemaining === 'number' && c.hoursRemaining < 0)
    ).length;
    const pending = complaints.filter(c => !['RESOLVED', 'CLOSED', 'REJECTED'].includes(c.status)).length;
    const resolved = complaints.filter(c => ['RESOLVED', 'ACTION_TAKEN', 'CLOSED'].includes(c.status)).length;
    const escalationsCount = complaints.filter(
      c => (c.escalationLevel && c.escalationLevel > 0) || (c.escalationTier && c.escalationTier !== 'NONE')
    ).length;
    const avgHealthScore = Math.round(complaints.reduce((acc, c) => acc + (c.healthScore || 80), 0) / (total || 1));

    const firstContactCohort = complaints.filter(c => !(c.reopeningRequests && c.reopeningRequests.length > 0));
    const fcrRate = total > 0 ? calculateResolutionRate(firstContactCohort) : 0;
    const slaRate = calculateSLACompliance(complaints);
    const csat = calculateCitizenSatisfaction(feedbackRecords, complaints);

    return {
      total,
      newToday,
      inProgress,
      pending,
      overdue,
      resolved,
      escalations: Math.max(
        escalationsCount,
        escalations.filter(e => e.currentStatus === 'ACTIVE_ESCALATION' || e.status === 'ACTIVE_ESCALATION').length
      ),
      slaCompliance: `${slaRate}%`,
      firstContactResolution: `${fcrRate}%`,
      resolutionRate: `${calculateResolutionRate(complaints)}%`,
      avgSatisfaction: csat.averageRating,
      avgResolutionDays: calculateAverageResolutionTime(complaints),
      avgHealthScore
    };
  }, [complaints, escalations, feedbackRecords]);

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
        feedbackRecords,
        citizenNotifications,
        auditLogs,
        setAuditLogs,
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
        verifyCitizenAccess,
        getCitizenComplaints,
        submitCitizenResponse,
        acceptResolution,
        requestFurtherAction,
        submitCitizenFeedback,
        markCitizenNotificationRead,
        markAllCitizenNotificationsRead,
        markNotificationRead,
        markAllNotificationsRead,
        // Complaint Details & Resolution Audit Module
        addAuditRecord,
        getComplaintDetails,
        getComplaintActivities,
        addComplaintActivity,
        submitOfficerAction,
        submitResolution,
        recordCitizenAcceptance,
        recordReopening,
        recordFinalClosure,
        // Complaint Intelligence & Decision Support Module
        intelligenceAlerts,
        intelligenceReviews,
        relatedComplaintPairs,
        markIntelligenceAlertReviewed,
        dismissIntelligenceAlert,
        refreshIntelligenceAlerts,
        markComplaintsRelated,
        recordIntelligenceDecision,
        resetDemoState
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => useContext(ComplaintContext);
