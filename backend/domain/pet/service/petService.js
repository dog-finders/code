// backend/domain/pet/service/petService.js

// 데이터베이스 로직을 담당하는 petRepository를 가져옵니다.
const petRepository = require('../repository/petRepository');

// 특정 사용자의 모든 반려동물 정보를 조회합니다.
exports.getPetsByUserId = async (userId) => {
    return await petRepository.findByUserId(userId);
};

// 새로운 반려동물 정보를 생성하고 사용자에게 연결합니다.
exports.createPet = async (petData, userId) => {
    const petEntity = { ...petData, user: { id: userId } };
    return await petRepository.createAndSave(petEntity);
};

// 기존 반려동물 정보를 수정합니다. (반드시 해당 반려동물의 주인인지 확인)
exports.updatePet = async (petId, petData, userId) => {
    // 수정 전, 현재 로그인한 사용자가 반려동물의 소유주가 맞는지 검사합니다.
    const pet = await petRepository.findById(petId);
    if (!pet || pet.user.id !== userId) {
        throw new Error('수정 권한이 없거나 반려동물을 찾을 수 없습니다.');
    }
    return await petRepository.update(petId, petData);
};

// 반려동물 정보를 삭제합니다. (반드시 해당 반려동물의 주인인지 확인)
exports.deletePet = async (petId, userId) => {
    // 삭제 전, 현재 로그인한 사용자가 반려동물의 소유주가 맞는지 검사합니다.
    const pet = await petRepository.findById(petId);
    if (!pet || pet.user.id !== userId) {
        throw new Error('삭제 권한이 없거나 반려동물을 찾을 수 없습니다.');
    }
    return await petRepository.remove(petId);
};

// 반려동물의 이미지만 업데이트합니다. (반드시 해당 반려동물의 주인인지 확인)
exports.updatePetImage = async (petId, userId, imageUrl) => {
    // 이미지 수정 전, 현재 로그인한 사용자가 반려동물의 소유주가 맞는지 검사합니다.
    const pet = await petRepository.findById(petId);
    if (!pet || pet.user.id !== userId) {
        throw new Error('수정 권한이 없거나 반려동물을 찾을 수 없습니다.');
    }
    return await petRepository.update(petId, { imageUrl });
};

// 여러 반려동물 정보를 한 번에 저장/수정합니다. (레거시 함수)
exports.updatePetsBulk = async (pets, userId) => {
    return await petRepository.updatePetsBulk(pets, userId);
};