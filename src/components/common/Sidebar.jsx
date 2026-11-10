import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { lang, t } = useLanguage();
  const { currentRole, USER_ROLES } = useAuth();
  const { metrics, complaints, reminders, escalations } = useComplaints();

  // Navigation configurations based on active role
  const getNavSections = () => {
    if (currentRole === USER_ROLES.CITIZEN) {
      return [
        {
          title: lang === 'kn' ? 'ನಾಗರಿಕ ಸೇವೆಗಳು' : 'Citizen Services',
          links: [
            { to: '/citizen', icon: 'home', label: t('navHome') },
            { to: '/citizen/register', icon: 'add_circle', label: t('navRegister'), badge: '⌘N' },
            { to: '/citizen/track', icon: 'qr_code_scanner', label: t('navTrack') },
            { to: '/citizen/feedback', icon: 'rate_review', label: t('navFeedback') },
            { to: '/citizen/login', icon: 'account_circle', label: t('navLogin') },
          ],
        },
      ];
    }

    if (currentRole === USER_ROLES.OFFICER) {
      return [
        {
          title: lang === 'kn' ? 'ಕ್ಷೇತ್ರ ಕಾರ್ಯಕ್ಷೇತ್ರ' : 'Officer Workspace',
          links: [
            { to: '/officer/dashboard', icon: 'dashboard', label: lang === 'kn' ? 'ಅಧಿಕಾರಿ ಮುಖಫಲಕ' : 'Officer Dashboard', badge: 'Active' },
            { to: '/officer/assigned-complaints', icon: 'assignment', label: t('assignedComplaints'), count: complaints.length.toString() },
            { to: '/officer/follow-up-management', icon: 'checklist', label: lang === 'kn' ? 'ಅನುಸರಣೆ ನಿರ್ವಹಣೆ' : 'Follow-up Management', badge: 'Daily' },
            { to: '/officer/action-history', icon: 'history', label: lang === 'kn' ? 'ಕ್ರಮಗಳ ಇತಿಹಾಸ' : 'Action History' },
            { to: '/officer/update-status', icon: 'edit_note', label: lang === 'kn' ? 'ಸ್ಥಿತಿ ನವೀಕರಣ' : 'Update Status' },
          ],
        },
        {
          title: lang === 'kn' ? 'ಇಲಾಖಾ ಉಲ್ಲೇಖ' : 'Department References',
          links: [
            { to: '/officer/all-complaints', icon: 'inbox', label: t('navAllComplaints') },
            { to: '/officer/heatmap', icon: 'map', label: t('navHeatmap') },
          ],
        },
      ];
    }

    if (currentRole === USER_ROLES.SUPERVISOR) {
      return [
        {
          title: lang === 'kn' ? 'ಮೇಲ್ವಿಚಾರಣಾ ಕಮಾಂಡ್' : 'Supervisor Command',
          links: [
            { to: '/supervisor/dashboard', icon: 'monitoring', label: lang === 'kn' ? 'ಮೇಲ್ವಿಚಾರಕ ಮುಖಫಲಕ' : 'Supervisor Dashboard', badge: 'Zone 1' },
            { to: '/supervisor/team-complaints', icon: 'groups', label: lang === 'kn' ? 'ತಂಡದ ದೂರುಗಳು' : 'Team Complaints', count: complaints.length.toString() },
            { to: '/supervisor/overdue-monitoring', icon: 'alarm_on', label: lang === 'kn' ? 'ಗಡುವು ಮೀರಿದ ದೂರುಗಳ ಪರಿಶೀಲನೆ' : 'Overdue Monitoring', isAlert: true, count: metrics.overdue.toString() },
            { to: '/supervisor/escalation-review', icon: 'crisis_alert', label: lang === 'kn' ? 'ಮೇಲ್ಮನವಿ ಪರಿಶೀಲನೆ' : 'Escalation Review', isAlert: true, badge: `${escalations.length} Active` },
            { to: '/supervisor/officer-performance', icon: 'badge', label: lang === 'kn' ? 'ಅಧಿಕಾರಿಗಳ ಕಾರ್ಯಕ್ಷಮತೆ' : 'Officer Performance' },
            { to: '/supervisor/department-performance', icon: 'account_balance', label: t('navDepartments'), badge: 'Q3' },
            { to: '/supervisor/resolution-approval', icon: 'fact_check', label: lang === 'kn' ? 'ಪರಿಹಾರ ಅನುಮೋದನೆ' : 'Resolution Approval', badge: 'Gate' },
            { to: '/supervisor/complaint-audit', icon: 'manage_search', label: t('navAuditSearch') },
            { to: '/supervisor/complaint-intelligence', icon: 'rule_settings', label: t('navComplaintIntelligence'), badge: 'Rules' },
            { to: '/supervisor/reminder-centre', icon: 'notification_important', label: t('navReminderCentre'), badge: `${reminders.length}` },
          ],
        },
      ];
    }

    // Default Administrator navigation
    return [
      {
        title: lang === 'kn' ? 'ಕೇಂದ್ರ ನಿಯಂತ್ರಣ' : 'Core Command',
        links: [
          { to: '/admin/overview', icon: 'dashboard', label: t('navOverview') },
          { to: '/admin/all-complaints', icon: 'inbox', label: t('navAllComplaints'), count: metrics.total.toLocaleString() },
          { to: '/admin/pending-complaints', icon: 'pending_actions', label: t('navPending'), count: metrics.pending.toLocaleString() },
          { to: '/admin/overdue-complaints', icon: 'alarm_on', label: t('navOverdue'), count: metrics.overdue.toString(), isAlert: true },
        ],
      },
      {
        title: lang === 'kn' ? 'ಇಲಾಖೆ & ಅಧಿಕಾರಿಗಳು' : 'Departments & Cadre',
        links: [
          { to: '/admin/department-management', icon: 'domain', label: t('navDepartmentManagement') },
          { to: '/admin/departments', icon: 'account_balance', label: t('navDepartments') },
          { to: '/admin/officers-directory', icon: 'badge', label: t('navOfficers') },
          { to: '/admin/officer-workload', icon: 'sync_alt', label: t('navOfficerWorkload') },
        ],
      },
      {
        title: lang === 'kn' ? 'ಸಂವಹನ & ಬುದ್ಧಿಮತ್ತೆ' : 'Intelligence & Communications',
        links: [
          { to: '/admin/reminder-centre', icon: 'notification_important', label: t('navReminderCentre'), badge: `${reminders.length}` },
          { to: '/admin/complaint-audit', icon: 'manage_search', label: t('navAuditSearch'), badge: 'Audit' },
          { to: '/admin/communication-logs', icon: 'forum', label: t('navCommunicationLogs') },
          { to: '/admin/complaint-intelligence', icon: 'rule_settings', label: t('navComplaintIntelligence'), badge: 'Rules' },
          { to: '/admin/resolution-verification', icon: 'verified', label: t('navResolutionVerification') },
          { to: '/admin/analytics', icon: 'analytics', label: t('navAnalytics') },
          { to: '/admin/heatmap', icon: 'map', label: t('navHeatmap') },
          { to: '/admin/settings', icon: 'settings', label: t('navSettings') },
        ],
      },
    ];
  };

  const navSections = getNavSections();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Persistent Sidebar Dock */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-72 bg-inverse-surface z-50 flex flex-col justify-between overflow-y-auto border-r border-outline/30 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Header & Logo */}
          <div className="h-16 px-space-lg flex items-center justify-between bg-inverse-surface border-b border-outline/20">
            <Link to="/" className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-bold shadow-md">
                <span className="material-symbols-outlined text-xl">shield</span>
              </div>
              <span className="font-headline text-headline-sm text-inverse-on-surface tracking-tight font-bold">
                ResolveTrack
              </span>
            </Link>
            <span className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container font-mono text-[10px] uppercase font-bold tracking-wider">
              GovOps AI
            </span>
          </div>

          {/* Navigation Items grouped by Section */}
          <div className="px-space-md py-space-sm space-y-4">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {section.title && (
                  <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-secondary-fixed-dim/70 font-bold block mb-1">
                    {section.title}
                  </span>
                )}
                <nav className="flex flex-col gap-1">
                  {section.links.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => onClose && onClose()}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-space-md py-2 rounded-lg transition-all font-body text-body-sm ${
                          isActive
                            ? 'bg-primary-container text-on-primary-container font-semibold shadow-md'
                            : 'text-secondary-fixed-dim hover:bg-on-secondary-fixed-variant/40 hover:text-inverse-on-surface'
                        }`
                      }
                    >
                      <div className="flex items-center gap-space-sm">
                        <span className="material-symbols-outlined text-lg">{link.icon}</span>
                        <span className="text-label-sm">{link.label}</span>
                      </div>

                      {link.count && (
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                            link.isAlert
                              ? 'bg-error text-on-error animate-pulse'
                              : 'bg-secondary-fixed/30 text-secondary-fixed'
                          }`}
                        >
                          {link.count}
                        </span>
                      )}

                      {link.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                            link.isAlert
                              ? 'bg-error text-on-error'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          {link.badge}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Footer: Live Sync & Hotline */}
        <div className="p-space-md m-space-md rounded-xl bg-on-secondary-fixed-variant/30 border border-outline/20 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-body text-[11px] text-secondary-fixed-dim font-medium">
              {t('portalName')}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] text-emerald-300 font-semibold">
                {t('liveSync')}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-secondary-fixed-dim pt-2 border-t border-outline/20">
            <span>{t('slaHotline')}:</span>
            <span className="font-mono font-bold text-inverse-on-surface">1800-425-425</span>
          </div>
        </div>
      </aside>
    </>
  );
};
