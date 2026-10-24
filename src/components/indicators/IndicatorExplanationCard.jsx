import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, HelpCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { ReviewStatusBadge } from '../students/IndicatorBadge';

export default function IndicatorExplanationCard({ evaluation, onActionClick }) {
  if (!evaluation) return null;

  const {
    status,
    priorityLabel,
    indicators,
    triggeredCount,
    summaryText,
    suggestedActions,
    evaluatedAt,
    safetyDisclaimer
  } = evaluation;

  return (
    <div className={`rounded-2xl p-5 border transition-all ${
      status === 'high_priority_review'
        ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
        : status === 'review_suggested'
        ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
        : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
    }`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <ReviewStatusBadge status={status} triggeredCount={triggeredCount} />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Evaluated on {new Date(evaluatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {onActionClick && (
          <button
            onClick={onActionClick}
            className="text-xs font-semibold text-[#6D28D9] dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Log Support Follow-up</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Synthesis Explanation */}
      <div className="py-3">
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
          {summaryText}
        </p>
      </div>

      {/* Triggered Rule Breakdowns */}
      {indicators && indicators.length > 0 && (
        <div className="space-y-2.5 my-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Triggered Indicators & Measurements
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {indicators.map((ind, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {ind.label}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Observed: <strong className="text-purple-600 dark:text-purple-400">{ind.observedValue}</strong> vs Rule ({ind.threshold})
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {ind.explanation}
                </p>

                {ind.details && (
                  <p className="text-[11px] text-slate-400 mt-1 italic">
                    Evidence: {ind.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Teacher Actions */}
      {suggestedActions && suggestedActions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Suggested Teacher Follow-Up Steps:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300 pl-1">
            {suggestedActions.map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Non-punitive Safety Guardrail */}
      <div className="mt-3 pt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>{safetyDisclaimer}</span>
      </div>
    </div>
  );
}
