import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import IndicatorExplanationCard from '../components/indicators/IndicatorExplanationCard';
import InterventionModal from '../components/interventions/InterventionModal';
import { TrendBadge, FollowUpStatusBadge } from '../components/students/IndicatorBadge';
import { 
  ArrowLeft, 
  Calendar, 
  Award, 
  Plus, 
  Lock, 
  Eye, 
  FileText, 
  Clock, 
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import Button from '../components/common/Button';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getStudentMetrics, updateInterventionStatus, theme } = useApp();
  const { isTeacher, isAdmin, isStudent } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const data = getStudentMetrics(id);

  if (!data) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Student Not Found</h2>
        <p className="text-xs text-slate-500">The requested student ID ({id}) was not found in active records.</p>
        <Button onClick={() => navigate('/students')} size="sm">
          Return to Students
        </Button>
      </div>
    );
  }

  const {
    student,
    classInfo,
    attendanceSummary,
    studentAttendance,
    validAssessments,
    assessmentSummary,
    trendSummary,
    evaluation,
    interventions
  } = data;

  const isDark = theme === 'dark';

  const chartPoints = validAssessments.map(a => ({
    date: a.assessmentDate.slice(5),
    fullDate: a.assessmentDate,
    title: a.assessmentTitle,
    score: a.percentage
  }));

  const handleComplete = (intId) => {
    updateInterventionStatus(intId, 'completed', resolutionNotes || 'Support follow-up completed.');
    setResolvingId(null);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/students')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Directory</span>
        </button>
      </div>

      {/* Main Student Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#6D28D9] text-white font-extrabold text-lg flex items-center justify-center shadow-lg shadow-purple-600/20">
            {student.displayName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {student.displayName}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {student.studentCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Class: <strong>{classInfo?.className || student.classId}</strong> • Guardian: {student.guardianContact || 'None on file'}
            </p>
          </div>
        </div>

        {(isTeacher || isAdmin) && (
          <Button
            size="sm"
            icon={Plus}
            onClick={() => setShowInterventionModal(true)}
          >
            Create Support Action
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview & Indicators' },
          { id: 'attendance', label: `Attendance (${attendanceSummary.percentage}%)` },
          { id: 'assessments', label: `Assessments (${validAssessments.length})` },
          { id: 'interventions', label: `Support Records (${interventions.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-5 -mb-px border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#6D28D9] text-[#6D28D9] dark:text-purple-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Attendance Rate</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {attendanceSummary.percentage}%
              </p>
              <span className="text-xs text-slate-400">
                {attendanceSummary.attended}/{attendanceSummary.totalEligible} sessions attended
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Assessment Average</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {assessmentSummary.average !== null ? `${assessmentSummary.average}%` : 'N/A'}
              </p>
              <span className="text-xs text-slate-400">
                {assessmentSummary.count} completed assessments
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Score Trend</span>
              <div className="mt-1">
                <TrendBadge trendSummary={trendSummary} />
              </div>
              <span className="text-xs text-slate-400 block mt-1">
                {trendSummary.description}
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Review Status</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {evaluation.priorityLabel}
              </p>
              <span className="text-xs text-slate-400">
                {evaluation.triggeredCount} rules triggered
              </span>
            </div>
          </div>

          {/* Explainable review card */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Explainable Review Dossier
            </h3>
            <IndicatorExplanationCard
              evaluation={evaluation}
              onActionClick={() => setShowInterventionModal(true)}
            />
          </div>
        </div>
      )}

      {/* Other tabs follow same structure */}
      {activeTab === 'attendance' && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/50 text-xs">
            <strong>Attendance Formula:</strong> {attendanceSummary.formula}
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {studentAttendance.slice().reverse().map(rec => (
                <tr key={rec.id}>
                  <td className="py-2.5 px-3 font-semibold">{rec.date}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-slate-100 dark:bg-slate-800">
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{rec.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'assessments' && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Marks</th>
                <th className="py-2.5 px-3">Normalized %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {validAssessments.map(asm => (
                <tr key={asm.id}>
                  <td className="py-2.5 px-3 text-slate-500">{asm.assessmentDate}</td>
                  <td className="py-2.5 px-3 font-semibold">{asm.assessmentTitle}</td>
                  <td className="py-2.5 px-3 text-slate-500">{asm.subject}</td>
                  <td className="py-2.5 px-3 font-mono">{asm.marksObtained} / {asm.maximumMarks}</td>
                  <td className="py-2.5 px-3 font-bold text-[#6D28D9]">{asm.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'interventions' && (
        <div className="space-y-3">
          {interventions.map(item => (
            <div key={item.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {item.plannedActionLabel || item.plannedAction}
                </span>
                <FollowUpStatusBadge status={item.status} />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <strong>Reason:</strong> {item.reason}
              </p>
              {!isStudent && item.privateTeacherNotes && (
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-300">
                  <span className="font-semibold block mb-0.5">Private Staff Note:</span>
                  {item.privateTeacherNotes}
                </div>
              )}
              {item.studentFeedback && (
                <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-xs text-purple-900 dark:text-purple-300">
                  <span className="font-semibold block mb-0.5">Feedback:</span>
                  {item.studentFeedback}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Intervention Modal */}
      <InterventionModal
        isOpen={showInterventionModal}
        onClose={() => setShowInterventionModal(false)}
        initialStudent={student}
      />
    </div>
  );
}
