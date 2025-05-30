const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const User = require('../entity/User');

const userRepository = AppDataSource.getRepository('User');

exports.findAll = async () => {
    return await userRepository.find();
};

exports.findById = async (id) => {
    return await userRepository.findOneBy({ id: parseInt(id) });
};
//