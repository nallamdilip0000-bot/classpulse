import express from 'express';
import { Class } from '../models/Class.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const classes = await Class.find({}).sort({ id: 1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const cls = await Class.findOne({ id: req.params.id });
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
