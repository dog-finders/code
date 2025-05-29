// backend/domain/pet/service/petService.js
const { AppDataSource } = require('../../../global/config/typeOrmConfig');

const createPet = async (petData, userId) => {
    const petRepository = AppDataSource.getRepository('Pet');
    const userRepository = AppDataSource.getRepository('User');

    const user = await userRepository.findOne({ where: { id: userId } });
    if (user === undefined) {
        throw new Error('User not found');
    }
    const pet = petRepository.create({ ...petData, user });
    return await petRepository.save(pet);
};

const updatePet = async (petId, updatedData) => {
    const petRepository = AppDataSource.getRepository('Pet');
    const pet = await petRepository.update({ id: petId }, updatedData);
    if (pet === undefined) {
        throw new Error('Pet not found');
    }
    return pet;
};

const getPetsByUser = async (userId) => {
    const petRepository = AppDataSource.getRepository('Pet');
    return await petRepository.find({ where: { user: { id: userId } } });
};

module.exports = { createPet, updatePet, getPetsByUser };
