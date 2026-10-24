import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  className: { type: String, required: true },
  section: { type: String, required: true },
  subjectFocus: { type: String },
  academicTerm: { type: String, default: 'Fall 2026' },
  room: { type: String },
  assignedTeacherId: { type: String },
  assignedTeacherName: { type: String },
  studentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const Class = mongoose.model('Class', ClassSchema);
