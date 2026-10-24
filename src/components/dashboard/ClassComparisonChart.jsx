import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useApp } from '../../context/AppContext';

export default function ClassComparisonChart({ classes, studentEvaluations }) {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const chartData = useMemo(() => {
    return classes.map(cls => {
      const evaluationsInClass = studentEvaluations.filter(e => e.student.classId === cls.id);
      
      let attSum = 0;
      let attCount = 0;
      let scoreSum = 0;
      let scoreCount = 0;

      evaluationsInClass.forEach(item => {
        if (item.metrics.attendanceSummary.hasData) {
          attSum += item.metrics.attendanceSummary.percentage;
          attCount++;
        }
        if (item.metrics.assessmentSummary.hasData && item.metrics.assessmentSummary.average !== null) {
          scoreSum += item.metrics.assessmentSummary.average;
          scoreCount++;
        }
      });

      return {
        className: cls.section ? `Sec ${cls.section}` : cls.className,
        fullName: cls.className,
        avgAttendance: attCount > 0 ? Math.round((attSum / attCount) * 10) / 10 : 0,
        avgScore: scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 10) / 10 : 0,
        studentsCount: evaluationsInClass.length
      };
    });
  }, [classes, studentEvaluations]);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
          <XAxis 
            dataKey="className" 
            tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} 
            axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
          />
          <YAxis 
            domain={[0, 100]} 
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
                    <p className="font-semibold text-slate-300">{data.fullName}</p>
                    <p className="text-[#c084fc] font-medium mt-1">Attendance: {data.avgAttendance}%</p>
                    <p className="text-emerald-400 font-medium">Assessment Avg: {data.avgScore}%</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Enrolled: {data.studentsCount} students</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
          <Bar dataKey="avgAttendance" name="Avg Attendance" fill="#6D28D9" radius={[4, 4, 0, 0]} />
          <Bar dataKey="avgScore" name="Avg Assessment" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
