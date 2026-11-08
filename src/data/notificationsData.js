export const NOTIFICATIONS_DATA = [
  {
    id: 'NOTIF-01',
    token: 'GRV-2024-8839',
    type: 'CRITICAL_BREACH',
    title: 'Tier-3 Escalation Triggered',
    message: 'NH-48 Pothole Crater breached 48h SLA. DM hearing notice signed.',
    time: '12 mins ago',
    unread: true,
    severity: 'error',
    actionRoute: '/supervisor/escalations?token=GRV-2024-8839'
  },
  {
    id: 'NOTIF-02',
    token: 'GRV-2024-8818',
    type: 'WARNING',
    title: 'SLA Grace Period Expired',
    message: 'Property tax clearance ticket breached 72h window in Belagavi Ward 8.',
    time: '45 mins ago',
    unread: true,
    severity: 'warning',
    actionRoute: '/officer/complaints/GRV-2024-8818'
  },
  {
    id: 'NOTIF-03',
    token: 'GRV-2024-8841',
    type: 'STATUS_UPDATE',
    title: 'Field Team Dispatched',
    message: 'Er. Sandeep Kulkarni initiated storm drain water line inspection at Ward 14.',
    time: '2 hours ago',
    unread: false,
    severity: 'info',
    actionRoute: '/officer/complaints/GRV-2024-8841'
  },
  {
    id: 'NOTIF-04',
    token: 'GRV-2024-8805',
    type: 'RESOLUTION_VERIFIED',
    title: 'Citizen Verified Resolution',
    message: 'ICU Oxygen power stabilized. 5-Star CSAT feedback submitted by Hospital Admin.',
    time: '3 hours ago',
    unread: false,
    severity: 'success',
    actionRoute: '/citizen/track?token=GRV-2024-8805'
  }
];

