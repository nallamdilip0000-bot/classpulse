import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { validateStudentForm } from '../../utils/validation';
import { Sparkles, RefreshCw, KeyRound, CheckCircle2 } from 'lucide-react';

export default function AddStudentModal({ isOpen, onClose }) {
  const { classes, addStudent } = useApp();
  const { currentUser, isTeacher, isAdmin, register } = useAuth();

  // Faculty and students are strictly blocked from manual learner enrollment
  if (!isAdmin) {
    return null;
  }

  // Filter available classes to teacher's cohorts if faculty
  const availableClasses = classes;

  const [studentCode, setStudentCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [classId, setClassId] = useState(availableClasses[0]?.id || 'CLS-10A');
  const [guardianContact, setGuardianContact] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2010-05-15');
  const [createLoginAccount, setCreateLoginAccount] = useState(true);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  // Reset or initialize classId when modal opens
  useEffect(() => {
    if (isOpen) {
      if (!studentCode) {
        setStudentCode(`STU-${Math.floor(140 + Math.random() * 800)}`);
      }
      if (availableClasses.length > 0) {
        setClassId(availableClasses[0].id);
      }
      setErrors({});
    }
  }, [isOpen, availableClasses]);

  const handleGenerateId = () => {
    setStudentCode(`STU-${Math.floor(140 + Math.random() * 800)}`);
    if (errors.studentCode) setErrors({ ...errors, studentCode: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = studentCode.trim().toUpperCase();
    const cleanName = displayName.trim();

    const formData = { studentCode: cleanCode, displayName: cleanName, classId };
    const validation = validateStudentForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // 1. Add student record to academic roster
    addStudent({
      studentCode: cleanCode,
      displayName: cleanName,
      classId,
      guardianContact,
      dateOfBirth,
      profileCategory: isTeacher ? 'Enrolled by Faculty' : 'Newly Enrolled',
      notes
    });

    // 2. Optionally create instant student login credentials
    if (createLoginAccount && register) {
      const studentEmail = `${cleanCode.toLowerCase()}@student.classpulse.edu`;
      await register({
        fullName: cleanName,
        email: studentEmail,
        password: 'demo123',
        role: 'student',
        studentCode: cleanCode,
        classId
      });
    }

    // Reset and close
    setDisplayName('');
    setNotes('');
    setGuardianContact('');
    setStudentCode(`STU-${Math.floor(140 + Math.random() * 800)}`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isTeacher ? "Enroll Learner into Your Class" : "Enroll New Learner"}
      subtitle={isTeacher ? `Add a student directly to ${currentUser?.displayName}'s cohort.` : "Register an authorized student record into the academic system."}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student ID Code */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Student ID Code *
            </label>
            <button
              type="button"
              onClick={handleGenerateId}
              className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Suggest New ID</span>
            </button>
          </div>
          <input
            type="text"
            placeholder="e.g. STU-137"
            value={studentCode}
            onChange={(e) => {
              setStudentCode(e.target.value.toUpperCase());
              if (errors.studentCode) setErrors({ ...errors, studentCode: null });
            }}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30"
          />
          {errors.studentCode && <p className="text-xs text-rose-500 mt-1">{errors.studentCode}</p>}
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Full Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Julian Hayes"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              if (errors.displayName) setErrors({ ...errors, displayName: null });
            }}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30"
          />
          {errors.displayName && <p className="text-xs text-rose-500 mt-1">{errors.displayName}</p>}
        </div>

        {/* Assigned Class */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Assigned Cohort Class *
          </label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30 cursor-pointer"
          >
            {availableClasses.map(c => (
              <option key={c.id} value={c.id}>
                {c.className} ({c.subjectFocus})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Guardian Info
            </label>
            <input
              type="text"
              placeholder="Name / Contact"
              value={guardianContact}
              onChange={(e) => setGuardianContact(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30"
            />
          </div>
        </div>

        {/* Create Student Account Toggle */}
        <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={createLoginAccount}
              onChange={(e) => setCreateLoginAccount(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-[#6D28D9] focus:ring-purple-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Create Student Portal Login Account</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Enables learner to sign in with ID <code className="font-mono font-semibold">{studentCode || 'STU-XXX'}</code> or email <code className="font-mono">{studentCode ? `${studentCode.toLowerCase()}@student.classpulse.edu` : ''}</code> (passkey: <code className="font-mono">demo123</code>).
              </p>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Initial Academic Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Transfer history, IEP, or initial teacher observations..."
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Enroll Learner
          </Button>
        </div>
      </form>
    </Modal>
  );
}
