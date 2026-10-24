import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { calculateAttendancePercentage } from '../utils/attendanceCalculations';
import { exportToCSV } from '../utils/csvExport';
import { 
  CalendarCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Save, 
  Download, 
  Users, 
  Info,
  Calendar,
  ShieldCheck,
  Lock
} from 'lucide-react';
import Button from '../components/common/Button';

export default function Attendance() {
  const { isStudent, isTeacher, isAdmin } = useAuth();
  const { 
    classes, 
    authorizedStudents, 
    attendanceRecords, 
    recordAttendanceBatch,
    selectedClassId
  } = useApp();

  const [selectedClass, setSelectedClass] = useState(() => {
    return selectedClassId !== 'ALL' ? selectedClassId : (classes[0]?.id || 'CLS-10A');
  });

  const todayStr = '2026-10-23';
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Filter students for the selected class (auto-scoped for student accounts)
  const classStudents = useMemo(() => {
    return authorizedStudents.filter(s => s.classId === selectedClass);
  }, [authorizedStudents, selectedClass]);

  // Map of student attendance on selectedDate
  const [dailyStatuses, setDailyStatuses] = useState(() => {
    const map = {};
    attendanceRecords
      .filter(r => r.classId === selectedClass && r.date === selectedDate)
      .forEach(r => {
        map[r.studentId] = r.status;
      });
    return map;
  });

  // Re-sync when class or date changes
  useMemo(() => {
    const map = {};
    attendanceRecords
      .filter(r => r.classId === selectedClass && r.date === selectedDate)
      .forEach(r => {
        map[r.studentId] = r.status;
      });
    setDailyStatuses(map);
  }, [selectedClass, selectedDate, attendanceRecords]);

  // Status changes only permitted for faculty and administrators
  const handleStatusChange = (studentId, status) => {
    if (isStudent) return; // Strict lock for student users
    setDailyStatuses(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status) => {
    if (isStudent) return;
    const updated = {};
    classStudents.forEach(s => {
      updated[s.id] = status;
    });
    setDailyStatuses(updated);
  };

  const handleSaveAttendance = () => {
    if (isStudent) return;
    const recordsToSave = classStudents.map(student => ({
      studentId: student.id,
      classId: selectedClass,
      date: selectedDate,
      status: dailyStatuses[student.id] || 'present'
    }));

    recordAttendanceBatch(recordsToSave);
  };

  // Class Overall Attendance Rate calculation
  const classOverallAttendance = useMemo(() => {
    const records = attendanceRecords.filter(r => r.classId === selectedClass);
    return calculateAttendancePercentage(records);
  }, [attendanceRecords, selectedClass]);

  // Student's full longitudinal attendance records
  const myAttendanceHistory = useMemo(() => {
    if (!isStudent || !classStudents[0]) return [];
    const studentId = classStudents[0].id;
    return attendanceRecords
      .filter(r => r.studentId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [isStudent, classStudents, attendanceRecords]);

  // Export class attendance to CSV
  const handleExportCSV = () => {
    const columns = [
      { key: 'studentCode', label: 'Student Code' },
      { key: 'displayName', label: 'Full Name' },
      { key: 'percentage', label: 'Attendance %' },
      { key: 'attended', label: 'Attended' },
      { key: 'absent', label: 'Absences' },
      { key: 'excused', label: 'Excused' }
    ];

    const data = classStudents.map(st => {
      const records = attendanceRecords.filter(r => r.studentId === st.id);
      const calc = calculateAttendancePercentage(records);
      return {
        studentCode: st.studentCode,
        displayName: st.displayName,
        percentage: calc.percentage,
        attended: calc.attended,
        absent: calc.absent,
        excused: calc.excused
      };
    });

    exportToCSV({
      filename: `attendance_${selectedClass}_${selectedDate}.csv`,
      title: `ClassPulse Attendance Report - ${selectedClass}`,
      columns,
      data,
      metadata: { filterDescription: `Class: ${selectedClass}, Date: ${selectedDate}` }
    });
  };

  const currentClassObj = classes.find(c => c.id === selectedClass);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isStudent ? 'My Attendance Record' : 'Attendance Management'}
            </h1>
            {isStudent && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <Lock className="w-3 h-3" />
                Read-Only
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isStudent
              ? 'View your verified classroom attendance percentage, session attendance records, and excused absence exemptions.'
              : 'Record daily classroom participation, inspect longitudinal trends, and review transparent attendance percentages.'
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          {(isTeacher || isAdmin) && (
            <Button
              size="sm"
              icon={Save}
              onClick={handleSaveAttendance}
            >
              Save Attendance
            </Button>
          )}
        </div>
      </div>

      {/* Security & Integrity Banner for Students */}
      {isStudent && (
        <div className="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/50 text-xs flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="font-bold text-slate-900 dark:text-white">
              Official Institutional Attendance Record:
            </span>
            <span className="text-slate-600 dark:text-slate-300 ml-1">
              Classroom attendance is taken, verified, and locked by your faculty instructors. Student accounts cannot modify or tamper with attendance records.
            </span>
          </div>
        </div>
      )}

      {/* Educational Attendance Policy Notice Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-[#6D28D9] dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-900 dark:text-white">
            Transparent Educational Attendance Policy:
          </span>
          <p className="text-slate-600 dark:text-slate-300">
            Formula: <code className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800 font-mono text-[#6D28D9] dark:text-purple-300 font-bold">Attendance % = (Attended / (Attended + Absent)) × 100</code>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            * <strong>Excused Absences</strong> (medical exemptions or sanctioned school events) are excluded from total eligible classes and do not penalize the learner. Zero eligible classes returns 100% safely without division by zero.
          </p>
        </div>
      </div>

      {/* Controls Bar: Class, Date, Batch Actions */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Select or Badge */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              {isStudent ? 'Enrolled Cohort' : 'Select Class'}
            </label>
            {isTeacher || isAdmin ? (
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.className} ({c.section})
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {currentClassObj ? `${currentClassObj.className} (${currentClassObj.section})` : 'Grade 10 - Section A (A)'}
              </div>
            )}
          </div>

          {/* Date Select */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Session Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Batch Actions for Teachers / Admins ONLY */}
        {(isTeacher || isAdmin) && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Batch:</span>
            <button
              onClick={() => handleMarkAll('present')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
            >
              All Present
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-100 transition-colors"
            >
              All Absent
            </button>
          </div>
        )}
      </div>

      {/* Roster Attendance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {isStudent ? 'My Enrolled Record' : `Enrolled Students (${classStudents.length})`}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Class Cohort Rate: <strong className="text-[#6D28D9] dark:text-purple-400">{classOverallAttendance.percentage}%</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-3">Historical Rate</th>
                <th className="py-3 px-3">Attended / Eligible</th>
                <th className="py-3 px-4 text-right">
                  {isStudent ? `Session Status (${selectedDate})` : `Session Status (${selectedDate})`}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {classStudents.map(student => {
                const studentHist = attendanceRecords.filter(r => r.studentId === student.id);
                const calc = calculateAttendancePercentage(studentHist);
                const currentStatus = dailyStatuses[student.id] || 'present';

                return (
                  <tr key={student.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center">
                          {student.displayName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {student.displayName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {student.studentCode}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`text-xs font-bold ${
                        calc.percentage < 75 
                          ? 'text-amber-600 dark:text-amber-400 font-extrabold' 
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {calc.percentage}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-xs text-slate-500 dark:text-slate-400">
                      {calc.attended} / {calc.totalEligible} ({calc.excused} excused)
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isTeacher || isAdmin ? (
                        /* Faculty / Administrator Interactive Controls */
                        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'present')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'absent')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'excused')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                              currentStatus === 'excused'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      ) : (
                        /* Student Portal Read-Only Status Indicator */
                        <div className="inline-flex items-center justify-end">
                          {currentStatus === 'present' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 select-none">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              Present
                            </span>
                          )}
                          {currentStatus === 'absent' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 select-none">
                              <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                              Absent
                            </span>
                          )}
                          {currentStatus === 'excused' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 select-none">
                              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              Excused Absence
                            </span>
                          )}
                          {!['present', 'absent', 'excused'].includes(currentStatus) && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 select-none">
                              Not Recorded
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Longitudinal Session Log */}
      {isStudent && myAttendanceHistory.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                My Verified Session Logs (Recent Sessions)
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total Recorded: {myAttendanceHistory.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-3">Session Description</th>
                  <th className="py-2.5 px-3">Verification</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {myAttendanceHistory.slice(0, 10).map((record) => (
                  <tr key={record.id || `${record.studentId}-${record.date}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {record.date}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-300">
                      Standard Scheduled Lecture Session
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-400">
                      Verified by Class Faculty
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {record.status === 'present' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 select-none">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Present
                        </span>
                      )}
                      {record.status === 'absent' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 select-none">
                          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          Absent
                        </span>
                      )}
                      {record.status === 'excused' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 select-none">
                          <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          Excused
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
