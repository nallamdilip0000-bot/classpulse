/**
 * Local Storage Persistence Service for ClassPulse Demo Mode
 * 
 * Provides transparent local persistence for the demo.
 * Fully compatible with future Supabase database integration.
 */

import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_ASSESSMENTS,
  generateInitialAssessmentResults,
  generateInitialAttendanceRecords,
  INITIAL_INTERVENTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOG
} from '../data/syntheticData';
import { DEFAULT_RISK_SETTINGS } from '../utils/riskRules';

const STORAGE_KEYS = {
  CLASSES: 'classpulse_classes_v1',
  STUDENTS: 'classpulse_students_v1',
  ASSESSMENTS: 'classpulse_assessments_v1',
  RESULTS: 'classpulse_results_v1',
  ATTENDANCE: 'classpulse_attendance_v1',
  INTERVENTIONS: 'classpulse_interventions_v1',
  SETTINGS: 'classpulse_settings_v1',
  NOTIFICATIONS: 'classpulse_notifications_v1',
  ACTIVITY: 'classpulse_activity_v1',
  VERSION: 'classpulse_init_flag_v1'
};

export const storageService = {
  initialize() {
    if (!localStorage.getItem(STORAGE_KEYS.VERSION)) {
      this.resetToDefaults();
    }
  },

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(INITIAL_ASSESSMENTS));
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(generateInitialAssessmentResults()));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(generateInitialAttendanceRecords()));
    localStorage.setItem(STORAGE_KEYS.INTERVENTIONS, JSON.stringify(INITIAL_INTERVENTIONS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_RISK_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(INITIAL_ACTIVITY_LOG));
    localStorage.setItem(STORAGE_KEYS.VERSION, 'true');
  },

  getClasses() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
      return data ? JSON.parse(data) : INITIAL_CLASSES;
    } catch {
      return INITIAL_CLASSES;
    }
  },

  getStudents() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return data ? JSON.parse(data) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  },

  saveStudents(students) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  getAssessments() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
      return data ? JSON.parse(data) : INITIAL_ASSESSMENTS;
    } catch {
      return INITIAL_ASSESSMENTS;
    }
  },

  saveAssessments(assessments) {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
  },

  getAssessmentResults() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESULTS);
      return data ? JSON.parse(data) : generateInitialAssessmentResults();
    } catch {
      return generateInitialAssessmentResults();
    }
  },

  saveAssessmentResults(results) {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
  },

  getAttendanceRecords() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return data ? JSON.parse(data) : generateInitialAttendanceRecords();
    } catch {
      return generateInitialAttendanceRecords();
    }
  },

  saveAttendanceRecords(records) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  },

  getInterventions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INTERVENTIONS);
      return data ? JSON.parse(data) : INITIAL_INTERVENTIONS;
    } catch {
      return INITIAL_INTERVENTIONS;
    }
  },

  saveInterventions(interventions) {
    localStorage.setItem(STORAGE_KEYS.INTERVENTIONS, JSON.stringify(interventions));
  },

  getRiskSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_RISK_SETTINGS;
    } catch {
      return DEFAULT_RISK_SETTINGS;
    }
  },

  saveRiskSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getNotifications() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  saveNotifications(notifications) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  getActivityLog() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
      return data ? JSON.parse(data) : INITIAL_ACTIVITY_LOG;
    } catch {
      return INITIAL_ACTIVITY_LOG;
    }
  },

  saveActivityLog(log) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(log));
  }
};
