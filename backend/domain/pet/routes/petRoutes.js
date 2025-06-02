// backend/domain/pet/routes/petRoutes.js
const express = require('express');
const router = express.Router();
const petController = require('../controller/petController');
const isAuth = require('../../auth/middleware/inAuth');

// 모든 라우트에 인증 미들웨어 적용
router.use(isAuth);

// 현재 사용자의 모든 반려동물 조회
router.get('/', petController.getPets);

// 반려동물 등록
router.post('/', petController.createPet);

// 반려동물 정보 수정
router.put('/:id', petController.updatePet);

// 반려동물 삭제
router.delete('/:id', petController.deletePet);

module.exports = router;
