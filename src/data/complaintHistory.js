// Mock Data: Comprehensive Chronological Complaint Action History
// Tracks events: Complaint Registered, Department Assigned, Officer Assigned, Follow-up Date Set,
// Reminder Generated, Officer Action Recorded, Deadline Missed, Complaint Marked Overdue,
// Supervisor Escalation, Officer Reassigned, Resolution Submitted, Complaint Reopened.

export const INITIAL_COMPLAINT_HISTORY = [
  {
    id: 'HIST-001',
    complaintToken: 'GRV-2024-8839',
    eventType: 'Complaint Registered',
    description: 'Citizen Pooja Hegde lodged pothole hazard with 2 geotagged images.',
    responsibleUser: 'Pooja Hegde (Citizen)',
    timestamp: '2026-11-03 11:20',
    previousValue: null,
    newValue: 'STATUS: SUBMITTED, PRIORITY: CRITICAL'
  },
  {
    id: 'HIST-002',
    complaintToken: 'GRV-2024-8839',
    eventType: 'Department Assigned',
    description: 'Auto-routed to Ministry of Road Transport & Highways based on NH-48 keywords.',
    responsibleUser: 'GovOps AI Triage',
    timestamp: '2026-11-03 11:22',
    previousValue: 'Unassigned',
    newValue: 'Ministry of Road Transport & Highways (MORTH)'
  },
  {
    id: 'HIST-003',
    complaintToken: 'GRV-2024-8839',
    eventType: 'Officer Assigned',
    description: 'Assigned to Assistant Executive Engineer V. R. Chandrashekar.',
    responsibleUser: 'Cadre Allocation Matrix',
    timestamp: '2026-11-03 11:25',
    previousValue: 'Unassigned',
    newValue: 'V. R. Chandrashekar (PWD-3312)'
  },
  {
    id: 'HIST-004',
    complaintToken: 'GRV-2024-8839',
    eventType: 'Follow-up Date Set',
    description: 'First follow-up deadline set for inspection dispatch.',
    responsibleUser: 'System Scheduler',
    timestamp: '2026-11-03 11:30',
    previousValue: null,
    newValue: '2026-11-04 12:00'
  },
  {
    id: 'HIST-005',
    complaintToken: 'GRV-2024-8839',
    eventType: 'Deadline Missed',
    description: 'Statutory 48h resolution SLA elapsed without site verification.',
    responsibleUser: 'SLA Chrono-Bot',
    timestamp: '2026-11-05 11:20',
    previousValue: '48h SLA Remaining',
    newValue: 'SLA Breached (-1h)'
  },
  {
    id: 'HIST-006',
    complaintToken: 'GRV-2024-8839',
    eventType: 'Complaint Marked Overdue',
    description: 'Docket status automatically shifted to OVERDUE.',
    responsibleUser: 'SLA Chrono-Bot',
    timestamp: '2026-11-05 11:21',
    previousValue: 'IN_PROGRESS',
    newValue: 'OVERDUE'
  },
  {
    id: 'HIST-007',
    complaintToken: 'GRV-2024-8839',
    eventType: 'Reminder Generated',
    description: 'Simulated WhatsApp Show-Cause notice generated and dispatched.',
    responsibleUser: 'Cadre Reminder Engine',
    timestamp: '2026-11-06 10:00',
    previousValue: 'No reminder',
    newValue: 'Show-Cause Notice Sent'
  },
  {
    id: 'HIST-008',
    complaintToken: 'GRV-2024-8839',
    eventType: 'Supervisor Escalation',
    description: 'Escalated to Level 3 (Department Head Review / DM Desk).',
    responsibleUser: 'Smt. Gayatri Devi, IAS',
    timestamp: '2026-11-07 09:00',
    previousValue: 'Level 1: Officer Reminder',
    newValue: 'Level 3: Department Head Review'
  },
  // History for GRV-2024-8841
  {
    id: 'HIST-009',
    complaintToken: 'GRV-2024-8841',
    eventType: 'Complaint Registered',
    description: 'Citizen Sunil Mehta reported water contamination in Ward 14.',
    responsibleUser: 'Sunil Mehta (Citizen)',
    timestamp: '2026-11-06 09:30',
    previousValue: null,
    newValue: 'STATUS: SUBMITTED'
  },
  {
    id: 'HIST-010',
    complaintToken: 'GRV-2024-8841',
    eventType: 'Officer Assigned',
    description: 'Assigned to Senior Executive Nodal Engineer Er. Sandeep Kulkarni.',
    responsibleUser: 'GovOps AI Triage',
    timestamp: '2026-11-06 09:31',
    previousValue: 'Unassigned',
    newValue: 'Er. Sandeep Kulkarni (GAZ-9014)'
  },
  {
    id: 'HIST-011',
    complaintToken: 'GRV-2024-8841',
    eventType: 'Officer Action Recorded',
    description: 'Inspection team dispatched. Located cross-leakage near storm drain pipe.',
    responsibleUser: 'Er. Sandeep Kulkarni',
    timestamp: '2026-11-06 14:15',
    previousValue: 'Pending site visit',
    newValue: 'Site inspected; cross-leak identified'
  },
  {
    id: 'HIST-012',
    complaintToken: 'GRV-2024-8841',
    eventType: 'Follow-up Date Set',
    description: 'Follow-up date set for water tanker verification.',
    responsibleUser: 'Er. Sandeep Kulkarni',
    timestamp: '2026-11-08 14:00',
    previousValue: '2026-11-07 10:00',
    newValue: '2026-11-09 11:00'
  },
  {
    id: 'HIST-013',
    complaintToken: 'GRV-2024-8841',
    eventType: 'Reminder Generated',
    description: 'Nodal email reminder issued for upcoming 24h follow-up deadline.',
    responsibleUser: 'Reminder Centre Daemon',
    timestamp: '2026-11-08 17:00',
    previousValue: 'NONE',
    newValue: 'SENT'
  },
  // History for GRV-2024-8822 (Resolved)
  {
    id: 'HIST-014',
    complaintToken: 'GRV-2024-8822',
    eventType: 'Complaint Registered',
    description: 'Elderly pension delay ticket registered via Gram Panchayat kiosk.',
    responsibleUser: 'Ananya Sen (Citizen)',
    timestamp: '2026-11-04 10:10',
    previousValue: null,
    newValue: 'STATUS: SUBMITTED'
  },
  {
    id: 'HIST-015',
    complaintToken: 'GRV-2024-8822',
    eventType: 'Officer Action Recorded',
    description: 'Treasury IFSC reconciliation completed. ₹6,000 arrears released.',
    responsibleUser: 'Meenakshi Rao',
    timestamp: '2026-11-06 12:00',
    previousValue: 'Pending Treasury sync',
    newValue: 'IFSC fixed, DBT queued'
  },
  {
    id: 'HIST-016',
    complaintToken: 'GRV-2024-8822',
    eventType: 'Resolution Submitted',
    description: 'Sanction letter #SWD/2024/9012 uploaded; ticket resolved.',
    responsibleUser: 'Meenakshi Rao',
    timestamp: '2026-11-06 12:30',
    previousValue: 'ACTION_TAKEN',
    newValue: 'RESOLVED'
  }
];

