// backend/domain/recruit/routes/recruitRoutes.js
const express = require('express');
const router = express.Router();
const recruitController = require('../controller/recruitController');
const isAuth = require('../../auth/middleware/inAuth'); // 인증 미들웨어

// 모집글 목록 조회 (인증 불필요)
router.get('/', recruitController.getAllRecruits);

// 모집글 상세 조회 (인증 불필요)
router.get('/:id', recruitController.getRecruitById);

// 모집글 작성 (인증 필요)
router.post('/', isAuth, recruitController.createRecruit);

// 모집글 마감 (인증 필요)
router.patch('/:id/close', isAuth, recruitController.closeRecruit);

// 모집글 삭제 (인증 필요)
router.delete('/:id', isAuth, recruitController.deleteRecruit);

module.exports = router;