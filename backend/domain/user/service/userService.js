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
  return await userRepository.findOneBy({ id: parseInt(id) });
};

// 사용자 생성 (회원가입)
const createUser = async (userData) => {
  try {
    console.log('[createUser] Received userData:', userData);

    const userRepository = AppDataSource.getRepository('User');
    if (!userRepository) {
      console.error('[createUser] Failed to get User repository');
      throw new Error('User repository not found');
    }

    // username을 loginId 필드에 매핑
    const { username, password, name, address, phone, email, birthdate } = userData;

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('[createUser] Hashed password generated');

    const user = userRepository.create({
      loginId: username,
      password: hashedPassword,
      name,
      address,
      phone,
      email,
      birthdate,
    });
    console.log('[createUser] User entity created:', user);

    const savedUser = await userRepository.save(user);
    console.log('[createUser] User saved:', savedUser);

    return savedUser;
  } catch (error) {
    console.error('[createUser] Error occurred:', error.message);
    throw error;
  }
};

// loginId로 사용자 찾기
const findByLoginId = async (loginId) => {
  const userRepository = AppDataSource.getRepository('User');
  return await userRepository.findOne({ where: { loginId } });
};

// email로 사용자 찾기 (옵션)
const findByEmail = async (email) => {
  const userRepository = AppDataSource.getRepository('User');
  return await userRepository.findOne({ where: { email } });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  findByLoginId,
  findByEmail,
};
