import React, { useEffect } from 'react';

export const Modal = ({ isOpen, onClose, title, subtitle, children, footer, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Box (Elevation Level 3) */}
      <div
        className={`relative w-full ${maxWidth} bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/60 overflow-hidden transform transition-all z-10 my-8`}
      >
        {/* Header */}
        <div className="px-space-lg py-space-md bg-surface-container-low/60 border-b border-outline-variant/30 flex items-center justify-between">
          <div>
            <h3 className="font-headline text-headline-sm font-bold text-on-surface">
              {title}
            </h3>
            {subtitle && (
              <p className="font-body text-body-sm text-secondary mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-space-lg max-h-[75vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer Actions */}
        {footer && (
          <div className="px-space-lg py-space-md bg-surface-container-low/40 border-t border-outline-variant/30 flex items-center justify-end gap-space-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

