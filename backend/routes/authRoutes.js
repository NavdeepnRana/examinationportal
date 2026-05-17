const express = require('express');
const { register, login, getMe, changePassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', verifyToken, getMe);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;
