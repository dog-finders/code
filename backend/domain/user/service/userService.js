const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const bcrypt = require('bcrypt');
const createUser = async (userData) => {
    const userRepository = AppDataSource.getRepository('User'); // 여기서 바로 가져와야 안전
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = userRepository.create({
        ...userData,
        password: hashedPassword,
    });
    return await userRepository.save(user);
};

const findByLoginId = async (loginId) => {
    const userRepository = AppDataSource.getRepository('User');
    return await userRepository.findOne({ where: { loginId } });
};

module.exports = { createUser, findByLoginId };
