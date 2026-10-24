import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle, ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export function ReviewStatusBadge({ status, triggeredCount }) {
  if (status === 'high_priority_review') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
        <span>Priority Review ({triggeredCount})</span>
      </span>
    );
  }

  if (status === 'review_suggested') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>Support Recommended</span>
      </span>
    );
  }

  if (status === 'insufficient_data') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <HelpCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        <span>Insufficient Data</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
      <span>On Track</span>
    </span>
  );
}

export function TrendBadge({ trendSummary }) {
  if (!trendSummary || trendSummary.trend === 'insufficient_data') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
        <Minus className="w-3.5 h-3.5 text-slate-400" />
        <span>New / N/A</span>
      </span>
    );
  }

  if (trendSummary.trend === 'downward') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
        <ArrowDownRight className="w-4 h-4" />
        <span>{trendSummary.delta} pts</span>
      </span>
    );
  }

  if (trendSummary.trend === 'upward') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        <ArrowUpRight className="w-4 h-4" />
        <span>+{trendSummary.delta} pts</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
      <Minus className="w-3.5 h-3.5" />
      <span>Stable ({trendSummary.delta > 0 ? `+${trendSummary.delta}` : trendSummary.delta} pts)</span>
    </span>
  );
}

export function FollowUpStatusBadge({ status }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
        Completed
      </span>
    );
  }
  if (status === 'in_progress') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
        In Progress
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
        Pending Follow-up
      </span>
    );
  }
  return (
    <span className="text-[11px] text-slate-400">
      None Planned
    </span>
  );
}
