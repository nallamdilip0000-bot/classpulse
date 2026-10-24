/**
 * MongoDB Atlas & REST API Service for ClassPulse
 * 
 * Provides seamless integration with the Express + MongoDB Atlas backend
 * at http://localhost:5000/api (or VITE_API_URL).
 * 
 * Features:
 * - Dynamic health & connection detection
 * - Transparent fallback to browser localStorage if server or database is offline
 * - Full CRUD endpoints for Students, Classes, Assessments, Attendance,
 *   Interventions, Institutional Settings, and Auth.
 */

import { storageService } from './storageService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class MongoService {
  constructor() {
    this.apiBase = API_BASE;
    this.lastHealthCheck = null;
    this.isConnectedToAtlas = false;
  }

  /**
   * Verify server health and MongoDB Atlas connection status
   */
  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${this.apiBase}/health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        this.isConnectedToAtlas = false;
        return { online: false, isConnected: false };
      }

      const data = await res.json();
      this.lastHealthCheck = data;
      this.isConnectedToAtlas = Boolean(data?.database?.isConnected);

      return {
        online: true,
        isConnected: this.isConnectedToAtlas,
        details: data
      };
    } catch {
      this.isConnectedToAtlas = false;
      return { online: false, isConnected: false };
    }
  }

  /**
   * Safe fetch with automatic fallback error handling
   */
  async safeFetch(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const res = await fetch(`${this.apiBase}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.status === 503) {
      const err = await res.json();
      throw new Error(err.message || 'MongoDB Atlas is not connected');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server responded with HTTP ${res.status}`);
    }

    return await res.json();
  }

  // ==========================================
  // Students
  // ==========================================
  async getStudents(classId = 'ALL') {
    try {
      const query = classId && classId !== 'ALL' ? `?classId=${encodeURIComponent(classId)}` : '';
      const data = await this.safeFetch(`/students${query}`);
      return data;
    } catch {
      // Fallback to local storage
      const local = storageService.getStudents();
      return classId && classId !== 'ALL' ? local.filter(s => s.classId === classId) : local;
    }
  }

  async enrollStudent(studentData) {
    try {
      const res = await this.safeFetch('/students', {
        method: 'POST',
        body: JSON.stringify(studentData)
      });
      return res;
    } catch {
      // Fallback: save to local storage
      const current = storageService.getStudents();
      const newStudent = {
        id: studentData.studentCode,
        ...studentData,
        activeStatus: true,
        attendanceRate: 100,
        academicAverage: 85,
        createdAt: new Date().toISOString()
      };
      const updated = [...current.filter(s => s.id !== newStudent.id && s.studentCode !== newStudent.studentCode), newStudent];
      storageService.saveStudents(updated);
      return newStudent;
    }
  }

  // ==========================================
  // Classes
  // ==========================================
  async getClasses() {
    try {
      return await this.safeFetch('/classes');
    } catch {
      return storageService.getClasses();
    }
  }

  // ==========================================
  // Assessments
  // ==========================================
  async getAssessments(classId = 'ALL') {
    try {
      const query = classId && classId !== 'ALL' ? `?classId=${encodeURIComponent(classId)}` : '';
      return await this.safeFetch(`/assessments${query}`);
    } catch {
      const local = storageService.getAssessments();
      return classId && classId !== 'ALL' ? local.filter(a => a.classId === classId) : local;
    }
  }

  async saveAssessmentMarks(assessmentId, marks) {
    try {
      return await this.safeFetch(`/assessments/${assessmentId}/results`, {
        method: 'POST',
        body: JSON.stringify({ marks })
      });
    } catch {
      const currentResults = storageService.getAssessmentResults();
      const updated = currentResults.map(r => {
        if (r.assessmentId === assessmentId && marks[r.studentId] !== undefined) {
          const m = marks[r.studentId];
          return {
            ...r,
            score: m.absent ? 0 : Number(m.score),
            isAbsent: Boolean(m.absent),
            percentage: m.absent ? 0 : Math.round((Number(m.score) / (m.totalMarks || 100)) * 100)
          };
        }
        return r;
      });
      storageService.saveAssessmentResults(updated);
      return { success: true, count: Object.keys(marks).length };
    }
  }

  // ==========================================
  // Attendance
  // ==========================================
  async getAttendance(classId, date) {
    try {
      const params = new URLSearchParams();
      if (classId) params.append('classId', classId);
      if (date) params.append('date', date);
      return await this.safeFetch(`/attendance?${params.toString()}`);
    } catch {
      return storageService.getAttendanceRecords();
    }
  }

  async recordAttendance(records) {
    try {
      return await this.safeFetch('/attendance', {
        method: 'POST',
        body: JSON.stringify({ records })
      });
    } catch {
      const current = storageService.getAttendanceRecords();
      const map = new Map(current.map(r => [`${r.studentId}_${r.date}`, r]));
      records.forEach(r => map.set(`${r.studentId}_${r.date}`, r));
      const updated = Array.from(map.values());
      storageService.saveAttendanceRecords(updated);
      return { success: true, count: records.length };
    }
  }

  // ==========================================
  // Interventions
  // ==========================================
  async getInterventions(studentId) {
    try {
      const query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : '';
      return await this.safeFetch(`/interventions${query}`);
    } catch {
      const current = storageService.getInterventions();
      return studentId ? current.filter(i => i.studentId === studentId) : current;
    }
  }

  async addIntervention(interventionData) {
    try {
      return await this.safeFetch('/interventions', {
        method: 'POST',
        body: JSON.stringify(interventionData)
      });
    } catch {
      const current = storageService.getInterventions();
      const newIntervention = {
        id: `INT-${Date.now()}`,
        ...interventionData,
        status: interventionData.status || 'Active',
        createdAt: new Date().toISOString()
      };
      storageService.saveInterventions([newIntervention, ...current]);
      return newIntervention;
    }
  }

  // ==========================================
  // Risk Settings
  // ==========================================
  async getRiskSettings() {
    try {
      return await this.safeFetch('/settings/risk');
    } catch {
      return storageService.getRiskSettings();
    }
  }

  async saveRiskSettings(settings) {
    try {
      return await this.safeFetch('/settings/risk', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
    } catch {
      storageService.saveRiskSettings(settings);
      return settings;
    }
  }

  // ==========================================
  // Authentication & Users
  // ==========================================
  async login(identifier, password, role) {
    try {
      return await this.safeFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password, role })
      });
    } catch (err) {
      throw err;
    }
  }

  async register(userData) {
    try {
      return await this.safeFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    } catch (err) {
      throw err;
    }
  }
}

export const mongoService = new MongoService();
