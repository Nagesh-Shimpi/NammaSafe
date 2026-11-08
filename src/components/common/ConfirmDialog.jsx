import React from 'react';
import { Modal } from './Modal';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this operation?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-body text-label-sm font-semibold hover:bg-surface-container-high transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 rounded-xl font-headline text-label-sm font-bold shadow-sm transition-all ${
              isDestructive
                ? 'bg-error text-on-error hover:bg-error/90'
                : 'bg-primary text-on-primary hover:bg-primary-container'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="flex items-start gap-3.5 py-1">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isDestructive ? 'bg-error-container text-error' : 'bg-primary/10 text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">
            {isDestructive ? 'warning' : 'help_outline'}
          </span>
        </div>
        <p className="font-body text-body-md text-on-surface-variant leading-relaxed">
          {message}
        </p>
      </div>
    </Modal>
  );
};

