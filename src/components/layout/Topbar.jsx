import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { backendMode } from '../../services/supabase';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  RotateCcw, 
  Sparkles, 
  UserCheck, 
  GraduationCap, 
  ShieldCheck, 
  Database,
  ExternalLink,
  CheckCircle,
  Clock,
  LogOut,
  LogIn
} from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';
import Badge from '../common/Badge';

export default function Topbar({ onOpenSearch }) {
  const navigate = useNavigate();
  const { currentUser, availablePersonas, switchPersona, isDemoMode, logout } = useAuth();
  const { 
    activeAcademicTerm, 
    setActiveAcademicTerm, 
    theme, 
    toggleTheme, 
    notifications, 
    resetDemoData,
    summaryMetrics
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const roleMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setShowRoleMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
        {/* Left Section: Term selector & Global Search */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-lg">
          {/* Term Selector */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300">
            <span className="text-slate-400">Term:</span>
            <select
              value={activeAcademicTerm}
              onChange={(e) => setActiveAcademicTerm(e.target.value)}
              className="bg-transparent font-semibold text-[#6D28D9] dark:text-purple-400 focus:outline-none cursor-pointer"
            >
              <option value="Fall 2026">Fall 2026</option>
              <option value="Spring 2027">Spring 2027</option>
            </select>
          </div>

          {/* Quick Search Bar */}
          <button
            onClick={onOpenSearch}
            className="flex items-center justify-between w-full max-w-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-xl text-slate-500 dark:text-slate-400 text-xs sm:text-sm transition-colors border border-transparent focus:border-[#6D28D9]"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search students, tests, classes...</span>
            </div>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-400">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Section: System mode badge, Notifications, Reset, Theme, Role switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backend Mode Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[11px] text-purple-700 dark:text-purple-300">
            <Database className="w-3 h-3 text-[#6D28D9] dark:text-purple-400" />
            <span className="font-medium">{backendMode.name}</span>
          </div>

          {/* Reset Demo Data */}
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Reset demo data to initial state"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Reset Demo</span>
          </button>

          {/* Dark / Light Mode Switch */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Notifications ({notifications.length})
                  </h4>
                  {unreadNotifs.length > 0 && (
                    <span className="text-[11px] text-[#6D28D9] font-medium">
                      {unreadNotifs.length} new
                    </span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.map(notif => (
                    <div key={notif.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* DEMO ROLE SWITCHER (Prominently marked per requirements) */}
          <div className="relative" ref={roleMenuRef}>
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/60 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-[#6D28D9] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.avatarInitials || 'CP'}
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                    {currentUser?.displayName}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-purple-200/70 dark:bg-purple-800 text-purple-900 dark:text-purple-200">
                    {currentUser?.role}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  {currentUser?.title || 'User'}
                </p>
              </div>
            </button>

            {/* Role Switcher Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Demo Role Switcher
                    </span>
                    <span className="text-[9px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded">
                      DEMO ONLY
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Select a fictional persona to evaluate role-based views and permissions.
                  </p>
                </div>

                <div className="py-2">
                  {availablePersonas.map(persona => {
                    const isSelected = persona.id === currentUser?.id;
                    return (
                      <button
                        key={persona.id}
                        onClick={() => {
                          switchPersona(persona.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full px-4 py-2.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left ${
                          isSelected ? 'bg-purple-50/70 dark:bg-purple-950/40' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {persona.avatarInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {persona.displayName}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {persona.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {persona.title}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-[#6D28D9] shrink-0 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 px-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      navigate('/login');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-[#6D28D9] dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors font-medium cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Open Login Interface</span>
                  </button>

                  <button
                    onClick={async () => {
                      setShowRoleMenu(false);
                      await logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Confirmation Dialog for Demo Data Reset */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={resetDemoData}
        title="Reset Demo Dataset"
        message="Are you sure you want to reset all synthetic student records, attendance entries, marks, and interventions back to original defaults? All local modifications will be restored."
        confirmLabel="Reset Everything"
        cancelLabel="Keep Changes"
        isDanger={true}
      />
    </>
  );
}
