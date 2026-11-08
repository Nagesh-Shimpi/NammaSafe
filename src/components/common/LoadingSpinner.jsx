import React from 'react';

export const LoadingSpinner = ({ label = 'Synchronizing civic telemetry...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className="w-8 h-8 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
      <span className="font-mono text-xs text-secondary">{label}</span>
    </div>
  );
};

