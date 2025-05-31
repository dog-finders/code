const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// 모든 사용자 조회
router.get('/', userController.getAllUsers);

// 특정 사용자 조회
router.get('/:id', userController.getUserById);

// 회원가입 처리a
router.post('/signup', userController.registerUser);

module.exports = router;
