const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// 모든 사용자 조회
router.get('/', userController.getAllUsers);

// 특정 사용자 조회
router.get('/:id', userController.getUserById);

// 회원가입 처리a
router.post('/signup', userController.registerUser);

// 로그인 라우트
router.post('/login', userController.login);

// 로그아웃 라우트
router.post('/logout', userController.logout);
module.exports = router;
