import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Search, User, BookOpen, Award, ArrowRight, X } from 'lucide-react';

export default function QuickSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { authorizedStudents, classes, assessments } = useApp();
  const { isStudent } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Filter students
  const filteredStudents = cleanQuery === '' ? [] : authorizedStudents.filter(s => 
    s.displayName.toLowerCase().includes(cleanQuery) ||
    s.studentCode.toLowerCase().includes(cleanQuery) ||
    s.id.toLowerCase().includes(cleanQuery)
  ).slice(0, 5);

  // Filter assessments
  const filteredAssessments = cleanQuery === '' || isStudent ? [] : assessments.filter(a =>
    a.title.toLowerCase().includes(cleanQuery) ||
    a.subject.toLowerCase().includes(cleanQuery)
  ).slice(0, 4);

  // Filter classes
  const filteredClasses = cleanQuery === '' || isStudent ? [] : classes.filter(c =>
    c.className.toLowerCase().includes(cleanQuery) ||
    c.subjectFocus.toLowerCase().includes(cleanQuery)
  ).slice(0, 3);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a student name, ID (e.g. STU-102), class, or assessment..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="p-3 max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {cleanQuery === '' ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Type to search students, assessments, or classes.
            </div>
          ) : (
            <>
              {filteredStudents.length === 0 && filteredAssessments.length === 0 && filteredClasses.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  No matching records found for "{query}".
                </div>
              )}

              {/* Students Section */}
              {filteredStudents.length > 0 && (
                <div className="py-2">
                  <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Students
                  </div>
                  {filteredStudents.map(student => (
                    <button
                      key={student.id}
                      onClick={() => handleSelect(`/students/${student.id}`)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-[#6D28D9] dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {student.displayName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {student.studentCode} • {student.classId}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                  ))}
                </div>
              )}

              {/* Assessments Section */}
              {filteredAssessments.length > 0 && (
                <div className="py-2">
                  <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Assessments
                  </div>
                  {filteredAssessments.map(asm => (
                    <button
                      key={asm.id}
                      onClick={() => handleSelect('/assessments')}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                          <Award className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {asm.title}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {asm.subject} • Max Marks: {asm.maximumMarks}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                  ))}
                </div>
              )}

              {/* Classes Section */}
              {filteredClasses.length > 0 && (
                <div className="py-2">
                  <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Classes
                  </div>
                  {filteredClasses.map(cls => (
                    <button
                      key={cls.id}
                      onClick={() => handleSelect('/students')}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {cls.className}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {cls.subjectFocus} • {cls.assignedTeacherName}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Press <kbd className="px-1.5 py-0.5 font-mono bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">ESC</kbd> to close</span>
          <span>ClassPulse Global Navigator</span>
        </div>
      </div>
    </div>
  );
}
