/**
 * Explainable Risk & Academic Support Rules Engine for ClassPulse
 * 
 * Philosophy:
 * - Transparent, deterministic, rule-based review.
 * - Explicit explanations showing exact values, thresholds, and comparison periods.
 * - Non-punitive, teacher-centered terminology ("Support Recommended", "Needs Review").
 * - Never makes automated high-stakes decisions.
 */

export const DEFAULT_RISK_SETTINGS = {
  attendanceThreshold: 75, // in percent (<75% triggers)
  minimumAverageThreshold: 40, // in percent (<40% triggers)
  declineThreshold: 15, // in percentage points drop (e.g. >= 15 pt drop triggers)
  minimumAssessments: 2, // minimum completed assessments for trend evaluation
  enableAttendanceRule: true,
  enableAverageRule: true,
  enableDeclineRule: true
};

/**
 * Evaluate indicators for a single student
 * 
 * @param {Object} student 
 * @param {Object} attendanceSummary Output of calculateAttendancePercentage
 * @param {Object} assessmentSummary Output of calculateAssessmentAverage
 * @param {Object} trendSummary Output of calculateAssessmentTrend
 * @param {Object} settings Current active thresholds
 */
export function evaluateStudentSupportIndicators(
  student,
  attendanceSummary,
  assessmentSummary,
  trendSummary,
  settings = DEFAULT_RISK_SETTINGS
) {
  const activeSettings = { ...DEFAULT_RISK_SETTINGS, ...settings };
  const indicators = [];
  const explanations = [];
  const suggestedActions = [];

  // 1. Attendance Evaluation
  let attendanceTriggered = false;
  if (activeSettings.enableAttendanceRule && attendanceSummary.hasData) {
    if (attendanceSummary.percentage < activeSettings.attendanceThreshold) {
      attendanceTriggered = true;
      const indicator = {
        code: 'ATTENDANCE_BELOW_THRESHOLD',
        label: 'Low Attendance Rate',
        category: 'attendance',
        severity: attendanceSummary.percentage < (activeSettings.attendanceThreshold - 15) ? 'high' : 'medium',
        observedValue: `${attendanceSummary.percentage}%`,
        threshold: `< ${activeSettings.attendanceThreshold}%`,
        details: `${attendanceSummary.attended} attended out of ${attendanceSummary.totalEligible} eligible sessions (${attendanceSummary.absent} absences, ${attendanceSummary.excused} excused)`,
        explanation: `Attendance is ${attendanceSummary.percentage}%, which is below the review threshold of ${activeSettings.attendanceThreshold}%. Consistent presence is critical for academic continuity.`
      };
      indicators.push(indicator);
      explanations.push(indicator.explanation);
      suggestedActions.push('Conduct an informal 1-on-1 check-in to identify potential attendance barriers (transport, health, family).');
    }
  }

  // 2. Low Assessment Average Evaluation
  let averageTriggered = false;
  if (activeSettings.enableAverageRule && assessmentSummary.hasData && assessmentSummary.average !== null) {
    if (assessmentSummary.average < activeSettings.minimumAverageThreshold) {
      averageTriggered = true;
      const indicator = {
        code: 'LOW_ASSESSMENT_AVERAGE',
        label: 'Assessment Average Below Baseline',
        category: 'performance',
        severity: assessmentSummary.average < (activeSettings.minimumAverageThreshold - 10) ? 'high' : 'medium',
        observedValue: `${assessmentSummary.average}%`,
        threshold: `< ${activeSettings.minimumAverageThreshold}%`,
        details: `Average of ${assessmentSummary.average}% calculated across ${assessmentSummary.count} valid assessments.`,
        explanation: `Recent assessment average is ${assessmentSummary.average}%, below the academic support threshold of ${activeSettings.minimumAverageThreshold}%.`
      };
      indicators.push(indicator);
      explanations.push(indicator.explanation);
      suggestedActions.push('Provide targeted practice material or arrange a remedial workshop on fundamental concepts.');
    }
  }

  // 3. Performance Decline Evaluation
  let declineTriggered = false;
  if (activeSettings.enableDeclineRule) {
    if (trendSummary.canEvaluateDecline && trendSummary.delta !== null) {
      const drop = Math.abs(trendSummary.delta);
      if (trendSummary.delta <= -activeSettings.declineThreshold) {
        declineTriggered = true;
        const indicator = {
          code: 'PERFORMANCE_DECLINE',
          label: 'Significant Performance Drop',
          category: 'trend',
          severity: drop >= 25 ? 'high' : 'medium',
          observedValue: `-${drop} pts (${trendSummary.priorScore}% → ${trendSummary.recentScore}%)`,
          threshold: `Decline ≥ ${activeSettings.declineThreshold} pts`,
          details: `Dropped from ${trendSummary.priorScore}% in "${trendSummary.priorTitle}" to ${trendSummary.recentScore}% in "${trendSummary.recentTitle}".`,
          explanation: `Recent performance declined by ${drop} percentage points between recent assessments (${trendSummary.priorScore}% to ${trendSummary.recentScore}%).`
        };
        indicators.push(indicator);
        explanations.push(indicator.explanation);
        suggestedActions.push('Review specific test errors with the student and offer diagnostic guidance before the next evaluation.');
      }
    } else if (trendSummary.trend === 'insufficient_data') {
      // Data insufficiency notice - explicitly not a penalty
      // We don't trigger a risk indicator, but note it in evaluation status
    }
  }

  // Synthesis & Status determination
  let status = 'on_track';
  let priorityLabel = 'On Track';
  let summaryText = 'Student performance and attendance are within expected parameters.';

  if (indicators.length >= 2) {
    status = 'high_priority_review';
    priorityLabel = 'Needs Priority Review';
    summaryText = `${explanations.join(' ')} These multiple indicators suggest that timely teacher check-in and support may be beneficial.`;
  } else if (indicators.length === 1) {
    status = 'review_suggested';
    priorityLabel = 'Support May Be Helpful';
    summaryText = `${explanations[0]} This indicator suggests that a teacher check-in or practice review may be helpful.`;
  } else if (!attendanceSummary.hasData || (trendSummary.trend === 'insufficient_data' && !assessmentSummary.hasData)) {
    status = 'insufficient_data';
    priorityLabel = 'Insufficient Data';
    summaryText = 'Additional attendance or assessment records are required to perform a comprehensive evaluation.';
  }

  return {
    studentId: student.id,
    studentCode: student.studentCode || student.id,
    studentName: student.displayName,
    classId: student.classId,
    status,
    priorityLabel,
    indicators,
    triggeredCount: indicators.length,
    attendanceTriggered,
    averageTriggered,
    declineTriggered,
    explanations,
    summaryText,
    suggestedActions,
    evaluatedAt: new Date().toISOString(),
    metrics: {
      attendancePct: attendanceSummary.percentage,
      assessmentAvg: assessmentSummary.average,
      trendDelta: trendSummary.delta,
      trendState: trendSummary.trend,
      validAssessmentsCount: assessmentSummary.count
    },
    safetyDisclaimer: 'This indicator is a transparent prompt for teacher investigation, not a clinical diagnosis or automated grading decision.'
  };
}
