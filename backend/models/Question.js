const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    type: { type: String, enum: ['mcq', 'theory'], required: true },
    questionText: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: String, default: '' },
    modelAnswer: { type: String, default: '' },
    maxMarks: { type: Number, required: true, min: 1 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

questionSchema.index({ exam: 1, order: 1 });

module.exports = mongoose.model('Question', questionSchema);
