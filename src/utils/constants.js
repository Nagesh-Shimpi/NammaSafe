export const USER_ROLES = {
  CITIZEN: 'Citizen',
  OFFICER: 'Department Officer',
  SUPERVISOR: 'Supervisor',
  ADMIN: 'Administrator'
};

export const DEPARTMENTS = [
  { id: 'dept-1', code: 'MORTH', name: 'Ministry of Road Transport & Highways', nameKn: 'ರಸ್ತೆ ಸಾರಿಗೆ ಮತ್ತು ಹೆದ್ದಾರಿಗಳ ಸಚಿವಾಲಯ', icon: 'traffic', targetSla: 48, score: 96, active: 4120, tier: 'Tier 1' },
  { id: 'dept-2', code: 'JAL', name: 'Ministry of Jal Shakti (Water Supply)', nameKn: 'ಜಲ ಶಕ್ತಿ ಸಚಿವಾಲಯ (ಕುಡಿಯುವ ನೀರು)', icon: 'water_drop', targetSla: 48, score: 88, active: 3840, tier: 'Tier 2' },
  { id: 'dept-3', code: 'URBAN', name: 'Urban Development & Municipal Corp', nameKn: 'ನಗರಾಭಿವೃದ್ಧಿ ಮತ್ತು ಮಹಾನಗರ ಪಾಲಿಕೆ', icon: 'domain', targetSla: 72, score: 79, active: 5210, tier: 'Needs Attention' },
  { id: 'dept-4', code: 'POWER', name: 'Power & Energy Distribution (BESCOM/Grid)', nameKn: 'ವಿದ್ಯುತ್ ಮತ್ತು ಇಂಧನ ವಿತರಣಾ ನಿಗಮ', icon: 'bolt', targetSla: 24, score: 84, active: 2900, tier: 'Nominal' },
  { id: 'dept-5', code: 'PDS', name: 'Public Distribution System (Food & Civil Supplies)', nameKn: 'ಸಾರ್ವಜನಿಕ ವಿತರಣಾ ವ್ಯವಸ್ಥೆ (ಆಹಾರ)', icon: 'local_mall', targetSla: 72, score: 93, active: 1980, tier: 'Tier 1' },
  { id: 'dept-6', code: 'WELFARE', name: 'Social Welfare & Empowerment', nameKn: 'ಸಮಾಜ ಕಲ್ಯಾಣ ಮತ್ತು ಸಬಲೀಕರಣ ಇಲಾಖೆ', icon: 'elderly', targetSla: 96, score: 81, active: 1450, tier: 'Nominal' },
  { id: 'dept-7', code: 'HEALTH', name: 'Health & Family Welfare Directorate', nameKn: 'ಆರೋಗ್ಯ ಮತ್ತು ಕುಟುಂಬ ಕಲ್ಯಾಣ ನಿರ್ದೇಶನಾಲಯ', icon: 'medical_services', targetSla: 24, score: 91, active: 2130, tier: 'Tier 1' },
  { id: 'dept-8', code: 'POLICE', name: 'Home Affairs & Public Safety', nameKn: 'ಗೃಹ ವ್ಯವಹಾರಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ರಕ್ಷಣೆ', icon: 'local_police', targetSla: 24, score: 89, active: 3100, tier: 'Tier 2' },
];

export const DISTRICTS = [
  'Bengaluru Urban',
  'Bengaluru Rural',
  'Mysuru',
  'Mangaluru (Dakshina Kannada)',
  'Hubballi-Dharwad',
  'Belagavi',
  'Kalaburagi',
  'Shivamogga',
  'Ballari',
  'Tumakuru'
];

export const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', labelKn: 'ಕರಡು', color: 'bg-slate-100 text-slate-700 border border-slate-300', dot: 'bg-slate-400' },
  NEWLY_REGISTERED: { label: 'Newly Registered', labelKn: 'ಹೊಸದಾಗಿ ದಾಖಲಾಗಿದೆ', color: 'bg-sky-50 text-sky-700 border border-sky-200', dot: 'bg-sky-500 animate-pulse' },
  PENDING_VERIFICATION: { label: 'Pending Verification', labelKn: 'ಪರಿಶೀಲನೆ ಬಾಕಿ', color: 'bg-amber-50 text-amber-700 border border-amber-300', dot: 'bg-amber-500' },
  ADDITIONAL_INFO_REQUIRED: { label: 'Info Required', labelKn: 'ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ', color: 'bg-orange-50 text-orange-700 border border-orange-300', dot: 'bg-orange-500' },
  VERIFIED: { label: 'Verified', labelKn: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ', color: 'bg-teal-50 text-teal-700 border border-teal-300', dot: 'bg-teal-600' },
  ASSIGNED: { label: 'Assigned', labelKn: 'ನಿಯೋಜಿಸಲಾಗಿದೆ', color: 'bg-blue-50 text-blue-700 border border-blue-300', dot: 'bg-blue-600' },
  IN_PROGRESS: { label: 'In Progress', labelKn: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ', color: 'bg-primary-fixed text-on-primary-fixed-variant border border-primary/20', dot: 'bg-primary' },
  PENDING_CITIZEN_RESPONSE: { label: 'Citizen Response Pending', labelKn: 'ನಾಗರಿಕರ ಪ್ರತಿಕ್ರಿಯೆ ಬಾಕಿ', color: 'bg-indigo-50 text-indigo-700 border border-indigo-200', dot: 'bg-indigo-500' },
  UNDER_REVIEW: { label: 'Under Review', labelKn: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ', color: 'bg-purple-50 text-purple-700 border border-purple-200', dot: 'bg-purple-500' },
  ACTION_TAKEN: { label: 'Action Taken', labelKn: 'ಕ್ರಮ ಕೈಗೊಳ್ಳಲಾಗಿದೆ', color: 'bg-cyan-50 text-cyan-700 border border-cyan-200', dot: 'bg-cyan-600' },
  RESOLVED: { label: 'Resolved', labelKn: 'ಪರಿಹರಿಸಲಾಗಿದೆ', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500' },
  REOPENED: { label: 'Reopened', labelKn: 'ಮರುತೆರೆಯಲಾಗಿದೆ', color: 'bg-amber-100 text-amber-900 border border-amber-300', dot: 'bg-amber-600 animate-pulse' },
  REJECTED: { label: 'Rejected', labelKn: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ', color: 'bg-rose-50 text-rose-700 border border-rose-300', dot: 'bg-rose-600' },
  CLOSED: { label: 'Closed', labelKn: 'ಮುಕ್ತಾಯಗೊಂಡಿದೆ', color: 'bg-slate-200 text-slate-600 border border-slate-300', dot: 'bg-slate-500' },
  // Backward compatibility alias for legacy data
  SUBMITTED: { label: 'Submitted', labelKn: 'ದಾಖಲಾಗಿದೆ', color: 'bg-sky-50 text-sky-700 border border-sky-200', dot: 'bg-sky-500 animate-pulse' },
  OVERDUE: { label: 'Overdue', labelKn: 'ಅವಧಿ ಮೀರಿದೆ', color: 'bg-error-container text-on-error-container border border-error/20', dot: 'bg-error animate-ping' }
};

export const VALID_STATUS_TRANSITIONS = {
  DRAFT: ['NEWLY_REGISTERED', 'SUBMITTED'],
  NEWLY_REGISTERED: ['PENDING_VERIFICATION', 'VERIFIED', 'ADDITIONAL_INFO_REQUIRED', 'REJECTED'],
  SUBMITTED: ['PENDING_VERIFICATION', 'VERIFIED', 'ADDITIONAL_INFO_REQUIRED', 'ASSIGNED', 'REJECTED'],
  PENDING_VERIFICATION: ['VERIFIED', 'ADDITIONAL_INFO_REQUIRED', 'REJECTED'],
  ADDITIONAL_INFO_REQUIRED: ['PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'],
  VERIFIED: ['ASSIGNED', 'IN_PROGRESS', 'REJECTED'],
  ASSIGNED: ['IN_PROGRESS', 'PENDING_CITIZEN_RESPONSE', 'UNDER_REVIEW', 'REOPENED'],
  IN_PROGRESS: ['PENDING_CITIZEN_RESPONSE', 'UNDER_REVIEW', 'ACTION_TAKEN', 'RESOLVED', 'ASSIGNED', 'OVERDUE'],
  PENDING_CITIZEN_RESPONSE: ['IN_PROGRESS', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'],
  UNDER_REVIEW: ['IN_PROGRESS', 'ACTION_TAKEN', 'RESOLVED', 'OVERDUE'],
  ACTION_TAKEN: ['RESOLVED', 'IN_PROGRESS', 'REOPENED'],
  OVERDUE: ['IN_PROGRESS', 'ASSIGNED', 'RESOLVED', 'REOPENED'],
  RESOLVED: ['REOPENED', 'CLOSED'],
  REOPENED: ['ASSIGNED', 'IN_PROGRESS', 'UNDER_REVIEW'],
  REJECTED: ['REOPENED', 'PENDING_VERIFICATION'], // for administrative review / appeal
  CLOSED: ['REOPENED']
};

export const isValidStatusTransition = (currentStatus, targetStatus) => {
  if (!currentStatus || !targetStatus) return false;
  if (currentStatus === targetStatus) return true;
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
  return Array.isArray(allowed) && allowed.includes(targetStatus);
};

export const PRIORITY_CONFIG = {
  LOW: { label: 'Low', labelKn: 'ಕಡಿಮೆ', color: 'bg-surface-container text-on-surface-variant', slaHours: 168 },
  MEDIUM: { label: 'Medium', labelKn: 'ಮಧ್ಯಮ', color: 'bg-secondary-container text-on-secondary-container', slaHours: 72 },
  HIGH: { label: 'High', labelKn: 'ಹೆಚ್ಚು', color: 'bg-amber-100 text-amber-900', slaHours: 48 },
  CRITICAL: { label: 'Critical', labelKn: 'ತುರ್ತು', color: 'bg-error-container text-on-error-container', slaHours: 24 }
};

export const INITIAL_COMPLAINTS = [
  {
    id: 'GRV-2024-8841',
    token: 'GRV-2024-8841',
    citizenName: 'Sunil Mehta',
    citizenPhone: '+91 98402 11928',
    citizenIdType: 'Aadhaar Verified',
    district: 'Bengaluru Urban',
    ward: 'North Zone · Ward 14',
    location: '12.9716° N, 77.5946° E',
    category: 'Water Supply & Quality',
    departmentId: 'dept-2',
    departmentName: 'Ministry of Jal Shakti (Water Supply)',
    title: 'Contaminated drinking water pipeline leak with sewer intrusion',
    titleKn: 'ಕೊಳಚೆ ನೀರಿನ ಮಿಶ್ರಣದಿಂದ ಕಲುಷಿತ ಕುಡಿಯುವ ನೀರಿನ ಪೈಪ್‌ಲೈನ್ ಸೋರಿಕೆ',
    description: 'Black brackish water supplied for the last 3 days in Ward 14. Multiple households reported gastro issues. Immediate inspection and pipe replacement required.',
    descriptionKn: 'ವಾರ್ಡ್ 14 ರಲ್ಲಿ ಕಳೆದ 3 ದಿನಗಳಿಂದ ಕಪ್ಪು ಬಣ್ಣದ ನೀರು ಬರುತ್ತಿದೆ. ಅನೇಕ ಕುಟುಂಬಗಳಲ್ಲಿ ಜಠರ ಸಂಬಂಧಿ ಸಮಸ್ಯೆಗಳು ಕಾಣಿಸಿಕೊಂಡಿವೆ. ತಕ್ಷಣ ಪೈಪ್ ದುರಸ್ತಿ ಅಗತ್ಯವಿದೆ.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    escalationTier: 'NONE',
    slaDeadline: '2026-11-08T18:00:00Z',
    hoursRemaining: 4,
    healthScore: 68,
    assignedOfficer: {
      id: 'off-1',
      name: 'Er. Sandeep Kulkarni',
      badge: 'GAZ-9014',
      designation: 'Senior Executive Engineer (Water Ops)',
      mobile: '+91 94480 32190'
    },
    actions: [
      { id: 1, type: 'SUBMITTED', date: '2026-11-06 09:30', user: 'Sunil Mehta', text: 'Grievance submitted via Citizen Web Portal with geocoded photos.' },
      { id: 2, type: 'AUTO_ASSIGNED', date: '2026-11-06 09:31', user: 'GovOps AI', text: 'Auto-routed to Jal Shakti Dept based on keywords "water pipeline". Assigned to Er. Sandeep Kulkarni.' },
      { id: 3, type: 'NOTE', date: '2026-11-06 14:15', user: 'Er. Sandeep Kulkarni', text: 'Inspection team dispatched. Located cross-leakage near storm drain pipe.' }
    ],
    nextBestAction: 'Dispatch emergency water tanker & issue pipeline repair tender',
    attachments: [
      { name: 'contaminated_tap_water.jpg', size: '2.4 MB', type: 'image' },
      { name: 'voice_complaint_transcript.wav', size: '1.1 MB', type: 'audio' }
    ],
    audioTranscript: "Water coming from tap has foul odor and brown residue since yesterday morning. We have small children in the house."
  },
  {
    id: 'GRV-2024-8839',
    token: 'GRV-2024-8839',
    citizenName: 'Pooja Hegde',
    citizenPhone: '+91 98801 44520',
    citizenIdType: 'Aadhaar Verified',
    district: 'Bengaluru Urban',
    ward: 'Bengaluru South · Silk Board Ramp',
    location: '12.9175° N, 77.6238° E',
    category: 'Roads & Infrastructure',
    departmentId: 'dept-1',
    departmentName: 'Ministry of Road Transport & Highways',
    title: 'Pothole crater accident hazard on NH-48 flyover descent',
    titleKn: 'ಎನ್‌ಎಚ್‌-48 ಮೇಲ್ಸೇತುವೆ ಇಳಿಜಾರಿನಲ್ಲಿ ಆಳವಾದ ಗುಂಡಿ ಅಪಘಾತದ ಅಪಾಯ',
    description: '18-inch deep crater directly at the descent of the main expressway. 2 two-wheelers skidded last night during rain. Vehicles swerving abruptly at high speed.',
    descriptionKn: 'ಮೇನ್‌ ಎಕ್ಸ್‌ಪ್ರೆಸ್‌ವೇ ಇಳಿಜಾರಿನಲ್ಲಿ 18 ಇಂಚು ಆಳದ ಗುಂಡಿ ಬಿದ್ದಿದೆ. ನಿನ್ನೆ ರಾತ್ರಿ ಮಳೆಯಲ್ಲಿ 2 ಬೈಕ್‌ಗಳು ಜಾರಿ ಬಿದ್ದಿವೆ.',
    priority: 'CRITICAL',
    status: 'OVERDUE',
    escalationTier: 'TIER_3',
    slaDeadline: '2026-11-05T12:00:00Z',
    hoursRemaining: -48,
    healthScore: 22,
    assignedOfficer: {
      id: 'off-2',
      name: 'V. R. Chandrashekar',
      badge: 'PWD-3312',
      designation: 'Assistant Executive Engineer (NHAI/PWD)',
      mobile: '+91 98451 90871'
    },
    actions: [
      { id: 1, type: 'SUBMITTED', date: '2026-11-03 11:20', user: 'Pooja Hegde', text: 'Grievance submitted with geotagged photo proof.' },
      { id: 2, type: 'ESCALATED', date: '2026-11-05 13:00', user: 'SLA Chrono-Bot', text: 'SLA 48h breached without contractor sign-off. Escalated to Tier 2 (Zonal Commissioner).' },
      { id: 3, type: 'SHOW_CAUSE', date: '2026-11-06 10:00', user: 'District Magistrate Office', text: 'Statutory Show-Cause Notice issued to PWD under Section 4 Public Services Guarantee Act.' }
    ],
    nextBestAction: 'Summon PWD Contractor for emergency cold-mix bitumen patching within 6 hours',
    attachments: [
      { name: 'pothole_crater_depth.jpg', size: '3.1 MB', type: 'image' },
      { name: 'traffic_hazard_video.mp4', size: '14.8 MB', type: 'video' }
    ],
    audioTranscript: "Two two-wheelers skidded last night. The hole is nearly 18 inches deep right after the flyover ramp. Vehicles swerving abruptly."
  },
  {
    id: 'GRV-2024-8835',
    token: 'GRV-2024-8835',
    citizenName: 'Farhan Akhtar',
    citizenPhone: '+91 97412 88120',
    citizenIdType: 'Consumer Meter ID',
    district: 'Hubballi-Dharwad',
    ward: 'Zone 3 · Vidyanagar',
    location: '15.3647° N, 75.1240° E',
    category: 'Electricity & Power',
    departmentId: 'dept-4',
    departmentName: 'Power & Energy Distribution (HESCOM)',
    title: 'Commercial electric meter overbilling dispute with abnormal spike',
    titleKn: 'ಅಸಹಜ ಏರಿಕೆಯೊಂದಿಗೆ ವಾಣಿಜ್ಯ ವಿದ್ಯುತ್ ಮೀಟರ್ ಅತಿಯಾದ ಬಿಲ್ಲಿಂಗ್ ವಿವಾದ',
    description: 'Monthly electricity bill jumped from average ₹3,200 to ₹48,000 without load increase. Meter appears faulty with continuous high pulse rate.',
    descriptionKn: 'ಯಾವುದೇ ಹೆಚ್ಚುವರಿ ಲೋಡ್ ಇಲ್ಲದಿದ್ದರೂ ಮಾಸಿಕ ಬಿಲ್ ₹3,200 ರಿಂದ ₹48,000 ಕ್ಕೆ ಏರಿಕೆಯಾಗಿದೆ. ಮೀಟರ್ ದೋಷಪೂರಿತವಾಗಿದೆ.',
    priority: 'MEDIUM',
    status: 'UNDER_REVIEW',
    escalationTier: 'NONE',
    slaDeadline: '2026-11-09T10:00:00Z',
    hoursRemaining: 18,
    healthScore: 78,
    assignedOfficer: {
      id: 'off-3',
      name: 'Naveen Kumar Swamy',
      badge: 'ELE-5521',
      designation: 'Assistant Engineer (Metering & Vigilance)',
      mobile: '+91 94498 77610'
    },
    actions: [
      { id: 1, type: 'SUBMITTED', date: '2026-11-06 16:40', user: 'Farhan Akhtar', text: 'Dispute submitted with 3 previous billing receipts.' },
      { id: 2, type: 'ASSIGNED', date: '2026-11-06 17:00', user: 'Auto-Triage', text: 'Routed to Vidyanagar Sub-division metering cadre.' }
    ],
    nextBestAction: 'Schedule on-site meter calibration test and freeze demand notice penalty',
    attachments: [
      { name: 'current_bill_oct.pdf', size: '1.2 MB', type: 'pdf' }
    ]
  },
  {
    id: 'GRV-2024-8822',
    token: 'GRV-2024-8822',
    citizenName: 'Ananya Sen',
    citizenPhone: '+91 94481 00219',
    citizenIdType: 'Senior Citizen Gate',
    district: 'Mysuru',
    ward: 'South Zone · Kuvempunagar',
    location: '12.2958° N, 76.6394° E',
    category: 'Social Welfare & Pensions',
    departmentId: 'dept-6',
    departmentName: 'Social Welfare & Empowerment',
    title: 'Delayed pension disbursal under Sandhya Suraksha / Old Age Scheme',
    titleKn: 'ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ / ವೃದ್ಧಾಪ್ಯ ಯೋಜನೆಯಡಿ ಪಿಂಚಣಿ ವಿತರಣೆಯಲ್ಲಿ ವಿಳಂಬ',
    description: 'Pension for 78-year-old beneficiary unpaid for past 3 quarters despite Aadhaar biometric re-verification completed in August.',
    descriptionKn: '78 ವರ್ಷದ ಫಲಾನುಭವಿಗೆ ಆಗಸ್ಟ್‌ನಲ್ಲಿ ಬಯೋಮೆಟ್ರಿಕ್ ಪರಿಶೀಲನೆ ಮುಗಿದಿದ್ದರೂ ಕಳೆದ 3 ತ್ರೈಮಾಸಿಕಗಳಿಂದ ಪಿಂಚಣಿ ಬಂದಿಲ್ಲ.',
    priority: 'LOW',
    status: 'ACTION_TAKEN',
    escalationTier: 'NONE',
    slaDeadline: '2026-11-10T15:00:00Z',
    hoursRemaining: 72,
    healthScore: 84,
    assignedOfficer: {
      id: 'off-4',
      name: 'Meenakshi Rao',
      badge: 'SWD-1190',
      designation: 'Taluk Welfare Officer',
      mobile: '+91 94808 55432'
    },
    actions: [
      { id: 1, type: 'SUBMITTED', date: '2026-11-04 10:10', user: 'Ananya Sen', text: 'Application lodged with beneficiary pension registration ID.' },
      { id: 2, type: 'ACTION_TAKEN', date: '2026-11-06 12:00', user: 'Meenakshi Rao', text: 'Treasury IFSC bank reconciliation completed. ₹6,000 arrears queued for direct transfer.' }
    ],
    nextBestAction: 'Send automated SMS confirmation to citizen with Treasury transaction ref',
    attachments: []
  },
  {
    id: 'GRV-2024-8818',
    token: 'GRV-2024-8818',
    citizenName: 'Rameshwar Rao',
    citizenPhone: '+91 98450 67123',
    citizenIdType: 'Municipal Land SAS ID',
    district: 'Belagavi',
    ward: 'City Corporation · Ward 8',
    location: '15.8497° N, 74.4977° E',
    category: 'Revenue & Property Tax',
    departmentId: 'dept-3',
    departmentName: 'Urban Development & Municipal Corp',
    title: 'Non-issuance of property tax clearance certificate and Khata extract',
    titleKn: 'ಆಸ್ತಿ ತೆರಿಗೆ ಪಾವತಿ ಪ್ರಮಾಣಪತ್ರ ಮತ್ತು ಖಾತಾ ಸಾರಾಂಶ ನೀಡದಿರುವುದು',
    description: 'Paid complete SAS property dues on 12th Oct. Receipt generated but digital e-Khata extract is blocked due to server sync error at zonal revenue office.',
    descriptionKn: 'ಅಕ್ಟೋಬರ್ 12 ರಂದು ಎಲ್ಲಾ ಆಸ್ತಿ ತೆರಿಗೆ ಪಾವತಿಸಲಾಗಿದೆ. ಆದರೆ ಇ-ಖಾತಾ ಸಾರಾಂಶ ಸರ್ವರ್ ಸಮಸ್ಯೆಯಿಂದ ಸಿಗುತ್ತಿಲ್ಲ.',
    priority: 'HIGH',
    status: 'OVERDUE',
    escalationTier: 'TIER_1',
    slaDeadline: '2026-11-07T08:00:00Z',
    hoursRemaining: -5,
    healthScore: 34,
    assignedOfficer: {
      id: 'off-5',
      name: 'Praveen Kumar',
      badge: 'REV-4482',
      designation: 'Revenue Inspector (Zone 8)',
      mobile: '+91 98442 12908'
    },
    actions: [
      { id: 1, type: 'SUBMITTED', date: '2026-11-02 14:00', user: 'Rameshwar Rao', text: 'Grievance submitted with bank transaction challan.' },
      { id: 2, type: 'WARNING', date: '2026-11-07 08:01', user: 'Chrono-Monitor', text: 'SLA threshold 72h expired without officer verification. Auto-notified.' }
    ],
    nextBestAction: 'Manual override to push SAS clearance certificate to citizen WhatsApp portal',
    attachments: []
  }
];

export const INITIAL_OFFICERS = [
  {
    id: 'off-1',
    name: 'Er. Sandeep Kulkarni',
    badge: 'GAZ-9014',
    department: 'Ministry of Jal Shakti',
    designation: 'Senior Executive Engineer',
    activeCaseload: 34,
    slaRate: 94.2,
    resolvedCount: 420,
    rating: 4.6,
    status: 'ONLINE',
    section8Flag: false,
    zone: 'Bengaluru North'
  },
  {
    id: 'off-2',
    name: 'V. R. Chandrashekar',
    badge: 'PWD-3312',
    department: 'Road Transport & Highways',
    designation: 'Assistant Executive Engineer',
    activeCaseload: 52,
    slaRate: 78.4,
    resolvedCount: 310,
    rating: 3.8,
    status: 'ONLINE',
    section8Flag: true,
    zone: 'Bengaluru South'
  },
  {
    id: 'off-3',
    name: 'Naveen Kumar Swamy',
    badge: 'ELE-5521',
    department: 'Power & Energy (BESCOM)',
    designation: 'Assistant Engineer (Metering)',
    activeCaseload: 28,
    slaRate: 91.5,
    resolvedCount: 560,
    rating: 4.4,
    status: 'ONLINE',
    section8Flag: false,
    zone: 'Hubballi-Dharwad'
  },
  {
    id: 'off-4',
    name: 'Meenakshi Rao',
    badge: 'SWD-1190',
    department: 'Social Welfare & Empowerment',
    designation: 'Taluk Welfare Officer',
    activeCaseload: 22,
    slaRate: 96.0,
    resolvedCount: 680,
    rating: 4.8,
    status: 'ONLINE',
    section8Flag: false,
    zone: 'Mysuru South'
  },
  {
    id: 'off-5',
    name: 'Praveen Kumar',
    badge: 'REV-4482',
    department: 'Urban Development (BBMP/CC)',
    designation: 'Revenue Inspector',
    activeCaseload: 48,
    slaRate: 72.1,
    resolvedCount: 290,
    rating: 3.5,
    status: 'OFFLINE',
    section8Flag: true,
    zone: 'Belagavi Central'
  }
];

export const INITIAL_NOTICES = [
  {
    id: 'NOT-1001',
    token: 'GRV-2024-8839',
    type: 'SHOW_CAUSE_NOTICE',
    channel: 'WHATSAPP & REGISTERED POST',
    recipient: 'V. R. Chandrashekar (PWD-3312)',
    subject: 'Show-Cause Notice under Sec 4 Karnataka Guarantee of Services Act',
    date: '2026-11-06 10:00',
    status: 'DELIVERED',
    stage: 'Tier 3 (T+48h)'
  },
  {
    id: 'NOT-1002',
    token: 'GRV-2024-8818',
    type: 'SLA_BREACH_WARNING',
    channel: 'SMS & PORTAL ALERT',
    recipient: 'Praveen Kumar (REV-4482)',
    subject: 'SLA Grace Period Expired: Mandatory Action within 12 Hours',
    date: '2026-11-07 08:05',
    status: 'DELIVERED',
    stage: 'Tier 1 (T-0h)'
  },
  {
    id: 'NOT-1003',
    token: 'GRV-2024-8841',
    type: 'SOFT_NUDGE',
    channel: 'SMS GATEWAY',
    recipient: 'Sunil Mehta (Citizen)',
    subject: 'Your grievance has been assigned to inspection cadre',
    date: '2026-11-06 09:35',
    status: 'ACKNOWLEDGED',
    stage: 'Tier 0 (Citizen Info)'
  }
];

