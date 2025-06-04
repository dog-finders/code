// 경로: backend/domain/user/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const isAuth = require('../../auth/middleware/inAuth');

// 회원가입
router.post('/signup', userController.registerUser);

// 로그인
router.post('/login', userController.login);

// 로그아웃
router.post('/logout', userController.logout);

// 유효한 세션인지 확인
router.get('/check-auth', (req, res) => {
  console.log('Checking auth status:', req.session);
  if (req.session && req.session.userId) {
    res.json({ isLoggedIn: true, userId: req.session.userId });
  } else {
    res.status(401).json({ isLoggedIn: false, message: '인증되지 않은 사용자입니다.' });
  }
});

// 현재 로그인한 사용자 정보 조회 (인증 필요)
router.get('/me', isAuth, userController.getCurrentUser);

// 현재 로그인한 사용자 정보 업데이트 (인증 필요)
router.put('/me', isAuth, userController.updateUser);

// 모든 사용자 조회 (관리자용 등)
router.get('/', userController.getAllUsers);

// 특정 사용자 조회
router.get('/:id', userController.getUserById);

module.exports = router;
