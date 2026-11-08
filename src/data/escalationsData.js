export const ESCALATIONS_DATA = [
  {
    id: 'ESC-301',
    token: 'GRV-2024-8839',
    title: 'Pothole crater accident hazard on NH-48 flyover descent',
    department: 'Ministry of Road Transport & Highways',
    nodalOfficer: 'V. R. Chandrashekar (PWD-3312)',
    level: 'Tier 3 (DM Desk)',
    daysOverdue: 2,
    hoursOverdue: 48,
    status: 'ACTIVE_ESCALATION',
    penaltyExposure: '₹1,500 pending',
    rootCause: 'Road Transport tender contractor sign-off delayed; lack of cold-mix bitumen bags.',
    mandatedAction: 'Immediate executive override. Summon contractor by 5:00 PM for emergency patching.',
    timeline: [
      { time: '2026-11-03 11:20', text: 'Citizen registered critical crater hazard.' },
      { time: '2026-11-05 11:21', text: 'SLA threshold 48h breached without action.' },
      { time: '2026-11-05 13:00', text: 'Autonomous Tier 2 escalation to Zonal Commissioner.' },
      { time: '2026-11-06 10:00', text: 'Statutory Show-Cause notice issued to PWD cadre under Sec 4 Sakala Act.' },
      { time: '2026-11-07 09:00', text: 'Tier 3 DM emergency escalation matrix triggered.' }
    ]
  },
  {
    id: 'ESC-302',
    token: 'GRV-2024-8818',
    title: 'Non-issuance of property tax clearance certificate and Khata extract',
    department: 'Urban Development & Municipal Corp (BBMP)',
    nodalOfficer: 'Praveen Kumar (REV-4482)',
    level: 'Tier 1 (Nodal Warning)',
    daysOverdue: 1,
    hoursOverdue: 5,
    status: 'ACTIVE_ESCALATION',
    penaltyExposure: '₹250 pending',
    rootCause: 'Zonal revenue database sync failure with state Kaveri-2 registry portal.',
    mandatedAction: 'Manual override to push digital SAS clearance certificate to citizen WhatsApp.',
    timeline: [
      { time: '2026-11-02 14:00', text: 'Citizen paid dues; registered clearance delay ticket.' },
      { time: '2026-11-07 08:00', text: 'SLA threshold 72h expired without officer validation.' },
      { time: '2026-11-07 08:05', text: 'Automated Tier 1 grace breach warning dispatched to Inspector.' }
    ]
  },
  {
    id: 'ESC-303',
    token: 'GRV-2024-8805',
    title: 'Hospital Oxygen Supply Substation Power Fluctuation Hazard',
    department: 'Health & Family Welfare Directorate',
    nodalOfficer: 'Dr. Anita Deshmukh (HLT-8802)',
    level: 'Tier 3 (DM Desk)',
    daysOverdue: 1,
    hoursOverdue: 24,
    status: 'MITIGATED_PENDING_CLOSURE',
    penaltyExposure: 'Waived (Emergency action taken)',
    rootCause: 'Grid transmission surge tripped ICU ventilator circuit breakers.',
    mandatedAction: 'District Magistrate sign-off required after safety inspector certificate upload.',
    timeline: [
      { time: '2026-11-05 08:00', text: 'Emergency ticket received via Hospital Superintendent direct hotline.' },
      { time: '2026-11-05 08:15', text: 'Immediate Tier 3 DM priority tagged.' },
      { time: '2026-11-06 14:00', text: 'Backup 125 kVA generator deployed and operational.' }
    ]
  }
];

