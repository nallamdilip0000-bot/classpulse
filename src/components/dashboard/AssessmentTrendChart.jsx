import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useApp } from '../../context/AppContext';

export default function AssessmentTrendChart({ assessments, assessmentResults }) {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const chartData = useMemo(() => {
    if (!assessments || assessments.length === 0) return [];

    const asmMap = {};
    assessments.forEach(a => {
      asmMap[a.id] = a;
    });

    // Group results by assessment date
    const dateMap = {};
    assessmentResults.forEach(res => {
      if (res.resultStatus === 'missing' || res.resultStatus === 'excused') return;
      if (res.marksObtained === null || res.marksObtained === undefined) return;

      const asm = asmMap[res.assessmentId];
      if (!asm) return;

      const maxMarks = asm.maximumMarks || 100;
      const pct = (Number(res.marksObtained) / Number(maxMarks)) * 100;

      const key = asm.assessmentDate;
      if (!dateMap[key]) {
        dateMap[key] = {
          date: key,
          title: asm.title,
          subject: asm.subject,
          totalPct: 0,
          count: 0
        };
      }
      dateMap[key].totalPct += pct;
      dateMap[key].count++;
    });

    return Object.keys(dateMap).sort().map(date => {
      const item = dateMap[date];
      const avg = item.count > 0 ? Math.round((item.totalPct / item.count) * 10) / 10 : 0;
      return {
        date: date.slice(5),
        fullDate: date,
        averageScore: avg,
        title: item.title,
        subject: item.subject,
        studentsCount: item.count
      };
    });
  }, [assessments, assessmentResults]);

  if (chartData.length === 0) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-400">No assessment data available</div>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} 
            axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
          />
          <YAxis 
            domain={[30, 100]} 
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
                    <p className="font-semibold text-slate-300">{data.title}</p>
                    <p className="text-[11px] text-slate-400">{data.subject} • {data.fullDate}</p>
                    <p className="text-emerald-400 font-bold text-sm mt-1">
                      Cohort Average: {data.averageScore}%
                    </p>
                    <p className="text-[10px] text-slate-400">Based on {data.studentsCount} submitted scores</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="averageScore"
            stroke="#10B981"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#10B981' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
