// backend/domain/pet/repository/petRepository.js
const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const Pet = require('../entity/Pet');

const petRepo = AppDataSource.getRepository(Pet);

exports.findByUserId = async (userId) => {
    return await petRepo.find({ where: { user: { id: userId } } });
};

exports.findById = async (id) => {
    return await petRepo.findOne({
        where: { id },
        relations: ['user'],
    });
};

exports.createAndSave = async (petEntity) => {
    const newPet = petRepo.create(petEntity);
    return await petRepo.save(newPet);
};

exports.update = async (id, petData) => {
    await petRepo.update(id, petData);
    return await petRepo.findOneBy({ id });
};

exports.remove = async (id) => {
    const result = await petRepo.delete(id);
    return result.affected > 0;
};

// 레거시 벌크 업데이트 함수
exports.updatePetsBulk = async (pets, userId) => {
    const entitiesToSave = pets.map(pet => {
        const entity = { ...pet, user: { id: userId } };
        if (pet.id) {
            entity.id = pet.id;
        }
        return entity;
    });
    return await petRepo.save(entitiesToSave);
};
