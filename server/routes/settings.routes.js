import express from 'express';
import { Settings } from '../models/Settings.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ id: 'institutional-risk-thresholds' });
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { attendanceThreshold, minimumAverageThreshold, declineThreshold, minimumAssessments } = req.body;
    let settings = await Settings.findOne({ id: 'institutional-risk-thresholds' });
    if (!settings) settings = new Settings();

    if (attendanceThreshold !== undefined) settings.attendanceThreshold = Number(attendanceThreshold);
    if (minimumAverageThreshold !== undefined) settings.minimumAverageThreshold = Number(minimumAverageThreshold);
    if (declineThreshold !== undefined) settings.declineThreshold = Number(declineThreshold);
    if (minimumAssessments !== undefined) settings.minimumAssessments = Number(minimumAssessments);
    settings.updatedAt = new Date();

    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
