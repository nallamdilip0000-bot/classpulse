import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { exportToCSV } from '../utils/csvExport';
import { 
  FileSpreadsheet, 
  Download, 
  Filter, 
  CalendarCheck, 
  Award, 
  AlertTriangle, 
  ClipboardList,
  Printer
} from 'lucide-react';
import Button from '../components/common/Button';

export default function Reports() {
  const { isTeacher, isAdmin } = useAuth();
  const { 
    classes, 
    studentEvaluations, 
    interventions, 
    assessments, 
    activeAcademicTerm 
  } = useApp();

  const [reportType, setReportType] = useState('STUDENTS_REQUIRING_REVIEW');
  const [selectedClass, setSelectedClass] = useState('ALL');

  // Filtered dataset for active report
  const reportData = useMemo(() => {
    let list = studentEvaluations;
    if (selectedClass !== 'ALL') {
      list = list.filter(item => item.student.classId === selectedClass);
    }
    return list;
  }, [studentEvaluations, selectedClass]);

  const handleExportCSV = () => {
    let filename = '';
    let title = '';
    let columns = [];
    let data = [];

    if (reportType === 'STUDENTS_REQUIRING_REVIEW') {
      filename = `classpulse_review_indicators_${new Date().toISOString().slice(0, 10)}.csv`;
      title = 'ClassPulse - Learners Flagged for Academic Support Review';
      columns = [
        { key: 'code', label: 'Student ID' },
        { key: 'name', label: 'Full Name' },
        { key: 'classId', label: 'Class ID' },
        { key: 'priority', label: 'Review Priority' },
        { key: 'attendance', label: 'Attendance %' },
        { key: 'score', label: 'Recent Score Avg %' },
        { key: 'trend', label: 'Performance Trend' },
        { key: 'reasons', label: 'Triggered Rules & Rationale' }
      ];
      data = reportData
        .filter(item => item.evaluation.triggeredCount > 0)
        .map(item => ({
          code: item.student.studentCode,
          name: item.student.displayName,
          classId: item.student.classId,
          priority: item.evaluation.priorityLabel,
          attendance: item.metrics.attendanceSummary.percentage,
          score: item.metrics.assessmentSummary.average,
          trend: item.metrics.trendSummary.trend,
          reasons: item.evaluation.explanations.join(' | ')
        }));
    } else if (reportType === 'ATTENDANCE_SUMMARY') {
      filename = `classpulse_attendance_summary_${new Date().toISOString().slice(0, 10)}.csv`;
      title = 'ClassPulse - Cohort Attendance Summary Report';
      columns = [
        { key: 'code', label: 'Student ID' },
        { key: 'name', label: 'Full Name' },
        { key: 'classId', label: 'Class' },
        { key: 'attendance', label: 'Attendance %' },
        { key: 'attended', label: 'Sessions Attended' },
        { key: 'absent', label: 'Absences' },
        { key: 'excused', label: 'Excused Absences' }
      ];
      data = reportData.map(item => ({
        code: item.student.studentCode,
        name: item.student.displayName,
        classId: item.student.classId,
        attendance: item.metrics.attendanceSummary.percentage,
        attended: item.metrics.attendanceSummary.attended,
        absent: item.metrics.attendanceSummary.absent,
        excused: item.metrics.attendanceSummary.excused
      }));
    } else if (reportType === 'INTERVENTIONS_REPORT') {
      filename = `classpulse_interventions_audit_${new Date().toISOString().slice(0, 10)}.csv`;
      title = 'ClassPulse - Academic Support Interventions Audit';
      columns = [
        { key: 'id', label: 'ID' },
        { key: 'studentName', label: 'Student' },
        { key: 'studentId', label: 'Student ID' },
        { key: 'plannedAction', label: 'Planned Action' },
        { key: 'reason', label: 'Trigger Reason' },
        { key: 'status', label: 'Status' },
        { key: 'nextFollowUpDate', label: 'Target Date' },
        { key: 'assignedTeacherName', label: 'Assigned Teacher' },
        { key: 'completionNotes', label: 'Resolution Outcome' }
      ];
      data = interventions;
    }

    exportToCSV({
      filename,
      title,
      columns,
      data,
      metadata: { filterDescription: `Scope: ${selectedClass}, Term: ${activeAcademicTerm}` }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Reports & Export
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate educational performance summaries, compliance documentation, and CSV data exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print Report
          </Button>
          <Button
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Download CSV Export
          </Button>
        </div>
      </div>

      {/* Report Configuration & Filters */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <option value="STUDENTS_REQUIRING_REVIEW">Learners Flagged for Support Review</option>
              <option value="ATTENDANCE_SUMMARY">Classroom Attendance & Participation Summary</option>
              <option value="INTERVENTIONS_REPORT">Interventions & Follow-up Resolution Audit</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Class Cohort
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <option value="ALL">All Authorized Classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.className}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Academic Term: <strong>{activeAcademicTerm}</strong> • Timestamp: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Render Report Preview Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden p-5">
        <div className="pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              {reportType === 'STUDENTS_REQUIRING_REVIEW' && 'Learners Flagged for Academic Support Review'}
              {reportType === 'ATTENDANCE_SUMMARY' && 'Class Attendance & Longitudinal Records'}
              {reportType === 'INTERVENTIONS_REPORT' && 'Intervention Tracking & Resolution Audit'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Fictional demonstration records for challenge review. Private teacher notes are excluded.
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-[#6D28D9] dark:text-purple-300">
            Official Ministry Export Format
          </span>
        </div>

        <div className="overflow-x-auto">
          {reportType === 'STUDENTS_REQUIRING_REVIEW' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Attendance</th>
                  <th className="py-2.5 px-3">Score Avg</th>
                  <th className="py-2.5 px-3">Trend</th>
                  <th className="py-2.5 px-3">Triggered Rules</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reportData.filter(i => i.evaluation.triggeredCount > 0).map(item => (
                  <tr key={item.student.id}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {item.student.displayName} ({item.student.studentCode})
                    </td>
                    <td className="py-2.5 px-3">{item.student.classId}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-600">
                      {item.metrics.attendanceSummary.percentage}%
                    </td>
                    <td className="py-2.5 px-3 font-bold">
                      {item.metrics.assessmentSummary.average !== null ? `${item.metrics.assessmentSummary.average}%` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-bold">
                      {item.metrics.trendSummary.trend}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {item.evaluation.explanations.join(' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'ATTENDANCE_SUMMARY' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Student Code</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Attendance %</th>
                  <th className="py-2.5 px-3">Attended</th>
                  <th className="py-2.5 px-3">Absences</th>
                  <th className="py-2.5 px-3">Excused</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reportData.map(item => (
                  <tr key={item.student.id}>
                    <td className="py-2.5 px-3 font-mono">{item.student.studentCode}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{item.student.displayName}</td>
                    <td className="py-2.5 px-3">{item.student.classId}</td>
                    <td className="py-2.5 px-3 font-bold">{item.metrics.attendanceSummary.percentage}%</td>
                    <td className="py-2.5 px-3">{item.metrics.attendanceSummary.attended}</td>
                    <td className="py-2.5 px-3 text-rose-600">{item.metrics.attendanceSummary.absent}</td>
                    <td className="py-2.5 px-3 text-blue-600">{item.metrics.attendanceSummary.excused}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'INTERVENTIONS_REPORT' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Planned Action</th>
                  <th className="py-2.5 px-3">Trigger Reason</th>
                  <th className="py-2.5 px-3">Target Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Resolution Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {interventions.map(item => (
                  <tr key={item.id}>
                    <td className="py-2.5 px-3 font-mono">{item.id}</td>
                    <td className="py-2.5 px-3 font-semibold">{item.studentName}</td>
                    <td className="py-2.5 px-3 font-medium text-purple-700 dark:text-purple-300">{item.plannedActionLabel || item.plannedAction}</td>
                    <td className="py-2.5 px-3 text-slate-500">{item.reason}</td>
                    <td className="py-2.5 px-3">{item.nextFollowUpDate}</td>
                    <td className="py-2.5 px-3 font-bold uppercase text-[10px]">{item.status}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{item.completionNotes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
