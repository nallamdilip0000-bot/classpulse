import React from 'react';
import { 
  HelpCircle, 
  ShieldCheck, 
  GraduationCap, 
  Database, 
  Lock, 
  Cpu, 
  ExternalLink,
  BookOpen,
  Award,
  CalendarCheck,
  CheckCircle2
} from 'lucide-react';
import { backendMode } from '../services/supabase';

export default function HelpAbout() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-[#6D28D9] dark:text-purple-300">
            Educational SaaS Platform
          </span>
          <span className="text-xs text-slate-400">
            Alignment: Ministry of Education
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          ClassPulse: Early Academic Support Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Comprehensive system documentation, pedagogical methodology, non-punitive ethics, and dual-backend architecture.
        </p>
      </div>

      {/* Problem Statement Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#6D28D9] dark:text-purple-400" />
          <span>The Problem & Educational Vision</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Teachers often notice academic difficulties only after multiple cumulative assessments or midterms, when it is significantly harder to catch up. <strong>ClassPulse</strong> bridges this gap by combining daily attendance records and assessment trends to flag learners who may benefit from early teacher support.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Crucially, ClassPulse replaces opaque machine-learning "black boxes" with <strong>transparent, explainable indicators</strong>. Teachers retain complete autonomy and follow-up control; the platform never automatically labels a student as a failure or makes automated high-stakes promotion or disciplinary decisions.
        </p>
      </div>

      {/* Explainable Rules & Formulas */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#6D28D9] dark:text-purple-400" />
          <span>Mathematical Formulations & Rules Engine</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <span>Attendance Calculation Formula</span>
            </span>
            <div className="font-mono text-xs p-2 bg-white dark:bg-slate-900 rounded-lg border text-purple-700 dark:text-purple-300">
              (Classes Attended / (Attended + Absent)) × 100
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Excused absences (medical or official) are exempt from total eligible sessions so students are not penalized. Zero eligible classes safely returns 100% without division-by-zero errors.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Assessment Normalization & Trends</span>
            </span>
            <div className="font-mono text-xs p-2 bg-white dark:bg-slate-900 rounded-lg border text-purple-700 dark:text-purple-300">
              (Raw Marks / Maximum Marks) × 100
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Allows fair comparison across quizzes (50 marks), labs (40 marks), and exams (100 marks). Missing tests are explicitly tagged as "Missing" and never treated as zero marks. Minimum 2 assessments are required to calculate a trend.
            </p>
          </div>
        </div>
      </div>

      {/* Role-Based Access Guide */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#6D28D9] dark:text-purple-400" />
          <span>Role-Based Access Hierarchy</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 space-y-2">
            <span className="text-xs font-bold text-purple-900 dark:text-purple-200 uppercase">
              Administrator
            </span>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
              <li>Manage all classes & enroll students</li>
              <li>Configure system risk thresholds</li>
              <li>Audit log of all changes</li>
              <li>Import/Export system datasets</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-2">
            <span className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase">
              Teacher
            </span>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
              <li>View assigned classes & students</li>
              <li>Record daily attendance</li>
              <li>Publish assessment marks</li>
              <li>Create & track support follow-ups</li>
              <li>Log private teacher notes</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-2">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase">
              Student
            </span>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
              <li>View only their own attendance</li>
              <li>View personal score trends</li>
              <li>Read encouraging teacher guidance</li>
              <li>Cannot see other students or private notes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Backend & Supabase Deployment */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-[#6D28D9] dark:text-purple-400" />
          <span>Dual Architecture: Demo vs Supabase Cloud</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Currently active: <strong className="text-purple-600 dark:text-purple-400">{backendMode.name}</strong>. The application functions out-of-the-box with local browser persistence for presentation and evaluation.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          To connect live Supabase Cloud:
        </p>
        <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-1 pl-2">
          <li>Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#6D28D9] underline">supabase.com</a>.</li>
          <li>Paste the contents of <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">supabase_schema.sql</code> into the SQL Editor.</li>
          <li>Set <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_URL</code> and <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_ANON_KEY</code> in your environment.</li>
        </ol>
      </div>
    </div>
  );
}
