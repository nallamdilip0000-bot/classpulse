import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { exportToCSV } from '../utils/csvExport';
import { FollowUpStatusBadge } from '../components/students/IndicatorBadge';
import InterventionModal from '../components/interventions/InterventionModal';
import StudentProfileModal from '../components/students/StudentProfileModal';
import { 
  ClipboardList, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Lock, 
  Eye, 
  Calendar 
} from 'lucide-react';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';

export default function Interventions() {
  const { isTeacher, isAdmin, isStudent, currentUser } = useAuth();
  const { 
    interventions, 
    updateInterventionStatus, 
    classes,
    authorizedStudents
  } = useApp();

  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, IN_PROGRESS, COMPLETED, OVERDUE
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectStudentId, setInspectStudentId] = useState(null);

  const [resolvingId, setResolvingId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const todayStr = '2026-10-23';

  // Check if a follow-up is overdue
  const isOverdue = (intItem) => {
    if (intItem.status === 'completed' || intItem.status === 'cancelled') return false;
    return intItem.nextFollowUpDate < todayStr;
  };

  // Filtered interventions
  const filteredList = useMemo(() => {
    return interventions.filter(item => {
      // If student persona, only see their own interventions
      if (isStudent && item.studentId !== currentUser?.studentId) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (item.studentName || '').toLowerCase().includes(q);
        const matchAction = (item.plannedActionLabel || item.plannedAction || '').toLowerCase().includes(q);
        const matchReason = (item.reason || '').toLowerCase().includes(q);
        if (!matchName && !matchAction && !matchReason) return false;
      }

      if (statusFilter === 'OVERDUE') {
        return isOverdue(item);
      } else if (statusFilter === 'PENDING') {
        return item.status === 'pending';
      } else if (statusFilter === 'IN_PROGRESS') {
        return item.status === 'in_progress';
      } else if (statusFilter === 'COMPLETED') {
        return item.status === 'completed';
      }

      return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [interventions, isStudent, currentUser, searchQuery, statusFilter]);

  // Counts
  const counts = useMemo(() => {
    let pending = 0;
    let inProgress = 0;
    let completed = 0;
    let overdue = 0;

    interventions.forEach(item => {
      if (isOverdue(item)) overdue++;
      if (item.status === 'pending') pending++;
      else if (item.status === 'in_progress') inProgress++;
      else if (item.status === 'completed') completed++;
    });

    return { pending, inProgress, completed, overdue, total: interventions.length };
  }, [interventions]);

  const handleComplete = (id) => {
    updateInterventionStatus(id, 'completed', resolutionNotes || 'Follow-up successfully resolved.');
    setResolvingId(null);
    setResolutionNotes('');
  };

  const handleExportCSV = () => {
    const columns = [
      { key: 'id', label: 'Intervention ID' },
      { key: 'studentName', label: 'Student Name' },
      { key: 'studentId', label: 'Student ID' },
      { key: 'plannedActionLabel', label: 'Support Action' },
      { key: 'reason', label: 'Reason' },
      { key: 'status', label: 'Status' },
      { key: 'nextFollowUpDate', label: 'Target Date' },
      { key: 'assignedTeacherName', label: 'Assigned Teacher' },
      { key: 'completionNotes', label: 'Completion Notes' }
      // Private teacher notes are excluded by default for student privacy
    ];

    exportToCSV({
      filename: `classpulse_interventions_${new Date().toISOString().slice(0, 10)}.csv`,
      title: 'ClassPulse - Academic Support Interventions Report',
      columns,
      data: filteredList,
      metadata: { filterDescription: `Status: ${statusFilter}` }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Intervention & Follow-Up Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Establish student support plans, track remediation progress, and record teacher consultation outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export Tracker (CSV)
          </Button>

          {(isTeacher || isAdmin) && (
            <Button
              size="sm"
              icon={Plus}
              onClick={() => setShowCreateModal(true)}
            >
              New Support Plan
            </Button>
          )}
        </div>
      </div>

      {/* Overdue Alert Banner if overdue items exist */}
      {counts.overdue > 0 && !isStudent && (
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3 text-xs text-rose-900 dark:text-rose-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <strong>Action Required:</strong> You have {counts.overdue} overdue learner follow-up checks that require teacher review.
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('OVERDUE')}
            className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors shrink-0"
          >
            Filter Overdue
          </button>
        </div>
      )}

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'PENDING'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending Review</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{counts.pending}</p>
        </button>

        <button
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'IN_PROGRESS'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">In Progress</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{counts.inProgress}</p>
        </button>

        <button
          onClick={() => setStatusFilter('OVERDUE')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'OVERDUE'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Overdue Follow-ups</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{counts.overdue}</p>
        </button>

        <button
          onClick={() => setStatusFilter('COMPLETED')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'COMPLETED'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Completed & Resolved</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{counts.completed}</p>
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search learner name, support action, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <option value="ALL">All Support Records ({counts.total})</option>
            <option value="PENDING">Pending Only</option>
            <option value="IN_PROGRESS">In Progress Only</option>
            <option value="OVERDUE">Overdue Only</option>
            <option value="COMPLETED">Completed Only</option>
          </select>
        </div>
      </div>

      {/* Interventions List */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <EmptyState
            title="No support records match filter"
            description="Clear search or change status filter to view active interventions."
            actionLabel="View All Support Plans"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
          />
        ) : (
          filteredList.map(item => {
            const overdue = isOverdue(item);

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm transition-all space-y-3 ${
                  overdue
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setInspectStudentId(item.studentId)}
                      className="text-left group cursor-pointer"
                    >
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#6D28D9] dark:group-hover:text-purple-400 transition-colors">
                        {item.studentName}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.studentId} • Assigned to {item.assignedTeacherName}
                      </p>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {overdue && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                        Overdue Check
                      </span>
                    )}
                    <FollowUpStatusBadge status={item.status} />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <p>
                    <strong className="text-slate-900 dark:text-white">Action Plan:</strong>{' '}
                    <span className="font-semibold text-purple-700 dark:text-purple-300">
                      {item.plannedActionLabel || item.plannedAction}
                    </span>
                  </p>
                  <p>
                    <strong className="text-slate-900 dark:text-white">Reason / Trigger:</strong>{' '}
                    {item.reason}
                  </p>
                </div>

                {/* Privacy Separation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {!isStudent && item.privateTeacherNotes && (
                    <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Private Staff Note (Confidential)</span>
                      </div>
                      <p>{item.privateTeacherNotes}</p>
                    </div>
                  )}

                  {item.studentFeedback && (
                    <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 text-xs text-purple-900 dark:text-purple-200">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Student Portal Guidance</span>
                      </div>
                      <p>{item.studentFeedback}</p>
                    </div>
                  )}
                </div>

                {/* Completion outcome notes if completed */}
                {item.status === 'completed' && item.completionNotes && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300">
                    <span className="font-bold block mb-0.5">Resolution Outcome:</span>
                    <p>{item.completionNotes}</p>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Target Date: <strong className={overdue ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>{item.nextFollowUpDate}</strong>
                    </span>
                    <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  {(isTeacher || isAdmin) && item.status !== 'completed' && (
                    <div className="flex items-center gap-2">
                      {item.status === 'pending' && (
                        <button
                          onClick={() => updateInterventionStatus(item.id, 'in_progress')}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-semibold hover:bg-blue-100 transition-colors"
                        >
                          Mark In Progress
                        </button>
                      )}

                      {resolvingId === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Resolution notes..."
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            className="px-2 py-1 bg-white dark:bg-slate-900 border rounded text-xs"
                          />
                          <Button size="sm" onClick={() => handleComplete(item.id)}>
                            Save
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setResolvingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setResolvingId(item.id)}
                        >
                          Mark Completed
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Support Plan Modal */}
      <InterventionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={Boolean(inspectStudentId)}
        onClose={() => setInspectStudentId(null)}
        studentId={inspectStudentId}
      />
    </div>
  );
}
