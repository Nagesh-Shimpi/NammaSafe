// Mock Data: Escalation Records for ResolveTrack Intelligent Escalation Management
// Supports Configurable Levels:
// Level 0: Normal Monitoring
// Level 1: Officer Reminder
// Level 2: Supervisor Escalation
// Level 3: Department Head Review

export const INITIAL_ESCALATION_RECORDS = [
  {
    id: 'ESC-2024-101',
    complaintId: 'GRV-2024-8839',
    complaintToken: 'GRV-2024-8839',
    complaintTitle: 'Pothole crater accident hazard on NH-48 flyover descent',
    department: 'Ministry of Road Transport & Highways',
    departmentId: 'dept-1',
    escalationLevel: 3,
    levelLabel: 'Level 3: Department Head Review',
    escalationReason: 'Critical public safety hazard on National Highway breached 48h statutory deadline with no contractor mobilization.',
    previousOfficer: 'Er. Sandeep Kulkarni',
    previousOfficerId: 'off-1',
    currentOfficer: 'V. R. Chandrashekar (PWD-3312)',
    currentOfficerId: 'off-2',
    escalationDate: '2026-11-07 09:00',
    reviewingAuthority: 'District Magistrate & Zonal Ombudsman',
    currentStatus: 'ACTIVE_ESCALATION',
    penaltyExposure: '₹1,500 pending (Sec 4 Sakala Act)',
    mandatedAction: 'Immediate executive override. Summon contractor by 5:00 PM for emergency patching.',
    decisions: [
      {
        id: 1,
        author: 'Smt. Gayatri Devi, IAS (District Magistrate)',
        role: 'Supervisor',
        timestamp: '2026-11-07 10:15',
        decision: 'Summon Contractor & Nodal Lead',
        note: 'Contractor summoned for formal show-cause. Direct emergency patching team dispatched with cold-mix bags.'
      }
    ]
  },
  {
    id: 'ESC-2024-102',
    complaintId: 'GRV-2024-8818',
    complaintToken: 'GRV-2024-8818',
    complaintTitle: 'Non-issuance of property tax clearance certificate and Khata extract',
    department: 'Urban Development & Municipal Corp (BBMP)',
    departmentId: 'dept-3',
    escalationLevel: 2,
    levelLabel: 'Level 2: Supervisor Escalation',
    escalationReason: 'Zonal revenue database sync failure with state Kaveri-2 registry portal past 72h limit.',
    previousOfficer: 'Sri Anand Murthy',
    previousOfficerId: 'off-9',
    currentOfficer: 'Praveen Kumar (REV-4482)',
    currentOfficerId: 'off-5',
    escalationDate: '2026-11-07 08:00',
    reviewingAuthority: 'Zonal Revenue Commissioner',
    currentStatus: 'UNDER_REVIEW',
    penaltyExposure: '₹250 pending',
    mandatedAction: 'Manual override to push digital SAS clearance certificate to citizen WhatsApp.',
    decisions: [
      {
        id: 1,
        author: 'Er. R. K. Shrivastava (Zonal Head)',
        role: 'Supervisor',
        timestamp: '2026-11-07 09:30',
        decision: 'Technical Clearance Ordered',
        note: 'Requested IT directorate to run manual reconciliation script on Belagavi ward database.'
      }
    ]
  },
  {
    id: 'ESC-2024-103',
    complaintId: 'GRV-2024-8850',
    complaintToken: 'GRV-2024-8850',
    complaintTitle: 'Fluoride contamination and dried borewell supply in village school',
    department: 'Ministry of Jal Shakti (Water Supply)',
    departmentId: 'dept-2',
    escalationLevel: 2,
    levelLabel: 'Level 2: Supervisor Escalation',
    escalationReason: 'School drinking water fluoride level breached 2.4 mg/L; acute health hazard for 240 children.',
    previousOfficer: 'Er. Sandeep Kulkarni',
    previousOfficerId: 'off-1',
    currentOfficer: 'Er. Gururaj Patil (JAL-9931)',
    currentOfficerId: 'off-10',
    escalationDate: '2026-11-07 11:00',
    reviewingAuthority: 'District Health & Sanitation Ombudsman',
    currentStatus: 'ACTION_REQUIRED',
    penaltyExposure: 'Statutory Health Notice Issued',
    mandatedAction: 'Deploy emergency Jal Jeevan tanker and expedite RO membrane replacement within 12 hours.',
    decisions: [
      {
        id: 1,
        author: 'Dr. Sudha Chandran, IAS',
        role: 'Supervisor',
        timestamp: '2026-11-07 11:45',
        decision: 'Emergency Tanker Authorized',
        note: 'Two 5,000L clean drinking water tankers dispatched from Aland sub-division reservoir.'
      }
    ]
  },
  {
    id: 'ESC-2024-104',
    complaintId: 'GRV-2024-8805',
    complaintToken: 'GRV-2024-8805',
    complaintTitle: 'Hospital Oxygen Supply Substation Power Fluctuation Hazard',
    department: 'Health & Family Welfare Directorate',
    departmentId: 'dept-7',
    escalationLevel: 3,
    levelLabel: 'Level 3: Department Head Review',
    escalationReason: 'Power voltage fluctuations threatening ICU life-support ventilator systems.',
    previousOfficer: 'Dr. Anita Deshmukh',
    previousOfficerId: 'off-6',
    currentOfficer: 'Dr. Anita Deshmukh (HLT-8802)',
    currentOfficerId: 'off-6',
    escalationDate: '2026-11-05 08:15',
    reviewingAuthority: 'District Magistrate & Zonal Ombudsman',
    currentStatus: 'RESOLVED',
    penaltyExposure: 'Waived (Emergency Rapid Action Taken)',
    mandatedAction: 'Backup generator synchronisation certified by PWD electrical wing.',
    decisions: [
      {
        id: 1,
        author: 'Smt. Gayatri Devi, IAS',
        role: 'Supervisor',
        timestamp: '2026-11-06 15:00',
        decision: 'Safety Closure Sign-off',
        note: 'Inspection confirms backup 125 kVA generator running smoothly. Oxygen plant safe.'
      }
    ]
  }
];

