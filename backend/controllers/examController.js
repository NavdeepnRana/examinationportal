const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');
const { generateExamQuestions } = require('../services/groqService');
const { getPagination, paginatedResponse } = require('../utils/pagination');

const VISIBLE_RESULT_STATUSES = ['submitted', 'evaluated', 'approved'];

exports.createExam = async (req, res, next) => {
  try {
    const { title, description, subject, duration, startTime, endTime, questions, status } = req.body;

    const totalMarks = (questions || []).reduce((sum, q) => sum + (q.maxMarks || 0), 0);

    const exam = await Exam.create({
      title,
      description,
      subject,
      teacher: req.user._id,
      duration,
      startTime,
      endTime,
      status: status || 'draft',
      totalMarks,
    });

    if (questions?.length) {
      const questionDocs = questions.map((q, i) => ({
        exam: exam._id,
        type: q.type,
        questionText: q.questionText,
        options: q.type === 'mcq' ? q.options : [],
        correctAnswer: q.correctAnswer || '',
        modelAnswer: q.modelAnswer || '',
        maxMarks: q.maxMarks,
        order: i,
      }));
      await Question.insertMany(questionDocs);
    }

    const savedQuestions = await Question.find({ exam: exam._id }).sort('order');
    res.status(201).json({ success: true, exam, questions: savedQuestions });
  } catch (err) {
    next(err);
  }
};

exports.getExams = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { search, status, subject } = req.query;

    const filter = {};
    if (req.user.role === 'teacher') filter.teacher = req.user._id;
    if (req.user.role === 'student') filter.status = 'published';
    if (status) filter.status = status;
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { subject: new RegExp(search, 'i') },
      ];
    }

    const [exams, total] = await Promise.all([
      Exam.find(filter)
        .populate('teacher', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Exam.countDocuments(filter),
    ]);

    let data = exams;
    if (req.user.role === 'teacher' && exams.length > 0) {
      const examIds = exams.map((e) => e._id);
      const counts = await Result.aggregate([
        { $match: { exam: { $in: examIds }, status: { $in: VISIBLE_RESULT_STATUSES } } },
        { $group: { _id: '$exam', count: { $sum: 1 } } },
      ]);
      const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
      data = exams.map((e) => ({
        ...e,
        resultCount: countMap[e._id.toString()] || 0,
        hasResults: (countMap[e._id.toString()] || 0) > 0,
      }));
    }

    res.json({ success: true, ...paginatedResponse(data, total, page, limit) });
  } catch (err) {
    next(err);
  }
};

exports.getExamById = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('teacher', 'name email');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

    const questions = await Question.find({ exam: exam._id }).sort('order');

    const payload = { exam, questions };
    if (req.user.role === 'student') {
      payload.questions = questions.map((q) => {
        const obj = q.toObject();
        delete obj.correctAnswer;
        delete obj.modelAnswer;
        return obj;
      });
    }

    res.json({ success: true, ...payload });
  } catch (err) {
    next(err);
  }
};

exports.updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

    const allowed = ['title', 'description', 'subject', 'duration', 'startTime', 'endTime', 'status'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) exam[key] = req.body[key];
    });
    await exam.save();

    res.json({ success: true, exam });
  } catch (err) {
    next(err);
  }
};

exports.generateQuestions = async (req, res, next) => {
  try {
    const { topic, subject, numMcq, numTheory, difficulty } = req.body;
    if (!topic?.trim()) {
      return res.status(400).json({ success: false, message: 'Topic is required.' });
    }

    const questions = await generateExamQuestions({
      topic: topic.trim(),
      subject: subject?.trim() || '',
      numMcq: Math.min(10, Math.max(1, Number(numMcq) || 3)),
      numTheory: Math.min(10, Math.max(1, Number(numTheory) || 2)),
      difficulty: difficulty || 'medium',
    });

    res.json({ success: true, questions });
  } catch (err) {
    next(err);
  }
};

exports.deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });
    await Question.deleteMany({ exam: exam._id });
    res.json({ success: true, message: 'Exam deleted.' });
  } catch (err) {
    next(err);
  }
};
