const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const Recruit = require('../entity/Recruit');

const recruitRepository = AppDataSource.getRepository(Recruit);

module.exports = {
  // 모집글 생성
  createRecruit: async (recruitData) => {
    const recruit = recruitRepository.create(recruitData);
    return await recruitRepository.save(recruit);
  },

  // 모집글 전체 조회
  findAllRecruits: async () => {
    return await recruitRepository.find();
  },

  // 특정 모집글 조회
  findRecruitById: async (id) => {
    return await recruitRepository.findOneBy({ id });
  },

  // 모집글 마감 처리
  closeRecruit: async (id) => {
    const recruit = await recruitRepository.findOneBy({ id });
    if (recruit) {
      recruit.is_closed = true;
      return await recruitRepository.save(recruit);
    }
    return null;
  },
};
