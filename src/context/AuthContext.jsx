import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS } from '../data/syntheticData';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import { storageService } from '../services/storageService';

const AuthContext = createContext(null);

const STORAGE_AUTH_KEY = 'classpulse_auth_user_v1';
const STORAGE_REGISTERED_USERS_KEY = 'classpulse_registered_users_v2';

export function AuthProvider({ children }) {
  // Load custom registered users
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_REGISTERED_USERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allAvailablePersonas = [...INITIAL_USERS, ...registeredUsers];

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AUTH_KEY);
      if (saved) {
        if (saved === 'logged_out' || saved === 'null') return null;
        return JSON.parse(saved);
      }
    } catch {}
    // Default to Teacher persona (Sarah Jenkins) for first-time evaluation
    return INITIAL_USERS[1];
  });

  const [isDemoMode] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.setItem(STORAGE_AUTH_KEY, 'logged_out');
    }
  }, [currentUser]);

  // Demo Persona Switcher
  const switchPersona = (personaId) => {
    const selected = allAvailablePersonas.find(u => u.id === personaId);
    if (selected) {
      setCurrentUser(selected);
      return true;
    }
    return false;
  };

  const switchRole = (role) => {
    // Normalizes role alias (faculty -> teacher)
    const targetRole = role === 'faculty' ? 'teacher' : role;
    const persona = allAvailablePersonas.find(u => u.role === targetRole);
    if (persona) {
      setCurrentUser(persona);
    }
  };

  // Instant login as persona
  const loginAsPersona = (personaId) => {
    const selected = allAvailablePersonas.find(u => u.id === personaId);
    if (selected) {
      setCurrentUser(selected);
      return { success: true, user: selected };
    }
    return { success: false, error: 'Persona not found' };
  };

  // User Registration
  const register = async ({ fullName, email, password, role, department, studentCode, classId }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (fullName || '').trim();
    const targetRole = role === 'faculty' ? 'teacher' : (role || 'teacher');
    const cleanStudentCode = studentCode ? studentCode.trim().toUpperCase() : undefined;

    // Check if account already exists
    const allUsers = [...INITIAL_USERS, ...registeredUsers];
    const emailExists = allUsers.some(u => u.email?.toLowerCase() === cleanEmail);
    if (emailExists) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please sign in instead.'
      };
    }

    if (cleanStudentCode) {
      const idExists = allUsers.some(u => u.studentId?.toUpperCase() === cleanStudentCode);
      if (idExists) {
        return {
          success: false,
          error: `An account with Student ID ${cleanStudentCode} already exists.`
        };
      }
    }

    // Live Supabase signup if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password || 'demo123',
          options: {
            data: {
              display_name: cleanName,
              role: targetRole,
              title: targetRole === 'admin' 
                ? (department ? `${department} Administrator` : 'Administrator') 
                : targetRole === 'student' 
                ? 'Student' 
                : (department ? `${department} Faculty` : 'Faculty Instructor')
            }
          }
        });

        if (error) {
          console.warn('Supabase registration error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase signUp warning:', err);
      }
    }

    // Generate Initials
    const initials = cleanName
      .split(/\s+/)
      .map(part => part[0])
      .filter(Boolean)
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'CP';

    const assignedClassIds = targetRole === 'admin'
      ? ['CLS-10A', 'CLS-10B', 'CLS-11A']
      : [classId || 'CLS-10A'];

    const roleTitle = targetRole === 'admin'
      ? (department ? `${department} Administrator` : 'Institutional Administrator')
      : targetRole === 'student'
      ? (classId ? `Student (${classId.replace('CLS-', 'Class ')})` : 'Enrolled Student')
      : (department ? `${department} Faculty Instructor` : 'Faculty Instructor');

    const finalStudentId = targetRole === 'student'
      ? (cleanStudentCode || `STU-${Math.floor(130 + Math.random() * 800)}`)
      : undefined;

    const newUser = {
      id: `USR-${targetRole.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      displayName: cleanName,
      email: cleanEmail,
      password: password || 'demo123',
      role: targetRole,
      title: roleTitle,
      department: department || undefined,
      studentId: finalStudentId,
      avatarInitials: initials,
      assignedClassIds,
      isCustomRegistered: true,
      registeredAt: new Date().toISOString()
    };

    // If Student: automatically append student to students roster so they exist across ClassPulse
    if (targetRole === 'student') {
      try {
        const currentStudents = storageService.getStudents();
        const studentExists = currentStudents.some(s => s.id === finalStudentId || s.studentCode === finalStudentId);
        if (!studentExists) {
          const newStudentRecord = {
            id: finalStudentId,
            studentCode: finalStudentId,
            name: cleanName,
            displayName: cleanName,
            email: cleanEmail,
            classId: assignedClassIds[0],
            gender: 'Other',
            enrollmentDate: new Date().toISOString().split('T')[0],
            parentContact: 'family@classpulse.edu',
            attendanceRate: 100,
            academicAverage: 85
          };
          storageService.saveStudents([...currentStudents, newStudentRecord]);
        }
      } catch (err) {
        console.warn('Failed to sync registered student to student list:', err);
      }
    }

    const updated = [...registeredUsers, newUser];
    setRegisteredUsers(updated);
    localStorage.setItem(STORAGE_REGISTERED_USERS_KEY, JSON.stringify(updated));
    setCurrentUser(newUser);

    return {
      success: true,
      user: newUser
    };
  };

  // Delete registered account
  const deleteRegisteredUser = (userId) => {
    const updated = registeredUsers.filter(u => u.id !== userId);
    setRegisteredUsers(updated);
    localStorage.setItem(STORAGE_REGISTERED_USERS_KEY, JSON.stringify(updated));
    if (currentUser?.id === userId) {
      setCurrentUser(INITIAL_USERS[1]);
    }
  };

  // Full login function with dual mode (Supabase + Demo Persona directory)
  const login = async ({ identifier, password, role }) => {
    const cleanId = (identifier || '').trim();
    const targetRole = role === 'faculty' ? 'teacher' : role;

    // 1. Supabase live auth if configured
    if (isSupabaseConfigured && supabase && cleanId.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanId,
          password: password || 'demo123'
        });

        if (!error && data?.user) {
          const liveUser = {
            id: data.user.id,
            displayName: data.user.user_metadata?.display_name || cleanId.split('@')[0],
            email: data.user.email,
            role: targetRole || data.user.user_metadata?.role || 'teacher',
            title: data.user.user_metadata?.title || (targetRole === 'admin' ? 'Administrator' : targetRole === 'student' ? 'Student' : 'Faculty Member'),
            avatarInitials: cleanId.substring(0, 2).toUpperCase(),
            assignedClassIds: ['CLS-10A']
          };
          setCurrentUser(liveUser);
          return { success: true, user: liveUser };
        }
      } catch (err) {
        console.warn('Supabase authentication failed, checking local directory fallback:', err);
      }
    }

    // 2. Demo & Registered User lookup
    const allUsers = [...INITIAL_USERS, ...registeredUsers];
    const lowerId = cleanId.toLowerCase();
    let matched = allUsers.find(u => {
      if (u.email?.toLowerCase() === lowerId) return true;
      if (u.id?.toLowerCase() === lowerId) return true;
      if (u.studentId?.toLowerCase() === lowerId) return true;
      if (u.displayName?.toLowerCase() === lowerId) return true;
      return false;
    });

    // 2b. Check enrolled students in roster if not already in user directory
    if (!matched && cleanId) {
      try {
        const rosterStudents = storageService.getStudents();
        const studentMatch = rosterStudents.find(s => 
          s.studentCode?.toLowerCase() === lowerId ||
          s.id?.toLowerCase() === lowerId ||
          s.email?.toLowerCase() === lowerId ||
          s.displayName?.toLowerCase() === lowerId
        );
        if (studentMatch) {
          const stCode = studentMatch.studentCode || studentMatch.id;
          matched = {
            id: `USR-${stCode}`,
            studentId: stCode,
            displayName: studentMatch.displayName,
            email: studentMatch.email || `${stCode.toLowerCase()}@student.classpulse.edu`,
            role: 'student',
            title: `Student (${studentMatch.classId})`,
            avatarInitials: studentMatch.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
            assignedClassIds: [studentMatch.classId],
            password: 'demo123'
          };
        }
      } catch (err) {
        console.warn('Roster student lookup warning:', err);
      }
    }

    // If identifier empty and matching role provided, pick default role persona
    if (!matched && !cleanId && targetRole) {
      matched = allUsers.find(u => u.role === targetRole);
    }

    if (matched) {
      // Password verification for custom registered users or if password provided
      if (matched.password && password && matched.password !== password && password !== 'demo123') {
        return {
          success: false,
          notFound: false,
          error: 'Incorrect password. Please verify credentials or use demo password.'
        };
      }

      // If role was specified and persona role differs, find matching role persona if available
      if (targetRole && matched.role !== targetRole) {
        const rolePersona = allUsers.find(u => u.role === targetRole && (u.email?.toLowerCase() === lowerId || u.studentId?.toLowerCase() === lowerId));
        if (rolePersona) matched = rolePersona;
      }
      setCurrentUser(matched);
      return { success: true, user: matched };
    }

    // 3. Account NOT found - Prompt to register!
    if (cleanId) {
      return {
        success: false,
        notFound: true,
        identifier: cleanId,
        role: targetRole || 'teacher',
        error: `No account found for "${cleanId}". Would you like to register a new account?`
      };
    }

    return { 
      success: false, 
      notFound: false,
      error: 'Please enter a valid email or ID, or choose a quick demo account.' 
    };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase logout error:', err);
      }
    }
    localStorage.setItem(STORAGE_AUTH_KEY, 'logged_out');
    setCurrentUser(null);
  };

  // Permission helpers
  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'teacher';
  const isFaculty = isTeacher; // Alias for faculty
  const isStudent = currentUser?.role === 'student';
  const isAuthenticated = Boolean(currentUser);

  const canAccessClass = (classId) => {
    if (isAdmin) return true;
    if (isTeacher) {
      return (currentUser?.assignedClassIds || []).includes(classId);
    }
    if (isStudent) {
      return (currentUser?.assignedClassIds || []).includes(classId);
    }
    return false;
  };

  const canAccessStudent = (studentClassId, studentId) => {
    if (isAdmin) return true;
    if (isTeacher) {
      return (currentUser?.assignedClassIds || []).includes(studentClassId);
    }
    if (isStudent) {
      return currentUser?.studentId === studentId;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role || (isStudent ? 'student' : isTeacher ? 'teacher' : 'guest'),
        isAuthenticated,
        isAdmin,
        isTeacher,
        isFaculty,
        isStudent,
        availablePersonas: allAvailablePersonas,
        registeredUsers,
        isDemoMode,
        login,
        loginAsPersona,
        register,
        deleteRegisteredUser,
        switchPersona,
        switchRole,
        logout,
        canAccessClass,
        canAccessStudent
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
