import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import IndicatorExplanationCard from '../indicators/IndicatorExplanationCard';
import { TrendBadge, FollowUpStatusBadge } from './IndicatorBadge';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Calendar, 
  Award, 
  Clock, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Lock, 
  Eye, 
  FileText,
  Activity
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function StudentProfileModal({
  isOpen,
  onClose,
  studentId,
  onAddIntervention
}) {
  const { getStudentMetrics, updateInterventionStatus, theme } = useApp();
  const { isTeacher, isAdmin, isStudent } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // overview, attendance, assessments, interventions
  const [resolvingInterventionId, setResolvingInterventionId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  if (!isOpen || !studentId) return null;

  const data = getStudentMetrics(studentId);
  if (!data) return null;

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

  // Format chart points
  const assessmentChartData = validAssessments.map(a => ({
    date: a.assessmentDate.slice(5),
    fullDate: a.assessmentDate,
    title: a.assessmentTitle,
    score: a.percentage
  }));

  const handleCompleteIntervention = (id) => {
    updateInterventionStatus(id, 'completed', resolutionNotes || 'Completed with teacher review.');
    setResolvingInterventionId(null);
    setResolutionNotes('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${student.displayName} (${student.studentCode})`}
      subtitle={`${classInfo?.className || student.classId} • Academic Support Profile`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-5">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#6D28D9] text-white font-bold text-base flex items-center justify-center shadow-md shadow-purple-600/20">
              {student.displayName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {student.displayName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                DOB: {student.dateOfBirth || '2010-01-01'} • Guardian: {student.guardianContact || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(isTeacher || isAdmin) && (
              <Button
                size="sm"
                icon={Plus}
                onClick={() => {
                  onClose();
                  onAddIntervention(student);
                }}
              >
                Log Support Plan
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
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
              className={`py-2.5 px-4 -mb-px border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#6D28D9] text-[#6D28D9] dark:text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview & Explainable Indicators */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Attendance</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {attendanceSummary.percentage}%
                </p>
                <span className="text-[10px] text-slate-400">
                  {attendanceSummary.attended}/{attendanceSummary.totalEligible} attended
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Assessment Avg</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {assessmentSummary.average !== null ? `${assessmentSummary.average}%` : 'N/A'}
                </p>
                <span className="text-[10px] text-slate-400">
                  {assessmentSummary.count} tests evaluated
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Recent Trend</span>
                <div className="mt-1">
                  <TrendBadge trendSummary={trendSummary} />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {trendSummary.description}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Support Status</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {evaluation.priorityLabel}
                </p>
                <span className="text-[10px] text-slate-400">
                  {evaluation.triggeredCount} rules triggered
                </span>
              </div>
            </div>

            {/* Explainable Review Indicators */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Explainable Risk Review & Recommendation
              </h4>
              <IndicatorExplanationCard
                evaluation={evaluation}
                onActionClick={() => {
                  onClose();
                  onAddIntervention(student);
                }}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Attendance Details */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/50 text-xs">
              <span className="font-semibold text-purple-900 dark:text-purple-300">Attendance Calculation Formula:</span>
              <p className="font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                {attendanceSummary.formula || 'Attendance Percentage = (Classes Attended / Total Eligible Classes) × 100'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                * Medically/institutionally excused absences ({attendanceSummary.excused}) are exempted and do not penalize the student.
              </p>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
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
                      <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">
                        {rec.date}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          rec.status === 'present'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : rec.status === 'excused'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {rec.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400">
                        {rec.recordedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Assessment Scores & Trend Chart */}
        {activeTab === 'assessments' && (
          <div className="space-y-4">
            {/* Mini Trend Chart */}
            {assessmentChartData.length > 1 && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Performance Progression Chart
                </h5>
                <div className="w-full h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={assessmentChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} />
                      <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white text-xs p-2 rounded-lg">
                                <p className="font-semibold">{d.title}</p>
                                <p className="text-emerald-400 font-bold">{d.score}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line type="monotone" dataKey="score" stroke="#6D28D9" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Assessment Records Table */}
            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Assessment Title</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Raw Score</th>
                    <th className="py-2.5 px-3">Normalized %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {validAssessments.map(asm => (
                    <tr key={asm.id}>
                      <td className="py-2 px-3 text-slate-500">{asm.assessmentDate}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                        {asm.assessmentTitle}
                      </td>
                      <td className="py-2 px-3 text-slate-500">{asm.subject}</td>
                      <td className="py-2 px-3 font-mono">
                        {asm.marksObtained} / {asm.maximumMarks}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`font-bold ${asm.percentage < 40 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                          {asm.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Interventions & Support Records */}
        {activeTab === 'interventions' && (
          <div className="space-y-3">
            {interventions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No active or historical support interventions recorded for this student.
              </div>
            ) : (
              interventions.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.plannedActionLabel || item.plannedAction}
                    </span>
                    <FollowUpStatusBadge status={item.status} />
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <strong>Reason:</strong> {item.reason}
                  </p>

                  {/* Private Staff Note */}
                  {!isStudent && item.privateTeacherNotes && (
                    <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300">
                      <div className="flex items-center gap-1 font-semibold mb-0.5">
                        <Lock className="w-3 h-3" />
                        <span>Private Staff Note:</span>
                      </div>
                      <p>{item.privateTeacherNotes}</p>
                    </div>
                  )}

                  {/* Student Facing Feedback */}
                  {item.studentFeedback && (
                    <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-300">
                      <div className="flex items-center gap-1 font-semibold mb-0.5">
                        <Eye className="w-3 h-3" />
                        <span>Student Portal Guidance:</span>
                      </div>
                      <p>{item.studentFeedback}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-400 border-t border-slate-200/60 dark:border-slate-800">
                    <span>Target Date: {item.nextFollowUpDate} • Assigned to: {item.assignedTeacherName}</span>

                    {/* Completion actions */}
                    {(isTeacher || isAdmin) && item.status !== 'completed' && (
                      <div className="flex items-center gap-2">
                        {resolvingInterventionId === item.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Resolution outcome..."
                              value={resolutionNotes}
                              onChange={(e) => setResolutionNotes(e.target.value)}
                              className="px-2 py-1 bg-white dark:bg-slate-900 border rounded text-xs"
                            />
                            <Button size="sm" onClick={() => handleCompleteIntervention(item.id)}>
                              Confirm
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setResolvingInterventionId(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setResolvingInterventionId(item.id)}
                          >
                            Mark Completed
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
