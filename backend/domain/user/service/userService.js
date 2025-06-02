const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const bcrypt = require('bcrypt');

// 아이디 중복 체크 함수
const checkDuplicateLoginId = async (loginId) => {
    try {
        const existingUser = await findByLoginId(loginId);
        return !!existingUser;
    } catch (error) {
        console.error('[checkDuplicateLoginId] Error:', error.message);
        throw error;
    }
};

// createUser 함수 수정
const createUser = async (userData) => {
    try {
        console.log('[createUser] Received userData:', userData);

        const userRepository = AppDataSource.getRepository('User');
        if (!userRepository) {
            console.error('[createUser] Failed to get User repository');
            throw new Error('User repository not found');
        }
        // username을 loginId 필드에 매핑
        const { username, password, name, address, phone, email, birthdate } =
            userData;

        // 아이디 중복 체크
        const isDuplicate = await checkDuplicateLoginId(username);
        if (isDuplicate) {
            throw new Error('이미 사용 중인 아이디입니다.');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
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

const login = async (loginId, password) => {
    try {
        const user = await findByLoginId(loginId);
        if (!user) {
            throw new Error('존재하지 않는 사용자입니다.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('비밀번호가 일치하지 않습니다.');
        }

        // 비밀번호를 제외한 사용자 정보 반환
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (error) {
        console.error('[login] Error:', error.message);
        throw error;
    }
};

const logout = async (sessionId) => {
    try {
        // 세션 관련 추가 로직이 필요한 경우 여기에 구현
        return true;
    } catch (error) {
        console.error('[logout] Error:', error.message);
        throw error;
    }
};

module.exports = {
    createUser,
    findByLoginId,
    login,
    logout,
    checkDuplicateLoginId,
};

// email로 사용자 찾기 (옵션)
const findByEmail = async (email) => {
    const userRepository = AppDataSource.getRepository('User');
    return await userRepository.findOne({ where: { email } });
};

module.exports = {
    createUser,
    findByLoginId,
    login,
    logout,
    checkDuplicateLoginId,
};
