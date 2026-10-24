import React, { useState } from 'react';
import StudentTable from '../components/students/StudentTable';
import StudentProfileModal from '../components/students/StudentProfileModal';
import AddStudentModal from '../components/students/AddStudentModal';
import InterventionModal from '../components/interventions/InterventionModal';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserPlus, Download, Users, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import { exportToCSV } from '../utils/csvExport';

export default function Students() {
  const { isAdmin, isTeacher } = useAuth();
  const { studentEvaluations, summaryMetrics } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [interventionStudent, setInterventionStudent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleExportCSV = () => {
    const columns = [
      { key: 'studentCode', label: 'Student Code' },
      { key: 'displayName', label: 'Full Name' },
      { key: 'classId', label: 'Class ID' },
      { key: 'attendancePct', label: 'Attendance %' },
      { key: 'assessmentAvg', label: 'Assessment Avg %' },
      { key: 'trend', label: 'Score Trend' },
      { key: 'status', label: 'Review Status' },
      { key: 'triggeredCount', label: 'Triggered Rules Count' }
    ];

    const data = studentEvaluations.map(e => ({
      studentCode: e.student.studentCode,
      displayName: e.student.displayName,
      classId: e.student.classId,
      attendancePct: e.metrics.attendanceSummary.percentage,
      assessmentAvg: e.metrics.assessmentSummary.average,
      trend: e.metrics.trendSummary.trend,
      status: e.evaluation.priorityLabel,
      triggeredCount: e.evaluation.triggeredCount
    }));

    exportToCSV({
      filename: `classpulse_students_roster_${new Date().toISOString().slice(0, 10)}.csv`,
      title: 'ClassPulse - Student Academic Support Roster',
      columns,
      data,
      metadata: { filterDescription: 'Authorized cohort roster' }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isTeacher ? 'My Students' : 'Student Management'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isTeacher
              ? 'Manage your enrolled learners, inspect explainable indicators, and enroll new students into your cohorts.'
              : 'Search, filter, inspect explainable review indicators, and log teacher follow-up plans.'
            }
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export Roster (CSV)
          </Button>

          {(isAdmin || isTeacher) && (
            <Button
              size="sm"
              icon={UserPlus}
              onClick={() => setShowAddModal(true)}
            >
              Enroll Learner
            </Button>
          )}
        </div>
      </div>

      {/* Main Student Directory Table */}
      <StudentTable
        onSelectStudent={(id) => setSelectedStudentId(id)}
        onAddIntervention={(st) => setInterventionStudent(st)}
      />

      {/* Profile Modal */}
      <StudentProfileModal
        isOpen={Boolean(selectedStudentId)}
        onClose={() => setSelectedStudentId(null)}
        studentId={selectedStudentId}
        onAddIntervention={(st) => setInterventionStudent(st)}
      />

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Support Follow-up Modal */}
      <InterventionModal
        isOpen={Boolean(interventionStudent)}
        onClose={() => setInterventionStudent(null)}
        initialStudent={interventionStudent}
      />
    </div>
  );
}
