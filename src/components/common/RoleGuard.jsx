import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const RoleGuard = ({ allowedRoles = [], children }) => {
  const { currentRole, USER_ROLES, ROLE_PROFILES } = useAuth();
  const { lang } = useLanguage();

  const isAuthorized = allowedRoles.includes(currentRole);

  if (isAuthorized) {
    return <>{children}</>;
  }

  const profile = ROLE_PROFILES[currentRole] || ROLE_PROFILES[USER_ROLES.CITIZEN];
  const fallbackRoute = profile?.defaultRoute || '/citizen';

  return (
    <div
      data-testid="role-guard-blocked"
      className="min-h-[65vh] flex items-center justify-center p-6"
    >
      <div className="max-w-lg w-full bg-surface-container-lowest border border-error/30 rounded-2xl p-8 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-error-container/60 text-error mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl">gpp_maybe</span>
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-error-container text-on-error-container font-mono text-[11px] font-bold uppercase tracking-wider">
            {lang === 'kn' ? '403 ಪ್ರವೇಶ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ' : '403 Access Restricted'}
          </span>
          <h1 className="font-headline text-headline-md font-extrabold text-on-surface">
            {lang === 'kn' ? 'ಅನಧಿಕೃತ ಪಾತ್ರದ ಪ್ರವೇಶವನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ' : 'Unauthorized Role Access Blocked'}
          </h1>
          <p className="font-body text-body-sm text-secondary leading-relaxed">
            {lang === 'kn'
              ? `ಪ್ರಸ್ತುತ ಸಕ್ರಿಯ ಪಾತ್ರ (${profile?.label || currentRole}) ಈ ಆಡಳಿತಾತ್ಮಕ ಕಾರ್ಯಕ್ಷೇತ್ರವನ್ನು ತೆರೆಯಲು ಅಧಿಕಾರ ಹೊಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಅನುಮತಿಸಲಾದ ಪೋರ್ಟಲ್‌ಗೆ ಹಿಂತಿರುಗಿ.`
              : `Your active session role (${profile?.label || currentRole}) is not authorized to access this protected governance workspace. Required roles: ${allowedRoles.join(' / ')}.`}
          </p>
        </div>

        <div className="bg-surface-container-low rounded-xl p-3.5 text-left text-xs font-mono text-secondary space-y-1 border border-outline-variant/30">
          <div>
            <strong>{lang === 'kn' ? 'ಪ್ರಸ್ತುತ ಪಾತ್ರ:' : 'Active Role:'}</strong> {currentRole}
          </div>
          <div>
            <strong>{lang === 'kn' ? 'ಅಗತ್ಯವಿರುವ ಪಾತ್ರ:' : 'Permitted Roles:'}</strong> {allowedRoles.join(', ')}
          </div>
        </div>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link
            to={fallbackRoute}
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-headline text-label-md font-bold shadow-sm hover:bg-primary-container transition-all inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>
              {lang === 'kn' ? 'ಅನುಮತಿಸಲಾದ ಕಾರ್ಯಕ್ಷೇತ್ರಕ್ಕೆ ಹಿಂತಿರುಗಿ' : 'Return to Permitted Workspace'}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
