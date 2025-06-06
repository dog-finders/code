// backend/domain/pet/service/petService.js
const petRepository = require('../repository/petRepository');

exports.getPetsByUserId = async (userId) => {
    return await petRepository.findByUserId(userId);
};

exports.createPet = async (petData, userId) => {
    const petEntity = { ...petData, user: { id: userId } };
    return await petRepository.createAndSave(petEntity);
};

exports.updatePet = async (petId, petData, userId) => {
    const pet = await petRepository.findById(petId);
    if (!pet || pet.user.id !== userId) {
        throw new Error('수정 권한이 없거나 반려동물을 찾을 수 없습니다.');
    }
    return await petRepository.update(petId, petData);
};

exports.deletePet = async (petId, userId) => {
    const pet = await petRepository.findById(petId);
    if (!pet || pet.user.id !== userId) {
        throw new Error('삭제 권한이 없거나 반려동물을 찾을 수 없습니다.');
    }
    return await petRepository.remove(petId);
};

exports.updatePetImage = async (petId, userId, imageUrl) => {
    const pet = await petRepository.findById(petId);
    if (!pet || pet.user.id !== userId) {
        throw new Error('수정 권한이 없거나 반려동물을 찾을 수 없습니다.');
    }
    return await petRepository.update(petId, { imageUrl });
};

// 레거시 벌크 업데이트 함수
exports.updatePetsBulk = async (pets, userId) => {
    return await petRepository.updatePetsBulk(pets, userId);
};
