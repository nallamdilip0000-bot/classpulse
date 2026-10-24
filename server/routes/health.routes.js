import express from 'express';
import { getDbStatus } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    status: 'ok',
    service: 'ClassPulse MongoDB Atlas Backend',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

export default router;
