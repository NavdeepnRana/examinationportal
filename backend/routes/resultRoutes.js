const express = require('express');
const {
  startExam,
  reportTabSwitch,
  submitExam,
  getMyResults,
  getExamSubmissions,
  getResultDetail,
  updateFeedback,
} = require('../controllers/resultController');
const { verifyToken, authorize } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(verifyToken);

router.get('/my', authorize('student'), getMyResults);
router.post('/start/:examId', authorize('student'), startExam);
router.patch('/:resultId/tab-switch', authorize('student'), reportTabSwitch);
router.post('/:resultId/submit', authorize('student'), aiLimiter, submitExam);
router.get('/exam/:examId/submissions', authorize('teacher'), getExamSubmissions);
router.get('/:id', getResultDetail);
router.put('/feedback/:feedbackId', authorize('teacher'), updateFeedback);

module.exports = router;
