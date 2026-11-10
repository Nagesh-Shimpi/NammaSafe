import React, { useState, useMemo } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Modal } from '../../components/common/Modal';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { REMINDER_TEMPLATES, interpolateTemplate } from '../../data/reminderTemplates';
import { USER_ROLES } from '../../utils/constants';

export const ReminderCentre = () => {
  const {
    reminders = [],
    complaints = [],
    departments = [],
    createManualReminder,
    retryFailedReminder,
    runAutomatedReminderEngine
  } = useComplaints();

  const { currentUser, currentRole, switchRole, USER_ROLES } = useAuth();
  const { lang, t, tDepartment, tChannel } = useLanguage();

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('ALL');
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [sortField, setSortField] = useState('date'); // 'date' | 'priority' | 'status'
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Active View Tab: 'REGISTER' | 'RULES' | 'AUDIT'
  const [activeTab, setActiveTab] = useState('REGISTER');

  // Selected Reminder for Detail Drawer
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  // Manual Creation Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formComplaintToken, setFormComplaintToken] = useState('');
  const [formType, setFormType] = useState('UPCOMING_FOLLOW_UP');
  const [formChannel, setFormChannel] = useState('WHATSAPP');
  const [formRecipient, setFormRecipient] = useState('');
  const [formRecipientRole, setFormRecipientRole] = useState('Department Officer');
  const [formPriority, setFormPriority] = useState('NORMAL');
  const [formScheduledDate, setFormScheduledDate] = useState('');
  const [formTemplateLang, setFormTemplateLang] = useState('en'); // 'en' | 'kn'
  const [formMessage, setFormMessage] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Auto-Rule Settings State
  const [advanceHours, setAdvanceHours] = useState(24);
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);

  // UI Toast notification
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');
  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Channel Icon and Color Helpers
  const getChannelConfig = (channel) => {
    switch (channel) {
      case 'WHATSAPP':
        return { label: 'WhatsApp', icon: 'chat', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'IN_APP':
        return { label: 'In-App', icon: 'notifications', color: 'text-teal-700 bg-teal-50 border-teal-200' };
      case 'EMAIL':
        return { label: 'Email', icon: 'mail', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'IVR':
        return { label: 'IVR Call', icon: 'phone_in_talk', color: 'text-purple-700 bg-purple-50 border-purple-200' };
      default:
        return { label: channel, icon: 'send', color: 'text-slate-700 bg-slate-50 border-slate-200' };
    }
  };

  // Status Badge Helper
  const getStatusConfig = (status) => {
    switch (status) {
      case 'DELIVERED':
        return { label: 'Delivered', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold', icon: 'done_all' };
      case 'SCHEDULED':
        return { label: 'Scheduled', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 font-bold', icon: 'schedule' };
      case 'QUEUED':
        return { label: 'Queued', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse', icon: 'hourglass_top' };
      case 'FAILED':
        return { label: 'Failed', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold', icon: 'error' };
      default:
        return { label: status, badgeClass: 'bg-slate-100 text-slate-700', icon: 'info' };
    }
  };

  // Filtered Reminders
  const filteredReminders = useMemo(() => {
    return reminders.filter((rem) => {
      // Role filtering: Department Officer only sees reminders relevant to their department/officer
      if (currentRole === USER_ROLES.OFFICER) {
        const isAssigned =
          rem.assignedOfficer === currentUser?.name ||
          rem.recipientName === currentUser?.name ||
          (rem.department && currentUser?.department && rem.department.includes(currentUser.department));
        if (!isAssigned) return false;
      }

      // Department filter
      if (selectedDeptId !== 'ALL' && rem.departmentId !== selectedDeptId) {
        return false;
      }

      // Channel filter
      if (selectedChannel !== 'ALL' && rem.channel !== selectedChannel) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && rem.status !== selectedStatus) {
        return false;
      }

      // Type filter
      if (selectedType !== 'ALL' && rem.type !== selectedType) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = (rem.id || '').toLowerCase().includes(q);
        const matchesToken = (rem.complaintToken || '').toLowerCase().includes(q);
        const matchesTitle = (rem.complaintTitle || '').toLowerCase().includes(q);
        const matchesRecipient = (rem.recipientName || '').toLowerCase().includes(q);
        const matchesOfficer = (rem.assignedOfficer || '').toLowerCase().includes(q);
        if (!matchesId && !matchesToken && !matchesTitle && !matchesRecipient && !matchesOfficer) {
          return false;
        }
      }

      return true;
    });
  }, [reminders, selectedDeptId, selectedChannel, selectedStatus, selectedType, searchQuery, currentRole, currentUser]);

  // Sort Reminders
  const sortedReminders = useMemo(() => {
    return [...filteredReminders].sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.scheduledDate || a.createdDate || 0).getTime();
        const dateB = new Date(b.scheduledDate || b.createdDate || 0).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
      if (sortField === 'priority') {
        const pMap = { CRITICAL: 3, HIGH: 2, NORMAL: 1 };
        return sortOrder === 'desc' ? (pMap[b.priority] || 0) - (pMap[a.priority] || 0) : (pMap[a.priority] || 0) - (pMap[b.priority] || 0);
      }
      if (sortField === 'status') {
        return sortOrder === 'desc' ? b.status.localeCompare(a.status) : a.status.localeCompare(b.status);
      }
      return 0;
    });
  }, [filteredReminders, sortField, sortOrder]);

  // Paginated Reminders
  const totalPages = Math.ceil(sortedReminders.length / pageSize) || 1;
  const paginatedReminders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedReminders.slice(start, start + pageSize);
  }, [sortedReminders, currentPage, pageSize]);

  // 6 Summary Dashboard Metrics
  const summaryMetrics = useMemo(() => {
    const total = reminders.length;
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);

    const dueToday = reminders.filter(
      (r) => r.type === 'FOLLOW_UP_DUE_TODAY' || (r.scheduledDate || '').startsWith(todayStr)
    ).length;

    const upcoming = reminders.filter(
      (r) => r.status === 'SCHEDULED' || r.type === 'UPCOMING_FOLLOW_UP'
    ).length;

    const sent = reminders.filter((r) => r.status === 'DELIVERED').length;
    const failed = reminders.filter((r) => r.status === 'FAILED').length;

    const pendingFollowUps = complaints.filter(
      (c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (c.nextFollowUpDate || c.dueDate)
    ).length;

    return {
      total,
      dueToday,
      upcoming,
      sent,
      failed,
      pendingFollowUps
    };
  }, [reminders, complaints]);

  // Handle Opening Manual Reminder Modal
  const handleOpenCreateModal = () => {
    const defaultComplaint = complaints.find(c => c.status !== 'RESOLVED') || complaints[0];
    const initialToken = defaultComplaint ? defaultComplaint.token : '';

    setFormComplaintToken(initialToken);
    setFormType('UPCOMING_FOLLOW_UP');
    setFormChannel('WHATSAPP');
    setFormRecipient(defaultComplaint?.assignedOfficer?.name || '');
    setFormRecipientRole('Department Officer');
    setFormPriority('NORMAL');

    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().substring(0, 16);
    setFormScheduledDate(tomorrow);
    setFormNotes('');

    // Prepopulate template
    const template = REMINDER_TEMPLATES[0];
    const interpolated = interpolateTemplate(template.templateEn, {
      recipientName: defaultComplaint?.assignedOfficer?.name || 'Officer',
      token: initialToken,
      title: defaultComplaint?.title || 'Grievance',
      scheduledDate: tomorrow.split('T')[0]
    });
    setFormMessage(interpolated);
    setIsCreateModalOpen(true);
  };

  // On Changing Complaint in Modal Form
  const handleComplaintChange = (token) => {
    setFormComplaintToken(token);
    const matched = complaints.find(c => c.token === token);
    if (matched) {
      setFormRecipient(matched.assignedOfficer?.name || '');
      updateTemplateMessage(formType, token, matched, formTemplateLang);
    }
  };

  // On Changing Reminder Type in Modal Form
  const handleTypeChange = (type) => {
    setFormType(type);
    const matched = complaints.find(c => c.token === formComplaintToken);
    const foundTemplate = REMINDER_TEMPLATES.find(t => t.id === type);
    if (foundTemplate) {
      setFormChannel(foundTemplate.defaultChannel);
    }
    updateTemplateMessage(type, formComplaintToken, matched, formTemplateLang);
  };

  // Helper to re-interpolate message text
  const updateTemplateMessage = (type, token, matchedComplaint, language) => {
    const template = REMINDER_TEMPLATES.find(t => t.id === type) || REMINDER_TEMPLATES[0];
    const rawText = language === 'kn' ? template.templateKn : template.templateEn;
    const interpolated = interpolateTemplate(rawText, {
      recipientName: formRecipient || matchedComplaint?.assignedOfficer?.name || 'Officer',
      citizenName: matchedComplaint?.citizenName || 'Citizen',
      officerName: matchedComplaint?.assignedOfficer?.name || 'Nodal Officer',
      token: token || 'GRV-2024-XXXX',
      title: matchedComplaint?.title || 'Public Grievance',
      department: matchedComplaint?.departmentName || 'General Administration',
      daysOverdue: matchedComplaint?.daysOverdue || 2,
      escalationLevel: matchedComplaint?.escalationLevel || 2,
      scheduledDate: formScheduledDate.split('T')[0] || 'tomorrow',
      scheduledTime: '18:00',
      reason: 'SLA Grace Period Expired',
      reviewingAuthority: 'Zonal Ombudsman',
      resolutionSummary: 'Field repairs completed'
    });
    setFormMessage(interpolated);
  };

  // Submit Manual Reminder
  const handleSubmitCreateReminder = (e) => {
    e.preventDefault();
    if (currentRole !== USER_ROLES.ADMIN && currentRole !== USER_ROLES.SUPERVISOR) {
      showToast('Unauthorized action blocked: Only Administrators or Supervisors can create statutory reminders.', 'warning');
      return;
    }
    if (!formComplaintToken) return;

    const templateObj = REMINDER_TEMPLATES.find(t => t.id === formType);
    const res = createManualReminder({
      complaintToken: formComplaintToken,
      type: formType,
      typeLabel: templateObj?.name || formType,
      channel: formChannel,
      recipientName: formRecipient,
      recipientRole: formRecipientRole,
      priority: formPriority,
      scheduledDate: formScheduledDate.replace('T', ' '),
      subject: templateObj?.subject ? interpolateTemplate(templateObj.subject, { token: formComplaintToken }) : `Notice for #${formComplaintToken}`,
      message: formMessage,
      messageKn: formTemplateLang === 'kn' ? formMessage : '',
      notes: formNotes
    });

    if (res.duplicate) {
      showToast(res.message, 'warning');
    } else if (res.success) {
      showToast(`Demonstration reminder created and scheduled for #${formComplaintToken} via ${formChannel}.`);
      setIsCreateModalOpen(false);
    } else {
      showToast(res.message || 'Error creating reminder', 'warning');
    }
  };

  // Trigger Automated Reminder Engine Simulation
  const handleTriggerAutomatedEngine = () => {
    if (currentRole !== USER_ROLES.ADMIN && currentRole !== USER_ROLES.SUPERVISOR) {
      showToast('Unauthorized action blocked: Only Administrators or Supervisors can run the automated reminder engine.', 'warning');
      return;
    }
    const res = runAutomatedReminderEngine({ advanceHours });
    if (res.success) {
      showToast(res.message);
    }
  };

  // Retry Failed Reminder Action
  const handleRetryFailed = (reminderId, e) => {
    if (e) e.stopPropagation();
    if (currentRole !== USER_ROLES.ADMIN && currentRole !== USER_ROLES.SUPERVISOR) {
      showToast('Unauthorized action blocked: Only Administrators or Supervisors can retry failed dispatches.', 'warning');
      return;
    }
    retryFailedReminder(reminderId);
    showToast(`Reminder ${reminderId} retried via simulated fallback gateway. Status updated to Delivered.`);
    if (isDetailDrawerOpen && selectedReminder?.id === reminderId) {
      setSelectedReminder(prev => ({ ...prev, status: 'DELIVERED', failureReason: null }));
    }
  };

  // Inspect Reminder Detail Drawer
  const handleOpenDetail = (reminder) => {
    setSelectedReminder(reminder);
    setIsDetailDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl border text-white text-xs sm:text-sm font-semibold flex items-center gap-3 animate-bounce ${
            toastType === 'warning' ? 'bg-amber-900 border-amber-700' : 'bg-slate-900 border-slate-700'
          }`}
        >
          <span className="material-symbols-outlined text-teal-400">
            {toastType === 'warning' ? 'warning' : 'task_alt'}
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Command Strip */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <Breadcrumb
          items={[
            { label: t('navOverview'), to: '/admin/overview' },
            { label: t('supervisorReview') },
            { label: t('reminderCentreTitle') },
          ]}
        />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-2">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">outgoing_mail</span>
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-headline text-2xl font-bold text-slate-900 tracking-tight">
                  {t('reminderCentreTitle')}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase bg-teal-100 text-teal-800 border border-teal-300">
                  {lang === 'kn' ? 'ಸ್ವಯಂಚಾಲಿತ ಎಂಜಿನ್ ಸಕ್ರಿಯ' : 'Autonomous Engine Active'}
                </span>
              </div>
              <p className="font-body text-xs sm:text-sm text-slate-500 mt-0.5">
                {t('reminderCentreSubtitle')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Session Role Switcher */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs flex items-center gap-2">
              <span className="text-slate-500 font-medium">{t('activeRole')}:</span>
              <select
                value={currentRole}
                onChange={(e) => switchRole(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value={USER_ROLES.ADMIN}>{lang === 'kn' ? 'ಆಡಳಿತಾಧಿಕಾರಿ' : 'Administrator'}</option>
                <option value={USER_ROLES.SUPERVISOR}>{lang === 'kn' ? 'ಮೇಲ್ವಿಚಾರಕರು' : 'Supervisor'}</option>
                <option value={USER_ROLES.OFFICER}>{lang === 'kn' ? 'ಇಲಾಖಾ ಅಧಿಕಾರಿ' : 'Department Officer'}</option>
              </select>
            </div>

            {/* Run Automated Engine Button */}
            <button
              onClick={handleTriggerAutomatedEngine}
              title={lang === 'kn' ? 'ಸಕ್ರಿಯ ದೂರುಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಮತ್ತು ಜ್ಞಾಪನೆಗಳನ್ನು ರಚಿಸಿ' : 'Scan active grievances and generate due-today/overdue reminders without duplicates'}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-sm text-teal-600">bolt</span>
              <span>{t('runAutoEngine')}</span>
            </button>

            {/* Create Manual Reminder Button */}
            {(currentRole === USER_ROLES.ADMIN || currentRole === USER_ROLES.SUPERVISOR) && (
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-sm">add_alert</span>
                <span>{t('createManualReminder')}</span>
              </button>
            )}
          </div>
        </div>

        {/* 6 Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          {/* 1. Total Reminders */}
          <div
            onClick={() => { setSelectedStatus('ALL'); setSelectedType('ALL'); }}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedStatus === 'ALL' && selectedType === 'ALL'
                ? 'border-slate-800 bg-slate-50 ring-2 ring-slate-800/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-center text-slate-500 mb-1 text-xs font-bold uppercase">
              <span>{t('totalReminders')}</span>
              <span className="material-symbols-outlined text-slate-600 text-base">notifications</span>
            </div>
            <div className="font-headline text-2xl font-bold text-slate-900">
              {summaryMetrics.total}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {lang === 'kn' ? 'ದಾಖಲಾದ ನೋಟಿಸ್‌ಗಳು' : 'Logged notices'}
            </div>
          </div>

          {/* 2. Reminders Due Today */}
          <div
            onClick={() => { setSelectedType('FOLLOW_UP_DUE_TODAY'); }}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedType === 'FOLLOW_UP_DUE_TODAY'
                ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20'
                : 'border-amber-200 bg-amber-50/40 hover:border-amber-300'
            }`}
          >
            <div className="flex justify-between items-center text-amber-800 mb-1 text-xs font-bold uppercase">
              <span>{t('remindersDueToday')}</span>
              <span className="material-symbols-outlined text-amber-600 text-base">schedule</span>
            </div>
            <div className="font-headline text-2xl font-bold text-amber-900">
              {summaryMetrics.dueToday}
            </div>
            <div className="text-[10px] text-amber-700 mt-1 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              <span>{lang === 'kn' ? 'ಇಂದು ಬಾಕಿಯಿದೆ' : 'Action due today'}</span>
            </div>
          </div>

          {/* 3. Upcoming Reminders */}
          <div
            onClick={() => { setSelectedType('UPCOMING_FOLLOW_UP'); }}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedType === 'UPCOMING_FOLLOW_UP'
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                : 'border-blue-200 bg-blue-50/40 hover:border-blue-300'
            }`}
          >
            <div className="flex justify-between items-center text-blue-800 mb-1 text-xs font-bold uppercase">
              <span>{t('upcomingReminders')}</span>
              <span className="material-symbols-outlined text-blue-600 text-base">hourglass_top</span>
            </div>
            <div className="font-headline text-2xl font-bold text-blue-900">
              {summaryMetrics.upcoming}
            </div>
            <div className="text-[10px] text-blue-700 mt-1 font-semibold">
              {lang === 'kn' ? '<48 ಗಂಟೆ ಅವಧಿ' : '<48h window'}
            </div>
          </div>

          {/* 4. Sent / Delivered Reminders */}
          <div
            onClick={() => { setSelectedStatus('DELIVERED'); }}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedStatus === 'DELIVERED'
                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                : 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-300'
            }`}
          >
            <div className="flex justify-between items-center text-emerald-800 mb-1 text-xs font-bold uppercase">
              <span>{t('sentReminders')}</span>
              <span className="material-symbols-outlined text-emerald-600 text-base">done_all</span>
            </div>
            <div className="font-headline text-2xl font-bold text-emerald-900">
              {summaryMetrics.sent}
            </div>
            <div className="text-[10px] text-emerald-700 mt-1 font-semibold">
              {lang === 'kn' ? 'ರವಾನೆ ದೃಢಪಟ್ಟಿದೆ' : 'Simulated receipt'}
            </div>
          </div>

          {/* 5. Failed Reminders */}
          <div
            onClick={() => { setSelectedStatus('FAILED'); }}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedStatus === 'FAILED'
                ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-500/20'
                : 'border-rose-200 bg-rose-50/40 hover:border-rose-300'
            }`}
          >
            <div className="flex justify-between items-center text-rose-800 mb-1 text-xs font-bold uppercase">
              <span>{t('failedReminders')}</span>
              <span className="material-symbols-outlined text-rose-600 text-base">error</span>
            </div>
            <div className="font-headline text-2xl font-bold text-rose-700">
              {summaryMetrics.failed}
            </div>
            <div className="text-[10px] text-rose-600 mt-1 font-semibold">
              {lang === 'kn' ? 'ಮರುಪ್ರಯತ್ನದ ಅಗತ್ಯವಿದೆ' : 'Requires fallback retry'}
            </div>
          </div>

          {/* 6. Pending Follow-ups */}
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 shadow-sm">
            <div className="flex justify-between items-center text-purple-800 mb-1 text-xs font-bold uppercase">
              <span>{t('pendingFollowUps')}</span>
              <span className="material-symbols-outlined text-purple-600 text-base">assignment</span>
            </div>
            <div className="font-headline text-2xl font-bold text-purple-900">
              {summaryMetrics.pendingFollowUps}
            </div>
            <div className="text-[10px] text-purple-700 mt-1 font-semibold">
              {lang === 'kn' ? 'ಸಕ್ರಿಯ ದೂರು ಗುರಿಗಳು' : 'Active docket targets'}
            </div>
          </div>
        </div>

        {/* Telemetry Disclaimer Notice Banner (Section 6) */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-teal-600 text-base mt-0.5">verified_user</span>
          <div>
            <strong>{lang === 'kn' ? 'ಅಣಕು ಟೆಲಿಮೆಟ್ರಿ ಸುರಕ್ಷತಾ ಸೂಚನೆ: ' : 'Simulated Telemetry Safeguard: '}</strong>
            {lang === 'kn'
              ? 'ಎಲ್ಲಾ ಸಂದೇಶ ರವಾನೆ ಘಟನೆಗಳು (WhatsApp, SMS, IVR, Email) ಮುಂಭಾಗದ ಸ್ಥಿತಿಯಲ್ಲಿರುವ ಅಣಕು ಪ್ರದರ್ಶನ ದಾಖಲೆಗಳಾಗಿವೆ. ನಿಜವಾದ ಸಂದೇಶ ರವಾನೆಗೆ ಟೆಲಿಕಾಂ API ಸಂಪರ್ಕದ ಅಗತ್ಯವಿದೆ.'
              : 'All channel delivery events (WhatsApp, SMS, IVR, Email) are simulated demonstration records in the frontend state. Real statutory delivery requires backend telecom provider integration and delivery confirmation.'}
          </div>
        </div>
      </div>

      {/* Main View: Reminders Table & Filter Strip */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
        {/* Filter Controls Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pb-3 border-b border-slate-100">
          {/* Search */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Search Notices</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-sm">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Token, officer, title, reminder ID..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Department</label>
            <select
              value={selectedDeptId}
              onChange={(e) => { setSelectedDeptId(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Channel Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Channel</label>
            <select
              value={selectedChannel}
              onChange={(e) => { setSelectedChannel(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Channels</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="IN_APP">In-App Console</option>
              <option value="EMAIL">Email</option>
              <option value="IVR">IVR Call</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Delivery Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="QUEUED">Queued</option>
              <option value="DELIVERED">Delivered</option>
              <option value="FAILED">Failed Delivery</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Reminder Category</label>
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Categories</option>
              <option value="UPCOMING_FOLLOW_UP">Upcoming Follow-up</option>
              <option value="FOLLOW_UP_DUE_TODAY">Due Today</option>
              <option value="OVERDUE_COMPLAINT">Overdue SLA Notice</option>
              <option value="SUPERVISOR_ESCALATION">Supervisor Escalation</option>
              <option value="CITIZEN_FEEDBACK_REQUEST">Feedback Request</option>
            </select>
          </div>
        </div>

        {/* Reminders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-3 font-bold">Reminder ID</th>
                <th className="py-3 px-3 font-bold">Complaint ID</th>
                <th className="py-3 px-3 font-bold">Grievance Title</th>
                <th className="py-3 px-3 font-bold">Recipient</th>
                <th className="py-3 px-3 font-bold">Department</th>
                <th className="py-3 px-3 font-bold">Type</th>
                <th className="py-3 px-3 font-bold">Channel</th>
                <th className="py-3 px-3 font-bold">Scheduled Time</th>
                <th className="py-3 px-3 font-bold">Status</th>
                <th className="py-3 px-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-body">
              {paginatedReminders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-4xl text-slate-300">notifications_off</span>
                      <p className="font-semibold text-slate-600">No reminders found matching current filters.</p>
                      <p className="text-[11px] text-slate-400">Click "Evaluate Auto-Rules" or create a manual reminder.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedReminders.map((reminder) => {
                  const channelConfig = getChannelConfig(reminder.channel);
                  const statusConfig = getStatusConfig(reminder.status);

                  return (
                    <tr
                      key={reminder.id}
                      onClick={() => handleOpenDetail(reminder)}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      {/* Reminder ID */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {reminder.id}
                      </td>

                      {/* Complaint ID */}
                      <td className="py-3 px-3 font-mono font-bold text-teal-700 whitespace-nowrap">
                        #{reminder.complaintToken}
                      </td>

                      {/* Title */}
                      <td className="py-3 px-3 max-w-[200px]">
                        <div className="font-semibold text-slate-900 truncate" title={reminder.complaintTitle}>
                          {reminder.complaintTitle || 'Public Grievance'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Citizen: {reminder.citizenName || 'Resident'}
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{reminder.recipientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{reminder.recipientRole}</div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-3 max-w-[130px] text-slate-600">
                        <span className="truncate block text-[11px]" title={reminder.department}>
                          {reminder.department}
                        </span>
                      </td>

                      {/* Reminder Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-700">
                          {reminder.typeLabel || reminder.type}
                        </span>
                      </td>

                      {/* Channel */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${channelConfig.color}`}>
                          <span className="material-symbols-outlined text-[12px]">{channelConfig.icon}</span>
                          <span>{channelConfig.label}</span>
                        </span>
                      </td>

                      {/* Scheduled Time */}
                      <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                        {reminder.scheduledDate}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase border ${statusConfig.badgeClass}`}>
                          <span className="material-symbols-outlined text-[12px]">{statusConfig.icon}</span>
                          <span>{statusConfig.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {reminder.status === 'FAILED' && (
                            <button
                              onClick={(e) => handleRetryFailed(reminder.id, e)}
                              title="Retry Delivery via Fallback Gateway"
                              className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200"
                            >
                              Retry
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenDetail(reminder)}
                            title="Inspect Detailed Audit Record"
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500 font-body">
          <div>
            Showing <strong>{Math.min(sortedReminders.length, (currentPage - 1) * pageSize + 1)}</strong> to{' '}
            <strong>{Math.min(sortedReminders.length, currentPage * pageSize)}</strong> of{' '}
            <strong>{sortedReminders.length}</strong> reminder notices
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 font-mono text-slate-700 font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Reminder Audit Detail Drawer (Section 8) */}
      {isDetailDrawerOpen && selectedReminder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDetailDrawerOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white shadow-2xl h-full flex flex-col justify-between overflow-y-auto z-10 p-6 border-l border-slate-200 animate-slide-left">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-700">
                      {selectedReminder.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${getStatusConfig(selectedReminder.status).badgeClass}`}>
                      {selectedReminder.status}
                    </span>
                  </div>
                  <h3 className="font-headline text-base font-bold text-slate-900 mt-1">
                    {selectedReminder.subject}
                  </h3>
                </div>
                <button
                  onClick={() => setIsDetailDrawerOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Delivery Telemetry Strip */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Complaint Docket:</span>
                  <span className="font-bold text-teal-700">#{selectedReminder.complaintToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Channel Type:</span>
                  <span className="font-bold text-slate-900">{selectedReminder.channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient Contact:</span>
                  <span className="font-bold text-slate-900">{selectedReminder.recipientContact || 'Cadre Endpoint'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled At:</span>
                  <span className="text-slate-800">{selectedReminder.scheduledDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dispatched At:</span>
                  <span className="text-slate-800">{selectedReminder.dispatchedDate || 'Queued / Pending'}</span>
                </div>
              </div>

              {/* Message Payload Preview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Notice Payload Content
                </h4>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-body leading-relaxed">
                  {selectedReminder.message}
                </div>
                {selectedReminder.messageKn && (
                  <div className="mt-2 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs text-slate-700 font-body leading-relaxed">
                    <span className="text-[10px] font-bold text-teal-700 block mb-1">ಕನ್ನಡ ಆವೃತ್ತಿ (Kannada Payload):</span>
                    {selectedReminder.messageKn}
                  </div>
                )}
              </div>

              {/* Failure Notice / Retry Action */}
              {selectedReminder.status === 'FAILED' && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <span className="material-symbols-outlined text-rose-600 text-base">report_problem</span>
                    <span>Delivery Failure Diagnostic</span>
                  </div>
                  <p className="font-mono text-[11px] text-rose-700">
                    {selectedReminder.failureReason || 'Gateway timeout: carrier route unreachable'}
                  </p>
                  <button
                    onClick={(e) => handleRetryFailed(selectedReminder.id, e)}
                    className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    <span>Retry Delivery via Fallback Gateway</span>
                  </button>
                </div>
              )}

              {/* Associated Grievance Snapshot */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Associated Grievance Context
                </h4>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-900">{selectedReminder.complaintTitle}</div>
                  <div className="text-[11px] text-slate-500">Department: {selectedReminder.department}</div>
                  <div className="text-[11px] text-slate-500">Assigned Nodal Lead: {selectedReminder.assignedOfficer}</div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsDetailDrawerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Reminder Creation Modal (Section 5) */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Statutory Cadre Reminder"
          subtitle="Queue a targeted multi-channel follow-up notice"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSubmitCreateReminder} className="space-y-4 text-xs font-body">
            {/* Complaint Selector */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Target Grievance Docket <span className="text-rose-500">*</span>
              </label>
              <select
                value={formComplaintToken}
                onChange={(e) => handleComplaintChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:border-teal-500"
              >
                {complaints
                  .filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED')
                  .map((c) => (
                    <option key={c.token} value={c.token}>
                      #{c.token} · [{c.priority}] {c.title} ({c.assignedOfficer?.name || 'Unassigned'})
                    </option>
                  ))}
              </select>
            </div>

            {/* Recipient Details & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Recipient Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formRecipient}
                  onChange={(e) => setFormRecipient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Recipient Role
                </label>
                <select
                  value={formRecipientRole}
                  onChange={(e) => setFormRecipientRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-teal-500"
                >
                  <option value="Department Officer">Department Officer</option>
                  <option value="Citizen">Citizen Resident</option>
                  <option value="Supervisor">Zonal Supervisor / Ombudsman</option>
                </select>
              </div>
            </div>

            {/* Reminder Type & Channel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reminder Template Category
                </label>
                <select
                  value={formType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:border-teal-500"
                >
                  {REMINDER_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Communication Channel
                </label>
                <select
                  value={formChannel}
                  onChange={(e) => setFormChannel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:border-teal-500"
                >
                  <option value="WHATSAPP">WhatsApp Interactive Outbound</option>
                  <option value="IN_APP">In-App Cadre Notification</option>
                  <option value="EMAIL">Ministerial SMTP Email</option>
                  <option value="IVR">Automated IVR Outbound Nudge</option>
                </select>
              </div>
            </div>

            {/* Scheduled Date/Time & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Scheduled Dispatch Timestamp
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formScheduledDate}
                  onChange={(e) => setFormScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Priority Rating
                </label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-teal-500"
                >
                  <option value="NORMAL">Normal Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="CRITICAL">Critical Statutory Priority</option>
                </select>
              </div>
            </div>

            {/* Message Template Language & Text */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider">
                  Reminder Message Payload
                </label>
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      setFormTemplateLang('en');
                      const matched = complaints.find(c => c.token === formComplaintToken);
                      updateTemplateMessage(formType, formComplaintToken, matched, 'en');
                    }}
                    className={`px-2 py-0.5 rounded font-bold ${
                      formTemplateLang === 'en' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormTemplateLang('kn');
                      const matched = complaints.find(c => c.token === formComplaintToken);
                      updateTemplateMessage(formType, formComplaintToken, matched, 'kn');
                    }}
                    className={`px-2 py-0.5 rounded font-bold ${
                      formTemplateLang === 'kn' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    ಕನ್ನಡ (Kannada)
                  </button>
                </div>
              </div>
              <textarea
                required
                rows={3}
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Internal Administrative Justification (Optional)
              </label>
              <input
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="e.g. Special follow-up authorized under Section 12 Sakala directive..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px]">
              <strong>Duplicate Safeguard:</strong> Identical reminders scheduled for the same docket, category, and date will be rejected by the dispatcher engine.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl hover:bg-slate-100 font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm"
              >
                Save & Queue Reminder
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
