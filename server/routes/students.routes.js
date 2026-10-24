import express from 'express';
import { Student } from '../models/Student.js';

const router = express.Router();

// GET all students (supports ?classId=CLS-10A)
router.get('/', async (req, res) => {
  try {
    const { classId } = req.query;
    const filter = classId && classId !== 'ALL' ? { classId } : {};
    const students = await Student.find(filter).sort({ displayName: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single student
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findOne({
      $or: [{ id: req.params.id }, { studentCode: req.params.id }]
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST enroll student (Admin and Faculty authorized, students prohibited)
router.post('/', async (req, res) => {
  const userRole = req.headers['x-user-role'] || req.body.role;
  if (userRole === 'student') {
    return res.status(403).json({ error: 'Forbidden: Students cannot manually enroll other students.' });
  }

  try {
    const { studentCode, displayName, classId, dateOfBirth, guardianContact, notes, profileCategory } = req.body;
    const cleanCode = (studentCode || '').trim().toUpperCase();

    const existing = await Student.findOne({
      $or: [{ id: cleanCode }, { studentCode: cleanCode }]
    });

    if (existing) {
      // Update existing student
      existing.displayName = displayName || existing.displayName;
      existing.classId = classId || existing.classId;
      existing.guardianContact = guardianContact || existing.guardianContact;
      existing.notes = notes || existing.notes;
      existing.updatedAt = new Date();
      await existing.save();
      return res.json(existing);
    }

    const newStudent = new Student({
      id: cleanCode,
      studentCode: cleanCode,
      displayName: displayName.trim(),
      email: `${cleanCode.toLowerCase()}@student.classpulse.edu`,
      classId,
      dateOfBirth,
      guardianContact,
      notes,
      profileCategory: profileCategory || 'Newly Enrolled',
      attendanceRate: 100,
      academicAverage: 85
    });

    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
