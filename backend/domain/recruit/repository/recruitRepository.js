const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const Recruit = require('../entity/Recruit');

const recruitRepository = AppDataSource.getRepository(Recruit);

module.exports = recruitRepository;
