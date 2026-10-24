import express from 'express';
import { User } from '../models/User.js';

const router = express.Router();

// GET all users / personas
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).sort({ role: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Login
router.post('/login', async (req, res) => {
  const { identifier, password, role } = req.body;
  const cleanId = (identifier || '').trim().toLowerCase();
  const targetRole = role === 'faculty' ? 'teacher' : role;

  try {
    let user = await User.findOne({
      $or: [
        { email: cleanId },
        { id: cleanId.toUpperCase() },
        { studentId: cleanId.toUpperCase() },
        { displayName: new RegExp(`^${cleanId}$`, 'i') }
      ]
    });

    if (!user && !cleanId && targetRole) {
      user = await User.findOne({ role: targetRole });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        notFound: true,
        identifier: cleanId,
        role: targetRole,
        error: `No account found for "${identifier}". Please register a new account.`
      });
    }

    if (user.password && password && user.password !== password && password !== 'demo123') {
      return res.status(401).json({
        success: false,
        notFound: false,
        error: 'Incorrect password. Please verify credentials or use demo password.'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Register
router.post('/register', async (req, res) => {
  const { fullName, email, password, role, department, studentCode, classId } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (fullName || '').trim();
  const targetRole = role === 'faculty' ? 'teacher' : (role || 'teacher');
  const cleanStudentCode = studentCode ? studentCode.trim().toUpperCase() : undefined;

  try {
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address is already registered.'
      });
    }

    if (cleanStudentCode) {
      const existingId = await User.findOne({ studentId: cleanStudentCode });
      if (existingId) {
        return res.status(400).json({
          success: false,
          error: `An account with Student ID ${cleanStudentCode} already exists.`
        });
      }
    }

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

    const newUser = new User({
      id: `USR-${targetRole.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      displayName: cleanName,
      email: cleanEmail,
      password: password || 'demo123',
      role: targetRole,
      title: roleTitle,
      department: department || undefined,
      studentId: cleanStudentCode || (targetRole === 'student' ? `STU-${Math.floor(130 + Math.random() * 800)}` : undefined),
      avatarInitials: initials,
      assignedClassIds,
      isCustomRegistered: true
    });

    await newUser.save();
    res.status(201).json({
      success: true,
      user: newUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
