const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  answer: { type: String, default: '' },
  isCorrect: { type: Boolean, default: false },
  marksAwarded: { type: Number, default: 0 },
});

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    answers: [answerSchema],
    mcqScore: { type: Number, default: 0 },
    theoryScore: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    tabSwitchCount: { type: Number, default: 0 },
    autoSubmitted: { type: Boolean, default: false },
    submittedAt: { type: Date },
    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'evaluated', 'approved'],
      default: 'in_progress',
    },
  },
  { timestamps: true }
);

resultSchema.index({ student: 1, exam: 1 }, { unique: true });
resultSchema.index({ exam: 1, submittedAt: -1 });
resultSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model('Result', resultSchema);
