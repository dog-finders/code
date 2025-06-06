// backend/domain/pet/routes/petRoutes.js
const express = require('express');
const router = express.Router();
const petController = require('../controller/petController');
const isAuth = require('../../auth/middleware/inAuth');
const { upload } = require('../../../global/config/typeOrmConfig');

// 모든 pet API는 로그인이 필요합니다.
router.use(isAuth);

// [중요] 구체적인 경로를 와일드카드(:id)보다 먼저 정의합니다.
router.put('/bulk', petController.updatePetsBulk);

// --- 기본 CRUD 라우트 ---
router.get('/', petController.getPets);
router.post('/', petController.createPet);
router.put('/:id', petController.updatePet);
router.delete('/:id', petController.deletePet);

// --- 이미지 업로드를 위한 라우트 ---
router.post('/:id/image', upload.single('petImage'), petController.uploadPetImage);

module.exports = router;
