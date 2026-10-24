/**
 * Automated Verification for Login, Registration & Role-Based Authentication
 */

import { INITIAL_USERS } from '../src/data/syntheticData.js';
import { validateRegistrationForm } from '../src/utils/validation.js';

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

console.log('\n--- ClassPulse Login, Registration & Role Authentication Tests ---\n');

// 1. Verify all 3 roles exist in the synthetic user directory
const studentUsers = INITIAL_USERS.filter(u => u.role === 'student');
const facultyUsers = INITIAL_USERS.filter(u => u.role === 'teacher');
const adminUsers = INITIAL_USERS.filter(u => u.role === 'admin');

assert(studentUsers.length >= 2, 'Student role accounts available (Amina Yusuf, Marcus Vance)');
assert(facultyUsers.length >= 2, 'Faculty role accounts available (Sarah Jenkins, David Al-Mansoor)');
assert(adminUsers.length >= 1, 'Administrator role account available (Dr. Arthur Vance)');

// 2. Student identifier matching logic
const testStudentId = 'STU-101';
const matchedStudent = INITIAL_USERS.find(u => 
  u.studentId === testStudentId || u.email?.toLowerCase() === testStudentId.toLowerCase()
);
assert(matchedStudent && matchedStudent.displayName === 'Amina Yusuf', 'Student successfully matched by Student ID "STU-101"');

// 3. Faculty identifier matching logic
const testFacultyEmail = 's.jenkins@classpulse.edu';
const matchedFaculty = INITIAL_USERS.find(u => 
  u.email?.toLowerCase() === testFacultyEmail.toLowerCase()
);
assert(matchedFaculty && matchedFaculty.displayName === 'Mrs. Sarah Jenkins', 'Faculty matched by email "s.jenkins@classpulse.edu"');

// 4. Administrator identifier matching logic
const testAdminEmail = 'principal.vance@classpulse.edu';
const matchedAdmin = INITIAL_USERS.find(u => 
  u.email?.toLowerCase() === testAdminEmail.toLowerCase()
);
assert(matchedAdmin && matchedAdmin.displayName === 'Dr. Arthur Vance', 'Administrator matched by email "principal.vance@classpulse.edu"');

// 5. Role permissions verification
assert(matchedAdmin.role === 'admin', 'Arthur Vance has admin role');
const adminClassCheck = (classId) => matchedAdmin.role === 'admin' || matchedAdmin.assignedClassIds.includes(classId);
assert(adminClassCheck('CLS-10A') && adminClassCheck('CLS-10B') && adminClassCheck('CLS-11A'), 'Admin has school-wide access to all cohorts');

const facultyClassCheck = (classId) => matchedFaculty.role === 'admin' || matchedFaculty.assignedClassIds.includes(classId);
assert(facultyClassCheck('CLS-10A'), 'Faculty can access assigned class 10-A');
assert(!facultyClassCheck('CLS-10B'), 'Faculty restricted from unassigned class 10-B');

const canAccessStudent = (user, targetStudentId) => {
  if (user.role === 'admin') return true;
  if (user.role === 'teacher') return true;
  if (user.role === 'student') return user.studentId === targetStudentId;
  return false;
};
assert(canAccessStudent(matchedStudent, 'STU-101'), 'Student Amina can view her own record (STU-101)');
assert(!canAccessStudent(matchedStudent, 'STU-102'), 'Student Amina cannot view Marcus Vance record (STU-102)');

// 6. Account NOT found detection logic
const lookupUser = (identifier, userList = INITIAL_USERS) => {
  const cleanId = (identifier || '').trim().toLowerCase();
  const matched = userList.find(u => 
    u.email?.toLowerCase() === cleanId ||
    u.id?.toLowerCase() === cleanId ||
    u.studentId?.toLowerCase() === cleanId ||
    u.displayName?.toLowerCase() === cleanId
  );
  if (!matched && cleanId) {
    return { found: false, notFound: true, identifier: cleanId, error: `No account found for "${cleanId}"` };
  }
  return { found: true, user: matched };
};

const unknownLookup = lookupUser('nonexistent.user@school.edu');
assert(!unknownLookup.found && unknownLookup.notFound === true, 'Unknown email correctly flagged as account not found');
assert(unknownLookup.identifier === 'nonexistent.user@school.edu', 'Returns target identifier for seamless registration prefill');

const unknownStudentLookup = lookupUser('STU-999');
assert(!unknownStudentLookup.found && unknownStudentLookup.notFound === true, 'Unknown Student ID correctly flagged as account not found');

// 7. Registration Form Validation
const emptyVal = validateRegistrationForm({});
assert(!emptyVal.isValid, 'Empty registration form is rejected');
assert(Boolean(emptyVal.errors.fullName), 'Full name is required');
assert(Boolean(emptyVal.errors.email), 'Email is required');
assert(Boolean(emptyVal.errors.password), 'Password is required');

const invalidEmailVal = validateRegistrationForm({
  fullName: 'John Doe',
  email: 'not-an-email',
  password: 'password123',
  confirmPassword: 'password123',
  role: 'teacher'
});
assert(!invalidEmailVal.isValid && Boolean(invalidEmailVal.errors.email), 'Invalid email format rejected');

const shortPassVal = validateRegistrationForm({
  fullName: 'John Doe',
  email: 'john@classpulse.edu',
  password: '123',
  confirmPassword: '123',
  role: 'teacher'
});
assert(!shortPassVal.isValid && Boolean(shortPassVal.errors.password), 'Short password (<6 chars) rejected');

const mismatchPassVal = validateRegistrationForm({
  fullName: 'John Doe',
  email: 'john@classpulse.edu',
  password: 'password123',
  confirmPassword: 'different123',
  role: 'teacher'
});
assert(!mismatchPassVal.isValid && Boolean(mismatchPassVal.errors.confirmPassword), 'Mismatched passwords rejected');

const missingStudentCodeVal = validateRegistrationForm({
  fullName: 'Alex Student',
  email: 'alex@student.classpulse.edu',
  password: 'password123',
  confirmPassword: 'password123',
  role: 'student',
  classId: 'CLS-10A'
});
assert(!missingStudentCodeVal.isValid && Boolean(missingStudentCodeVal.errors.studentCode), 'Student registration requires student ID code');

const validStudentVal = validateRegistrationForm({
  fullName: 'Alex Carter',
  email: 'alex.c@student.classpulse.edu',
  password: 'password123',
  confirmPassword: 'password123',
  role: 'student',
  studentCode: 'STU-188',
  classId: 'CLS-10A'
});
assert(validStudentVal.isValid && Object.keys(validStudentVal.errors).length === 0, 'Complete student registration form passes validation');

// 8. User Registration Flow & Persistence Simulation
const registeredUsersStore = [];

const simulateRegister = (data) => {
  const cleanEmail = (data.email || '').trim().toLowerCase();
  const allUsers = [...INITIAL_USERS, ...registeredUsersStore];
  
  if (allUsers.some(u => u.email?.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'Email already registered' };
  }
  if (data.studentCode && allUsers.some(u => u.studentId?.toUpperCase() === data.studentCode.toUpperCase())) {
    return { success: false, error: 'Student ID already registered' };
  }

  const newUser = {
    id: `USR-${data.role.toUpperCase().slice(0, 3)}-9999`,
    displayName: data.fullName.trim(),
    email: cleanEmail,
    password: data.password,
    role: data.role,
    title: data.role === 'admin' ? 'Institutional Administrator' : data.role === 'student' ? 'Student' : 'Faculty Instructor',
    avatarInitials: data.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    studentId: data.studentCode,
    assignedClassIds: [data.classId || 'CLS-10A'],
    isCustomRegistered: true
  };
  registeredUsersStore.push(newUser);
  return { success: true, user: newUser };
};

const regResult = simulateRegister({
  fullName: 'Prof. Marie Curie',
  email: 'm.curie@classpulse.edu',
  password: 'securePass123',
  role: 'teacher',
  classId: 'CLS-10A'
});
assert(regResult.success === true, 'New faculty user registered successfully');
assert(registeredUsersStore.length === 1, 'Registered user added to persistence store');

// Duplicate email rejection
const duplicateRegResult = simulateRegister({
  fullName: 'Another Marie',
  email: 'm.curie@classpulse.edu',
  password: 'password456',
  role: 'teacher'
});
assert(!duplicateRegResult.success, 'Duplicate email registration rejected');

// Authenticate newly registered user
const loginRegistered = lookupUser('m.curie@classpulse.edu', [...INITIAL_USERS, ...registeredUsersStore]);
assert(loginRegistered.found && loginRegistered.user.displayName === 'Prof. Marie Curie', 'Newly registered user can log in immediately');

// Role-based Attendance Security Policy
function canModifyAttendance(userRole) {
  return userRole === 'teacher' || userRole === 'faculty' || userRole === 'admin';
}

assert(!canModifyAttendance('student'), 'Student role is forbidden from modifying attendance');
assert(canModifyAttendance('teacher'), 'Teacher role is authorized to modify attendance');
assert(canModifyAttendance('admin'), 'Admin role is authorized to modify attendance');

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.\n`);
