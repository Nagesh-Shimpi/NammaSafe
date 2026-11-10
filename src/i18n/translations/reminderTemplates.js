// Bilingual Reminder & Communication Templates (Section 7)
export const REMINDER_TEMPLATES = {
  UPCOMING_FOLLOW_UP: {
    key: 'UPCOMING_FOLLOW_UP',
    labelEn: 'Upcoming Follow-up',
    labelKn: 'ಮುಂಬರುವ ಅನುಸರಣೆ',
    en: 'Your complaint {{trackingId}} has an upcoming follow-up deadline on {{date}}. Please ensure necessary field inspections are on schedule.',
    kn: 'ನಿಮ್ಮ ದೂರು {{trackingId}} ಗೆ {{date}} ರಂದು ಮುಂದಿನ ಅನುಸರಣೆ ಗಡುವು ಇದೆ. ದಯವಿಟ್ಟು ಅಗತ್ಯ ಸ್ಥಳ ಪರಿಶೀಲನೆ ನಿಗದಿತ ಸಮಯದಲ್ಲಾಗುವುದನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.'
  },
  DUE_TODAY: {
    key: 'DUE_TODAY',
    labelEn: 'Follow-up Due Today',
    labelKn: 'ಇಂದು ಬಾಕಿ ಇರುವ ಅನುಸರಣೆ',
    en: 'URGENT: Inspection and action logging for complaint {{trackingId}} is due TODAY ({{date}}). Please submit progress report to avoid statutory penalty.',
    kn: 'ತುರ್ತು: ದೂರು {{trackingId}} ಪರಿಶೀಲನೆ ಮತ್ತು ಕ್ರಮ ದಾಖಲಾತಿ ಇಂದೇ ({{date}}) ಪೂರ್ಣಗೊಳ್ಳಬೇಕಿದೆ. ದಂಡ ತಪ್ಪಿಸಲು ದಯವಿಟ್ಟು ಪ್ರಗತಿ ವರದಿ ಸಲ್ಲಿಸಿ.'
  },
  OVERDUE_COMPLAINT: {
    key: 'OVERDUE_COMPLAINT',
    labelEn: 'Overdue Complaint Breach',
    labelKn: 'ಗಡುವು ಮೀರಿದ ದೂರಿನ ಎಚ್ಚರಿಕೆ',
    en: 'CRITICAL: Grievance {{trackingId}} is overdue by {{days}} days. Immediate redressal is mandated under Karnataka Sakala Services Guarantee Act.',
    kn: 'ಗಂಭೀರ: ದೂರು {{trackingId}} ಪರಿಹಾರದ ಗಡುವು {{days}} ದಿನಗಳಷ್ಟು ಮೀರಿದೆ. ಕರ್ನಾಟಕ ಸಕಾಲ ಕಾಯ್ದೆಯನ್ವಯ ತಕ್ಷಣವೇ ಸೂಕ್ತ ಕ್ರಮ ಕೈಗೊಳ್ಳುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ.'
  },
  SUPERVISOR_ESCALATION: {
    key: 'SUPERVISOR_ESCALATION',
    labelEn: 'Supervisor Escalation Notice',
    labelKn: 'ಮೇಲ್ವಿಚಾರಕರ ಪರಿಶೀಲನೆಗೆ ವರ್ಗಾವಣೆ',
    en: 'ESCALATION ALERT: Complaint {{trackingId}} has been escalated to Level {{level}} (Supervisory Authority: {{supervisor}}). Hearing schedule is pending.',
    kn: 'ಮೇಲ್ಮನವಿ ಎಚ್ಚರಿಕೆ: ದೂರು {{trackingId}} ಅನ್ನು ಹಂತ {{level}} ಕ್ಕೆ ಮೇಲ್ವಿಚಾರಕರ ಪರಿಶೀಲನೆಗೆ (ಅಧಿಕಾರಿ: {{supervisor}}) ವರ್ಗಾಯಿಸಲಾಗಿದೆ.'
  },
  RESOLUTION_SUBMITTED: {
    key: 'RESOLUTION_SUBMITTED',
    labelEn: 'Resolution Submitted',
    labelKn: 'ಪರಿಹಾರ ವರದಿ ಸಲ್ಲಿಸಲಾಗಿದೆ',
    en: 'Resolution evidence for grievance {{trackingId}} has been submitted by {{officerName}} ({{department}}). Please verify within 7 days.',
    kn: 'ದೂರು {{trackingId}} ಗೆ {{officerName}} ({{department}}) ಪರಿಹಾರ ವರದಿ ಮತ್ತು ಪುರಾವೆ ಸಲ್ಲಿಸಿದ್ದಾರೆ. ದಯವಿಟ್ಟು 7 ದಿನಗಳೊಳಗೆ ಪರಿಶೀಲಿಸಿ.'
  },
  FEEDBACK_REQUEST: {
    key: 'FEEDBACK_REQUEST',
    labelEn: 'Citizen Feedback Request',
    labelKn: 'ನಾಗರಿಕ ಪ್ರತಿಕ್ರಿಯೆ ವಿನಂತಿ',
    en: 'Dear Citizen, your complaint {{trackingId}} is marked resolved. Please rate your experience and confirm physical rectification on the portal.',
    kn: 'ಆತ್ಮೀಯ ನಾಗರಿಕರೇ, ನಿಮ್ಮ ದೂರು {{trackingId}} ಪರಿಹರಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಅನುಭವವನ್ನು ರೇಟ್ ಮಾಡಿ ಮತ್ತು ಸ್ಥಳೀಯ ಪರಿಹಾರವನ್ನು ದೃಢೀಕರಿಸಿ.'
  }
};

/**
 * Format template string with dynamic values
 */
export function formatTemplate(templateStr, values = {}) {
  if (!templateStr) return '';
  return Object.keys(values).reduce((acc, key) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    return acc.replace(regex, values[key] ?? '');
  }, templateStr);
}
