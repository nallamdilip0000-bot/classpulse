import mongoose from 'mongoose';
import { connectToDatabase } from '../db.js';
import { User } from '../models/User.js';
import { Class } from '../models/Class.js';
import { Student } from '../models/Student.js';
import { Assessment } from '../models/Assessment.js';
import { AssessmentResult } from '../models/AssessmentResult.js';
import { Attendance } from '../models/Attendance.js';
import { Intervention } from '../models/Intervention.js';
import { Settings } from '../models/Settings.js';

import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_USERS,
  INITIAL_ASSESSMENTS,
  generateInitialAssessmentResults,
  generateInitialAttendanceRecords,
  INITIAL_INTERVENTIONS
} from '../../src/data/syntheticData.js';
import { DEFAULT_RISK_SETTINGS } from '../../src/utils/riskRules.js';

export async function seedDatabase(force = false) {
  const conn = await connectToDatabase();
  if (!conn.success) {
    console.error('Cannot seed: Database not connected.');
    return;
  }

  try {
    const studentCount = await Student.countDocuments();
    if (studentCount > 0 && !force) {
      console.log(`Database already contains ${studentCount} students. Skipping seed (use force=true to re-seed).`);
      return;
    }

    console.log('Seeding ClassPulse synthetic dataset into MongoDB Atlas...');

    // Clear existing collections if force
    if (force) {
      console.log('Clearing existing collections...');
      await Promise.all([
        User.deleteMany({}),
        Class.deleteMany({}),
        Student.deleteMany({}),
        Assessment.deleteMany({}),
        AssessmentResult.deleteMany({}),
        Attendance.deleteMany({}),
        Intervention.deleteMany({}),
        Settings.deleteMany({})
      ]);
    }

    // 1. Classes
    console.log(`Inserting ${INITIAL_CLASSES.length} classes...`);
    await Class.insertMany(INITIAL_CLASSES);

    // 2. Users (Add default password 'demo123')
    console.log(`Inserting ${INITIAL_USERS.length} demo users...`);
    const usersWithPasswords = INITIAL_USERS.map(u => ({
      ...u,
      password: 'demo123'
    }));
    await User.insertMany(usersWithPasswords);

    // 3. Students
    console.log(`Inserting ${INITIAL_STUDENTS.length} students...`);
    await Student.insertMany(INITIAL_STUDENTS);

    // 4. Assessments
    console.log(`Inserting ${INITIAL_ASSESSMENTS.length} assessments...`);
    const assessmentsWithMarks = INITIAL_ASSESSMENTS.map(a => ({
      ...a,
      maxMarks: a.maximumMarks || a.maxMarks || 100,
      maximumMarks: a.maximumMarks || a.maxMarks || 100
    }));
    await Assessment.insertMany(assessmentsWithMarks);

    // 5. Assessment Results
    const initialResults = generateInitialAssessmentResults();
    console.log(`Inserting ${initialResults.length} assessment results...`);
    await AssessmentResult.insertMany(initialResults);

    // 6. Attendance Records
    const initialAttendance = generateInitialAttendanceRecords();
    console.log(`Inserting ${initialAttendance.length} attendance records...`);
    await Attendance.insertMany(initialAttendance);

    // 7. Interventions
    console.log(`Inserting ${INITIAL_INTERVENTIONS.length} interventions...`);
    await Intervention.insertMany(INITIAL_INTERVENTIONS);

    // 8. Settings
    console.log('Inserting institutional risk settings...');
    await Settings.create({
      id: 'institutional-risk-thresholds',
      ...DEFAULT_RISK_SETTINGS
    });

    console.log('✅ [MongoDB Atlas] Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed with error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
}

// Run standalone if executed directly
const isDirectRun = process.argv[1]?.endsWith('seed.js');
if (isDirectRun) {
  const force = process.argv.includes('--force');
  seedDatabase(force).then(() => process.exit(0));
}
