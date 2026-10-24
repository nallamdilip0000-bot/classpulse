import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  id: { type: String, default: 'institutional-risk-thresholds', unique: true },
  attendanceThreshold: { type: Number, default: 75 },
  minimumAverageThreshold: { type: Number, default: 60 },
  declineThreshold: { type: Number, default: 15 },
  minimumAssessments: { type: Number, default: 2 },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'Administrator' }
});

export const Settings = mongoose.model('Settings', SettingsSchema);
