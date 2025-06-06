// backend/domain/pet/controller/petController.js
const petService = require('../service/petService');

// 현재 유저의 반려동물 전체 조회
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

// 새 반려동물 등록 (텍스트 정보)
exports.createPet = async (req, res) => {
    try {
        const userId = req.session.userId;
        const newPet = await petService.createPet(req.body, userId);
        res.status(201).json(newPet); // 생성된 펫 정보(ID 포함)를 반환
    } catch (error) {
        console.error('createPet error:', error);
        res.status(400).json({ message: '반려동물 등록 실패', error: error.message });
    }
};

// 기존 반려동물 수정 (텍스트 정보)
exports.updatePet = async (req, res) => {
    try {
        const userId = req.session.userId;
        const petId = parseInt(req.params.id, 10);
        const updatedPet = await petService.updatePet(petId, req.body, userId);
        res.json(updatedPet);
    } catch (error) {
        console.error('updatePet error:', error);
        res.status(400).json({ message: '반려동물 정보 수정 실패', error: error.message });
    }
};

// 반려동물 삭제
exports.deletePet = async (req, res) => {
    try {
        const userId = req.session.userId;
        const petId = parseInt(req.params.id, 10);
        await petService.deletePet(petId, userId);
        res.json({ message: '반려동물 정보가 삭제되었습니다.' });
    } catch (error) {
        console.error('deletePet error:', error);
        res.status(400).json({ message: '반려동물 정보 삭제 실패', error: error.message });
    }
};

// 여러 마리 일괄 저장/수정 (레거시, 현재는 사용되지 않음)
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

// 반려동물 이미지 업로드
exports.uploadPetImage = async (req, res) => {
    try {
        const userId = req.session.userId;
        const petId = parseInt(req.params.id, 10);
        if (!req.file) {
            return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
        }
        const imageUrl = `/uploads/pets/${req.file.filename}`;
        await petService.updatePetImage(petId, userId, imageUrl);
        res.json({ message: '이미지가 성공적으로 업로드되었습니다.', imageUrl });
    } catch (error) {
        console.error('uploadPetImage error:', error);
        res.status(400).json({ message: '이미지 업로드 실패', error: error.message });
    }
};
