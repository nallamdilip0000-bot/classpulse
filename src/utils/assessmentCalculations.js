/**
 * Assessment Calculations Utility for ClassPulse
 * 
 * Rules:
 * - Always normalize scores to percentage: (marksObtained / maximumMarks) * 100
 * - Never treat missing assessments as 0 marks. Display separately as 'missing' or 'incomplete'.
 * - Minimum 2 valid assessments needed to calculate a performance trend.
 * - Trend: upward, stable, or downward with percentage point difference.
 */

export function normalizeAssessmentScore(marksObtained, maximumMarks) {
  if (marksObtained === null || marksObtained === undefined || isNaN(marksObtained)) {
    return null;
  }
  if (!maximumMarks || maximumMarks <= 0) {
    return 0;
  }
  const pct = (Number(marksObtained) / Number(maximumMarks)) * 100;
  return Math.round(pct * 10) / 10;
}

/**
 * Filter valid scored assessments (excluding missing or unrecorded)
 */
export function getValidAssessments(results = [], assessmentsMap = {}) {
  return results
    .filter(res => {
      if (res.resultStatus === 'missing' || res.resultStatus === 'excused') return false;
      if (res.marksObtained === null || res.marksObtained === undefined || res.marksObtained === '') return false;
      return true;
    })
    .map(res => {
      const assessment = assessmentsMap[res.assessmentId] || {};
      const maxMarks = assessment.maximumMarks || 100;
      const percentage = normalizeAssessmentScore(res.marksObtained, maxMarks);
      return {
        ...res,
        assessmentTitle: assessment.title || 'Assessment',
        subject: assessment.subject || 'General',
        assessmentDate: assessment.assessmentDate || res.date || '2026-01-01',
        maximumMarks: maxMarks,
        percentage
      };
    })
    .sort((a, b) => new Date(a.assessmentDate) - new Date(b.assessmentDate));
}

/**
 * Calculates recent assessment average for a student
 * @param {Array} validAssessments Sorted chronological valid assessments
 * @param {number} windowSize Optional limit to the N most recent (default: all or recent 3)
 */
export function calculateAssessmentAverage(validAssessments = [], windowSize = null) {
  if (!validAssessments || validAssessments.length === 0) {
    return {
      average: null,
      count: 0,
      hasData: false,
      text: 'No completed assessments'
    };
  }

  const subset = windowSize && windowSize > 0 
    ? validAssessments.slice(-windowSize) 
    : validAssessments;

  const sum = subset.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
  const average = Math.round((sum / subset.length) * 10) / 10;

  return {
    average,
    count: subset.length,
    hasData: true,
    totalValid: validAssessments.length,
    windowDescription: windowSize ? `Last ${subset.length} assessments` : `All ${subset.length} assessments`
  };
}

/**
 * Calculates assessment trend between recent assessment and baseline/prior assessment.
 * Requirements:
 * - Minimum 2 valid assessments needed.
 * - Otherwise return 'insufficient_data'.
 */
export function calculateAssessmentTrend(validAssessments = []) {
  if (!validAssessments || validAssessments.length < 2) {
    return {
      trend: 'insufficient_data',
      delta: null,
      description: 'Insufficient assessment data (minimum 2 required)',
      recentScore: validAssessments.length === 1 ? validAssessments[0].percentage : null,
      priorScore: null,
      canEvaluateDecline: false
    };
  }

  const recent = validAssessments[validAssessments.length - 1];
  const prior = validAssessments[validAssessments.length - 2];
  
  const delta = Math.round((recent.percentage - prior.percentage) * 10) / 10;

  let trend = 'stable';
  if (delta <= -5) {
    trend = 'downward';
  } else if (delta >= 5) {
    trend = 'upward';
  }

  return {
    trend,
    delta, // in percentage points, e.g. -16.5
    recentScore: recent.percentage,
    priorScore: prior.percentage,
    recentTitle: recent.assessmentTitle,
    priorTitle: prior.assessmentTitle,
    recentDate: recent.assessmentDate,
    priorDate: prior.assessmentDate,
    canEvaluateDecline: true,
    description: delta >= 0 
      ? `Increased by ${delta} percentage points (${prior.percentage}% to ${recent.percentage}%)`
      : `Decreased by ${Math.abs(delta)} percentage points (${prior.percentage}% to ${recent.percentage}%)`
  };
}
