const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');
const Feedback = require('../models/Feedback');
const { evaluateTheoryAnswer } = require('../services/groqService');
const { getPagination, paginatedResponse } = require('../utils/pagination');

const gradeMcq = (questions, answers) => {
  let mcqScore = 0;
  const graded = answers.map((ans) => {
    const question = questions.find((q) => q._id.toString() === ans.question.toString());
    if (!question || question.type !== 'mcq') {
      return { ...ans, isCorrect: false, marksAwarded: 0 };
    }
    const isCorrect = question.correctAnswer === ans.answer;
    const marks = isCorrect ? question.maxMarks : 0;
    mcqScore += marks;
    return { ...ans, isCorrect, marksAwarded: marks };
  });
  return { mcqScore, graded };
};

exports.startExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam || exam.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Exam not available.' });
    }

    const now = new Date();
    if (now < new Date(exam.startTime) || now > new Date(exam.endTime)) {
      return res.status(400).json({ success: false, message: 'Exam is not within the scheduled window.' });
    }

    let result = await Result.findOne({ student: req.user._id, exam: exam._id });
    if (result?.status === 'submitted' || result?.status === 'evaluated' || result?.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Exam already submitted.' });
    }

    if (!result) {
      const questions = await Question.find({ exam: exam._id });
      const maxScore = questions.reduce((s, q) => s + q.maxMarks, 0);
      result = await Result.create({
        student: req.user._id,
        exam: exam._id,
        maxScore,
        status: 'in_progress',
      });
    }

    res.json({
      success: true,
      resultId: result._id,
      duration: exam.duration,
      endTime: exam.endTime,
    });
  } catch (err) {
    next(err);
  }
};

exports.reportTabSwitch = async (req, res, next) => {
  try {
    const result = await Result.findOne({
      _id: req.params.resultId,
      student: req.user._id,
      status: 'in_progress',
    });
    if (!result) return res.status(404).json({ success: false, message: 'Active exam session not found.' });

    result.tabSwitchCount += 1;
    await result.save();
    res.json({ success: true, tabSwitchCount: result.tabSwitchCount });
  } catch (err) {
    next(err);
  }
};

exports.submitExam = async (req, res, next) => {
  try {
    const { answers, autoSubmitted } = req.body;
    const result = await Result.findOne({
      _id: req.params.resultId,
      student: req.user._id,
      status: 'in_progress',
    });
    if (!result) return res.status(404).json({ success: false, message: 'Active exam session not found.' });

    const questions = await Question.find({ exam: result.exam });
    const { mcqScore, graded } = gradeMcq(questions, answers);

    result.answers = graded;
    result.mcqScore = mcqScore;
    result.autoSubmitted = !!autoSubmitted;
    result.submittedAt = new Date();
    result.status = 'submitted';
    await result.save();

    const theoryQuestions = questions.filter((q) => q.type === 'theory');
    let theoryScore = 0;

    for (const tq of theoryQuestions) {
      const studentAns = answers.find((a) => a.question.toString() === tq._id.toString());
      const studentAnswer = studentAns?.answer || '';

      let aiResult = { score: 0, feedback: 'No answer provided.', suggestions: ['Attempt all theory questions.'] };
      if (studentAnswer.trim()) {
        try {
          aiResult = await evaluateTheoryAnswer({
            question: tq.questionText,
            modelAnswer: tq.modelAnswer,
            studentAnswer,
            maxMarks: tq.maxMarks,
          });
        } catch (aiErr) {
          console.error('Groq evaluation error:', aiErr.message);
          aiResult = {
            score: 0,
            feedback: 'AI evaluation temporarily unavailable. Teacher will review manually.',
            suggestions: [],
          };
        }
      }

      theoryScore += aiResult.score;

      const answerIdx = result.answers.findIndex((a) => a.question.toString() === tq._id.toString());
      if (answerIdx >= 0) {
        result.answers[answerIdx].marksAwarded = aiResult.score;
      }

      await Feedback.findOneAndUpdate(
        { result: result._id, question: tq._id },
        {
          result: result._id,
          question: tq._id,
          studentAnswer,
          aiScore: aiResult.score,
          aiFeedback: aiResult.feedback,
          suggestions: aiResult.suggestions,
          finalScore: aiResult.score,
          evaluatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    result.theoryScore = theoryScore;
    result.totalScore = result.mcqScore + result.theoryScore;
    result.status = 'evaluated';
    await result.save();

    res.json({
      success: true,
      message: 'Exam submitted and evaluated.',
      result: {
        mcqScore: result.mcqScore,
        theoryScore: result.theoryScore,
        totalScore: result.totalScore,
        maxScore: result.maxScore,
        tabSwitchCount: result.tabSwitchCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyResults = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { student: req.user._id, status: { $in: ['submitted', 'evaluated', 'approved'] } };

    const [results, total] = await Promise.all([
      Result.find(filter)
        .populate('exam', 'title subject totalMarks duration')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit),
      Result.countDocuments(filter),
    ]);

    res.json({ success: true, ...paginatedResponse(results, total, page, limit) });
  } catch (err) {
    next(err);
  }
};

exports.getExamSubmissions = async (req, res, next) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.examId, teacher: req.user._id });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

    const { page, limit, skip } = getPagination(req.query);
    const filter = { exam: exam._id, status: { $in: ['submitted', 'evaluated', 'approved'] } };

    const [results, total] = await Promise.all([
      Result.find(filter)
        .populate('student', 'name email enrollYear')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit),
      Result.countDocuments(filter),
    ]);

    res.json({ success: true, ...paginatedResponse(results, total, page, limit) });
  } catch (err) {
    next(err);
  }
};

exports.getResultDetail = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('student', 'name email')
      .populate('exam', 'title subject teacher');

    if (!result) return res.status(404).json({ success: false, message: 'Result not found.' });

    const isOwner = result.student._id.toString() === req.user._id.toString();
    const isTeacher = req.user.role === 'teacher' && result.exam.teacher.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isTeacher && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const questions = await Question.find({ exam: result.exam._id }).sort('order');
    const feedback = await Feedback.find({ result: result._id }).populate('question');

    res.json({ success: true, result, questions, feedback });
  } catch (err) {
    next(err);
  }
};

exports.updateFeedback = async (req, res, next) => {
  try {
    const { teacherScore, teacherFeedback } = req.body;
    const feedback = await Feedback.findById(req.params.feedbackId).populate({
      path: 'result',
      populate: { path: 'exam' },
    });

    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found.' });
    if (feedback.result.exam.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    feedback.teacherScore = teacherScore ?? feedback.aiScore;
    feedback.teacherFeedback = teacherFeedback || feedback.aiFeedback;
    feedback.finalScore = feedback.teacherScore;
    await feedback.save();

    const allFeedback = await Feedback.find({ result: feedback.result._id });
    const theoryScore = allFeedback.reduce((s, f) => s + (f.finalScore || 0), 0);

    const result = await Result.findById(feedback.result._id);
    result.theoryScore = theoryScore;
    result.totalScore = result.mcqScore + result.theoryScore;
    await result.save();

    res.json({ success: true, feedback, result });
  } catch (err) {
    next(err);
  }
};
