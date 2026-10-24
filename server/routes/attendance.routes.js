import express from 'express';
import { Attendance } from '../models/Attendance.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { studentId, classId, date } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (classId) filter.classId = classId;
    if (date) filter.date = date;

    const records = await Attendance.find(filter).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST batch roll-call upsert
router.post('/batch', async (req, res) => {
  const { records } = req.body;
  if (!Array.isArray(records)) {
    return res.status(400).json({ error: 'Records must be an array' });
  }

  try {
    const ops = records.map(r => ({
      updateOne: {
        filter: { studentId: r.studentId, date: r.date },
        update: {
          $set: {
            id: r.id || `${r.studentId}-${r.date}`,
            studentId: r.studentId,
            classId: r.classId,
            date: r.date,
            status: r.status,
            excusedReason: r.excusedReason || null,
            notes: r.notes || '',
            recordedAt: new Date()
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(ops);
    res.json({ success: true, count: records.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
