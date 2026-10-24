import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { normalizeAssessmentScore } from '../utils/assessmentCalculations';
import { validateMarks } from '../utils/validation';
import { 
  Award, 
  Plus, 
  Edit3, 
  Search, 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';

export default function Assessments() {
  const { isTeacher, isAdmin } = useAuth();
  const { 
    classes, 
    authorizedStudents, 
    assessments, 
    assessmentResults, 
    addAssessment, 
    saveAssessmentMarks 
  } = useApp();

  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [enteringMarksAssessment, setEnteringMarksAssessment] = useState(null);

  // New assessment form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newClassId, setNewClassId] = useState(classes[0]?.id || 'CLS-10A');
  const [newDate, setNewDate] = useState('2026-10-24');
  const [newMaxMarks, setNewMaxMarks] = useState(50);
  const [createErrors, setCreateErrors] = useState({});

  // Entering marks form state
  const [marksState, setMarksState] = useState({});
  const [marksErrors, setMarksErrors] = useState({});

  // Filtered assessments list
  const filteredAssessments = useMemo(() => {
    return assessments.filter(a => {
      if (selectedClass !== 'ALL' && a.classId !== selectedClass) return false;
      if (selectedSubject !== 'ALL' && a.subject !== selectedSubject) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!a.title.toLowerCase().includes(q) && !a.subject.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => new Date(b.assessmentDate) - new Date(a.assessmentDate));
  }, [assessments, selectedClass, selectedSubject, searchQuery]);

  // Unique subjects
  const availableSubjects = useMemo(() => {
    const set = new Set(assessments.map(a => a.subject));
    return Array.from(set);
  }, [assessments]);

  // Open Enter Marks
  const handleOpenEnterMarks = (assessment) => {
    setEnteringMarksAssessment(assessment);
    const existing = {};
    assessmentResults
      .filter(r => r.assessmentId === assessment.id)
      .forEach(r => {
        existing[r.studentId] = {
          marks: r.marksObtained !== null ? r.marksObtained : '',
          isMissing: r.resultStatus === 'missing'
        };
      });
    setMarksState(existing);
    setMarksErrors({});
  };

  const handleMarkChange = (studentId, val, maxMarks) => {
    const res = validateMarks(val, maxMarks);
    if (!res.valid) {
      setMarksErrors(prev => ({ ...prev, [studentId]: res.error }));
    } else {
      setMarksErrors(prev => {
        const copy = { ...prev };
        delete copy[studentId];
        return copy;
      });
    }

    setMarksState(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        marks: val,
        isMissing: false
      }
    }));
  };

  const handleToggleMissing = (studentId) => {
    setMarksState(prev => {
      const current = prev[studentId] || {};
      const nextMissing = !current.isMissing;
      return {
        ...prev,
        [studentId]: {
          marks: nextMissing ? '' : (current.marks || ''),
          isMissing: nextMissing
        }
      };
    });
    setMarksErrors(prev => {
      const copy = { ...prev };
      delete copy[studentId];
      return copy;
    });
  };

  const handleSaveMarksSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(marksErrors).length > 0) return;

    const classStudents = authorizedStudents.filter(s => s.classId === enteringMarksAssessment.classId);
    const marksArray = classStudents.map(student => {
      const entry = marksState[student.id];
      const isMissing = entry?.isMissing;
      const rawMarks = entry?.marks;

      return {
        studentId: student.id,
        marksObtained: isMissing || rawMarks === '' || rawMarks === null || rawMarks === undefined ? null : Number(rawMarks),
        resultStatus: isMissing ? 'missing' : (rawMarks !== '' && rawMarks !== null ? 'scored' : 'missing')
      };
    });

    saveAssessmentMarks(enteringMarksAssessment.id, marksArray);
    setEnteringMarksAssessment(null);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!newTitle.trim()) errors.title = 'Title is required';
    if (!newMaxMarks || Number(newMaxMarks) <= 0) errors.maxMarks = 'Max marks must be > 0';

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    addAssessment({
      title: newTitle,
      subject: newSubject,
      classId: newClassId,
      assessmentDate: newDate,
      maximumMarks: Number(newMaxMarks)
    });

    setShowCreateModal(false);
    setNewTitle('');
    setCreateErrors({});
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Assessment Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage evaluations, publish scores with raw-to-percentage normalization, and identify performance shifts.
          </p>
        </div>

        {(isTeacher || isAdmin) && (
          <Button
            size="sm"
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
          >
            Create Assessment
          </Button>
        )}
      </div>

      {/* Safety Notice regarding Missing Assessments */}
      <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 flex items-center gap-2.5">
        <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          <strong>Pedagogical Integrity:</strong> Missing or unsubmitted assessments are recorded separately and are <strong>never</strong> treated as zero marks in trend calculations.
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assessment title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <option value="ALL">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.className}</option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <option value="ALL">All Subjects</option>
            {availableSubjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assessment Cards Grid */}
      {filteredAssessments.length === 0 ? (
        <EmptyState
          title="No assessments found"
          description="Try selecting different filters or create a new assessment."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssessments.map(asm => {
            const classObj = classes.find(c => c.id === asm.classId);
            const resultsForThis = assessmentResults.filter(r => r.assessmentId === asm.id);
            const scoredCount = resultsForThis.filter(r => r.resultStatus === 'scored').length;
            const missingCount = resultsForThis.filter(r => r.resultStatus === 'missing').length;

            // Calculate cohort average for this test
            let totalPct = 0;
            resultsForThis.forEach(r => {
              if (r.resultStatus === 'scored' && r.marksObtained !== null) {
                totalPct += normalizeAssessmentScore(r.marksObtained, asm.maximumMarks);
              }
            });
            const cohortAvg = scoredCount > 0 ? Math.round((totalPct / scoredCount) * 10) / 10 : null;

            return (
              <div
                key={asm.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-[#6D28D9] dark:bg-purple-950 dark:text-purple-300">
                      {asm.subject}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {asm.assessmentDate}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    {asm.title}
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Class: {classObj?.className || asm.classId} • Max: {asm.maximumMarks} Marks
                  </p>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Cohort Avg</span>
                      <strong className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {cohortAvg !== null ? `${cohortAvg}%` : 'N/A'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Scored</span>
                      <strong className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {scoredCount}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Missing</span>
                      <strong className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {missingCount}
                      </strong>
                    </div>
                  </div>
                </div>

                {(isTeacher || isAdmin) && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit3}
                    onClick={() => handleOpenEnterMarks(asm)}
                    className="w-full justify-center"
                  >
                    Enter / Edit Scores
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Assessment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Assessment"
        subtitle="Configure evaluation details and maximum possible score."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Assessment Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Unit 3: Trigonometry & Circle Geometry"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none"
            />
            {createErrors.title && <p className="text-xs text-rose-500 mt-1">{createErrors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Subject
              </label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="English Literature">English Literature</option>
                <option value="World History">World History</option>
                <option value="Pre-Calculus">Pre-Calculus</option>
                <option value="Chemistry">Chemistry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Class Section
              </label>
              <select
                value={newClassId}
                onChange={(e) => setNewClassId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.className}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Evaluation Date
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Maximum Marks *
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={newMaxMarks}
                onChange={(e) => setNewMaxMarks(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold"
              />
              {createErrors.maxMarks && <p className="text-xs text-rose-500 mt-1">{createErrors.maxMarks}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Create Assessment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Enter / Edit Marks Modal */}
      {enteringMarksAssessment && (
        <Modal
          isOpen={Boolean(enteringMarksAssessment)}
          onClose={() => setEnteringMarksAssessment(null)}
          title={`Enter Marks: ${enteringMarksAssessment.title}`}
          subtitle={`${enteringMarksAssessment.subject} • Max Marks: ${enteringMarksAssessment.maximumMarks}`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSaveMarksSubmit} className="space-y-4">
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
              {authorizedStudents
                .filter(s => s.classId === enteringMarksAssessment.classId)
                .map(student => {
                  const entry = marksState[student.id] || {};
                  const isMissing = entry.isMissing;
                  const rawMarks = entry.marks;
                  const pct = !isMissing && rawMarks !== '' && rawMarks !== null && !isNaN(rawMarks)
                    ? normalizeAssessmentScore(rawMarks, enteringMarksAssessment.maximumMarks)
                    : null;
                  const err = marksErrors[student.id];

                  return (
                    <div key={student.id} className="py-2.5 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {student.displayName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {student.studentCode}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Missing Toggle */}
                        <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(isMissing)}
                            onChange={() => handleToggleMissing(student.id)}
                            className="rounded text-[#6D28D9]"
                          />
                          <span>Missing</span>
                        </label>

                        {/* Marks Input */}
                        <div className="w-24">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max={enteringMarksAssessment.maximumMarks}
                            disabled={Boolean(isMissing)}
                            placeholder={`0-${enteringMarksAssessment.maximumMarks}`}
                            value={rawMarks ?? ''}
                            onChange={(e) => handleMarkChange(student.id, e.target.value, enteringMarksAssessment.maximumMarks)}
                            className={`w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs font-semibold text-center focus:outline-none ${
                              err ? 'border-rose-500 text-rose-500' : 'border-slate-200 dark:border-slate-700'
                            }`}
                          />
                          {err && <p className="text-[9px] text-rose-500 leading-tight mt-0.5">{err}</p>}
                        </div>

                        {/* Normalized % */}
                        <div className="w-16 text-right">
                          {isMissing ? (
                            <span className="text-[11px] font-semibold text-amber-600">Missing</span>
                          ) : pct !== null ? (
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                              {pct}%
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300">-</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setEnteringMarksAssessment(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={Object.keys(marksErrors).length > 0}>
                Publish Scores
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
