/**
 * Form and Data Validation Utilities for ClassPulse
 */

export function validateMarks(marks, maxMarks) {
  if (marks === '' || marks === null || marks === undefined) {
    return { valid: true, value: null, isMissing: true };
  }
  const num = Number(marks);
  if (isNaN(num)) {
    return { valid: false, error: 'Marks must be a valid number' };
  }
  if (num < 0) {
    return { valid: false, error: 'Marks cannot be negative' };
  }
  if (maxMarks && num > Number(maxMarks)) {
    return { valid: false, error: `Marks cannot exceed maximum marks (${maxMarks})` };
  }
  return { valid: true, value: num, isMissing: false };
}

export function validateRiskThresholds(thresholds) {
  const errors = {};

  const att = Number(thresholds.attendanceThreshold);
  if (isNaN(att) || att < 10 || att > 100) {
    errors.attendanceThreshold = 'Attendance threshold must be between 10% and 100%';
  }

  const avg = Number(thresholds.minimumAverageThreshold);
  if (isNaN(avg) || avg < 5 || avg > 90) {
    errors.minimumAverageThreshold = 'Assessment baseline must be between 5% and 90%';
  }

  const dec = Number(thresholds.declineThreshold);
  if (isNaN(dec) || dec < 1 || dec > 50) {
    errors.declineThreshold = 'Decline threshold must be between 1 and 50 percentage points';
  }

  const minA = Number(thresholds.minimumAssessments);
  if (isNaN(minA) || minA < 1 || minA > 10) {
    errors.minimumAssessments = 'Minimum assessments count must be between 1 and 10';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateStudentForm(formData) {
  const errors = {};
  if (!formData.studentCode || !formData.studentCode.trim()) {
    errors.studentCode = 'Student ID code is required (e.g., STU-150)';
  }
  if (!formData.displayName || !formData.displayName.trim()) {
    errors.displayName = 'Student full name is required';
  }
  if (!formData.classId) {
    errors.classId = 'Assigned class is required';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateInterventionForm(formData) {
  const errors = {};
  if (!formData.studentId) {
    errors.studentId = 'Student selection is required';
  }
  if (!formData.plannedAction) {
    errors.plannedAction = 'Planned support action is required';
  }
  if (!formData.reason || !formData.reason.trim()) {
    errors.reason = 'Reason for support follow-up is required';
  }
  if (!formData.nextFollowUpDate) {
    errors.nextFollowUpDate = 'Next follow-up date is required';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateRegistrationForm(formData) {
  const errors = {};
  
  if (!formData.fullName || !formData.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (formData.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }

  const email = (formData.email || '').trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    errors.email = 'Email address is required';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (formData.confirmPassword !== undefined && formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (formData.role === 'student') {
    if (!formData.studentCode || !formData.studentCode.trim()) {
      errors.studentCode = 'Student ID is required (e.g., STU-150)';
    }
    if (!formData.classId) {
      errors.classId = 'Please select your enrolled class';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

