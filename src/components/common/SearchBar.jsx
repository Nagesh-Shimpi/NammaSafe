import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const SearchBar = ({ value, onChange, placeholder, className = '' }) => {
  const { t } = useLanguage();

  return (
    <div className={`relative w-full ${className}`}>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t('searchPlaceholder')}
        className="w-full h-10 pl-10 pr-12 bg-surface-container-low rounded-lg font-body text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/40"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-surface-container text-outline font-mono text-[11px] pointer-events-none hidden sm:inline-block">
        ⌘K
      </span>
    </div>
  );
};

