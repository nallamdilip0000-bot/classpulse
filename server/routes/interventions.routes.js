import express from 'express';
import { Intervention } from '../models/Intervention.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { studentId, status } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (status && status !== 'ALL') filter.status = status;

    const interventions = await Intervention.find(filter).sort({ createdAt: -1 });
    res.json(interventions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const id = `INT-${Date.now().toString().slice(-4)}`;
    const newIntervention = new Intervention({
      id,
      ...req.body
    });
    await newIntervention.save();
    res.status(201).json(newIntervention);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { status, notes } = req.body;
  try {
    const item = await Intervention.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Intervention not found' });

    item.status = status || item.status;
    if (notes) item.completionNotes = notes;
    item.updatedAt = new Date();
    if (status === 'completed') item.completedAt = new Date();

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
