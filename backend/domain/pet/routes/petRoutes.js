const express = require('express');
const router = express.Router();
const petController = require('../controller/petController');
const isAuth = require('../../auth/middleware/inAuth');

router.use(isAuth);

router.get('/', petController.getPets);
router.post('/', petController.createPet);
router.put('/:id', petController.updatePet);
router.delete('/:id', petController.deletePet);

// ⭐ bulk 저장/수정 라우트
router.put('/bulk', async (req, res) => {
    try {
        const userId = req.session.userId;
        const updatedPets = await petController.updatePetsBulk(req.body, userId);
        res.json(updatedPets);
    } catch (error) {
        console.error('bulk updatePets error:', error);
        res.status(400).json({ message: '펫 수정 실패', error: error.message });
    }
});

module.exports = router;
