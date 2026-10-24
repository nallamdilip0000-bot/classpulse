import mongoose from 'mongoose';

const AssessmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  classId: { type: String, required: true },
  maximumMarks: { type: Number, default: 100 },
  maxMarks: { type: Number, default: 100 },
  assessmentDate: { type: String, required: true },
  assessmentType: { type: String, default: 'Quiz' },
  weightPercentage: { type: Number, default: 10 },
  academicTerm: { type: String, default: 'Fall 2026' },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now }
});

AssessmentSchema.pre('save', function (next) {
  if (this.maximumMarks && !this.maxMarks) this.maxMarks = this.maximumMarks;
  if (this.maxMarks && !this.maximumMarks) this.maximumMarks = this.maxMarks;
  next();
});

export const Assessment = mongoose.model('Assessment', AssessmentSchema);
