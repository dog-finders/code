const { getRepository } = require('typeorm');
const User = require('../entity/User');

// getRepository(User)는 createConnection() 성공 이후에만 사용 가능!
const userRepository = () => getRepository(User);

exports.findAll = async () => {
    try {
        return await userRepository().find();
    } catch (error) {
        console.error('findAll error:', error);
        throw error;
    }
};

exports.findById = async (id) => {
    try {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            console.warn(`findById: invalid id ${id}`);
            return null;
        }
        return await userRepository().findOne({ id: numericId });
    } catch (error) {
        console.error('findById error:', error);
        throw error;
    }
};

exports.findByLoginId = async (loginId) => {
    try {
        return await userRepository().findOne({ where: { loginId } });
    } catch (error) {
        console.error('findByLoginId error:', error);
        throw error;
    }
};

exports.update = async (id, userData) => {
    const user = await userRepository().findOne({ id });
    if (!user) throw new Error('사용자를 찾을 수 없습니다');

    Object.assign(user, userData);
    const savedUser = await userRepository().save(user);
    console.log('변경된 사용자:', savedUser);
    return savedUser;
};

exports.create = async (userEntity) => {
    try {
        const createdUser = userRepository().create(userEntity);
        return await userRepository().save(createdUser);
    } catch (error) {
        console.error('create user error:', error);
        throw error;
    }
};
