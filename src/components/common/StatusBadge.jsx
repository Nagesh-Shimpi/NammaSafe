import React from 'react';
import { STATUS_CONFIG } from '../../utils/constants';
import { useLanguage } from '../../context/LanguageContext';

export const StatusBadge = ({ status, className = '' }) => {
  const { lang, tStatus } = useLanguage();
  const config = STATUS_CONFIG[status] || {
    label: tStatus(status),
    labelKn: tStatus(status),
    color: 'bg-surface-container text-on-surface-variant',
    dot: 'bg-outline'
  };

  const label = lang === 'kn' ? (config.labelKn || tStatus(status)) : (config.label || tStatus(status));

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider ${config.color} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{label}</span>
    </span>
  );
};

