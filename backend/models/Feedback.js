const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    result: { type: mongoose.Schema.Types.ObjectId, ref: 'Result', required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    studentAnswer: { type: String, default: '' },
    aiScore: { type: Number, default: 0 },
    aiFeedback: { type: String, default: '' },
    suggestions: [{ type: String }],
    teacherScore: { type: Number },
    teacherFeedback: { type: String, default: '' },
    finalScore: { type: Number, default: 0 },
    adminApproved: { type: Boolean, default: false },
    adminNotes: { type: String, default: '' },
    evaluatedAt: { type: Date },
  },
  { timestamps: true }
);

feedbackSchema.index({ result: 1 });
feedbackSchema.index({ result: 1, question: 1 }, { unique: true });
feedbackSchema.index({ adminApproved: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
