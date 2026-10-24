import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentCode: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  email: { type: String },
  classId: { type: String, required: true, ref: 'Class' },
  dateOfBirth: { type: String },
  guardianContact: { type: String },
  profileCategory: { type: String, default: 'Newly Enrolled' },
  activeStatus: { type: Boolean, default: true },
  attendanceRate: { type: Number, default: 100 },
  academicAverage: { type: Number, default: 85 },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Student = mongoose.model('Student', StudentSchema);
