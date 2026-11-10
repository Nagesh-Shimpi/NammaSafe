import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useComplaints } from '../../context/ComplaintContext';
import { SearchBar } from './SearchBar';
import { NotificationPanel } from './NotificationPanel';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ showSidebarToggle = true, onToggleSidebar, isCitizenView = false }) => {
  const { currentRole, currentUser, switchRole, USER_ROLES } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const { notices, complaints } = useComplaints();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      // Find matching complaint token
      const found = complaints.find(
        c => c.token.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
             c.citizenName.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
      if (found) {
        if (currentRole === USER_ROLES.CITIZEN) {
          navigate(`/citizen/track?token=${found.token}`);
        } else {
          navigate(`/officer/complaints/${found.token}`);
        }
      } else {
        alert(`No complaint found matching "${searchTerm}". Try GRV-2024-8841 or GRV-2024-8839`);
      }
    }
  };

  return (
    <header className="h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-sm z-30 px-gutter flex items-center justify-between border-b border-outline-variant/30 sticky top-0">
      {/* Left: Mobile Toggle & Omnibox */}
      <div className="flex items-center gap-space-md flex-1 max-w-2xl">
        {showSidebarToggle && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        )}

        <div className="relative w-full" onKeyDown={handleSearchSubmit}>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={
              isCitizenView
                ? (lang === 'kn' ? 'ನಿಮ್ಮ ಟೋಕನ್ ಐಡಿ ನಮೂದಿಸಿ (ಉದಾ: GRV-2024-8841)...' : 'Enter tracking token (e.g. GRV-2024-8841)...')
                : t('searchPlaceholder')
            }
          />
        </div>

        <div className="hidden xl:flex items-center gap-space-xs px-3 py-1.5 bg-surface-container-low rounded-lg whitespace-nowrap border border-outline-variant/20">
          <span className="material-symbols-outlined text-primary text-base">verified_user</span>
          <span className="font-body text-label-sm font-semibold text-on-surface">
            {t('nationalPortal')}
          </span>
        </div>
      </div>

      {/* Right: Controls & Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-4 ml-space-md">
        {/* Global Language Switcher */}
        <LanguageSwitcher />

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container/10 hover:bg-primary-container/20 text-primary border border-primary/20 font-body text-label-sm font-semibold transition-all"
          >
            <span className="material-symbols-outlined text-base">badge</span>
            <span className="hidden md:inline">{currentRole}</span>
            <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
          </button>

          {isRoleDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsRoleDropdownOpen(false)}
              />
              <div className="absolute right-0 top-11 w-56 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/60 z-50 py-1 overflow-hidden animate-in fade-in duration-100">
                <div className="px-3 py-2 bg-surface-container-low/60 text-[11px] font-mono text-secondary uppercase font-bold border-b border-outline-variant/30">
                  Switch Active Role
                </div>
                {Object.values(USER_ROLES).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      switchRole(role);
                      setIsRoleDropdownOpen(false);
                      if (role === USER_ROLES.CITIZEN) navigate('/citizen');
                      else if (role === USER_ROLES.OFFICER) navigate('/officer/dashboard');
                      else if (role === USER_ROLES.SUPERVISOR) navigate('/supervisor/dashboard');
                      else navigate('/admin/overview');
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-body-sm font-body flex items-center justify-between transition-colors ${
                      currentRole === role
                        ? 'bg-primary-container text-on-primary font-semibold'
                        : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <span>{role}</span>
                    {currentRole === role && (
                      <span className="material-symbols-outlined text-sm">check</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors relative"
            title="Statutory Notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            {notices.length > 0 && (
              <span className="absolute top-1 right-1 px-1 min-w-[16px] h-4 rounded-full bg-error text-on-error font-mono text-[10px] leading-none flex items-center justify-center font-bold">
                {notices.length}
              </span>
            )}
          </button>
          <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        {/* User Profile Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-outline-variant/30">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
          />
          <div className="hidden lg:flex flex-col text-left">
            <span className="font-body text-label-sm font-bold text-on-surface leading-tight truncate max-w-[140px]">
              {currentUser.name}
            </span>
            <span className="font-body text-[11px] text-secondary leading-tight truncate max-w-[140px]">
              {currentUser.title}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

