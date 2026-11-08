import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    appTitle: 'ResolveTrack',
    appSubtitle: 'GovOps AI Platform',
    portalName: 'Central Redressal Portal v2.4',
    liveSync: 'Live Sync',
    slaHotline: 'SLA Hotline',
    nationalPortal: 'National Portal · Min. Public Administration',

    // Nav
    navOverview: 'Overview',
    navAllComplaints: 'All Complaints',
    navPending: 'Pending Complaints',
    navOverdue: 'Overdue Complaints',
    navEscalations: 'Escalations',
    navDepartments: 'Departments',
    navOfficers: 'Officers',
    navReminderCentre: 'Reminder Centre',
    navAnalytics: 'Analytics',
    navSettings: 'Settings',

    // Citizen Nav
    navHome: 'Citizen Home',
    navRegister: 'File Grievance',
    navTrack: 'Track Status',
    switchRole: 'Switch Role',

    // Actions & Buttons
    exportReport: 'Export SLA Audit Report',
    registerGrievance: 'Register Citizen Grievance',
    reviewAutoAssigned: 'Review Auto-Assigned',
    triggerReminders: 'Trigger Bulk Reminders',
    searchPlaceholder: 'Search complaints by token ID, citizen name, or keyword (⌘K)...',
    filterTokenId: 'Filter token ID...',
    allStatuses: 'All Statuses',
    filter: 'Filter',
    assign: 'Assign',
    escalate: 'Escalate',
    details: 'Details',
    viewAllDepartments: 'View All 24 Departments Redressal Index',
    nextBestAction: 'Next Best Action',
    healthScore: 'Health Score',

    // KPI labels
    totalComplaints: 'Total Complaints',
    newComplaints: 'New Complaints',
    inProgress: 'In Progress',
    pendingReview: 'Pending Review',
    overdueTickets: 'Overdue Tickets',
    resolvedTotal: 'Resolved Total',
    slaCompliance: 'National SLA Compliance',
    firstContactResolution: 'First Contact Resolution',
    escalationRate: 'Escalation Rate',
    reopenRate: 'Citizen Re-open Rate',

    // Form labels
    fullName: 'Full Name',
    phoneNumber: 'Mobile Number',
    idNumber: 'Aadhaar / Citizen ID',
    district: 'District',
    talukWard: 'Taluk / Ward',
    department: 'Department',
    grievanceTitle: 'Grievance Subject',
    grievanceDescription: 'Detailed Description',
    priority: 'Priority Level',
    submitGrievance: 'Submit Grievance',
    attachProof: 'Attach Photos / Documents',
    voiceNote: 'Record Voice Note (Optional)',
    grievanceRegistered: 'Grievance Successfully Registered!',
    trackingTokenAssigned: 'Your Unique Tracking Token ID is:',
    saveTokenNotice: 'Please save this Token ID to check real-time status and receive SMS/WhatsApp updates.'
  },
  kn: {
    appTitle: 'ರಿಸಾಲ್ವ್‌ಟ್ರ್ಯಾಕ್',
    appSubtitle: 'ಸರ್ಕಾರಿ ಕಲ್ಯಾಣ ಕಾರ್ಯಾಚರಣೆ ವೇದಿಕೆ',
    portalName: 'ಕೇಂದ್ರ ಕುಂದುಕೊರತೆ ನಿವಾರಣಾ ಪೋರ್ಟಲ್ v2.4',
    liveSync: 'ಲೈವ್ ಸಿಂಕ್',
    slaHotline: 'ಎಸ್‌ಎಲ್‌ಎ ಸಹಾಯವಾಣಿ',
    nationalPortal: 'ರಾಜ್ಯ ಮತ್ತು ರಾಷ್ಟ್ರೀಯ ಪೋರ್ಟಲ್ · ಸಾರ್ವಜನಿಕ ಆಡಳಿತ',

    // Nav
    navOverview: 'ಅವಲೋಕನ',
    navAllComplaints: 'ಎಲ್ಲಾ ದೂರುಗಳು',
    navPending: 'ಬಾಕಿ ದೂರುಗಳು',
    navOverdue: 'ಅವಧಿ ಮೀರಿದ ದೂರುಗಳು',
    navEscalations: 'ಮೇಲ್ಮನವಿಗಳು / ಹೆಚ್ಚಳಗಳು',
    navDepartments: 'ಇಲಾಖೆಗಳು',
    navOfficers: 'ಅಧಿಕಾರಿಗಳು',
    navReminderCentre: 'ಸ್ಮರಣೆ ಕೇಂದ್ರ',
    navAnalytics: 'ವಿಶ್ಲೇಷಣೆ',
    navSettings: 'ಸೆಟ್ಟಿಂಗ್ಸ್',

    // Citizen Nav
    navHome: 'ಮುಖ್ಯಪುಟ',
    navRegister: 'ದೂರು ದಾಖಲಿಸಿ',
    navTrack: 'ದೂರಿನ ಸ್ಥಿತಿ ತಿಳಿಯಿರಿ',
    switchRole: 'ಪಾತ್ರ ಬದಲಾಯಿಸಿ',

    // Actions & Buttons
    exportReport: 'ವರದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    registerGrievance: 'ಹೊಸ ದೂರು ನೋಂದಾಯಿಸಿ',
    reviewAutoAssigned: 'ನಿಯೋಜಿತ ದೂರುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
    triggerReminders: 'ಸ್ಮರಣೆ ಸಂದೇಶ ಕಳುಹಿಸಿ',
    searchPlaceholder: 'ಟೋಕನ್ ಐಡಿ, ಹೆಸರು ಅಥವಾ ಕೀವರ್ಡ್ ಮೂಲಕ ಹುಡುಕಿ (⌘K)...',
    filterTokenId: 'ಟೋಕನ್ ಐಡಿ ಫಿಲ್ಟರ್...',
    allStatuses: 'ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು',
    filter: 'ಫಿಲ್ಟರ್',
    assign: 'ನಿಯೋಜಿಸಿ',
    escalate: 'ಮೇಲ್ಮಟ್ಟಕ್ಕೆ ಕಳುಹಿಸಿ',
    details: 'ವಿವರಗಳು',
    viewAllDepartments: 'ಎಲ್ಲಾ 24 ಇಲಾಖೆಗಳ ಸೂಚ್ಯಂಕ ವೀಕ್ಷಿಸಿ',
    nextBestAction: 'ಮುಂದಿನ ಶಿಫಾರಸು ಕ್ರಮ',
    healthScore: 'ದೂರಿನ ಆರೋಗ್ಯ ಅಂಕ',

    // KPI labels
    totalComplaints: 'ಒಟ್ಟು ದೂರುಗಳು',
    newComplaints: 'ಹೊಸ ದೂರುಗಳು',
    inProgress: 'ಪ್ರಗತಿಯಲ್ಲಿರುವ ದೂರುಗಳು',
    pendingReview: 'ಪರಿಶೀಲನೆಯಲ್ಲಿರುವ ದೂರುಗಳು',
    overdueTickets: 'ಅವಧಿ ಮೀರಿದ ದೂರುಗಳು',
    resolvedTotal: 'ಪರಿಹಾರಗೊಂಡ ದೂರುಗಳು',
    slaCompliance: 'ಎಸ್‌ಎಲ್‌ಎ ಅನುಸರಣೆ ದರ',
    firstContactResolution: 'ಮೊದಲ ಸಂಪರ್ಕ ಪರಿಹಾರ',
    escalationRate: 'ಮೇಲ್ಮನವಿ ದರ',
    reopenRate: 'ಮರುತೆರೆಯುವಿಕೆ ದರ',

    // Form labels
    fullName: 'ಪೂರ್ಣ ಹೆಸರು',
    phoneNumber: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    idNumber: 'ಆಧಾರ್ / ನಾಗರಿಕ ಗುರುತಿನ ಸಂಖ್ಯೆ',
    district: 'ಜಿಲ್ಲೆ',
    talukWard: 'ತಾಲೂಕು / ವಾರ್ಡ್',
    department: 'ಇಲಾಖೆ',
    grievanceTitle: 'ದೂರಿನ ವಿಷಯ',
    grievanceDescription: 'ವಿವರವಾದ ವಿವರಣೆ',
    priority: 'ಆದ್ಯತೆ ಮಟ್ಟ',
    submitGrievance: 'ದೂರು ಸಲ್ಲಿಸಿ',
    attachProof: 'ಫೋಟೋಗಳು / ದಾಖಲೆಗಳನ್ನು ಲಗತ್ತಿಸಿ',
    voiceNote: 'ಧ್ವನಿ ಟಿಪ್ಪಣಿ ರೆಕಾರ್ಡ್ ಮಾಡಿ (ಐಚ್ಛಿಕ)',
    grievanceRegistered: 'ದೂರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ!',
    trackingTokenAssigned: 'ನಿಮ್ಮ ಅನನ್ಯ ಟ್ರ್ಯಾಕಿಂಗ್ ಟೋಕನ್ ಐಡಿ:',
    saveTokenNotice: 'ನೈಜ-ಸಮಯದ ಸ್ಥಿತಿಯನ್ನು ತಿಳಿಯಲು ಮತ್ತು ಎಸ್‌ಎಂಎಸ್ ನವೀಕರಣಗಳನ್ನು ಪಡೆಯಲು ದಯವಿಟ್ಟು ಈ ಟೋಕನ್ ಐಡಿಯನ್ನು ಉಳಿಸಿಕೊಳ್ಳಿ.'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('resolvetrack_lang') || 'en';
  });

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'kn' : 'en';
    setLang(nextLang);
    localStorage.setItem('resolvetrack_lang', nextLang);
  };

  const setSpecificLanguage = (l) => {
    setLang(l);
    localStorage.setItem('resolvetrack_lang', l);
  };

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, setSpecificLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

