// backend/domain/pet/controller/petController.js
const express = require('express');
const router = express.Router();
const {
    createPet,
    updatePet,
    getPetsByUser,
} = require('../service/petService');
const inAuth = require('../../auth/middleware/inAuth');

// 여기에서 multer 가져오기 (typeOrmConfig에 같이 정의했다면 거기서 가져옴)
const { upload } = require('../../../global/config/typeOrmConfig');

// 📌 POST: 반려동물 등록
router.post('/', inAuth, upload.single('photo'), async (req, res) => {
    try {
        const petData = {
            ...req.body,
            profile: req.file ? `/uploads/pets/${req.file.filename}` : null, // 파일이 있을 경우만 저장
        };
        const pet = await createPet(petData, req.session.userId);
        res.status(201).json(pet);
    } catch (err) {
        res.status(400).json({
            message: '반려동물 등록 실패',
            error: err.message,
        });
    }
});

// 📌 PATCH: 반려동물 정보 수정
router.patch('/:id', inAuth, upload.single('photo'), async (req, res) => {
    try {
        const updatedData = {
            ...req.body,
            ...(req.file && { profile: `/uploads/pets/${req.file.filename}` }), // 파일 있을 때만 덮어쓰기
        };
        const updated = await updatePet(parseInt(req.params.id), updatedData);
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: '수정 실패', error: err.message });
    }
});

// 📌 GET: 현재 로그인한 사용자의 반려동물 목록 조회
router.get('/', inAuth, async (req, res) => {
    try {
        const pets = await getPetsByUser(req.session.userId);
        res.json(pets);
    } catch (err) {
        res.status(500).json({ message: '조회 실패', error: err.message });
    }
});

module.exports = router;
