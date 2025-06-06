// backend/domain/user/repository/userRepository.js
const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const User = require('../entity/User');

// TypeORM 0.3.x 방식: DataSource에서 직접 레포지토리를 가져옵니다.
const userRepository = AppDataSource.getRepository(User);

exports.findAll = async () => {
    return await userRepository.find();
};

exports.findById = async (id) => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
        console.warn(`findById: invalid id ${id}`);
        return null;
    }
    return await userRepository.findOneBy({ id: numericId });
};

exports.findByLoginId = async (loginId) => {
    return await userRepository.findOne({ where: { loginId } });
};

exports.update = async (id, userData) => {
    await userRepository.update(id, userData);
    return await userRepository.findOneBy({ id: id });
};

exports.create = (userEntity) => {
    return userRepository.create(userEntity);
};

exports.save = async (user) => {
    return await userRepository.save(user);
};
