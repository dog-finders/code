const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const bcrypt = require('bcrypt');

const createUser = async (userData) => {
    try {
        console.log('[createUser] Received userData:', userData);

        const userRepository = AppDataSource.getRepository('User');
        if (!userRepository) {
            console.error('[createUser] Failed to get User repository');
            throw new Error('User repository not found');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        console.log('[createUser] Hashed password generated');

        const user = userRepository.create({
            ...userData,
            password: hashedPassword,
        });
        console.log('[createUser] User entity created:', user);

        const savedUser = await userRepository.save(user);
        console.log('[createUser] User saved:', savedUser);

        return savedUser;
    } catch (error) {
        console.error('[createUser] Error occurred:', error.message);
        throw error; // 이 에러가 404로 매핑되는지 컨트롤러/라우터도 확인 필요
    }
};
const findByLoginId = async (loginId) => {
    const userRepository = AppDataSource.getRepository('User');
    return await userRepository.findOne({ where: { loginId } });
};

module.exports = { createUser, findByLoginId };
