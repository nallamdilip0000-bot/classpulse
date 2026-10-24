/**
 * ClassPulse Verification Test Suite
 * Tests calculation formulas, risk indicators, edge cases, and safety rules.
 */

import { calculateAttendancePercentage } from '../src/utils/attendanceCalculations.js';
import { 
  normalizeAssessmentScore, 
  calculateAssessmentAverage, 
  calculateAssessmentTrend,
  getValidAssessments 
} from '../src/utils/assessmentCalculations.js';
import { 
  evaluateStudentSupportIndicators, 
  DEFAULT_RISK_SETTINGS 
} from '../src/utils/riskRules.js';
import { 
  validateMarks, 
  validateRiskThresholds 
} from '../src/utils/validation.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✓ PASS: ${message}`);
  } else {
    console.error(`✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log('\n--- ClassPulse Automated Verification Tests ---\n');

// 1. Attendance percentage calculation & Excused absence exemption
const attRecords1 = [
  { status: 'present' },
  { status: 'present' },
  { status: 'absent' },
  { status: 'excused' }
];
const attCalc1 = calculateAttendancePercentage(attRecords1);
// Present: 2, Absent: 1, Excused: 1 -> Eligible = 3 -> 2/3 = 66.7%
assert(attCalc1.percentage === 66.7, 'Scenario 7: Attendance percentage calculates correctly with excused absence exemption (2/3 = 66.7%)');
assert(attCalc1.totalEligible === 3, 'Eligible classes equals present + absent (3)');
assert(attCalc1.excused === 1, 'Excused absence recorded separately');

// Edge case: Zero eligible classes (all excused)
const zeroEligible = calculateAttendancePercentage([{ status: 'excused' }, { status: 'excused' }]);
assert(zeroEligible.percentage === 100, 'Zero eligible classes safely returns 100% without division-by-zero');

// 2. Normalizing assessment scores & Missing marks handling
const norm1 = normalizeAssessmentScore(38, 50); // 38 / 50 = 76%
assert(norm1 === 76, 'Raw score 38/50 normalized to 76%');

const normMissing = normalizeAssessmentScore(null, 50);
assert(normMissing === null, 'Scenario 6: Missing assessment is null, not 0');

// 3. Insufficient assessment data handling
const trendInsufficient = calculateAssessmentTrend([
  { percentage: 65, assessmentTitle: 'Quiz 1' }
]);
assert(
  trendInsufficient.trend === 'insufficient_data', 
  'Scenario 5: Student with only 1 assessment is marked as insufficient_data, NOT declining'
);
assert(trendInsufficient.canEvaluateDecline === false, 'Cannot evaluate decline with <2 assessments');

// 4. Performance decline detection
const trendDecline = calculateAssessmentTrend([
  { percentage: 80, assessmentTitle: 'Quiz 1' },
  { percentage: 55, assessmentTitle: 'Midterm' }
]);
assert(trendDecline.trend === 'downward', 'Score drop from 80% to 55% detected as downward');
assert(trendDecline.delta === -25, 'Decline delta is -25 percentage points');

// 5. Risk rule evaluations
const dummyStudent = { id: 'STU-999', displayName: 'Test Student', classId: 'CLS-10A' };

// Scenario 1: Low attendance triggers attendance indicator
const evalAttendanceOnly = evaluateStudentSupportIndicators(
  dummyStudent,
  { hasData: true, percentage: 68, attended: 13, totalEligible: 19, absent: 6, excused: 1 },
  { hasData: true, average: 75, count: 2 },
  { canEvaluateDecline: true, delta: 2, trend: 'stable' },
  DEFAULT_RISK_SETTINGS
);
assert(evalAttendanceOnly.attendanceTriggered === true, 'Scenario 1: Attendance below 75% triggers attendance indicator');
assert(evalAttendanceOnly.declineTriggered === false, 'Decline indicator not triggered when delta is positive');
assert(evalAttendanceOnly.triggeredCount === 1, 'Exactly 1 indicator triggered');
assert(evalAttendanceOnly.priorityLabel === 'Support May Be Helpful', 'Non-punitive priority label assigned');

// Scenario 2: Declining marks triggers performance-trend indicator
const evalDeclineOnly = evaluateStudentSupportIndicators(
  dummyStudent,
  { hasData: true, percentage: 95, attended: 19, totalEligible: 20, absent: 1, excused: 0 },
  { hasData: true, average: 60, count: 2 },
  { canEvaluateDecline: true, delta: -20, trend: 'downward', priorScore: 70, recentScore: 50, priorTitle: 'T1', recentTitle: 'T2' },
  DEFAULT_RISK_SETTINGS
);
assert(evalDeclineOnly.declineTriggered === true, 'Scenario 2: Drop of 20 pts (>=15) triggers decline indicator');
assert(evalDeclineOnly.attendanceTriggered === false, 'Attendance indicator not triggered when attendance is 95%');

// Scenario 3: Multiple rules triggered
const evalMulti = evaluateStudentSupportIndicators(
  dummyStudent,
  { hasData: true, percentage: 60, attended: 12, totalEligible: 20, absent: 8, excused: 0 },
  { hasData: true, average: 35, count: 2 },
  { canEvaluateDecline: true, delta: -18, trend: 'downward', priorScore: 53, recentScore: 35, priorTitle: 'T1', recentTitle: 'T2' },
  DEFAULT_RISK_SETTINGS
);
assert(evalMulti.triggeredCount === 3, 'Scenario 3: Student triggers attendance, low baseline, and decline rules');
assert(evalMulti.status === 'high_priority_review', 'Multi-factor classified as high priority review');
assert(evalMulti.explanations.length === 3, 'Displays all 3 distinct explanations');

// Scenario 4: Changing thresholds recalculates indicators
const strictThresholdSettings = {
  ...DEFAULT_RISK_SETTINGS,
  attendanceThreshold: 60 // Lower threshold to 60%
};
const evalRecalc = evaluateStudentSupportIndicators(
  dummyStudent,
  { hasData: true, percentage: 65, attended: 13, totalEligible: 20, absent: 7, excused: 0 },
  { hasData: true, average: 75, count: 2 },
  { canEvaluateDecline: true, delta: 0, trend: 'stable' },
  strictThresholdSettings
);
assert(evalRecalc.attendanceTriggered === false, 'Scenario 4: Changing threshold to 60% clears flag for student with 65% attendance');

// Scenario 8: Validation of invalid marks and threshold inputs
const valNegativeMarks = validateMarks(-5, 50);
assert(valNegativeMarks.valid === false, 'Scenario 8: Negative marks (-5) rejected');

const valExcessMarks = validateMarks(55, 50);
assert(valExcessMarks.valid === false, 'Scenario 8: Marks exceeding maximum (55/50) rejected');

const valThresholds = validateRiskThresholds({
  attendanceThreshold: 120, // Invalid >100
  minimumAverageThreshold: 40,
  declineThreshold: 15,
  minimumAssessments: 2
});
assert(valThresholds.isValid === false, 'Scenario 8: Attendance threshold >100% rejected');

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.\n`);
