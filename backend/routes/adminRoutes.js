const express = require('express');
const {
  createUser,
  getUsers,
  toggleUserStatus,
  getAnalytics,
  reviewFeedback,
  getPendingFeedback,
} = require('../controllers/adminController');
const { verifyToken, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken, authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id/toggle', toggleUserStatus);
router.get('/feedback/pending', getPendingFeedback);
router.patch('/feedback/:id/review', reviewFeedback);

module.exports = router;
