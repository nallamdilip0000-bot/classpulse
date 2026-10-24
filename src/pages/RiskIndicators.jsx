import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import IndicatorExplanationCard from '../components/indicators/IndicatorExplanationCard';
import InterventionModal from '../components/interventions/InterventionModal';
import StudentProfileModal from '../components/students/StudentProfileModal';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Sliders, 
  CheckCircle2, 
  Search, 
  Filter, 
  Sparkles, 
  ArrowRight,
  Info,
  CalendarCheck,
  TrendingDown,
  Layers
} from 'lucide-react';
import Button from '../components/common/Button';

export default function RiskIndicators() {
  const navigate = useNavigate();
  const { isTeacher, isAdmin } = useAuth();
  const { 
    studentEvaluations, 
    riskSettings, 
    classes, 
    selectedClassId, 
    setSelectedClassId,
    recordActivity,
    addToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL_FLAGGED'); // ALL_FLAGGED, MULTI, ATTENDANCE, DECLINE, AVERAGE, ALL
  const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
  const [interventionStudent, setInterventionStudent] = useState(null);
  const [acknowledgedStudents, setAcknowledgedStudents] = useState(() => {
    try {
      const saved = localStorage.getItem('classpulse_acknowledged_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Filter evaluated students
  const filteredEvaluations = useMemo(() => {
    return studentEvaluations.filter(item => {
      if (selectedClassId !== 'ALL' && item.student.classId !== selectedClassId) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.student.displayName.toLowerCase().includes(q);
        const matchCode = item.student.studentCode.toLowerCase().includes(q);
        if (!matchName && !matchCode) return false;
      }

      const { triggeredCount, attendanceTriggered, declineTriggered, averageTriggered } = item.evaluation;

      if (filterType === 'ALL_FLAGGED') {
        return triggeredCount > 0;
      } else if (filterType === 'MULTI') {
        return triggeredCount >= 2;
      } else if (filterType === 'ATTENDANCE') {
        return attendanceTriggered;
      } else if (filterType === 'DECLINE') {
        return declineTriggered;
      } else if (filterType === 'AVERAGE') {
        return averageTriggered;
      } else if (filterType === 'ALL') {
        return true;
      }

      return true;
    });
  }, [studentEvaluations, selectedClassId, searchQuery, filterType]);

  const handleAcknowledge = (studentId, studentName) => {
    const updated = {
      ...acknowledgedStudents,
      [studentId]: {
        acknowledgedAt: new Date().toISOString(),
        acknowledgedBy: 'Current Teacher'
      }
    };
    setAcknowledgedStudents(updated);
    localStorage.setItem('classpulse_acknowledged_v1', JSON.stringify(updated));

    recordActivity('Indicator Acknowledged', `Teacher reviewed and acknowledged indicator for ${studentName}.`);
    addToast('Indicator Acknowledged', `Review acknowledged for ${studentName}. Support timeline noted.`, 'success');
  };

  const flaggedTotal = studentEvaluations.filter(e => e.evaluation.triggeredCount > 0).length;
  const multiFactorTotal = studentEvaluations.filter(e => e.evaluation.triggeredCount >= 2).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-[#6D28D9] dark:text-purple-300">
              Core Engine • Transparent Review
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Explainable Risk Indicators
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deterministic, rule-based indicators showing exact measurements, comparison baselines, and pedagogical suggestions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(isTeacher || isAdmin) && (
            <Button
              variant="outline"
              size="sm"
              icon={Sliders}
              onClick={() => navigate('/settings')}
            >
              Configure Thresholds
            </Button>
          )}
        </div>
      </div>

      {/* Safety & Non-punitive Manifesto Alert */}
      <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#6D28D9] dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-900 dark:text-white">
            Ethical Guardrails & Non-Punitive Educational Principles:
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            ClassPulse review indicators are transparent prompts for human teacher investigation—<strong>never</strong> a clinical label, diagnosis, or automated penalty. No high-stakes decisions regarding grading, discipline, or academic tracks are ever automated.
          </p>
        </div>
      </div>

      {/* Active Rules Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Active Rules:
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">
            Attendance &lt; {riskSettings.attendanceThreshold}%
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">
            Assessment Avg &lt; {riskSettings.minimumAverageThreshold}%
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">
            Decline ≥ {riskSettings.declineThreshold} pts
          </span>
        </div>

        <button
          onClick={() => navigate('/settings')}
          className="text-xs font-semibold text-[#6D28D9] dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Adjust in Settings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search flagged learners by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <option value="ALL">All Enrolled Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.className}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <option value="ALL_FLAGGED">All Flagged Learners ({flaggedTotal})</option>
            <option value="MULTI">Multi-Factor Support ({multiFactorTotal})</option>
            <option value="ATTENDANCE">Attendance Triggered</option>
            <option value="DECLINE">Performance Decline</option>
            <option value="AVERAGE">Assessment Baseline</option>
            <option value="ALL">All Students (Including On Track)</option>
          </select>
        </div>
      </div>

      {/* Flagged Student Dossiers List */}
      <div className="space-y-4">
        {filteredEvaluations.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">
              No students match the selected indicator filter
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              All students in this filter are progressing within configured academic parameters.
            </p>
          </div>
        ) : (
          filteredEvaluations.map(item => {
            const { student, metrics, evaluation } = item;
            const ack = acknowledgedStudents[student.id];

            return (
              <div
                key={student.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-[#6D28D9] dark:text-purple-300 font-bold text-xs flex items-center justify-center">
                      {student.displayName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedStudentForModal(student.id)}
                          className="font-bold text-sm text-slate-900 dark:text-white hover:text-[#6D28D9] dark:hover:text-purple-400 text-left transition-colors cursor-pointer"
                        >
                          {student.displayName}
                        </button>
                        <span className="text-xs font-mono px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {student.studentCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Class: {metrics.classInfo?.className || student.classId} • Guardian: {student.guardianContact || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {ack ? (
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Acknowledged by Teacher</span>
                      </span>
                    ) : (
                      (isTeacher || isAdmin) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledge(student.id, student.displayName)}
                        >
                          Acknowledge Indicator
                        </Button>
                      )
                    )}

                    {(isTeacher || isAdmin) && (
                      <Button
                        size="sm"
                        onClick={() => setInterventionStudent(student)}
                      >
                        Create Support Plan
                      </Button>
                    )}
                  </div>
                </div>

                {/* Explainable Indicator Card */}
                <IndicatorExplanationCard
                  evaluation={evaluation}
                  onActionClick={() => setInterventionStudent(student)}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={Boolean(selectedStudentForModal)}
        onClose={() => setSelectedStudentForModal(null)}
        studentId={selectedStudentForModal}
        onAddIntervention={(st) => setInterventionStudent(st)}
      />

      {/* Intervention Modal */}
      <InterventionModal
        isOpen={Boolean(interventionStudent)}
        onClose={() => setInterventionStudent(null)}
        initialStudent={interventionStudent}
      />
    </div>
  );
}
