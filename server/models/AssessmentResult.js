import mongoose from 'mongoose';

const AssessmentResultSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  assessmentId: { type: String, required: true },
  studentId: { type: String, required: true },
  marksObtained: { type: Number, default: null },
  resultStatus: { type: String, enum: ['scored', 'missing', 'excused'], default: 'scored' },
  notes: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

export const AssessmentResult = mongoose.model('AssessmentResult', AssessmentResultSchema);
