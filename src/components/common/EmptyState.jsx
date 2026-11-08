import React from 'react';

export const EmptyState = ({
  icon = 'inbox',
  title = 'No Records Found',
  description = 'There are no items matching your criteria at this moment.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-container-low/40 rounded-2xl border border-outline-variant/30">
      <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-outline mb-3">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h3 className="font-headline text-headline-sm font-bold text-on-surface">
        {title}
      </h3>
      <p className="font-body text-body-sm text-secondary mt-1 max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary font-headline text-label-sm font-bold shadow-sm hover:bg-primary-container transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

