import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useApp } from '../../context/AppContext';

export default function IndicatorBreakdownChart({ studentEvaluations }) {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const chartData = useMemo(() => {
    let attendanceOnly = 0;
    let declineOnly = 0;
    let baselineOnly = 0;
    let multiFactor = 0;
    let onTrack = 0;

    studentEvaluations.forEach(item => {
      const { attendanceTriggered, averageTriggered, declineTriggered, triggeredCount } = item.evaluation;
      
      if (triggeredCount >= 2) {
        multiFactor++;
      } else if (triggeredCount === 1) {
        if (attendanceTriggered) attendanceOnly++;
        else if (declineTriggered) declineOnly++;
        else if (averageTriggered) baselineOnly++;
      } else {
        onTrack++;
      }
    });

    return [
      { name: 'Multi-Factor Support', value: multiFactor, color: '#DC2626' }, // Rose/Red
      { name: 'Attendance Alert', value: attendanceOnly, color: '#F59E0B' }, // Amber
      { name: 'Performance Decline', value: declineOnly, color: '#8B5CF6' }, // Purple
      { name: 'Low Assessment Avg', value: baselineOnly, color: '#EC4899' }, // Pink
      { name: 'On Track', value: onTrack, color: '#10B981' } // Emerald
    ].filter(item => item.value > 0);
  }, [studentEvaluations]);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-lg border border-slate-800">
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-white font-bold text-sm mt-0.5">{data.value} students</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
