const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const bcrypt = require('bcrypt');

// 모든 사용자 가져오기
const getAllUsers = async () => {
    const userRepository = AppDataSource.getRepository('User');
    return await userRepository.find();
};

// 사용자 ID로 찾기
const getUserById = async (id) => {
    const userRepository = AppDataSource.getRepository('User');
    return await userRepository.findOneBy({ id });
};

// 사용자 생성
const createUser = async (userData) => {
    const userRepository = AppDataSource.getRepository('User');
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = userRepository.create({
        ...userData,
        password: hashedPassword,
    });
    return await userRepository.save(user);
};

// 로그인 ID로 사용자 찾기 (예: 이메일 기반 로그인 시)
const findByLoginId = async (email) => {
    const userRepository = AppDataSource.getRepository('User');
    return await userRepository.findOneBy({ email });
};

// 모듈로 내보내기
module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    findByLoginId,
};
