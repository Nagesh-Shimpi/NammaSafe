// Reminder Message Templates for ResolveTrack Intelligent Reminder Centre
// Supports English and Kannada (ಕನ್ನಡ) for all 6 required notification scenarios.

export const REMINDER_TEMPLATES = [
  {
    id: 'UPCOMING_FOLLOW_UP',
    name: 'Upcoming Follow-up',
    nameKn: 'ಮುಂಬರುವ ಅನುಸರಣೆ ಸೂಚನೆ',
    description: 'Advance reminder before the follow-up milestone',
    category: 'ADVANCE',
    defaultChannel: 'EMAIL',
    subject: 'Advance Notice: Follow-up Scheduled for Complaint #{token}',
    subjectKn: 'ಮುನ್ಸೂಚನೆ: ದೂರು #{token} ಗೆ ನಿಗದಿತ ಅನುಸರಣೆ',
    templateEn:
      'Dear {recipientName}, this is an advance reminder from ResolveTrack. Grievance #{token} regarding "{title}" has a scheduled follow-up on {scheduledDate}. Please ensure site inspection and dossier verification are on track before the SLA deadline.',
    templateKn:
      'ಆತ್ಮೀಯ {recipientName}, ಇದು ರಿಸಾಲ್ವ್‌ಟ್ರ್ಯಾಕ್‌ನಿಂದ ಮುನ್ಸೂಚನೆಯಾಗಿದೆ. "{title}" ಕುರಿತಾದ ದೂರು #{token} ಗೆ {scheduledDate} ರಂದು ಅನುಸರಣೆ ನಿಗದಿಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಗಡುವಿನೊಳಗೆ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಳಿಸಿ.'
  },
  {
    id: 'FOLLOW_UP_DUE_TODAY',
    name: 'Follow-up Due Today',
    nameKn: 'ಇಂದು ಬಾಕಿ ಇರುವ ಅನುಸರಣೆ',
    description: 'Urgent notice for actions due within current calendar day',
    category: 'DUE_TODAY',
    defaultChannel: 'WHATSAPP',
    subject: 'Urgent: Follow-up Action Due Today for Grievance #{token}',
    subjectKn: 'ತುರ್ತು: ದೂರು #{token} ಗೆ ಇಂದು ಅನುಸರಣಾ ಕ್ರಮ ಬಾಕಿಯಿದೆ',
    templateEn:
      'URGENT: Nodal Officer {recipientName}, follow-up inspection for Complaint #{token} ("{title}") is due TODAY by {scheduledTime}. Please update your field action logs in the ResolveTrack portal immediately to avoid statutory breach escalation.',
    templateKn:
      'ತುರ್ತು: ನೋಡಲ್ ಅಧಿಕಾರಿ {recipientName}, ದೂರು #{token} ("{title}") ಗಾಗಿ ಅನುಸರಣಾ ಪರಿಶೀಲನೆಯು ಇಂದು {scheduledTime} ರೊಳಗೆ ಬಾಕಿಯಿದೆ. ಶಾಸನಬದ್ಧ ಉಲ್ಲಂಘನೆಯನ್ನು ತಪ್ಪಿಸಲು ತಕ್ಷಣ ವರದಿ ನಮೂದಿಸಿ.'
  },
  {
    id: 'OVERDUE_COMPLAINT',
    name: 'Overdue Complaint Breach',
    nameKn: 'ಅವಧಿ ಮೀರಿದ ದೂರಿನ ಶಾಸನಬದ್ಧ ನೋಟಿಸ್',
    description: 'Statutory SLA breach notice under Public Services Guarantee Act',
    category: 'OVERDUE',
    defaultChannel: 'WHATSAPP',
    subject: 'Statutory Show-Cause Notice: Complaint #{token} Overdue by {daysOverdue} Days',
    subjectKn: 'ಶಾಸನಬದ್ಧ ನೋಟಿಸ್: ದೂರು #{token} {daysOverdue} ದಿನಗಳಷ್ಟು ವಿಳಂಬವಾಗಿದೆ',
    templateEn:
      'STATUTORY SHOW-CAUSE NOTICE: Grievance #{token} ("{title}") assigned to {recipientName} ({department}) has breached the statutory SLA by {daysOverdue} days. Under Section 4 of Karnataka Guarantee of Services Act, an explanation is mandated within 12 hours.',
    templateKn:
      'ಶಾಸನಬದ್ಧ ಕಾರಣ ಕೇಳಿ ನೋಟಿಸ್: {department} ನ {recipientName} ಅವರಿಗೆ ನಿಯೋಜಿಸಲಾದ ದೂರು #{token} ("{title}") {daysOverdue} ದಿನಗಳಷ್ಟು ವಿಳಂಬವಾಗಿದೆ. ಸಕಾಲ ಕಾಯ್ದೆಯಡಿ 12 ಗಂಟೆಗಳ ಒಳಗೆ ಸಮಜಾಯಿಷಿ ನೀಡುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ.'
  },
  {
    id: 'SUPERVISOR_ESCALATION',
    name: 'Supervisor Escalation Alert',
    nameKn: 'ಮೇಲ್ವಿಚಾರಕರ ಹಂತೀಕರಣ ಎಚ್ಚರಿಕೆ',
    description: 'Executive notification to Zonal Ombudsman / District Magistrate',
    category: 'ESCALATION',
    defaultChannel: 'IN_APP',
    subject: 'Executive Escalation: Grievance #{token} Escalated to Level {escalationLevel}',
    subjectKn: 'ಕಾರ್ಯನಿರ್ವಾಹಕ ಎಚ್ಚರಿಕೆ: ದೂರು #{token} ಹಂತ {escalationLevel} ಕ್ಕೆ ಏರಿಸಲಾಗಿದೆ',
    templateEn:
      'EXECUTIVE ALERT: Grievance #{token} in {department} has been escalated to Level {escalationLevel} due to: {reason}. Reviewing Authority: {reviewingAuthority}. Immediate supervisory intervention or cadre rebalancing required.',
    templateKn:
      'ಕಾರ್ಯನಿರ್ವಾಹಕ ಎಚ್ಚರಿಕೆ: {department} ನ ದೂರು #{token} ಅನ್ನು ಕಾರಣ: {reason} ನಿಂದಾಗಿ ಹಂತ {escalationLevel} ಕ್ಕೆ ಏರಿಸಲಾಗಿದೆ. ಪರಿಶೀಲನಾ ಪ್ರಾಧಿಕಾರ: {reviewingAuthority}. ತಕ್ಷಣದ ಹಸ್ತಕ್ಷೇಪ ಅಗತ್ಯವಿದೆ.'
  },
  {
    id: 'RESOLUTION_SUBMITTED',
    name: 'Resolution Submitted Notice',
    nameKn: 'ಪರಿಹಾರ ಸಲ್ಲಿಕೆ ಸೂಚನೆ',
    description: 'Notice to citizen and supervisor that work has been executed',
    category: 'RESOLUTION',
    defaultChannel: 'EMAIL',
    subject: 'Resolution Update: Action Completed for Complaint #{token}',
    subjectKn: 'ಪರಿಹಾರದ ಮಾಹಿತಿ: ದೂರು #{token} ಕ್ಕೆ ಕ್ರಮ ಕೈಗೊಳ್ಳಲಾಗಿದೆ',
    templateEn:
      'Dear {citizenName}, the nodal department ({department}) has completed corrective action for your grievance #{token} ("{title}"). Summary: "{resolutionSummary}". You may inspect the evidence on ResolveTrack.',
    templateKn:
      'ಆತ್ಮೀಯ {citizenName}, ನಿಮ್ಮ ದೂರು #{token} ("{title}") ಗೆ ಸಂಬಂಧಿಸಿದಂತೆ {department} ಇಲಾಖೆಯು ದುರಸ್ತಿ ಕಾರ್ಯವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದೆ. ಸಾರಾಂಶ: "{resolutionSummary}".'
  },
  {
    id: 'CITIZEN_FEEDBACK_REQUEST',
    name: 'Citizen Feedback & Verification',
    nameKn: 'ನಾಗರಿಕರ ಪ್ರತಿಕ್ರಿಯೆ ಮತ್ತು ದೃಢೀಕರಣ ಕೋರಿಕೆ',
    description: 'CSAT verification loop sent to citizen after grievance closure',
    category: 'FEEDBACK',
    defaultChannel: 'WHATSAPP',
    subject: 'Feedback Request: Rate Resolution Quality for Complaint #{token}',
    subjectKn: 'ಪ್ರತಿಕ್ರಿಯೆ ಕೋರಿಕೆ: ದೂರು #{token} ನ ಪರಿಹಾರ ಗುಣಮಟ್ಟವನ್ನು ರೇಟ್ ಮಾಡಿ',
    templateEn:
      'Hello {citizenName}, your grievance #{token} has been marked resolved by {officerName}. Please confirm your satisfaction on ResolveTrack or reply with CSAT rating (1 to 5 stars). If unsatisfied, you may reopen with one click.',
    templateKn:
      'ನಮಸ್ಕಾರ {citizenName}, ನಿಮ್ಮ ದೂರು #{token} ಅನ್ನು {officerName} ರವರು ಪರಿಹರಿಸಿದ್ದಾರೆ ಎಂದು ದಾಖಲಿಸಿದ್ದಾರೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ತೃಪ್ತಿಯನ್ನು ದೃಢೀಕರಿಸಿ ಅಥವಾ 1 ರಿಂದ 5 ನಕ್ಷತ್ರಗಳ ರೇಟಿಂಗ್ ನೀಡಿ. ಅತೃಪ್ತರಾಗಿದ್ದರೆ ಮರುತೆರೆಯಬಹುದು.'
  }
];

export const interpolateTemplate = (template, variables = {}) => {
  if (!template) return '';
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return variables[key] !== undefined ? variables[key] : `{${key}}`;
  });
};

