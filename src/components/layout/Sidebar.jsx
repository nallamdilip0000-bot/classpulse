import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Award,
  TrendingUp,
  AlertCircle,
  ClipboardList,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Activity,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LogOut,
  LogIn
} from 'lucide-react';

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
  const { currentRole, isStudent, currentUser, logout } = useAuth();
  const { summaryMetrics } = useApp();

  // Navigation items for Staff (Admin & Teacher)
  const staffNavItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/students', label: 'Students', icon: Users },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/assessments', label: 'Assessments', icon: Award },
    { to: '/analytics', label: 'Academic Analytics', icon: TrendingUp },
    { 
      to: '/indicators', 
      label: 'Risk Indicators', 
      icon: AlertCircle,
      badge: summaryMetrics.flaggedCount > 0 ? summaryMetrics.flaggedCount : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    { 
      to: '/interventions', 
      label: 'Intervention Tracking', 
      icon: ClipboardList,
      badge: summaryMetrics.pendingFollowUps > 0 ? summaryMetrics.pendingFollowUps : null,
      badgeColor: 'bg-[#6D28D9] text-white'
    },
    { to: '/reports', label: 'Reports & Export', icon: FileSpreadsheet },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/help', label: 'Help & Methodology', icon: HelpCircle }
  ];

  // Navigation items for Student Persona
  const studentNavItems = [
    { to: '/', label: 'My Academic Overview', icon: LayoutDashboard },
    { to: '/attendance', label: 'My Attendance', icon: CalendarCheck },
    { to: '/assessments', label: 'My Assessment Scores', icon: Award },
    { to: '/interventions', label: 'My Support & Feedback', icon: ClipboardList },
    { to: '/help', label: 'Help & About', icon: HelpCircle }
  ];

  const navItems = isStudent ? studentNavItems : staffNavItems;

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-[#6D28D9] flex items-center justify-center text-white shadow-md shadow-purple-600/20 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-none">
                Class<span className="text-[#6D28D9] dark:text-purple-400">Pulse</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 truncate">
                IC26-02-02 • MoE
              </span>
            </div>
          )}
        </NavLink>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden md:block"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Banner */}
      {!isCollapsed && (
        <div className="px-4 py-2.5 mx-3 mt-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-purple-900 dark:text-purple-200 uppercase tracking-wider">
              {currentRole} Portal
            </span>
            <span className="text-[10px] bg-[#6D28D9] text-white px-1.5 py-0.2 rounded font-medium">
              Active
            </span>
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all group relative ${
                  isActive
                    ? 'bg-[#6D28D9] text-white shadow-sm shadow-purple-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
              {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
              {!isCollapsed && item.badge !== undefined && item.badge !== null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && item.badge !== undefined && item.badge !== null && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile & Portal Link */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {!isCollapsed ? (
          <>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#6D28D9] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser?.avatarInitials || 'CP'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-none">
                    {currentUser?.displayName || 'Authorized User'}
                  </p>
                  <p className="text-[10px] text-purple-600 dark:text-purple-400 capitalize mt-1 truncate">
                    {currentRole === 'teacher' ? 'Faculty' : currentRole}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <NavLink
                  to="/login"
                  title="Switch Role Portal"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                </NavLink>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-1 text-[10px] text-slate-400 leading-tight">
              ClassPulse early academic assistance • MoE IC26-02-02
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <NavLink
              to="/login"
              title={`Signed in as ${currentUser?.displayName || 'User'} (${currentRole}). Click to switch portal.`}
              className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#6D28D9] dark:text-purple-400 flex items-center justify-center hover:bg-purple-100 transition-colors"
            >
              <LogIn className="w-4 h-4" />
            </NavLink>
          </div>
        )}
      </div>
    </aside>
  );
}
