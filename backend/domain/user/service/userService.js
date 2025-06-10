const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const bcrypt = require('bcrypt');
const userRepository = require('../repository/userRepository');
const petRepository = require('../../pet/repository/petRepository');

// 아이디 중복을 체크합니다.
const checkDuplicateLoginId = async (loginId) => {
    try {
        const existingUser = await findByLoginId(loginId);
        return !!existingUser;
    } catch (error) {
        console.error('[checkDuplicateLoginId] Error:', error.message);
        throw error;
    }
};

// 새로운 사용자를 생성합니다.
const createUser = async (userData) => {
    try {
        console.log('[createUser] Received userData:', userData);
        
        const { loginId, password, name, address, phone, email, birthdate } = userData;

        // 아이디 중복 체크
        const isDuplicate = await checkDuplicateLoginId(loginId);
        if (isDuplicate) {
            throw new Error('이미 사용 중인 아이디입니다.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('[createUser] Hashed password generated');

        const user = userRepository.create({
            loginId: loginId,
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

// 특정 사용자의 정보를 업데이트합니다.
const updateUser = async (id, userData) => {
    const user = await userRepository.findById(id);
    console.log('[updateUser] 요청받은 ID:', id);

    if (!user) {
        throw new Error('사용자를 찾을 수 없습니다');
    }

    // 비밀번호가 변경된 경우, 새로 암호화하여 저장합니다.
    if (userData.password) {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        userData.password = await bcrypt.hash(userData.password, saltRounds);
    }

    return await userRepository.update(id, userData);
};

// ID로 사용자를 찾습니다.
const findById = async (id) => {
    console.log('[findById] 요청받은 ID:', id);
    const user = await userRepository.findById(id);
    console.log('[findById] 조회 결과:', user);
    return user;
};

// 로그인 ID로 사용자를 찾습니다.
const findByLoginId = async (loginId) => {
    const user = await userRepository.findByLoginId(loginId);
    console.log('[findByLoginId] user:', user);
    return user;
};

// 사용자의 프로필 정보(사용자 정보 + 반려동물 목록)를 조회합니다.
const getUserProfileByLoginId = async (loginId) => {
    const user = await userRepository.findByLoginId(loginId);
    if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
    }

    const pets = await petRepository.findByUserId(user.id);

    // 응답에서 비밀번호 등 민감한 정보를 제외합니다.
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, pets };
};

// 로그인 처리를 합니다.
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

        // 응답에서 비밀번호를 제외한 사용자 정보를 반환합니다.
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (error) {
        console.error('[login] Error:', error.message);
        throw error;
    }
};

// 로그아웃 처리를 합니다.
const logout = async (sessionId) => {
    try {
        // 세션 관련 추가 로직이 필요한 경우 여기에 구현
        return true;
    } catch (error) {
        console.error('[logout] Error:', error.message);
        throw error;
    }
};

// 이메일로 사용자를 찾습니다. (옵션)
const findByEmail = async (email) => {
    const userRepository = AppDataSource.getRepository('User');
    return await userRepository.findOne({ where: { email } });
};

module.exports = {
    createUser,
    findById,
    findByLoginId,
    login,
    logout,
    checkDuplicateLoginId,
    updateUser,
    getUserProfileByLoginId,
};