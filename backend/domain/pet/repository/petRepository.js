const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const Pet = require('../entity/Pet');

let petRepository;
function getRepo() {
    if (!petRepository) {
        petRepository = AppDataSource.getRepository(Pet);
    }
    return petRepository;
}

exports.findByUserId = async (userId) => {
    return await getRepo().find({
        where: { user: { id: userId } },
        relations: ['user'],
    });
};

exports.findById = async (id) => {
    return await getRepo().findOne({
        where: { id },
        relations: ['user'],
    });
};

exports.save = async (petData) => {
    const pet = getRepo().create(petData);
    return await getRepo().save(pet);
};

exports.update = async (id, petData) => {
    await getRepo().update(id, petData);
    return await getRepo().findOne({ where: { id } });
};

exports.remove = async (id) => {
    const pet = await getRepo().findOne({ where: { id } });
    if (!pet) throw new Error('반려동물을 찾을 수 없습니다');
    await getRepo().delete(id);
    return true;
};

exports.updatePetsBulk = async (pets, userId) => {
    const saved = [];
    for (const pet of pets) {
        if (pet.id) {
            const found = await getRepo().findOne({ where: { id: pet.id, user: { id: userId } } });
            if (!found) throw new Error(`ID ${pet.id}의 펫을 찾을 수 없습니다`);
            found.name = pet.name;
            found.species = pet.species;
            await getRepo().save(found);
            saved.push(found);
        } else {
            const newPet = getRepo().create({
                ...pet,
                user: { id: userId },
            });
            await getRepo().save(newPet);
            saved.push(newPet);
        }
    }
    return saved;
};
