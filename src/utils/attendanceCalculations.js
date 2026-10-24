/**
 * Attendance Calculations Utility for ClassPulse
 * 
 * Clear Policy:
 * Attendance Percentage = (Classes Attended / Total Eligible Classes) * 100
 * - Attended = 'present' (or 'late' if counted as attended)
 * - Absent = 'absent'
 * - Excused = 'excused' (exempt from total eligible classes, does not penalize student)
 * Total Eligible Classes = Present + Absent
 * If Total Eligible Classes == 0, returns 100% or null safely (prevents division by zero).
 */

export function calculateAttendancePercentage(records = []) {
  if (!records || records.length === 0) {
    return {
      percentage: 100,
      attended: 0,
      absent: 0,
      excused: 0,
      totalEligible: 0,
      totalSessions: 0,
      hasData: false,
      formattedText: 'No sessions recorded'
    };
  }

  let attended = 0;
  let absent = 0;
  let excused = 0;

  for (const rec of records) {
    const status = (rec.status || '').toLowerCase();
    if (status === 'present' || status === 'late') {
      attended++;
    } else if (status === 'absent') {
      absent++;
    } else if (status === 'excused') {
      excused++;
    }
  }

  const totalEligible = attended + absent;
  const totalSessions = records.length;

  if (totalEligible === 0) {
    return {
      percentage: 100,
      attended,
      absent,
      excused,
      totalEligible: 0,
      totalSessions,
      hasData: totalSessions > 0,
      formattedText: 'All sessions excused (100%)'
    };
  }

  const rawPercentage = (attended / totalEligible) * 100;
  const percentage = Math.round(rawPercentage * 10) / 10; // 1 decimal place

  return {
    percentage,
    attended,
    absent,
    excused,
    totalEligible,
    totalSessions,
    hasData: true,
    formula: `(${attended} attended / ${totalEligible} eligible) × 100 = ${percentage}%`
  };
}

/**
 * Calculate attendance trend over grouped periods (e.g. weekly or monthly)
 */
export function calculateAttendanceTrend(records = []) {
  if (!records || records.length === 0) return [];

  // Group by date
  const dateMap = {};
  for (const rec of records) {
    if (!dateMap[rec.date]) {
      dateMap[rec.date] = { date: rec.date, attended: 0, total: 0 };
    }
    const status = (rec.status || '').toLowerCase();
    if (status === 'present' || status === 'late') {
      dateMap[rec.date].attended++;
      dateMap[rec.date].total++;
    } else if (status === 'absent') {
      dateMap[rec.date].total++;
    }
  }

  const sortedDates = Object.keys(dateMap).sort();
  return sortedDates.map(date => {
    const item = dateMap[date];
    const rate = item.total > 0 ? Math.round((item.attended / item.total) * 100) : 100;
    return {
      date,
      attendanceRate: rate,
      attended: item.attended,
      total: item.total
    };
  });
}
