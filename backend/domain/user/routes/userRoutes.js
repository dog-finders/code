const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const isAuth = require('../../auth/middleware/inAuth');

// 인증이 필요한 라우트에 isAuth 미들웨어 추가
router.get('/check-auth', (req, res) => {
    console.log('Checking auth status:', req.session); // 세션 상태 로깅

    if (req.session && req.session.userId) {
        res.json({
            isLoggedIn: true,
            userId: req.session.userId,
        });
    } else {
        res.status(401).json({
            isLoggedIn: false,
            message: '인증되지 않은 사용자입니다.',
        });
    }
});

// 회원가입 처리a
router.post('/signup', userController.registerUser);

// 로그인 라우트
router.post('/login', userController.login);

// 로그아웃 라우트
router.post('/logout', userController.logout);

// 현재 로그인한 사용자 정보 조회
router.get('/me', isAuth, userController.getCurrentUser);

// 현재 로그인한 사용자 정보 업데이트
router.put('/me', isAuth, userController.updateUser);
// 모든 사용자 조회
router.get('/', userController.getAllUsers);

// 특정 사용자 조회
router.get('/:id', userController.getUserById);
module.exports = router;
