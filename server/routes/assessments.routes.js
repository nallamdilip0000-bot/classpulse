import express from 'express';
import { Assessment } from '../models/Assessment.js';
import { AssessmentResult } from '../models/AssessmentResult.js';

const router = express.Router();

// GET all assessments
router.get('/', async (req, res) => {
  try {
    const { classId } = req.query;
    const filter = classId && classId !== 'ALL' ? { classId } : {};
    const assessments = await Assessment.find(filter).sort({ assessmentDate: -1 });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create assessment
router.post('/', async (req, res) => {
  try {
    const id = `ASM-${Date.now().toString().slice(-5)}`;
    const newAssessment = new Assessment({
      id,
      ...req.body
    });
    await newAssessment.save();
    res.status(201).json(newAssessment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET assessment results
router.get('/results', async (req, res) => {
  try {
    const { assessmentId, studentId } = req.query;
    const filter = {};
    if (assessmentId) filter.assessmentId = assessmentId;
    if (studentId) filter.studentId = studentId;

    const results = await AssessmentResult.find(filter);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST batch save marks
router.post('/marks', async (req, res) => {
  const { assessmentId, marks } = req.body;
  if (!assessmentId || !Array.isArray(marks)) {
    return res.status(400).json({ error: 'assessmentId and marks array are required' });
  }

  try {
    const ops = marks.map((m, idx) => ({
      updateOne: {
        filter: { assessmentId, studentId: m.studentId },
        update: {
          $set: {
            id: `RES-${assessmentId}-${m.studentId}`,
            assessmentId,
            studentId: m.studentId,
            marksObtained: m.marksObtained !== null && m.marksObtained !== undefined ? Number(m.marksObtained) : null,
            resultStatus: m.resultStatus || (m.marksObtained !== null ? 'scored' : 'missing'),
            notes: m.notes || '',
            updatedAt: new Date()
          }
        },
        upsert: true
      }
    }));

    await AssessmentResult.bulkWrite(ops);
    res.json({ success: true, count: marks.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
