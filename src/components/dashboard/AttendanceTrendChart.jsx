import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useApp } from '../../context/AppContext';

export default function AttendanceTrendChart({ filteredRecords }) {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const chartData = useMemo(() => {
    if (!filteredRecords || filteredRecords.length === 0) return [];

    const dateMap = {};
    filteredRecords.forEach(r => {
      if (!dateMap[r.date]) {
        dateMap[r.date] = { date: r.date, present: 0, total: 0 };
      }
      if (r.status === 'present' || r.status === 'late') {
        dateMap[r.date].present++;
        dateMap[r.date].total++;
      } else if (r.status === 'absent') {
        dateMap[r.date].total++;
      }
    });

    return Object.keys(dateMap).sort().map(date => {
      const item = dateMap[date];
      const rate = item.total > 0 ? Math.round((item.present / item.total) * 100) : 100;
      return {
        date: date.slice(5), // MM-DD
        fullDate: date,
        attendanceRate: rate,
        present: item.present,
        total: item.total
      };
    });
  }, [filteredRecords]);

  if (chartData.length === 0) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-400">No attendance data recorded</div>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6D28D9" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6D28D9" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} 
            axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
          />
          <YAxis 
            domain={[40, 100]} 
            tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} 
            unit="%" 
            axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-lg border border-slate-800">
                    <p className="font-semibold text-slate-300">{data.fullDate}</p>
                    <p className="text-[#c084fc] font-bold text-sm mt-0.5">
                      Attendance: {data.attendanceRate}%
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {data.present} present out of {data.total} students
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="attendanceRate"
            stroke="#6D28D9"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#attendanceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
