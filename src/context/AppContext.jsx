import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { storageService } from '../services/storageService';
import { calculateAttendancePercentage, calculateAttendanceTrend } from '../utils/attendanceCalculations';
import { getValidAssessments, calculateAssessmentAverage, calculateAssessmentTrend } from '../utils/assessmentCalculations';
import { evaluateStudentSupportIndicators, DEFAULT_RISK_SETTINGS } from '../utils/riskRules';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { currentUser, isAdmin, isTeacher, isStudent } = useAuth();

  // Storage initialization
  useEffect(() => {
    storageService.initialize();
  }, []);

  // Core State
  const [classes, setClasses] = useState(() => storageService.getClasses());
  const [students, setStudents] = useState(() => storageService.getStudents());
  const [assessments, setAssessments] = useState(() => storageService.getAssessments());
  const [assessmentResults, setAssessmentResults] = useState(() => storageService.getAssessmentResults());
  const [attendanceRecords, setAttendanceRecords] = useState(() => storageService.getAttendanceRecords());
  const [interventions, setInterventions] = useState(() => storageService.getInterventions());
  const [riskSettings, setRiskSettings] = useState(() => storageService.getRiskSettings());
  const [notifications, setNotifications] = useState(() => storageService.getNotifications());
  const [activityLog, setActivityLog] = useState(() => storageService.getActivityLog());

  // App UI State
  const [activeAcademicTerm, setActiveAcademicTerm] = useState('Fall 2026');
  const [selectedClassId, setSelectedClassId] = useState('ALL');
  const [theme, setTheme] = useState(() => localStorage.getItem('classpulse_theme') || 'light');
  const [toasts, setToasts] = useState([]);

  // Synchronize students and classes when user session changes or custom registrations happen
  useEffect(() => {
    setStudents(storageService.getStudents());
    setClasses(storageService.getClasses());
  }, [currentUser]);

  // Toast System
  const addToast = useCallback((title, message, type = 'info', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast = { id, title, message, type, duration };
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Theme Toggle
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('classpulse_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Log activity helper
  const recordActivity = useCallback((action, details) => {
    const entry = {
      id: `ACT-${Date.now()}`,
      action,
      details,
      timestamp: new Date().toISOString(),
      user: currentUser?.displayName || 'Authorized User'
    };
    setActivityLog(prev => {
      const updated = [entry, ...prev].slice(0, 50);
      storageService.saveActivityLog(updated);
      return updated;
    });
  }, [currentUser]);

  // Assessments lookup map
  const assessmentsMap = useMemo(() => {
    const map = {};
    for (const a of assessments) {
      map[a.id] = a;
    }
    return map;
  }, [assessments]);

  // Classes lookup map
  const classesMap = useMemo(() => {
    const map = {};
    for (const c of classes) {
      map[c.id] = c;
    }
    return map;
  }, [classes]);

  // Calculations for a specific student
  const getStudentMetrics = useCallback((studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return null;

    const studentAttendance = attendanceRecords.filter(r => r.studentId === studentId);
    const attendanceSummary = calculateAttendancePercentage(studentAttendance);

    const studentResults = assessmentResults.filter(r => r.studentId === studentId);
    const validAssessments = getValidAssessments(studentResults, assessmentsMap);
    const assessmentSummary = calculateAssessmentAverage(validAssessments);
    const trendSummary = calculateAssessmentTrend(validAssessments);

    const evaluation = evaluateStudentSupportIndicators(
      student,
      attendanceSummary,
      assessmentSummary,
      trendSummary,
      riskSettings
    );

    const studentInterventions = interventions.filter(i => i.studentId === studentId);

    return {
      student,
      classInfo: classesMap[student.classId],
      attendanceSummary,
      studentAttendance,
      validAssessments,
      assessmentSummary,
      trendSummary,
      evaluation,
      interventions: studentInterventions
    };
  }, [students, attendanceRecords, assessmentResults, assessmentsMap, classesMap, riskSettings, interventions]);

  // Filter students based on role permissions
  const authorizedStudents = useMemo(() => {
    if (isAdmin) return students;
    if (isTeacher) {
      const allowedClassIds = currentUser?.assignedClassIds || [];
      return students.filter(s => allowedClassIds.includes(s.classId));
    }
    if (isStudent) {
      return students.filter(s => s.id === currentUser?.studentId);
    }
    return [];
  }, [students, currentUser, isAdmin, isTeacher, isStudent]);

  // Evaluated indicators for authorized students
  const studentEvaluations = useMemo(() => {
    return authorizedStudents.map(student => {
      const metrics = getStudentMetrics(student.id);
      return {
        student,
        metrics,
        evaluation: metrics.evaluation
      };
    });
  }, [authorizedStudents, getStudentMetrics]);

  // Summary Metrics for Dashboard
  const summaryMetrics = useMemo(() => {
    const totalStudents = authorizedStudents.length;
    const activeClassesCount = isAdmin 
      ? classes.length 
      : (currentUser?.assignedClassIds || []).length;

    // Filter student records if a specific class is selected
    const filteredEvaluations = selectedClassId === 'ALL'
      ? studentEvaluations
      : studentEvaluations.filter(e => e.student.classId === selectedClassId);

    let totalAttPctSum = 0;
    let attCount = 0;
    let totalScoreSum = 0;
    let scoreCount = 0;
    let flaggedCount = 0;

    filteredEvaluations.forEach(item => {
      if (item.metrics.attendanceSummary.hasData) {
        totalAttPctSum += item.metrics.attendanceSummary.percentage;
        attCount++;
      }
      if (item.metrics.assessmentSummary.hasData && item.metrics.assessmentSummary.average !== null) {
        totalScoreSum += item.metrics.assessmentSummary.average;
        scoreCount++;
      }
      if (item.evaluation.triggeredCount > 0) {
        flaggedCount++;
      }
    });

    const avgAttendance = attCount > 0 ? Math.round((totalAttPctSum / attCount) * 10) / 10 : 0;
    const avgScore = scoreCount > 0 ? Math.round((totalScoreSum / scoreCount) * 10) / 10 : 0;

    // Interventions summary
    const filteredStudentIds = new Set(filteredEvaluations.map(e => e.student.id));
    const activeInterventions = interventions.filter(i => filteredStudentIds.has(i.studentId));
    const pendingFollowUps = activeInterventions.filter(i => i.status === 'pending' || i.status === 'in_progress').length;
    const completedFollowUps = activeInterventions.filter(i => i.status === 'completed').length;

    return {
      totalStudents: filteredEvaluations.length,
      activeClassesCount,
      avgAttendance,
      avgScore,
      flaggedCount,
      pendingFollowUps,
      completedFollowUps
    };
  }, [authorizedStudents, studentEvaluations, selectedClassId, isAdmin, classes, currentUser, interventions]);

  // Actions: Add/Update Attendance
  const recordAttendanceBatch = useCallback((recordsToUpsert) => {
    if (isStudent) {
      addToast('Action Prohibited', 'Students are not authorized to record or modify attendance.', 'warning');
      return;
    }

    setAttendanceRecords(prev => {
      const recordMap = new Map();
      prev.forEach(r => recordMap.set(`${r.studentId}-${r.date}`, r));
      recordsToUpsert.forEach(r => recordMap.set(`${r.studentId}-${r.date}`, r));

      const updated = Array.from(recordMap.values());
      storageService.saveAttendanceRecords(updated);
      return updated;
    });

    recordActivity(
      'Attendance Batch Logged',
      `Updated attendance for ${recordsToUpsert.length} student sessions.`
    );
    addToast('Attendance Saved', 'Daily attendance records updated successfully.', 'success');
  }, [isStudent, recordActivity, addToast]);

  // Actions: Create Assessment
  const addAssessment = useCallback((assessmentData) => {
    const id = `ASM-${Date.now().toString().slice(-5)}`;
    const newAssessment = {
      id,
      ...assessmentData,
      academicTerm: activeAcademicTerm,
      createdBy: currentUser?.id || 'USR-TEA-01'
    };

    setAssessments(prev => {
      const updated = [...prev, newAssessment];
      storageService.saveAssessments(updated);
      return updated;
    });

    recordActivity(
      'Assessment Created',
      `Created assessment "${newAssessment.title}" (${newAssessment.subject}).`
    );
    addToast('Assessment Created', `"${newAssessment.title}" was created successfully.`, 'success');
    return newAssessment;
  }, [activeAcademicTerm, currentUser, recordActivity, addToast]);

  // Actions: Save Assessment Marks
  const saveAssessmentMarks = useCallback((assessmentId, marksArray) => {
    setAssessmentResults(prev => {
      const filtered = prev.filter(r => r.assessmentId !== assessmentId);
      const newEntries = marksArray.map((m, idx) => ({
        id: `RES-${Date.now()}-${idx}`,
        assessmentId,
        studentId: m.studentId,
        marksObtained: m.marksObtained !== null && m.marksObtained !== undefined ? Number(m.marksObtained) : null,
        resultStatus: m.resultStatus || (m.marksObtained !== null ? 'scored' : 'missing'),
        notes: m.notes || '',
        updatedAt: new Date().toISOString()
      }));

      const updated = [...filtered, ...newEntries];
      storageService.saveAssessmentResults(updated);
      return updated;
    });

    const asm = assessmentsMap[assessmentId];
    recordActivity(
      'Assessment Marks Updated',
      `Updated marks for ${marksArray.length} students on "${asm?.title || assessmentId}".`
    );
    addToast('Marks Published', 'Assessment scores updated and student trends recalculated.', 'success');
  }, [assessmentsMap, recordActivity, addToast]);

  // Actions: Add/Update Intervention
  const addIntervention = useCallback((interventionData) => {
    const id = `INT-${Date.now().toString().slice(-4)}`;
    const student = students.find(s => s.id === interventionData.studentId);
    const newIntervention = {
      id,
      ...interventionData,
      studentName: student?.displayName || interventionData.studentId,
      createdBy: currentUser?.id || 'USR-TEA-01',
      assignedTeacherName: currentUser?.displayName || 'Assigned Instructor',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null
    };

    setInterventions(prev => {
      const updated = [newIntervention, ...prev];
      storageService.saveInterventions(updated);
      return updated;
    });

    recordActivity(
      'Intervention Created',
      `Created support follow-up for ${student?.displayName} (${newIntervention.plannedActionLabel || newIntervention.plannedAction}).`
    );
    addToast('Intervention Logged', `Follow-up plan created for ${student?.displayName}.`, 'success');
    return newIntervention;
  }, [students, currentUser, recordActivity, addToast]);

  const updateInterventionStatus = useCallback((interventionId, newStatus, notes = '') => {
    setInterventions(prev => {
      const updated = prev.map(item => {
        if (item.id === interventionId) {
          const isComplete = newStatus === 'completed';
          return {
            ...item,
            status: newStatus,
            completionNotes: notes || item.completionNotes,
            completedAt: isComplete ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      });
      storageService.saveInterventions(updated);
      return updated;
    });

    recordActivity(
      'Intervention Status Updated',
      `Intervention ${interventionId} updated to status "${newStatus}".`
    );
    addToast('Status Updated', `Follow-up marked as ${newStatus}.`, 'success');
  }, [recordActivity, addToast]);

  // Actions: Update Risk Settings
  const updateRiskSettings = useCallback((newSettings) => {
    setRiskSettings(newSettings);
    storageService.saveRiskSettings(newSettings);

    recordActivity(
      'Risk Thresholds Modified',
      `Updated thresholds: Attendance < ${newSettings.attendanceThreshold}%, Baseline < ${newSettings.minimumAverageThreshold}%, Decline >= ${newSettings.declineThreshold} pts.`
    );
    addToast('Settings Saved', 'Risk indicator thresholds updated and indicators recalculated.', 'success');
  }, [recordActivity, addToast]);

  // Actions: Add Student (Institutional Administrator only)
  const addStudent = useCallback((studentData) => {
    if (!isAdmin) {
      addToast('Permission Denied', 'Faculty instructors cannot manually enroll students. Students must self-register through the portal.', 'warning');
      return null;
    }

    const newStudent = {
      id: studentData.studentCode,
      ...studentData,
      activeStatus: true,
      attendanceRate: studentData.attendanceRate ?? 100,
      academicAverage: studentData.academicAverage ?? 85,
      createdAt: new Date().toISOString()
    };

    setStudents(prev => {
      const exists = prev.some(s => s.id === newStudent.id || s.studentCode === newStudent.studentCode);
      const updated = exists
        ? prev.map(s => (s.id === newStudent.id || s.studentCode === newStudent.studentCode) ? { ...s, ...newStudent } : s)
        : [...prev, newStudent];
      storageService.saveStudents(updated);
      return updated;
    });

    recordActivity('Student Enrolled', `Enrolled student ${newStudent.displayName} (${newStudent.studentCode}) by ${currentUser?.displayName || 'User'}.`);
    addToast('Student Enrolled', `${newStudent.displayName} enrolled successfully.`, 'success');
    return newStudent;
  }, [currentUser, recordActivity, addToast]);

  // Reset Demo Data
  const resetDemoData = useCallback(() => {
    storageService.resetToDefaults();
    setClasses(storageService.getClasses());
    setStudents(storageService.getStudents());
    setAssessments(storageService.getAssessments());
    setAssessmentResults(storageService.getAssessmentResults());
    setAttendanceRecords(storageService.getAttendanceRecords());
    setInterventions(storageService.getInterventions());
    setRiskSettings(storageService.getRiskSettings());
    setNotifications(storageService.getNotifications());
    setActivityLog(storageService.getActivityLog());

    addToast('Demo Data Reset', 'Dataset restored to pristine initial state.', 'info');
  }, [addToast]);

  return (
    <AppContext.Provider
      value={{
        classes,
        students,
        assessments,
        assessmentResults,
        attendanceRecords,
        interventions,
        riskSettings,
        notifications,
        activityLog,
        activeAcademicTerm,
        setActiveAcademicTerm,
        selectedClassId,
        setSelectedClassId,
        theme,
        toggleTheme,
        toasts,
        addToast,
        removeToast,
        classesMap,
        assessmentsMap,
        authorizedStudents,
        studentEvaluations,
        summaryMetrics,
        getStudentMetrics,
        recordAttendanceBatch,
        addAssessment,
        saveAssessmentMarks,
        addIntervention,
        updateInterventionStatus,
        updateRiskSettings,
        addStudent,
        resetDemoData,
        recordActivity
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
