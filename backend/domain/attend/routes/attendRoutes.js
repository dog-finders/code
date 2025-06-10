const express = require('express');
const router = express.Router();
const attendController = require('../controller/attendController');
const isAuth = require('../../auth/middleware/inAuth');

router.use(isAuth);

// 참석 요청 보내기 API
router.post('/recruit/:recruitId', attendController.createAttendRequest);

// 메일함 목록 조회 API
router.get('/mailbox', attendController.getMailbox);

// 참석 요청 수락 API
router.patch('/:attendId/accept', attendController.acceptAttendRequest);

// 참석 요청 거절 API
router.patch('/:attendId/reject', attendController.rejectAttendRequest);

module.exports = router;