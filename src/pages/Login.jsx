import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { backendMode } from '../services/supabase';
import { validateRegistrationForm } from '../utils/validation';
import {
  GraduationCap,
  ShieldCheck,
  BookOpenCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sun,
  Moon,
  Database,
  Layers,
  ChevronRight,
  Check,
  UserPlus,
  LogIn,
  Trash2,
  IdCard,
  RefreshCw
} from 'lucide-react';
import Button from '../components/common/Button';

export default function Login({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    login,
    loginAsPersona,
    register,
    deleteRegisteredUser,
    registeredUsers = [],
    currentUser,
    availablePersonas,
    logout
  } = useAuth();
  const { theme, toggleTheme, addToast } = useApp();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState(() => {
    if (initialMode === 'register' || location.pathname === '/register') return 'register';
    return 'login';
  });

  // Role selection: 'student' | 'teacher' (Faculty) | 'admin' (Administrator)
  const [selectedRole, setSelectedRole] = useState('teacher');

  // Sign in state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [notFoundPrompt, setNotFoundPrompt] = useState(null);

  // Register state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regStudentCode, setRegStudentCode] = useState(() => 'STU-150');
  const [regClassId, setRegClassId] = useState('CLS-10A');
  const [regDepartment, setRegDepartment] = useState('Mathematics & Sciences');
  const [regAgreed, setRegAgreed] = useState(true);
  const [regErrors, setRegErrors] = useState({});
  const [regIsLoading, setRegIsLoading] = useState(false);

  // Modals
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Target destination after login
  const from = location.state?.from?.pathname || '/';

  // Role metadata configurations
  const roleConfigs = {
    student: {
      roleKey: 'student',
      title: 'Student Portal',
      badge: 'Learner Access',
      tagline: 'Personal Academic Roadmap & Learning Feedback',
      accentColor: '#0EA5E9', // sky-500
      accentClass: 'text-sky-500 dark:text-sky-400',
      bgGlow: 'from-sky-500/10 via-cyan-500/5 to-transparent',
      borderActive: 'border-sky-500 dark:border-sky-400 ring-2 ring-sky-500/20',
      pillClass: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      icon: GraduationCap,
      idLabel: 'Student ID or Student Email',
      idPlaceholder: 'e.g. STU-101 or amina.y@student.classpulse.edu',
      defaultId: 'STU-101',
      features: [
        { label: 'Personal Subject Marks & Grade Breakdown', desc: 'Direct visibility into assessments normalized 0–100%' },
        { label: 'Daily Attendance & Excused Absence Logs', desc: 'Full transparent tracking with medical and family excuse exemptions' },
        { label: 'Non-Punitive Pedagogical Support Notes', desc: 'Collaborative feedback from teachers, not punitive warnings' },
        { label: 'FERPA & MoE Student Privacy Protection', desc: 'Strict zero-leakage learner confidentiality' }
      ]
    },
    teacher: {
      roleKey: 'teacher',
      title: 'Faculty Portal',
      badge: 'Instructor Access',
      tagline: 'Classroom Roll-Call, Mark Entry & Early Intervention',
      accentColor: '#6D28D9', // purple-700
      accentClass: 'text-purple-600 dark:text-purple-400',
      bgGlow: 'from-purple-600/10 via-indigo-600/5 to-transparent',
      borderActive: 'border-[#6D28D9] dark:border-purple-400 ring-2 ring-purple-500/20',
      pillClass: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      icon: BookOpenCheck,
      idLabel: 'Faculty Email or Staff ID',
      idPlaceholder: 'e.g. s.jenkins@classpulse.edu or USR-TEA-01',
      defaultId: 's.jenkins@classpulse.edu',
      features: [
        { label: 'Daily Attendance Roll-Call with Excused Accounting', desc: 'Quick batch toggle for present, absent, excused, and late' },
        { label: 'Assessment Score Entry & Trend Detection', desc: 'Detects multi-period declines (≥15 points drop) early' },
        { label: 'Multi-Factor Explainable Risk Indicators', desc: 'Rule-based triggers with plain-language pedagogical rationale' },
        { label: 'Teacher-Controlled Intervention Follow-ups', desc: 'Schedule 1-on-1 tutoring, parent checks, and peer mentors' }
      ]
    },
    admin: {
      roleKey: 'admin',
      title: 'Administrator Portal',
      badge: 'Executive Governance',
      tagline: 'Institution-Wide Equity, Analytics & Policy Thresholds',
      accentColor: '#D97706', // amber-600
      accentClass: 'text-amber-600 dark:text-amber-400',
      bgGlow: 'from-amber-500/10 via-purple-600/5 to-transparent',
      borderActive: 'border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/20',
      pillClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: ShieldCheck,
      idLabel: 'Administrator Institutional Email',
      idPlaceholder: 'e.g. principal.vance@classpulse.edu or USR-ADM-01',
      defaultId: 'principal.vance@classpulse.edu',
      features: [
        { label: 'School-Wide Executive Cohort Overview', desc: 'Aggregated analytics across Class 10-A, 10-B, and 11-A' },
        { label: 'Inter-Class Equity & Grade Distributions', desc: 'Identify system gaps and resource distribution needs' },
        { label: 'Policy-Level Threshold Customization', desc: 'Set institutional attendance (default 75%) and decline cutoffs' },
        { label: 'MoE IC26-02-02 Compliance Export', desc: 'Export full audit logs, intervention summaries, and CSV reports' }
      ]
    }
  };

  const activeConfig = roleConfigs[selectedRole];

  // Auto-fill identifier when changing role if empty or clear error
  useEffect(() => {
    setErrorMsg('');
    setNotFoundPrompt(null);
  }, [selectedRole, authMode]);

  // Handle standard manual login
  const handleFormLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setNotFoundPrompt(null);
    setIsLoading(true);

    try {
      const targetId = identifier.trim() || activeConfig.defaultId;
      const res = await login({
        identifier: targetId,
        password: password || 'demo123',
        role: selectedRole
      });

      if (res.success) {
        addToast?.(
          `Welcome, ${res.user.displayName}`,
          `Signed in to ${activeConfig.title} successfully.`,
          'success'
        );
        navigate(from, { replace: true });
      } else if (res.notFound) {
        // Account not found! Prompt to register directly with prefilled credentials
        setNotFoundPrompt({
          identifier: res.identifier || targetId,
          role: res.role || selectedRole,
          message: res.error
        });
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to registration mode with pre-filled identifier from failed login
  const switchToRegisterWithIdentifier = (missingId, roleToUse) => {
    setAuthMode('register');
    const targetRole = roleToUse || selectedRole;
    setSelectedRole(targetRole);

    if (missingId.includes('@')) {
      setRegEmail(missingId);
      const nameGuess = missingId.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      setRegFullName(nameGuess);
    } else if (missingId.toUpperCase().startsWith('STU-')) {
      setSelectedRole('student');
      setRegStudentCode(missingId.toUpperCase());
      setRegEmail(`${missingId.toLowerCase()}@student.classpulse.edu`);
    } else {
      setRegEmail(`${missingId.toLowerCase()}@classpulse.edu`);
      setRegFullName(missingId.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    }

    setNotFoundPrompt(null);
    setErrorMsg('');
  };

  // Handle new account registration
  const handleFormRegister = async (e) => {
    e.preventDefault();
    setRegErrors({});
    setErrorMsg('');

    // Validate inputs
    const validation = validateRegistrationForm({
      fullName: regFullName,
      email: regEmail,
      password: regPassword,
      confirmPassword: regConfirmPassword,
      role: selectedRole,
      studentCode: regStudentCode,
      classId: regClassId
    });

    if (!validation.isValid) {
      setRegErrors(validation.errors);
      return;
    }

    if (!regAgreed) {
      setRegErrors({ general: 'Please agree to the MoE non-punitive ethical charter to register.' });
      return;
    }

    setRegIsLoading(true);

    try {
      const res = await register({
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
        role: selectedRole,
        department: selectedRole === 'student' ? undefined : regDepartment,
        studentCode: selectedRole === 'student' ? regStudentCode : undefined,
        classId: regClassId
      });

      if (res.success) {
        addToast?.(
          `Account Created: ${res.user.displayName}`,
          `Welcome to ClassPulse! You are signed in as ${res.user.title}.`,
          'success'
        );
        navigate(from, { replace: true });
      } else {
        setRegErrors({ general: res.error || 'Failed to create account.' });
      }
    } catch {
      setRegErrors({ general: 'An unexpected error occurred during account creation.' });
    } finally {
      setRegIsLoading(false);
    }
  };

  // Handle instant one-click demo login
  const handleQuickLogin = (persona) => {
    setErrorMsg('');
    setNotFoundPrompt(null);
    setIsLoading(true);
    const res = loginAsPersona(persona.id);
    if (res.success) {
      addToast?.(
        `Signed In as ${persona.displayName}`,
        `Authenticated as ${persona.title}.`,
        'success'
      );
      navigate(from, { replace: true });
    } else {
      setErrorMsg('Failed to sign in with demo persona.');
      setIsLoading(false);
    }
  };

  // Filter personas for active role
  const rolePersonas = availablePersonas.filter(p => p.role === selectedRole);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white transition-colors">
      {/* Header Bar */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6D28D9] to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-600/25 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                Class<span className="text-[#6D28D9] dark:text-purple-400">Pulse</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                IC26-02-02
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Early Academic Support Dashboard • Ministry of Education
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Backend Mode Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
            <Database className="w-3.5 h-3.5 text-[#6D28D9] dark:text-purple-400" />
            <span>{backendMode.name}</span>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            aria-label="Toggle Dark Mode"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
        {/* Subtle background glow ornaments */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-900/10 overflow-hidden relative z-10 flex flex-col lg:flex-row">
          
          {/* Left Column: Form & Role Selection */}
          <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
            <div>
              {/* Header Notice if already logged in */}
              {currentUser && (
                <div className="mb-6 p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#6D28D9] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {currentUser.avatarInitials || 'CP'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        Active session: {currentUser.displayName}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize truncate">
                        Role: {currentUser.role} • {currentUser.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(from, { replace: true })}
                      className="px-2.5 py-1 bg-[#6D28D9] text-white rounded-lg font-medium text-[11px] hover:bg-purple-700 transition-colors"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={logout}
                      className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-[11px] hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950 dark:hover:text-rose-300 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}

              {/* Top Mode Segmented Switcher (Sign In vs Create Account) */}
              <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMsg('');
                      setNotFoundPrompt(null);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'login'
                        ? 'bg-white dark:bg-slate-900 text-[#6D28D9] dark:text-purple-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setErrorMsg('');
                      setNotFoundPrompt(null);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'register'
                        ? 'bg-white dark:bg-slate-900 text-[#6D28D9] dark:text-purple-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Account</span>
                  </button>
                </div>

                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline-block">
                  {authMode === 'login' ? 'Existing Member Access' : 'New User Onboarding'}
                </span>
              </div>

              {/* Title Section */}
              <div className="mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D28D9] dark:text-purple-400">
                  {authMode === 'login' ? 'Select Portal & Identity' : 'Account Registration'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                  {authMode === 'login' ? 'ClassPulse Sign In' : 'Create ClassPulse Account'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {authMode === 'login'
                    ? 'Authenticate into your designated role portal to access academic records.'
                    : 'Register your account to access students, roll-call, and learning insights.'}
                </p>
              </div>

              {/* 3 Role Selection Tabs */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  1. Choose Your Role
                </label>
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                  
                  {/* Student Tab */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('student');
                      if (authMode === 'login') setIdentifier('STU-101');
                    }}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedRole === 'student'
                        ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200/60 dark:border-slate-700 ring-2 ring-sky-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5 mb-1" />
                    <span>Student</span>
                    <span className="text-[10px] font-normal opacity-70">Learner</span>
                  </button>

                  {/* Faculty Tab */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('teacher');
                      if (authMode === 'login') setIdentifier('s.jenkins@classpulse.edu');
                    }}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedRole === 'teacher'
                        ? 'bg-white dark:bg-slate-900 text-[#6D28D9] dark:text-purple-400 shadow-sm border border-slate-200/60 dark:border-slate-700 ring-2 ring-purple-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    <BookOpenCheck className="w-5 h-5 mb-1" />
                    <span>Faculty</span>
                    <span className="text-[10px] font-normal opacity-70">Teacher</span>
                  </button>

                  {/* Administrator Tab */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('admin');
                      if (authMode === 'login') setIdentifier('principal.vance@classpulse.edu');
                    }}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedRole === 'admin'
                        ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/60 dark:border-slate-700 ring-2 ring-amber-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-900/40'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 mb-1" />
                    <span>Administrator</span>
                    <span className="text-[10px] font-normal opacity-70">Dean & MoE</span>
                  </button>
                </div>
              </div>

              {/* Account Not Found Notice Banner (Shows up when user tries to sign in without an account) */}
              {notFoundPrompt && (
                <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 shadow-sm animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <span>Account Not Found</span>
                      </h4>
                      <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                        No registered profile was found for <code className="font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100">{notFoundPrompt.identifier}</code>. Would you like to create a new {selectedRole === 'teacher' ? 'Faculty' : selectedRole} account now?
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => switchToRegisterWithIdentifier(notFoundPrompt.identifier, notFoundPrompt.role)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Register This Account Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setNotFoundPrompt(null)}
                          className="px-2.5 py-1.5 text-xs text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Standard Error Message */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* MODE 1: Sign In Form */}
              {authMode === 'login' ? (
                <form onSubmit={handleFormLogin} className="space-y-4">
                  {/* Identifier Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {activeConfig.idLabel}
                      </label>
                      <button
                        type="button"
                        onClick={() => setIdentifier(activeConfig.defaultId)}
                        className="text-[11px] text-[#6D28D9] dark:text-purple-400 hover:underline font-medium"
                      >
                        Fill sample: {activeConfig.defaultId}
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        {selectedRole === 'student' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                      </div>
                      <input
                        id="login-identifier-input"
                        type="text"
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          if (notFoundPrompt) setNotFoundPrompt(null);
                        }}
                        placeholder={activeConfig.idPlaceholder}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:border-[#6D28D9] transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Password / Passkey
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
                      >
                        Need help?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="login-password-input"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password (e.g. demo123 or registered password)"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 focus:border-[#6D28D9] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Options row */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-[#6D28D9] focus:ring-purple-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                      />
                      <span>Remember this device</span>
                    </label>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Demo mode enabled
                    </span>
                  </div>

                  {/* Submit Action */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isLoading}
                    className="w-full shadow-lg shadow-purple-600/25 mt-2 cursor-pointer"
                  >
                    <div className="flex items-center justify-center gap-2 w-full font-bold">
                      <span>Sign In to {activeConfig.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Button>

                  {/* Direct Switcher to Registration */}
                  <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setErrorMsg('');
                        setNotFoundPrompt(null);
                      }}
                      className="font-bold text-[#6D28D9] dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      Create / Register Account here
                    </button>
                  </div>
                </form>
              ) : (
                /* MODE 2: Registration / Sign Up Form */
                <form onSubmit={handleFormRegister} className="space-y-3.5 animate-in fade-in duration-200">
                  {regErrors.general && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{regErrors.general}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Legal / Academic Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="e.g. Dr. Sarah Jenkins or Amina Yusuf"
                        className={`w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 transition-all ${
                          regErrors.fullName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                    </div>
                    {regErrors.fullName && (
                      <p className="text-[11px] text-rose-500 mt-1">{regErrors.fullName}</p>
                    )}
                  </div>

                  {/* Institutional Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Institutional Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. s.jenkins@classpulse.edu"
                        className={`w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 transition-all ${
                          regErrors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                    </div>
                    {regErrors.email && (
                      <p className="text-[11px] text-rose-500 mt-1">{regErrors.email}</p>
                    )}
                  </div>

                  {/* Role Specific Section */}
                  {selectedRole === 'student' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Student ID Code *
                          </label>
                          <button
                            type="button"
                            onClick={() => setRegStudentCode(`STU-${Math.floor(130 + Math.random() * 800)}`)}
                            className="text-[10px] text-sky-600 dark:text-sky-400 flex items-center gap-0.5 hover:underline"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            <span>Suggest</span>
                          </button>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <IdCard className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={regStudentCode}
                            onChange={(e) => setRegStudentCode(e.target.value.toUpperCase())}
                            placeholder="e.g. STU-150"
                            className={`w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 uppercase ${
                              regErrors.studentCode ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                            }`}
                          />
                        </div>
                        {regErrors.studentCode && (
                          <p className="text-[11px] text-rose-500 mt-1">{regErrors.studentCode}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Enrolled Cohort Class *
                        </label>
                        <select
                          value={regClassId}
                          onChange={(e) => setRegClassId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                        >
                          <option value="CLS-10A">Grade 10 - Section A (Math & Sci)</option>
                          <option value="CLS-10B">Grade 10 - Section B (Humanities)</option>
                          <option value="CLS-11A">Grade 11 - Section A (Advanced STEM)</option>
                        </select>
                      </div>
                    </div>
                  ) : selectedRole === 'teacher' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Department / Subject Focus
                        </label>
                        <select
                          value={regDepartment}
                          onChange={(e) => setRegDepartment(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                        >
                          <option value="Mathematics & Sciences">Mathematics & Sciences</option>
                          <option value="Humanities & Social Studies">Humanities & Social Studies</option>
                          <option value="Languages & Literature">Languages & Literature</option>
                          <option value="Computer Science & STEM">Computer Science & STEM</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Primary Class Assignment
                        </label>
                        <select
                          value={regClassId}
                          onChange={(e) => setRegClassId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                        >
                          <option value="CLS-10A">Grade 10 - Section A</option>
                          <option value="CLS-10B">Grade 10 - Section B</option>
                          <option value="CLS-11A">Grade 11 - Section A</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Administrative Office / Governance Division
                      </label>
                      <select
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      >
                        <option value="Academic Governance & Dean's Office">Academic Governance & Dean's Office</option>
                        <option value="Ministry Compliance & Equity Audit">Ministry Compliance & Equity Audit</option>
                        <option value="School Administration & Operations">School Administration & Operations</option>
                        <option value="Student Welfare & Counseling">Student Welfare & Counseling</option>
                      </select>
                    </div>
                  )}

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Create Password *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={regShowPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className={`w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 transition-all ${
                            regErrors.password ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setRegShowPassword(p => !p)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {regShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {regErrors.password && (
                        <p className="text-[11px] text-rose-500 mt-1">{regErrors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={regShowPassword ? 'text' : 'password'}
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className={`w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/40 transition-all ${
                            regErrors.confirmPassword ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                          }`}
                        />
                        {regConfirmPassword && regPassword === regConfirmPassword && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-500">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      {regErrors.confirmPassword && (
                        <p className="text-[11px] text-rose-500 mt-1">{regErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Ethical Agreement Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={regAgreed}
                        onChange={(e) => setRegAgreed(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded text-[#6D28D9] focus:ring-purple-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer shrink-0"
                      />
                      <span className="leading-tight">
                        I understand that ClassPulse is governed by <strong>Ministry of Education IC26-02-02 non-punitive guidelines</strong>. Early indicators provide coaching insights, not punitive consequences.
                      </span>
                    </label>
                  </div>

                  {/* Register Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={regIsLoading}
                    className="w-full shadow-lg shadow-purple-600/25 mt-2 cursor-pointer"
                  >
                    <div className="flex items-center justify-center gap-2 w-full font-bold">
                      <UserPlus className="w-4 h-4" />
                      <span>Register & Access {activeConfig.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Button>

                  {/* Switch to Sign In */}
                  <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setErrorMsg('');
                        setNotFoundPrompt(null);
                      }}
                      className="font-bold text-[#6D28D9] dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      Sign in to your account
                    </button>
                  </div>
                </form>
              )}

              {/* Divider */}
              <div className="my-6 relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <span className="relative bg-white dark:bg-slate-900 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Or One-Click Demo Access
                </span>
              </div>

              {/* Quick Persona Access for Active Role */}
              <div>
                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Pre-Configured {activeConfig.badge} Personas</span>
                  <button
                    type="button"
                    onClick={() => setShowDirectoryModal(true)}
                    className="text-[#6D28D9] dark:text-purple-400 hover:underline normal-case font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all accounts directory ({availablePersonas.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {rolePersonas.slice(0, 4).map((persona) => (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => handleQuickLogin(persona)}
                      className="p-3 text-left rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50/70 dark:hover:bg-purple-950/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-purple-300 dark:hover:border-purple-700 transition-all group flex items-start gap-3 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#6D28D9] dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                        {persona.avatarInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {persona.displayName}
                          </span>
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                            Enter <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {persona.title}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                          {persona.studentId || persona.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Security Note */}
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>MoE Safe Learning Architecture</span>
              <span className="font-semibold text-slate-500 dark:text-slate-400">ClassPulse v2.4</span>
            </div>
          </div>

          {/* Right Column: Role Features & Visual Showcase */}
          <div className="lg:w-96 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 relative overflow-hidden">
            
            {/* Ambient ornament in showcase */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Active Role Card Header */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/15 text-xs font-semibold backdrop-blur-md mb-4">
                <activeConfig.icon className="w-4 h-4 text-purple-300" />
                <span>{activeConfig.badge}</span>
              </div>

              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {activeConfig.title}
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {activeConfig.tagline}
              </p>

              {/* Portal Features Checklist */}
              <div className="mt-6 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Role Capabilities & Safety
                </span>

                <div className="space-y-3">
                  {activeConfig.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/30">
                        <Check className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-100">
                          {feat.label}
                        </p>
                        <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ethical Guarantee Callout */}
            <div className="mt-8 pt-4 border-t border-slate-800/80 relative z-10">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-slate-300 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-white mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Explainable & Teacher-Controlled</span>
                </div>
                Indicators highlight opportunities for early educational coaching. No automated disciplinary sanctions or high-stakes conclusions.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Directory Modal (All demo accounts + Custom registered accounts) */}
      {showDirectoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#6D28D9]" />
                  <span>ClassPulse Identity & Accounts Directory</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select any persona or your custom registered accounts below to sign in instantly.
                </p>
              </div>
              <button
                onClick={() => setShowDirectoryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {/* Custom registered accounts section (if any) */}
              {registeredUsers.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Your Registered Accounts ({registeredUsers.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {registeredUsers.map((persona) => {
                      const isCurrent = currentUser?.id === persona.id;
                      return (
                        <div
                          key={persona.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isCurrent
                              ? 'bg-purple-50/80 dark:bg-purple-950/50 border-purple-300 dark:border-purple-700'
                              : 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40 hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                              {persona.avatarInitials}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {persona.displayName}
                                </span>
                                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                  Registered
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {persona.title}
                              </p>
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                                {persona.studentId ? `ID: ${persona.studentId} • ` : ''}
                                {persona.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                handleQuickLogin(persona);
                                setShowDirectoryModal(false);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#6D28D9] hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>Sign In</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteRegisteredUser(persona.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete registered account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Synthetic Demo Accounts */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                  Pre-Configured Demonstration Personas
                </span>
                <div className="space-y-2">
                  {availablePersonas
                    .filter(p => !p.isCustomRegistered)
                    .map((persona) => {
                      const isCurrent = currentUser?.id === persona.id;
                      return (
                        <div
                          key={persona.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isCurrent
                              ? 'bg-purple-50/80 dark:bg-purple-950/50 border-purple-300 dark:border-purple-700'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:border-purple-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#6D28D9] dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                              {persona.avatarInitials}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {persona.displayName}
                                </span>
                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                  persona.role === 'admin'
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                    : persona.role === 'teacher'
                                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                                    : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300'
                                }`}>
                                  {persona.role === 'teacher' ? 'Faculty' : persona.role}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {persona.title}
                              </p>
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                                {persona.studentId ? `ID: ${persona.studentId} • ` : ''}
                                {persona.email}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              handleQuickLogin(persona);
                              setShowDirectoryModal(false);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#6D28D9] hover:bg-purple-700 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Sign In</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setShowDirectoryModal(false);
                  setAuthMode('register');
                }}
                className="text-xs font-semibold text-[#6D28D9] dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register a new account instead</span>
              </button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDirectoryModal(false)}
              >
                Close Directory
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot / Help Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Account Credentials & Demo Help</span>
              </h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
              <p>
                <strong>Evaluation Mode:</strong> ClassPulse is configured for friction-free evaluation. You can sign in using any password (e.g. <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-purple-600 dark:text-purple-400 font-mono">demo123</code> or any text).
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Sample Identifiers by Role:
                </p>
                <ul className="space-y-1 list-disc list-inside text-[11px]">
                  <li><strong>Student:</strong> <code className="font-mono">STU-101</code> (Amina Yusuf)</li>
                  <li><strong>Faculty:</strong> <code className="font-mono">s.jenkins@classpulse.edu</code> (Mrs. Sarah Jenkins)</li>
                  <li><strong>Administrator:</strong> <code className="font-mono">principal.vance@classpulse.edu</code> (Dr. Arthur Vance)</li>
                </ul>
              </div>
              <p>
                <strong>New Account:</strong> If an account doesn't exist, click the <strong>"Create Account"</strong> tab at the top or follow the register prompt when logging in!
              </p>
            </div>

            <div className="pt-2 text-right">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowForgotModal(false)}
              >
                Got It
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 px-4 sm:px-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 bg-white/40 dark:bg-slate-900/40">
        <p>
          ClassPulse Early Academic Support System • Innovative Conclave IC26-02-02 • Non-punitive Pedagogical AI Governance
        </p>
      </footer>
    </div>
  );
}
