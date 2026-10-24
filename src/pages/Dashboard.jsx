import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import SummaryCard from '../components/dashboard/SummaryCard';
import AttendanceTrendChart from '../components/dashboard/AttendanceTrendChart';
import AssessmentTrendChart from '../components/dashboard/AssessmentTrendChart';
import ClassComparisonChart from '../components/dashboard/ClassComparisonChart';
import ScoreDistributionChart from '../components/dashboard/ScoreDistributionChart';
import IndicatorBreakdownChart from '../components/dashboard/IndicatorBreakdownChart';
import StudentProfileModal from '../components/students/StudentProfileModal';
import InterventionModal from '../components/interventions/InterventionModal';
import { ReviewStatusBadge } from '../components/students/IndicatorBadge';
import { 
  Users, 
  CalendarCheck, 
  Award, 
  AlertTriangle, 
  ClipboardList, 
  TrendingUp, 
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import Button from '../components/common/Button';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isStudent, currentUser } = useAuth();
  const { 
    classes, 
    authorizedStudents, 
    studentEvaluations, 
    summaryMetrics,
    attendanceRecords,
    assessments,
    assessmentResults,
    interventions,
    activityLog,
    selectedClassId,
    setSelectedClassId
  } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [interventionStudent, setInterventionStudent] = useState(null);

  // Filtered flagged students
  const flaggedStudents = studentEvaluations
    .filter(e => e.evaluation.triggeredCount > 0)
    .slice(0, 5);

  // Recent interventions
  const recentInterventions = interventions.slice(0, 4);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#4F46E5] text-white shadow-xl shadow-purple-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
              Educational SaaS Platform
            </span>
            <span className="text-[11px] text-purple-200">
              IC26-02-02 • Ministry of Education
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Welcome back, {currentUser?.displayName}
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 mt-1 max-w-2xl leading-relaxed">
            ClassPulse combines attendance patterns and assessment trajectories to flag learners who may benefit from early teacher support—with explainable indicators and teacher-controlled follow-up.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/indicators')}
            className="bg-white text-[#6D28D9] hover:bg-purple-50 shadow-sm"
          >
            Review Indicators ({summaryMetrics.flaggedCount})
          </Button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cohort Scope:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Authorized Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.className} ({c.section})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Active Roster: <strong className="text-slate-800 dark:text-slate-200">{summaryMetrics.totalStudents}</strong> learners evaluated
        </div>
      </div>

      {/* 6 Key Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <SummaryCard
          title="Total Students"
          value={summaryMetrics.totalStudents}
          subtitle="Enrolled in active scope"
          icon={Users}
          colorScheme="purple"
          onClick={() => navigate('/students')}
        />
        <SummaryCard
          title="Active Classes"
          value={summaryMetrics.activeClassesCount}
          subtitle="Assigned sections"
          icon={CalendarCheck}
          colorScheme="blue"
          onClick={() => navigate('/students')}
        />
        <SummaryCard
          title="Avg Attendance"
          value={`${summaryMetrics.avgAttendance}%`}
          subtitle="Attended / Eligible"
          icon={CalendarCheck}
          colorScheme="emerald"
          badgeText={summaryMetrics.avgAttendance >= 75 ? 'Healthy' : 'Needs Focus'}
          onClick={() => navigate('/attendance')}
        />
        <SummaryCard
          title="Avg Assessment"
          value={`${summaryMetrics.avgScore}%`}
          subtitle="Across all valid tests"
          icon={Award}
          colorScheme="purple"
          onClick={() => navigate('/assessments')}
        />
        <SummaryCard
          title="Flagged for Review"
          value={summaryMetrics.flaggedCount}
          subtitle="Support recommended"
          icon={AlertTriangle}
          colorScheme="amber"
          badgeText="Rule-based"
          onClick={() => navigate('/indicators')}
        />
        <SummaryCard
          title="Pending Follow-ups"
          value={summaryMetrics.pendingFollowUps}
          subtitle="Active intervention plans"
          icon={ClipboardList}
          colorScheme="rose"
          onClick={() => navigate('/interventions')}
        />
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Line/Area */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Attendance Trajectory Over Time
              </h3>
              <p className="text-xs text-slate-400">
                Daily attendance rate across the recent 20 school sessions
              </p>
            </div>
            <button
              onClick={() => navigate('/attendance')}
              className="text-xs font-medium text-[#6D28D9] dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>View Grid</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <AttendanceTrendChart filteredRecords={attendanceRecords} />
        </div>

        {/* Assessment Performance Trend */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Assessment Performance Progression
              </h3>
              <p className="text-xs text-slate-400">
                Average normalized score percentage across curriculum evaluations
              </p>
            </div>
            <button
              onClick={() => navigate('/assessments')}
              className="text-xs font-medium text-[#6D28D9] dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>View Tests</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <AssessmentTrendChart
            assessments={assessments}
            assessmentResults={assessmentResults}
          />
        </div>
      </div>

      {/* Secondary Visualizations: Class Comparison, Score Distribution, Risk Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Class Comparison */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Class-wise Comparison
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Attendance % vs Assessment Avg by section
          </p>
          <ClassComparisonChart
            classes={classes}
            studentEvaluations={studentEvaluations}
          />
        </div>

        {/* Score Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Score Distribution Tier
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Count of students across academic benchmarks
          </p>
          <ScoreDistributionChart studentEvaluations={studentEvaluations} />
        </div>

        {/* Review Indicator Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Indicator Triggers
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Breakdown of triggered support rules
          </p>
          <IndicatorBreakdownChart studentEvaluations={studentEvaluations} />
        </div>
      </div>

      {/* Bottom Section: Learners Flagged for Review & Recent Follow-up Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flagged Students Dossier */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Learners Needing Early Review</span>
              </h3>
              <p className="text-xs text-slate-400">
                Showing top flagged students based on transparent rules
              </p>
            </div>
            <button
              onClick={() => navigate('/indicators')}
              className="text-xs font-semibold text-[#6D28D9] dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>See All ({summaryMetrics.flaggedCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {flaggedStudents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              All students are currently on track within configured thresholds.
            </div>
          ) : (
            <div className="space-y-3">
              {flaggedStudents.map(item => {
                const { student, metrics, evaluation } = item;
                return (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800/60 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-purple-50/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {student.displayName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {student.studentCode} • {metrics.classInfo?.className || student.classId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                        {evaluation.summaryText}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <ReviewStatusBadge
                        status={evaluation.status}
                        triggeredCount={evaluation.triggeredCount}
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInterventionStudent(student);
                        }}
                      >
                        Follow up
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Support Activities & Audit Log */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Recent Teacher Follow-up Activities</span>
              </h3>
              <p className="text-xs text-slate-400">
                Audit trail of pedagogical interventions and log updates
              </p>
            </div>
            <button
              onClick={() => navigate('/interventions')}
              className="text-xs font-semibold text-[#6D28D9] dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>View Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activityLog.slice(0, 5).map(act => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {act.action}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {act.details}
                </p>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium block mt-1">
                  By {act.user}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={Boolean(selectedStudentId)}
        onClose={() => setSelectedStudentId(null)}
        studentId={selectedStudentId}
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
