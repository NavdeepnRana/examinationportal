const express = require('express');
const {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  generateQuestions,
} = require('../controllers/examController');
const { verifyToken, authorize } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(verifyToken);

router.get('/', getExams);
router.post('/generate-questions', authorize('teacher'), aiLimiter, generateQuestions);
router.get('/:id', getExamById);
router.post('/', authorize('teacher'), createExam);
router.put('/:id', authorize('teacher'), updateExam);
router.delete('/:id', authorize('teacher'), deleteExam);

module.exports = router;
