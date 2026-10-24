import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'purple',
  onClick,
  badgeText
}) {
  const schemeStyles = {
    purple: {
      iconBg: 'bg-purple-100 dark:bg-purple-950/60 text-[#6D28D9] dark:text-purple-400',
      border: 'hover:border-purple-300 dark:hover:border-purple-800'
    },
    emerald: {
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      border: 'hover:border-emerald-300 dark:hover:border-emerald-800'
    },
    amber: {
      iconBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      border: 'hover:border-amber-300 dark:hover:border-amber-800'
    },
    rose: {
      iconBg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      border: 'hover:border-rose-300 dark:hover:border-rose-800'
    },
    blue: {
      iconBg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
      border: 'hover:border-blue-300 dark:hover:border-blue-800'
    }
  };

  const scheme = schemeStyles[colorScheme] || schemeStyles.purple;

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all duration-200 group ${
        onClick ? 'cursor-pointer hover:shadow-md ' + scheme.border : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {value}
            </span>
            {badgeText && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {badgeText}
              </span>
            )}
          </div>
        </div>

        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="truncate">{subtitle}</span>
        {onClick && (
          <span className="inline-flex items-center gap-0.5 text-[#6D28D9] dark:text-purple-400 font-medium group-hover:translate-x-0.5 transition-transform">
            View <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}
