import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { useApp } from '../../context/AppContext';

export default function ScoreDistributionChart({ studentEvaluations }) {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const chartData = useMemo(() => {
    let low = 0;       // < 40% (Needs Baseline Support)
    let developing = 0;// 40 - 59% (Developing)
    let proficient = 0;// 60 - 79% (Proficient)
    let advanced = 0;  // >= 80% (Advanced)

    studentEvaluations.forEach(item => {
      const avg = item.metrics.assessmentSummary.average;
      if (avg === null || avg === undefined) return;

      if (avg < 40) low++;
      else if (avg < 60) developing++;
      else if (avg < 80) proficient++;
      else advanced++;
    });

    return [
      { category: '< 40% (Support)', count: low, color: '#F43F5E' },
      { category: '40 - 59% (Dev)', count: developing, color: '#F59E0B' },
      { category: '60 - 79% (Prof)', count: proficient, color: '#3B82F6' },
      { category: '≥ 80% (Adv)', count: advanced, color: '#10B981' }
    ];
  }, [studentEvaluations]);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
          <XAxis 
            dataKey="category" 
            tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} 
            axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
          />
          <YAxis 
            allowDecimals={false}
            tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} 
            axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-lg border border-slate-800">
                    <p className="font-semibold">{data.category}</p>
                    <p className="text-white font-bold text-sm mt-0.5">{data.count} students</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
