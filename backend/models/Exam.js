const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    subject: { type: String, required: true, trim: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    duration: { type: Number, required: true, min: 1 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['draft', 'published', 'completed'], default: 'draft' },
    totalMarks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

examSchema.index({ teacher: 1, createdAt: -1 });
examSchema.index({ status: 1, startTime: 1 });
examSchema.index({ subject: 'text', title: 'text' });

module.exports = mongoose.model('Exam', examSchema);
