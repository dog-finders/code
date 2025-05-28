const userRepository = require('../repository/userRepository');

// 전체 사용자 조회
exports.getAllUsers = () => {
    return userRepository.findAll();
};

// 특정 사용자 조회
exports.getUserById = (id) => {
    return userRepository.findById(id);
};

// 사용자 생성 (회원가입)
exports.createUser = (userData) => {
    return userRepository.create(userData);
};
