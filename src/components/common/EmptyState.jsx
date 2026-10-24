import React from 'react';
import { SearchX } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = SearchX,
  title = 'No records found',
  description = 'Try adjusting your search criteria, class filter, or term selection.',
  actionLabel,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 my-4">
      <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-[#6D28D9] dark:text-purple-400 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
