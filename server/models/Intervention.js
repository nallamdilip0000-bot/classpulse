import mongoose from 'mongoose';

const InterventionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String },
  plannedAction: { type: String, required: true },
  plannedActionLabel: { type: String },
  reason: { type: String, required: true },
  assignedTeacherName: { type: String },
  createdBy: { type: String },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  nextFollowUpDate: { type: String },
  completionNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

export const Intervention = mongoose.model('Intervention', InterventionSchema);
