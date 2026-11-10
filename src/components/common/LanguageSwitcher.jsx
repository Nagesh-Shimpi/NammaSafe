import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const LanguageSwitcher = ({ className = '', compact = false }) => {
  const { lang, setLanguage, t } = useLanguage();

  return (
    <div
      role="radiogroup"
      aria-label={t('selectLanguage')}
      className={`inline-flex items-center rounded-xl bg-surface-container-low p-1 border border-outline-variant/40 shadow-sm ${className}`}
    >
      {/* English Toggle Option */}
      <button
        type="button"
        role="radio"
        aria-checked={lang === 'en'}
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-150 ${
          lang === 'en'
            ? 'bg-primary text-on-primary shadow-xs font-bold'
            : 'text-secondary hover:text-on-surface hover:bg-surface-container'
        }`}
        title="Switch to English"
      >
        <span className="font-mono uppercase text-[11px]">EN</span>
        {!compact && <span className="hidden sm:inline">English</span>}
      </button>

      {/* Visual Divider */}
      <span className="text-outline/40 mx-0.5 text-xs select-none">|</span>

      {/* Kannada Toggle Option */}
      <button
        type="button"
        role="radio"
        aria-checked={lang === 'kn'}
        onClick={() => setLanguage('kn')}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-150 ${
          lang === 'kn'
            ? 'bg-primary text-on-primary shadow-xs font-bold'
            : 'text-secondary hover:text-on-surface hover:bg-surface-container'
        }`}
        title="ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಿ / Switch to Kannada"
      >
        <span className="font-medium text-[12px]">ಕನ್ನಡ</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
