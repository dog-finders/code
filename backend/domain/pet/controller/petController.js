const petService = require('../service/petService');

exports.getPets = async (req, res) => {
    try {
        const userId = req.session.userId;
        const pets = await petService.getPetsByUserId(userId);
        res.json(pets);
    } catch (error) {
        console.error('getPets error:', error);
        res.status(500).json({ message: '펫 조회 실패', error: error.message });
    }
};

exports.updatePetsBulk = async (req, res) => {
    try {
        const userId = req.session.userId;
        const updatedPets = await petService.updatePetsBulk(req.body, userId);
        res.json(updatedPets);
    } catch (error) {
        console.error('updatePetsBulk error:', error);
        res.status(400).json({ message: '펫 수정 실패', error: error.message });
    }
};

exports.createPet = async (req, res) => {
    try {
        const userId = req.session.userId;
        const petData = req.body;
        const newPet = await petService.createPet(petData, userId);
        res.status(201).json(newPet);
    } catch (error) {
        console.error('createPet error:', error);
        res.status(400).json({
            message: '반려동물 등록 실패',
            error: error.message,
        });
    }
};

exports.updatePet = async (req, res) => {
    try {
        const userId = req.session.userId;
        const petId = parseInt(req.params.id);
        const petData = req.body;

        const updatedPet = await petService.updatePet(petId, petData, userId);
        res.json(updatedPet);
    } catch (error) {
        console.error('updatePet error:', error);

        if (
            error.message.includes('권한이 없습니다') ||
            error.message.includes('찾을 수 없습니다')
        ) {
            return res.status(403).json({ message: error.message });
        }

        res.status(400).json({
            message: '반려동물 정보 수정 실패',
            error: error.message,
        });
    }
};

exports.deletePet = async (req, res) => {
    try {
        const userId = req.session.userId;
        const petId = parseInt(req.params.id);

        await petService.deletePet(petId, userId);
        res.json({ message: '반려동물 정보가 삭제되었습니다' });
    } catch (error) {
        console.error('deletePet error:', error);

        if (
            error.message.includes('권한이 없습니다') ||
            error.message.includes('찾을 수 없습니다')
        ) {
            return res.status(403).json({ message: error.message });
        }

        res.status(400).json({
            message: '반려동물 정보 삭제 실패',
            error: error.message,
        });
    }
};
