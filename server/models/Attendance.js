import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  classId: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ['present', 'absent', 'excused', 'late'], default: 'present' },
  excusedReason: { type: String, default: null },
  notes: { type: String, default: '' },
  recordedAt: { type: Date, default: Date.now }
});

export const Attendance = mongoose.model('Attendance', AttendanceSchema);
