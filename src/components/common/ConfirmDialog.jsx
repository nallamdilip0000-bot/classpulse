import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  loading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDanger ? 'bg-rose-100 dark:bg-rose-950 text-rose-600' : 'bg-amber-100 dark:bg-amber-950 text-amber-600'}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
          {message}
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={isDanger ? 'danger' : 'primary'}
          size="sm"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
