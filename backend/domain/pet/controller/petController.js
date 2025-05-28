// backend/domain/pet/controller/petController.js
const express = require('express');
const router = express.Router();
const {
    createPet,
    updatePet,
    getPetsByUser,
} = require('../service/petService');
const isAuth = require('../../auth/middleware/isAuth');

router.post('/', isAuth, async (req, res) => {
    try {
        const pet = await createPet(req.body, req.session.userId);
        res.status(201).json(pet);
    } catch (err) {
        res.status(400).json({
            message: '반려동물 등록 실패',
            error: err.message,
        });
    }
});

router.patch('/:id', isAuth, async (req, res) => {
    try {
        const updated = await updatePet(parseInt(req.params.id), req.body);
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: '수정 실패', error: err.message });
    }
});

router.get('/', isAuth, async (req, res) => {
    try {
        const pets = await getPetsByUser(req.session.userId);
        res.json(pets);
    } catch (err) {
        res.status(500).json({ message: '조회 실패', error: err.message });
    }
});

module.exports = router;
