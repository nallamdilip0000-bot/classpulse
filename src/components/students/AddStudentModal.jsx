import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  GraduationCap, 
  ShieldAlert, 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  Lock,
  Sparkles
} from 'lucide-react';

export default function AddStudentModal({ isOpen, onClose }) {
  const { classes, addStudent, students } = useApp();
  const { currentUser, isTeacher, isAdmin, availablePersonas, registeredUsers } = useAuth();

  // Students are blocked from accessing this modal
  if (!isAdmin && !isTeacher) {
    return null;
  }

  // Filter available classes to teacher's cohorts if faculty
  const availableClasses = useMemo(() => {
    if (isAdmin) return classes;
    if (isTeacher) {
      const allowed = currentUser?.assignedClassIds || [];
      const teacherClasses = classes.filter(c => allowed.includes(c.id));
      return teacherClasses.length > 0 ? teacherClasses : classes;
    }
    return classes;
  }, [classes, isAdmin, isTeacher, currentUser]);

  const [searchId, setSearchId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(availableClasses[0]?.id || 'CLS-10A');
  const [guardianContact, setGuardianContact] = useState('');
  const [notes, setNotes] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // All registered student accounts (from self-registration + institutional roster)
  const allRegisteredStudents = useMemo(() => {
    const map = new Map();

    // 1. Gather from registered user accounts (role === 'student')
    (registeredUsers || []).forEach(u => {
      if (u.role === 'student') {
        const code = (u.studentId || u.id || '').trim();
        if (code && !map.has(code.toUpperCase())) {
          map.set(code.toUpperCase(), {
            id: code,
            studentCode: code,
            displayName: u.displayName,
            email: u.email,
            classId: u.assignedClassIds?.[0] || 'CLS-10A',
            source: 'Self-Registered Account',
            isSelfRegistered: true,
            registeredAt: u.registeredAt || new Date().toISOString()
          });
        }
      }
    });

    // 2. Gather from availablePersonas
    (availablePersonas || []).forEach(u => {
      if (u.role === 'student') {
        const code = (u.studentId || u.id || '').trim();
        if (code && !map.has(code.toUpperCase())) {
          map.set(code.toUpperCase(), {
            id: code,
            studentCode: code,
            displayName: u.displayName,
            email: u.email,
            classId: u.assignedClassIds?.[0] || 'CLS-10A',
            source: 'Institutional Student',
            isSelfRegistered: Boolean(u.isCustomRegistered),
            registeredAt: u.registeredAt
          });
        }
      }
    });

    // 3. Gather from students store
    (students || []).forEach(s => {
      const code = (s.studentCode || s.id || '').trim();
      if (code && !map.has(code.toUpperCase())) {
        map.set(code.toUpperCase(), {
          id: s.id || code,
          studentCode: code,
          displayName: s.displayName || s.name,
          email: s.email || `${code.toLowerCase()}@student.classpulse.edu`,
          classId: s.classId || 'CLS-10A',
          guardianContact: s.guardianContact || s.parentContact,
          source: 'Roster Student',
          isSelfRegistered: false
        });
      }
    });

    return Array.from(map.values());
  }, [registeredUsers, availablePersonas, students]);

  // Active match based on input
  const matchedStudent = useMemo(() => {
    const clean = searchId.trim().toUpperCase();
    if (!clean) return null;

    return allRegisteredStudents.find(s => 
      s.studentCode.toUpperCase() === clean || 
      s.id.toUpperCase() === clean ||
      s.email.toLowerCase() === clean.toLowerCase() ||
      s.displayName.toUpperCase() === clean
    ) || null;
  }, [searchId, allRegisteredStudents]);

  // Reset modal state upon open
  useEffect(() => {
    if (isOpen) {
      setSearchId('');
      setHasSearched(false);
      setNotes('');
      setGuardianContact('');
      if (availableClasses.length > 0) {
        setSelectedClassId(availableClasses[0].id);
      }
    }
  }, [isOpen, availableClasses]);

  // Auto-populate when student is matched
  useEffect(() => {
    if (matchedStudent) {
      if (matchedStudent.guardianContact) {
        setGuardianContact(matchedStudent.guardianContact);
      }
      if (matchedStudent.classId && availableClasses.some(c => c.id === matchedStudent.classId)) {
        setSelectedClassId(matchedStudent.classId);
      }
    }
  }, [matchedStudent, availableClasses]);

  const handleSelectPreRegistered = (student) => {
    setSearchId(student.studentCode);
    setHasSearched(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!matchedStudent) {
      return; // Compulsory check: Cannot enroll if not pre-registered
    }

    // Enroll learner into selected cohort
    addStudent({
      studentCode: matchedStudent.studentCode,
      displayName: matchedStudent.displayName,
      email: matchedStudent.email,
      classId: selectedClassId,
      guardianContact: guardianContact || matchedStudent.guardianContact || 'family@classpulse.edu',
      dateOfBirth: '2010-05-15',
      profileCategory: isTeacher ? 'Enrolled by Faculty' : 'Officially Enrolled',
      notes: notes || 'Enrolled into class cohort by faculty instructor after compulsory student ID verification.'
    });

    onClose();
  };

  const isInvalid = Boolean(searchId.trim() && !matchedStudent);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isTeacher ? "Enroll Student into My Class" : "Enroll Registered Student"}
      subtitle="Students must register their ID first. Type the student ID below to verify details and enroll."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Compulsory Policy Notice */}
        <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#6D28D9] dark:text-purple-400 shrink-0 mt-0.5" />
          <div className="text-slate-600 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white">Compulsory Student Registration Policy:</strong>
            <p className="mt-0.5">
              Students must create their account and ID code first via the registration portal before faculty can enroll them into a cohort.
            </p>
          </div>
        </div>

        {/* Student ID Lookup Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Enter Student ID Code *
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. 10000 or STU-101"
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value);
                setHasSearched(true);
              }}
              autoFocus
              className={`w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-semibold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 ${
                matchedStudent
                  ? 'border-emerald-500 focus:ring-emerald-500/20 text-emerald-900 dark:text-emerald-200'
                  : isInvalid
                  ? 'border-rose-500 focus:ring-rose-500/20 text-rose-900 dark:text-rose-200'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-[#6D28D9]/20 text-slate-900 dark:text-white'
              }`}
            />
            <Search className={`w-4 h-4 absolute left-3 top-3 ${
              matchedStudent ? 'text-emerald-500' : isInvalid ? 'text-rose-500' : 'text-slate-400'
            }`} />

            {matchedStudent && (
              <span className="absolute right-3 top-2.5 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* State 1: Invalid / Not Registered Yet */}
        {isInvalid && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-rose-900 dark:text-rose-200 block font-bold">
                  Student ID Not Found — Not Registered Yet
                </strong>
                <p className="text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                  No registered student was found for ID <code className="font-mono font-bold bg-white dark:bg-slate-900 px-1 py-0.5 rounded">{searchId}</code>.
                  Students <strong>must self-register</strong> on the portal first to create their verified institutional ID.
                </p>
                <p className="text-rose-600 dark:text-rose-400 text-[11px] mt-1.5 italic">
                  * Invalid details entered: Learner cannot be enrolled until they register.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* State 2: Valid / Pre-Registered Student Found */}
        {matchedStudent && (
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60 dark:border-emerald-800/40">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Student Account Verified
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700">
                {matchedStudent.source}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Full Name</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {matchedStudent.displayName}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Verified Student ID</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {matchedStudent.studentCode}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Email</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">
                  {matchedStudent.email}
                </span>
              </div>
            </div>

            {/* Target Cohort Class */}
            <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Assign to Class Cohort *
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {availableClasses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.className} ({c.section}) — {c.subjectFocus || 'General'}
                  </option>
                ))}
              </select>
            </div>

            {/* Guardian & Initial Observations */}
            <div className="grid grid-cols-1 gap-2 pt-1">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Guardian / Contact Details
                </label>
                <input
                  type="text"
                  value={guardianContact}
                  onChange={(e) => setGuardianContact(e.target.value)}
                  placeholder="Parent Name / Phone / Email"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  Initial Teacher Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enrolled into cohort by teacher..."
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Quick Helper: Registered Students Ready to Enroll */}
        {!matchedStudent && allRegisteredStudents.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
              Available Registered Students (Click ID to auto-fill):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
              {allRegisteredStudents.map(s => (
                <button
                  key={s.studentCode}
                  type="button"
                  onClick={() => handleSelectPreRegistered(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border text-left transition-colors cursor-pointer flex items-center gap-1.5 ${
                    s.isSelfRegistered 
                      ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span className="font-mono font-bold">{s.studentCode}</span>
                  <span className="text-slate-500 dark:text-slate-400">({s.displayName})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <button
            type="submit"
            disabled={!matchedStudent}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              matchedStudent
                ? 'bg-[#6D28D9] text-white hover:bg-purple-700 shadow-md shadow-purple-600/25 cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-300 dark:border-slate-700'
            }`}
          >
            {!matchedStudent && <Lock className="w-3.5 h-3.5" />}
            {matchedStudent ? 'Confirm & Enroll Student' : 'Enter Valid Registered ID First'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
