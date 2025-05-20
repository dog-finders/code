const userRepository = require('../repository/userRepository');

exports.getAllUsers = () => {
    return userRepository.findAll();
};

exports.getUserById = (id) => {
    return userRepository.findById(id);
};
