import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const PriorityBadge = ({ priority, className = '' }) => {
  const { lang } = useLanguage();

  const config = {
    CRITICAL: {
      label: 'Critical',
      labelKn: 'ತುರ್ತು',
      color: 'bg-error-container text-on-error-container border border-error/30 font-bold',
      dot: 'bg-error animate-ping'
    },
    HIGH: {
      label: 'High',
      labelKn: 'ಹೆಚ್ಚು',
      color: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
      dot: 'bg-amber-600'
    },
    MEDIUM: {
      label: 'Medium',
      labelKn: 'ಮಧ್ಯಮ',
      color: 'bg-secondary-container text-on-secondary-container border border-outline-variant/40',
      dot: 'bg-secondary'
    },
    LOW: {
      label: 'Low',
      labelKn: 'ಕಡಿಮೆ',
      color: 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30',
      dot: 'bg-outline'
    }
  }[priority] || {
    label: priority,
    labelKn: priority,
    color: 'bg-surface-container text-secondary',
    dot: 'bg-outline'
  };

  const label = lang === 'kn' ? config.labelKn : config.label;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] uppercase tracking-wider ${config.color} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{label}</span>
    </span>
  );
};

