import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_RISK_SETTINGS, evaluateStudentSupportIndicators } from '../utils/riskRules';
import { validateRiskThresholds } from '../utils/validation';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import { 
  Sliders, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  ShieldAlert, 
  History,
  Info 
} from 'lucide-react';

export default function Settings() {
  const { isTeacher, isAdmin } = useAuth();
  const { 
    riskSettings, 
    updateRiskSettings, 
    resetDemoData, 
    studentEvaluations, 
    authorizedStudents,
    getStudentMetrics,
    activityLog 
  } = useApp();

  // Local draft settings
  const [draft, setDraft] = useState({ ...riskSettings });
  const [errors, setErrors] = useState({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Live preview calculation: how many students would be flagged with these draft settings?
  const livePreview = useMemo(() => {
    let flaggedCount = 0;
    let attendanceCount = 0;
    let averageCount = 0;
    let declineCount = 0;

    authorizedStudents.forEach(student => {
      const metrics = getStudentMetrics(student.id);
      if (!metrics) return;

      const evalResult = evaluateStudentSupportIndicators(
        student,
        metrics.attendanceSummary,
        metrics.assessmentSummary,
        metrics.trendSummary,
        draft
      );

      if (evalResult.triggeredCount > 0) flaggedCount++;
      if (evalResult.attendanceTriggered) attendanceCount++;
      if (evalResult.averageTriggered) averageCount++;
      if (evalResult.declineTriggered) declineCount++;
    });

    return {
      flaggedCount,
      attendanceCount,
      averageCount,
      declineCount,
      currentFlagged: studentEvaluations.filter(e => e.evaluation.triggeredCount > 0).length
    };
  }, [draft, authorizedStudents, getStudentMetrics, studentEvaluations]);

  const handleSaveClick = (e) => {
    e.preventDefault();
    const val = validateRiskThresholds(draft);
    if (!val.isValid) {
      setErrors(val.errors);
      return;
    }
    setErrors({});
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = () => {
    updateRiskSettings(draft);
  };

  const handleResetDefaults = () => {
    setDraft({ ...DEFAULT_RISK_SETTINGS });
    updateRiskSettings({ ...DEFAULT_RISK_SETTINGS });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Risk Indicator & Threshold Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure transparent rules for academic review. Changes dynamically recalculate flags across the student body.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={handleResetDefaults}
          >
            Reset to Defaults
          </Button>
          {(isTeacher || isAdmin) && (
            <Button
              size="sm"
              icon={Save}
              onClick={handleSaveClick}
            >
              Save Configuration
            </Button>
          )}
        </div>
      </div>

      {/* Interactive Impact Preview Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/10 via-purple-800/10 to-indigo-900/10 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200 dark:border-purple-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#6D28D9] dark:text-purple-300 uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Live Policy Impact Preview</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              With these active sliders, <strong className="text-purple-700 dark:text-purple-300 text-sm font-extrabold">{livePreview.flaggedCount}</strong> out of {authorizedStudents.length} learners would be flagged for teacher review.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Attendance</span>
              <strong className="text-xs font-bold text-amber-600">{livePreview.attendanceCount}</strong>
            </div>
            <div className="text-center px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Baseline Avg</span>
              <strong className="text-xs font-bold text-rose-600">{livePreview.averageCount}</strong>
            </div>
            <div className="text-center px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Decline Drop</span>
              <strong className="text-xs font-bold text-purple-600 dark:text-purple-400">{livePreview.declineCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Rule 1: Attendance Threshold */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Rule 1: Attendance Review Threshold</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Flags students whose overall attendance percentage falls below this value.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.enableAttendanceRule}
                  onChange={(e) => setDraft({ ...draft, enableAttendanceRule: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6D28D9]"></div>
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Threshold:</span>
                <span className="text-[#6D28D9] dark:text-purple-400 text-sm font-bold">{draft.attendanceThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                step="1"
                value={draft.attendanceThreshold}
                onChange={(e) => setDraft({ ...draft, attendanceThreshold: Number(e.target.value) })}
                className="w-full accent-[#6D28D9] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>50% (Permissive)</span>
                <span>Default: 75%</span>
                <span>90% (Strict)</span>
              </div>
              {errors.attendanceThreshold && <p className="text-xs text-rose-500">{errors.attendanceThreshold}</p>}
            </div>
          </div>

          {/* Rule 2: Minimum Assessment Baseline */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Rule 2: Minimum Assessment Baseline</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Flags learners whose cumulative recent assessment average is below this baseline.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.enableAverageRule}
                  onChange={(e) => setDraft({ ...draft, enableAverageRule: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6D28D9]"></div>
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Threshold:</span>
                <span className="text-rose-600 dark:text-rose-400 text-sm font-bold">{draft.minimumAverageThreshold}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                step="1"
                value={draft.minimumAverageThreshold}
                onChange={(e) => setDraft({ ...draft, minimumAverageThreshold: Number(e.target.value) })}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>20% (Low)</span>
                <span>Default: 40%</span>
                <span>60% (Moderate)</span>
              </div>
              {errors.minimumAverageThreshold && <p className="text-xs text-rose-500">{errors.minimumAverageThreshold}</p>}
            </div>
          </div>

          {/* Rule 3: Declining Performance Threshold */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Rule 3: Declining Performance Shift</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Flags drops of this magnitude (in percentage points) between consecutive tests.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.enableDeclineRule}
                  onChange={(e) => setDraft({ ...draft, enableDeclineRule: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6D28D9]"></div>
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Decline Threshold:</span>
                <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">≥ {draft.declineThreshold} pts drop</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={draft.declineThreshold}
                onChange={(e) => setDraft({ ...draft, declineThreshold: Number(e.target.value) })}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>5 pts (Sensitive)</span>
                <span>Default: 15 pts</span>
                <span>30 pts (Only severe drops)</span>
              </div>
              {errors.declineThreshold && <p className="text-xs text-rose-500">{errors.declineThreshold}</p>}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">Minimum Completed Assessments for Trend:</span>
              <input
                type="number"
                min="2"
                max="5"
                value={draft.minimumAssessments}
                onChange={(e) => setDraft({ ...draft, minimumAssessments: Number(e.target.value) })}
                className="w-16 px-2 py-1 bg-slate-50 dark:bg-slate-800 border rounded text-xs text-center font-bold"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Threshold Explanations & Audit Log */}
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#6D28D9]" />
              <span>Policy Methodology</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              These thresholds represent prototype defaults for early academic notification. When modified by an authorized instructor or administrator, student records are reactively re-evaluated without altering historical student performance records.
            </p>
            <div className="pt-2 text-[11px] text-slate-400">
              * Recommended: Maintain decline threshold at 15 pts to capture meaningful concept disconnects without false positives from minor test variations.
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="w-4 h-4 text-purple-600" />
              <span>Audit History</span>
            </h4>
            <div className="space-y-2 text-xs">
              {activityLog.filter(a => a.action.includes('Threshold') || a.action.includes('Risk')).slice(0, 3).map(a => (
                <div key={a.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">{a.details}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">By {a.user} • {new Date(a.timestamp).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Save */}
      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleConfirmSave}
        title="Confirm Threshold Adjustments"
        message={`Are you sure you want to apply these threshold updates? This will immediately recalculate indicators for all ${authorizedStudents.length} students, resulting in ${livePreview.flaggedCount} flagged learners.`}
        confirmLabel="Apply & Recalculate"
      />
    </div>
  );
}
