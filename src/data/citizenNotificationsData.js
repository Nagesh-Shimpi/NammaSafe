// Simulated Citizen-Specific SMS & App Push Notifications
export const INITIAL_CITIZEN_NOTIFICATIONS = [
  {
    id: 'CNOTIF-901',
    complaintId: 'RTK-2026-000001',
    mobileNumber: '9840211928',
    type: 'REGISTRATION_CONFIRMATION',
    category: 'Registration',
    title: 'Grievance Docket Registered',
    message: 'Your grievance #RTK-2026-000001 regarding Contaminated drinking water has been safely logged in the Karnataka Sakala Registry.',
    timestamp: '2026-11-06 09:30',
    read: false,
    severity: 'info'
  },
  {
    id: 'CNOTIF-902',
    complaintId: 'RTK-2026-000001',
    mobileNumber: '9840211928',
    type: 'VERIFICATION_UPDATE',
    category: 'Verification',
    title: 'Grievance Verified by Scrutiny Desk',
    message: 'Scrutiny completed for #RTK-2026-000001. Jurisdictional mandate confirmed under Ministry of Jal Shakti.',
    timestamp: '2026-11-06 10:15',
    read: false,
    severity: 'success'
  },
  {
    id: 'CNOTIF-903',
    complaintId: 'RTK-2026-000001',
    mobileNumber: '9840211928',
    type: 'OFFICER_ASSIGNED',
    category: 'Assignment',
    title: 'Nodal Officer Assigned to Field',
    message: 'Er. Sandeep Kulkarni (Senior Executive Nodal Engineer) has been assigned to inspect and rectify your pipeline grievance.',
    timestamp: '2026-11-06 11:00',
    read: false,
    severity: 'info'
  },
  {
    id: 'CNOTIF-904',
    complaintId: 'RTK-2026-000005',
    mobileNumber: '9900344129',
    type: 'INFO_REQUESTED',
    category: 'Info Request',
    title: 'Action Required: Additional Information Requested',
    message: 'Administrative scrutiny desk requests updated site photographs or survey copy for storm water drain encroachment #RTK-2026-000005.',
    timestamp: '2026-11-07 10:30',
    read: false,
    severity: 'warning'
  },
  {
    id: 'CNOTIF-905',
    complaintId: 'RTK-2026-000002',
    mobileNumber: '9880144520',
    type: 'OVERDUE_ALERT',
    category: 'Escalation',
    title: 'Statutory Escalation Triggered (Level 1)',
    message: 'Grievance #RTK-2026-000002 on NH-48 crater has exceeded SLA target and has been automatically escalated to Supervisory Command.',
    timestamp: '2026-11-07 14:00',
    read: false,
    severity: 'warning'
  },
  {
    id: 'CNOTIF-906',
    complaintId: 'RTK-2026-000030',
    mobileNumber: '9840211928',
    type: 'RESOLUTION_READY',
    category: 'Resolution',
    title: 'Resolution Submitted by Nodal Officer',
    message: 'Er. Sandeep Kulkarni has reported completion of work for #RTK-2026-000030. Please inspect and confirm resolution.',
    timestamp: '2026-11-08 15:30',
    read: false,
    severity: 'success'
  },
  {
    id: 'CNOTIF-907',
    complaintId: 'RTK-2026-000030',
    mobileNumber: '9840211928',
    type: 'FEEDBACK_REQUEST',
    category: 'Feedback',
    title: 'Please Rate Your Grievance Redressal Experience',
    message: 'Your feedback directly drives departmental accountability and officer performance scores.',
    timestamp: '2026-11-08 16:00',
    read: false,
    severity: 'info'
  },
  {
    id: 'CNOTIF-908',
    complaintId: 'RTK-2026-000036',
    mobileNumber: '9840211928',
    type: 'REOPENED_CONFIRMATION',
    category: 'Reopened',
    title: 'Grievance Reopened for Further Action',
    message: 'Your request for further action on #RTK-2026-000036 has been approved. Assigned officer has been notified to re-inspect.',
    timestamp: '2026-11-08 12:20',
    read: false,
    severity: 'info'
  }
];

