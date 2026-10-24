import mongoose from 'mongoose';

const AssessmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  classId: { type: String, required: true },
  maxMarks: { type: Number, required: true },
  assessmentDate: { type: String, required: true },
  assessmentType: { type: String, default: 'Quiz' },
  weightPercentage: { type: Number, default: 10 },
  academicTerm: { type: String, default: 'Fall 2026' },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Assessment = mongoose.model('Assessment', AssessmentSchema);
