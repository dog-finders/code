const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const User = require('../entity/User');

const userRepository = AppDataSource.getRepository(User);

exports.findAll = async () => {
  try {
    return await userRepository.find();
  } catch (error) {
    console.error('findAll error:', error);
    throw error;
  }
};

exports.findById = async (id) => {
  try {
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      console.warn(`findById: invalid id ${id}`);
      return null;
    }
    return await userRepository.findOneBy({ id: numericId });
  } catch (error) {
    console.error('findById error:', error);
    throw error;
  }
};
