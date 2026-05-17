const User = require('../models/User');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Feedback = require('../models/Feedback');
const { getPagination, paginatedResponse } = require('../utils/pagination');

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, enrollYear, mobileNumber } = req.body;

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already exists.' });

    const user = await User.create({
      name,
      email,
      password,
      role,
      department: department || '',
      enrollYear: enrollYear || '',
      mobileNumber: mobileNumber || '',
    });

    res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { role, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, ...paginatedResponse(users, total, page, limit) });
  } catch (err) {
    next(err);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, user: { id: user._id, isActive: user.isActive } });
  } catch (err) {
    next(err);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const [students, teachers, exams, submissions, pendingFeedback] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'teacher', isActive: true }),
      Exam.countDocuments(),
      Result.countDocuments({ status: { $ne: 'in_progress' } }),
      Feedback.countDocuments({ adminApproved: false }),
    ]);

    const recentSubmissions = await Result.find({ status: { $ne: 'in_progress' } })
      .populate('student', 'name')
      .populate('exam', 'title')
      .sort({ submittedAt: -1 })
      .limit(5);

    res.json({
      success: true,
      analytics: { students, teachers, exams, submissions, pendingFeedback },
      recentSubmissions,
    });
  } catch (err) {
    next(err);
  }
};

exports.reviewFeedback = async (req, res, next) => {
  try {
    const { adminApproved, adminNotes } = req.body;
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found.' });

    feedback.adminApproved = adminApproved ?? feedback.adminApproved;
    feedback.adminNotes = adminNotes || feedback.adminNotes;
    await feedback.save();

    if (adminApproved) {
      const result = await Result.findById(feedback.result);
      if (result) {
        result.status = 'approved';
        await result.save();
      }
    }

    res.json({ success: true, feedback });
  } catch (err) {
    next(err);
  }
};

exports.getPendingFeedback = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const [feedback, total] = await Promise.all([
      Feedback.find({ adminApproved: false })
        .populate({ path: 'result', populate: [{ path: 'student', select: 'name email' }, { path: 'exam', select: 'title' }] })
        .populate('question', 'questionText maxMarks')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Feedback.countDocuments({ adminApproved: false }),
    ]);

    res.json({ success: true, ...paginatedResponse(feedback, total, page, limit) });
  } catch (err) {
    next(err);
  }
};
