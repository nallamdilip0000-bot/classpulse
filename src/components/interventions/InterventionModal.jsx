import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { validateInterventionForm } from '../../utils/validation';
import { AlertCircle, Calendar, User, FileText, Lock, Eye } from 'lucide-react';

const SUPPORT_ACTIONS = [
  { value: 'student_checkin', label: 'Student 1-on-1 Check-in' },
  { value: 'practice_material', label: 'Scaffolded Practice & Worksheets' },
  { value: 'remedial_session', label: 'Remedial Learning Clinic' },
  { value: 'progress_review', label: 'Study Hall Progress Review' },
  { value: 'guardian_meeting', label: 'Parent / Guardian Consultation' },
  { value: 'peer_tutoring', label: 'Peer Tutoring & Study Group' }
];

export default function InterventionModal({
  isOpen,
  onClose,
  initialStudent = null,
  initialIndicator = null
}) {
  const { authorizedStudents, addIntervention } = useApp();
  const { currentUser } = useAuth();

  const [studentId, setStudentId] = useState('');
  const [reason, setReason] = useState('');
  const [triggeredIndicator, setTriggeredIndicator] = useState('');
  const [plannedAction, setPlannedAction] = useState('student_checkin');
  const [privateTeacherNotes, setPrivateTeacherNotes] = useState('');
  const [studentFeedback, setStudentFeedback] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setStudentId(initialStudent?.id || (authorizedStudents[0]?.id || ''));
      setTriggeredIndicator(initialIndicator || 'Academic Review Indicator');
      
      // Default follow-up date 7 days from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setNextFollowUpDate(defaultDate.toISOString().split('T')[0]);

      if (initialStudent) {
        setReason(`Follow-up initiated for ${initialStudent.displayName} based on recent indicator review.`);
      } else {
        setReason('');
      }

      setPrivateTeacherNotes('');
      setStudentFeedback('');
      setErrors({});
    }
  }, [isOpen, initialStudent, initialIndicator, authorizedStudents]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      studentId,
      plannedAction,
      reason,
      nextFollowUpDate
    };

    const validation = validateInterventionForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const actionObj = SUPPORT_ACTIONS.find(a => a.value === plannedAction);

    addIntervention({
      studentId,
      reason,
      triggeredIndicator,
      plannedAction,
      plannedActionLabel: actionObj ? actionObj.label : plannedAction,
      privateTeacherNotes,
      studentFeedback,
      nextFollowUpDate,
      assignedTeacherId: currentUser?.id,
      assignedTeacherName: currentUser?.displayName
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Academic Support Plan"
      subtitle="Establish teacher-controlled follow-up actions and progress timelines."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Target Learner
          </label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            disabled={Boolean(initialStudent)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30"
          >
            {authorizedStudents.map(s => (
              <option key={s.id} value={s.id}>
                {s.displayName} ({s.studentCode} • {s.classId})
              </option>
            ))}
          </select>
          {errors.studentId && <p className="text-xs text-rose-500 mt-1">{errors.studentId}</p>}
        </div>

        {/* Triggered Indicator & Planned Action */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Triggering Indicator
            </label>
            <input
              type="text"
              value={triggeredIndicator}
              onChange={(e) => setTriggeredIndicator(e.target.value)}
              placeholder="e.g. Performance Drop (-20 pts)"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Planned Support Action *
            </label>
            <select
              value={plannedAction}
              onChange={(e) => setPlannedAction(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30 cursor-pointer"
            >
              {SUPPORT_ACTIONS.map(action => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reason for Follow-up */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Reason / Context for Support *
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (errors.reason) setErrors({ ...errors, reason: null });
            }}
            placeholder="Describe observed difficulties or reasons prompting this follow-up..."
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30"
          />
          {errors.reason && <p className="text-xs text-rose-500 mt-1">{errors.reason}</p>}
        </div>

        {/* Privacy Separation: Private Staff Notes vs Student-Facing Feedback */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Private Notes */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Private Staff Notes (Teacher Only)</span>
            </label>
            <textarea
              rows={3}
              value={privateTeacherNotes}
              onChange={(e) => setPrivateTeacherNotes(e.target.value)}
              placeholder="Internal pedagogical notes, observations, family context..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30"
            />
            <p className="text-[10px] text-slate-400 mt-1">Never shared with student accounts.</p>
          </div>

          {/* Student Facing Feedback */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              <Eye className="w-3.5 h-3.5 text-purple-500" />
              <span>Learner-Facing Guidance (Portal)</span>
            </label>
            <textarea
              rows={3}
              value={studentFeedback}
              onChange={(e) => setStudentFeedback(e.target.value)}
              placeholder="Encouraging feedback, links to practice sheets, next meeting time..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30"
            />
            <p className="text-[10px] text-slate-400 mt-1">Visible to the student on their portal.</p>
          </div>
        </div>

        {/* Next Follow-up Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Next Follow-up Check Date *
          </label>
          <input
            type="date"
            value={nextFollowUpDate}
            onChange={(e) => {
              setNextFollowUpDate(e.target.value);
              if (errors.nextFollowUpDate) setErrors({ ...errors, nextFollowUpDate: null });
            }}
            className="w-full sm:w-1/2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30"
          />
          {errors.nextFollowUpDate && <p className="text-xs text-rose-500 mt-1">{errors.nextFollowUpDate}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Save Support Plan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
