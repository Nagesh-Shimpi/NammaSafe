import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { useLanguage } from '../context/LanguageContext';

export const CitizenLayout = () => {
  const { t, lang } = useLanguage();
  const location = useLocation();

  const citizenTabs = [
    { to: '/citizen', label: t('navHome'), icon: 'home' },
    { to: '/citizen/register', label: t('navRegister'), icon: 'rate_review' },
    { to: '/citizen/track', label: t('navTrack'), icon: 'search_check' },
    { to: '/citizen/feedback', label: lang === 'kn' ? 'ಪ್ರತಿಕ್ರಿಯೆ ಮತ್ತು ದೃಢೀಕರಣ' : 'Feedback & Verify', icon: 'reviews' },
    { to: '/citizen/login', label: lang === 'kn' ? 'ನಾಗರಿಕ ಲಾಗಿನ್' : 'Citizen Sign In', icon: 'account_circle' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        {/* Top Civic Header */}
        <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 flex items-center justify-between text-xs font-mono border-b border-outline/30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Government of Karnataka & National Civic Redressal Network</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Public Services Guarantee Act 2011</span>
            <span className="hidden sm:inline">Toll Free: 1800-GOV-911</span>
          </div>
        </div>

        {/* Global Navbar */}
        <Navbar showSidebarToggle={false} isCitizenView={true} />

        {/* Citizen Navigation Sub-bar */}
        <div className="bg-surface-container-lowest border-b border-outline-variant/30 px-gutter shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              {citizenTabs.map((tab) => {
                const isActive = location.pathname === tab.to;
                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className={`flex items-center gap-1.5 px-4 py-3 font-body text-body-md font-semibold border-b-2 transition-all ${
                      isActive
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-secondary hover:text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-3 text-secondary font-mono text-[11px]">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="material-symbols-outlined text-sm">verified</span>
                Instant SMS Tracking
              </span>
              <span>·</span>
              <span>Kannada & English Supported</span>
            </div>
          </div>
        </div>

        {/* Main Citizen Content */}
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Citizen Footer */}
      <footer className="bg-inverse-surface text-secondary-fixed-dim border-t border-outline/30 mt-16">
        <div className="max-w-7xl mx-auto px-gutter py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-body">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-on-primary font-bold">
              RT
            </div>
            <div>
              <p className="font-headline font-bold text-inverse-on-surface">
                ResolveTrack Civic Grievance Management System
              </p>
              <p className="text-secondary-fixed-dim/70">
                Department of Administrative Reforms & Public Grievances
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px]">
            <Link to="/citizen/track" className="hover:text-inverse-on-surface transition-colors">
              Grievance Status
            </Link>
            <span>·</span>
            <Link to="/citizen/register" className="hover:text-inverse-on-surface transition-colors">
              File New Grievance
            </Link>
            <span>·</span>
            <span className="text-primary-fixed">Statutory SLA Window: 48–72h</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

