import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

export const NotificationPanel = ({ isOpen, onClose }) => {
  const {
    notifications = [],
    reminders = [],
    markNotificationRead,
    markAllNotificationsRead
  } = useComplaints();
  const { lang, t, tChannel } = useLanguage();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'REMINDERS' | 'BREACHES'

  if (!isOpen) return null;

  const getAlertTitle = (titleStr, typeStr) => {
    if (lang !== 'kn') return titleStr || typeStr || 'Statutory Alert';
    const raw = (titleStr || typeStr || '').toLowerCase();
    if (raw.includes('registered')) return t('notifComplaintRegistered');
    if (raw.includes('assigned')) return t('notifOfficerAssigned');
    if (raw.includes('resolution')) return t('notifResolutionSubmitted');
    if (raw.includes('info')) return t('notifInfoRequested');
    if (raw.includes('reopened')) return t('notifComplaintReopened');
    if (raw.includes('escalation') || raw.includes('breach')) return t('notifEscalationTriggered');
    if (raw.includes('reminder') || raw.includes('follow-up') || raw.includes('due')) return t('notifReminderDispatched');
    return titleStr || 'ಸರ್ಕಾರಿ ಎಚ್ಚರಿಕೆ';
  };

  // Synthesize integrated alerts from notifications & reminders
  const reminderAlerts = reminders.slice(0, 8).map(r => ({
    id: `REM-NOTIF-${r.id}`,
    token: r.complaintToken || r.complaintId,
    type: r.type,
    title: r.typeLabel || r.type || 'Follow-up Reminder',
    message: lang === 'kn' && r.messageKn ? r.messageKn : (r.subject || r.message),
    time: r.createdDate?.split(' ')[1] || (lang === 'kn' ? 'ಇಂದು' : 'Today'),
    unread: r.status === 'SCHEDULED' || r.status === 'QUEUED',
    severity: r.priority === 'CRITICAL' ? 'error' : r.priority === 'HIGH' ? 'warning' : 'info',
    actionRoute: `/supervisor/reminder-centre`,
    isReminder: true,
    channel: r.channel
  }));

  const allAlerts = [...notifications, ...reminderAlerts];
  const unreadCount = allAlerts.filter(a => a.unread).length;

  const filteredAlerts = allAlerts.filter(a => {
    if (filterType === 'REMINDERS') return a.isReminder || a.type?.includes('REMINDER');
    if (filterType === 'BREACHES') return a.severity === 'error' || a.severity === 'warning';
    return true;
  });

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-14 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
        {/* Panel Header */}
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-600 text-xl">notifications_active</span>
            <span className="font-headline font-bold text-slate-900 text-xs sm:text-sm">
              {lang === 'kn' ? 'ಕಾನೂನುಬದ್ಧ ಎಚ್ಚರಿಕೆಗಳು & ಜ್ಞಾಪನೆಗಳು' : 'Statutory Alerts & Reminders'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllNotificationsRead && markAllNotificationsRead()}
                className="text-[10px] text-teal-700 hover:underline font-semibold"
              >
                {lang === 'kn' ? 'ಎಲ್ಲಾ ಓದಿದೆ' : 'Mark all read'}
              </button>
            )}
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-mono text-[10px] font-bold">
              {unreadCount} {lang === 'kn' ? 'ಹೊಸದು' : 'New'}
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-3 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filterType === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {lang === 'kn' ? `ಎಲ್ಲಾ (${allAlerts.length})` : `All Alerts (${allAlerts.length})`}
          </button>
          <button
            onClick={() => setFilterType('REMINDERS')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filterType === 'REMINDERS' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {lang === 'kn' ? `ಜ್ಞಾಪನೆಗಳು (${reminders.length})` : `Reminders (${reminders.length})`}
          </button>
          <button
            onClick={() => setFilterType('BREACHES')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              filterType === 'BREACHES' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {lang === 'kn' ? 'ಉಲ್ಲಂಘನೆಗಳು' : 'Breaches'}
          </button>
        </div>

        {/* Notification / Reminder List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {filteredAlerts.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              {lang === 'kn' ? 'ಈ ವಿಭಾಗದಲ್ಲಿ ಯಾವುದೇ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ.' : 'No alerts in this category.'}
            </div>
          ) : (
            filteredAlerts.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (n.unread && markNotificationRead) markNotificationRead(n.id);
                  onClose();
                  navigate(n.actionRoute || `/supervisor/reminder-centre`);
                }}
                className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col gap-1 ${
                  n.unread ? 'bg-teal-50/30' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />}
                    <span
                      className={`font-mono text-[10px] font-bold uppercase ${
                        n.severity === 'error'
                          ? 'text-rose-700'
                          : n.severity === 'warning'
                          ? 'text-amber-700'
                          : 'text-teal-700'
                      }`}
                    >
                      {getAlertTitle(n.title, n.type)}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {n.time || (lang === 'kn' ? 'ಇಂದು' : 'Today')}
                  </span>
                </div>
                <p className="font-body text-xs font-semibold text-slate-800 line-clamp-1">
                  {n.message}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  {n.channel ? (
                    <span className="text-teal-800 font-medium">
                      {lang === 'kn' ? 'ಮಾಧ್ಯಮ' : 'Channel'}: {tChannel(n.channel)}
                    </span>
                  ) : (
                    <span>{lang === 'kn' ? 'ಸ್ವಯಂ-ಟೆಲಿಮೆಟ್ರಿ' : 'Auto-Telemetry'}</span>
                  )}
                  {n.token && <span className="text-teal-700 font-bold">#{n.token}</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
          <button
            onClick={() => {
              onClose();
              navigate('/supervisor/reminder-centre');
            }}
            className="text-teal-700 text-xs font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            <span>
              {lang === 'kn' ? 'ಬುದ್ಧಿವಂತ ಜ್ಞಾಪನೆ ಕೇಂದ್ರ ತೆರೆಯಿರಿ' : 'Open Intelligent Reminder Centre'}
            </span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>
      </div>
    </>
  );
};
