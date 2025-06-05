const petRepository = require('../repository/petRepository');

exports.getPetsByUserId = async (userId) => {
    return await petRepository.findByUserId(userId);
};

exports.updatePetsBulk = async (pets, userId) => {
    return await petRepository.updatePetsBulk(pets, userId);
};

exports.createPet = async (petData, userId) => {
    return await petRepository.save({ ...petData, user: { id: userId } });
};

exports.updatePet = async (petId, petData, userId) => {
    // userId 확인 및 소유자 체크(옵션), 기본은 id로 수정
    const found = await petRepository.findById(petId);
    if (!found) throw new Error('찾을 수 없습니다');
    if (found.user.id !== userId) throw new Error('권한이 없습니다');
    await petRepository.update(petId, petData);
    return await petRepository.findById(petId);
};

exports.deletePet = async (petId, userId) => {
    const found = await petRepository.findById(petId);
    if (!found) throw new Error('찾을 수 없습니다');
    if (found.user.id !== userId) throw new Error('권한이 없습니다');
    return await petRepository.remove(petId);
};
