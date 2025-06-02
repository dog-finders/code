// backend/domain/pet/repository/petRepository.js
const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const Pet = require('../entity/Pet');

const petRepository = AppDataSource.getRepository(Pet);

exports.findByUserId = async (userId) => {
    try {
        return await petRepository.find({
            where: { user: { id: userId } },
            relations: ['user'],
        });
    } catch (error) {
        console.error('findByUserId error:', error);
        throw error;
    }
};

exports.findById = async (id) => {
    try {
        return await petRepository.findOne({
            where: { id },
            relations: ['user'],
        });
    } catch (error) {
        console.error('findById error:', error);
        throw error;
    }
};

exports.save = async (petData) => {
    try {
        const pet = petRepository.create(petData);
        return await petRepository.save(pet);
    } catch (error) {
        console.error('save pet error:', error);
        throw error;
    }
};

exports.update = async (id, petData) => {
    try {
        await petRepository.update(id, petData);
        return await this.findById(id);
    } catch (error) {
        console.error('update pet error:', error);
        throw error;
    }
};

exports.remove = async (id) => {
    try {
        const pet = await this.findById(id);
        if (!pet) {
            throw new Error('반려동물을 찾을 수 없습니다');
        }
        await petRepository.delete(id);
        return true;
    } catch (error) {
        console.error('remove pet error:', error);
        throw error;
    }
};

exports.getPetsByUserId = async (userId) => {
    return await petRepository.find({
        where: { user: { id: userId } },
    });
};

exports.updatePetsBulk = async (pets, userId) => {
    const saved = [];

    for (const pet of pets) {
        if (pet.id) {
            const found = await petRepository.findOneBy({
                id: pet.id,
                user: { id: userId },
            });
            if (!found) throw new Error(`ID ${pet.id}의 펫을 찾을 수 없습니다`);
            found.name = pet.name;
            found.species = pet.species;
            await petRepository.save(found);
            saved.push(found);
        } else {
            const newPet = petRepository.create({
                ...pet,
                user: { id: userId },
            });
            await petRepository.save(newPet);
            saved.push(newPet);
        }
    }
    return saved;
};
