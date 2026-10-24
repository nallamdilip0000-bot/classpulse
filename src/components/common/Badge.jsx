import React from 'react';

export default function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  icon: Icon,
  className = '' 
}) {
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full transition-colors';
  
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    primary: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.default} ${className}`}>
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </span>
  );
}
