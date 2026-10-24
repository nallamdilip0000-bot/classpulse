import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ReviewStatusBadge, TrendBadge, FollowUpStatusBadge } from './IndicatorBadge';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  PlusCircle, 
  FileSpreadsheet,
  UserCheck
} from 'lucide-react';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';

export default function StudentTable({ onSelectStudent, onAddIntervention }) {
  const navigate = useNavigate();
  const { studentEvaluations, classes, selectedClassId, setSelectedClassId } = useApp();
  const { isTeacher, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, FLAGGED, ON_TRACK
  const [trendFilter, setTrendFilter] = useState('ALL'); // ALL, DOWNWARD, UPWARD, STABLE
  const [sortBy, setSortBy] = useState('name'); // name, attendance, score, status
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter and sort students
  const filteredData = useMemo(() => {
    return studentEvaluations.filter(item => {
      // Class filter
      if (selectedClassId !== 'ALL' && item.student.classId !== selectedClassId) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.student.displayName.toLowerCase().includes(q);
        const matchCode = item.student.studentCode.toLowerCase().includes(q);
        if (!matchName && !matchCode) return false;
      }

      // Status filter
      if (statusFilter === 'FLAGGED') {
        if (item.evaluation.triggeredCount === 0) return false;
      } else if (statusFilter === 'ON_TRACK') {
        if (item.evaluation.triggeredCount > 0) return false;
      }

      // Trend filter
      if (trendFilter !== 'ALL') {
        const trend = item.metrics.trendSummary.trend;
        if (trendFilter === 'DOWNWARD' && trend !== 'downward') return false;
        if (trendFilter === 'UPWARD' && trend !== 'upward') return false;
        if (trendFilter === 'STABLE' && trend !== 'stable') return false;
      }

      return true;
    }).sort((a, b) => {
      let valA, valB;
      if (sortBy === 'name') {
        valA = a.student.displayName.toLowerCase();
        valB = b.student.displayName.toLowerCase();
      } else if (sortBy === 'attendance') {
        valA = a.metrics.attendanceSummary.percentage ?? -1;
        valB = b.metrics.attendanceSummary.percentage ?? -1;
      } else if (sortBy === 'score') {
        valA = a.metrics.assessmentSummary.average ?? -1;
        valB = b.metrics.assessmentSummary.average ?? -1;
      } else if (sortBy === 'status') {
        valA = a.evaluation.triggeredCount;
        valB = b.evaluation.triggeredCount;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [studentEvaluations, selectedClassId, searchQuery, statusFilter, trendFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search student name or ID (e.g. STU-102)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Enrolled Classes</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.className}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Support Statuses</option>
            <option value="FLAGGED">Needs Review / Flagged</option>
            <option value="ON_TRACK">On Track Only</option>
          </select>

          {/* Trend Filter */}
          <select
            value={trendFilter}
            onChange={(e) => {
              setTrendFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Score Trends</option>
            <option value="DOWNWARD">Declining Trend</option>
            <option value="STABLE">Stable Trend</option>
            <option value="UPWARD">Improving Trend</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {paginatedData.length === 0 ? (
          <EmptyState
            title="No students match the criteria"
            description="Try clearing search filters or selecting 'All Enrolled Classes'."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedClassId('ALL');
              setStatusFilter('ALL');
              setTrendFilter('ALL');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1.5">
                      <span>Student</span>
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Class</th>
                  <th className="py-3.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('attendance')}>
                    <div className="flex items-center gap-1.5">
                      <span>Attendance</span>
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('score')}>
                    <div className="flex items-center gap-1.5">
                      <span>Latest Avg</span>
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Score Trend</th>
                  <th className="py-3.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1.5">
                      <span>Review Indicator</span>
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Follow-up</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedData.map(item => {
                  const { student, metrics, evaluation } = item;
                  const att = metrics.attendanceSummary;
                  const avg = metrics.assessmentSummary;
                  const trend = metrics.trendSummary;
                  const latestIntervention = metrics.interventions[0];

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors group cursor-pointer"
                      onClick={() => onSelectStudent(student.id)}
                    >
                      {/* Student Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-[#6D28D9] dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {student.displayName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white group-hover:text-[#6D28D9] dark:group-hover:text-purple-400 transition-colors">
                              {student.displayName}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              {student.studentCode}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3 px-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {metrics.classInfo?.className || student.classId}
                      </td>

                      {/* Attendance % */}
                      <td className="py-3 px-3">
                        {att.hasData ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${
                              att.percentage < 75 
                                ? 'text-amber-600 dark:text-amber-400 font-extrabold' 
                                : 'text-slate-700 dark:text-slate-300'
                            }`}>
                              {att.percentage}%
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({att.attended}/{att.totalEligible})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">No records</span>
                        )}
                      </td>

                      {/* Latest Avg Score */}
                      <td className="py-3 px-3">
                        {avg.hasData && avg.average !== null ? (
                          <span className={`text-xs font-bold ${
                            avg.average < 40 
                              ? 'text-rose-600 dark:text-rose-400 font-extrabold' 
                              : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {avg.average}%
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Pending</span>
                        )}
                      </td>

                      {/* Score Trend */}
                      <td className="py-3 px-3">
                        <TrendBadge trendSummary={trend} />
                      </td>

                      {/* Review Indicator */}
                      <td className="py-3 px-3">
                        <ReviewStatusBadge
                          status={evaluation.status}
                          triggeredCount={evaluation.triggeredCount}
                        />
                      </td>

                      {/* Follow-up Status */}
                      <td className="py-3 px-3">
                        <FollowUpStatusBadge status={latestIntervention?.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectStudent(student.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#6D28D9] dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Student Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(isTeacher || isAdmin) && (
                            <button
                              onClick={() => onAddIntervention(student)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#6D28D9] dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Create Support Action"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">
              {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span> to <span className="font-semibold text-slate-700 dark:text-slate-200">
              {Math.min(currentPage * pageSize, filteredData.length)}
            </span> of <span className="font-semibold text-slate-700 dark:text-slate-200">
              {filteredData.length}
            </span> students
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
