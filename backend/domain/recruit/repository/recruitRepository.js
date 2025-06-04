const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const Recruit = require('../entity/Recruit');

const recruitRepository = AppDataSource.getRepository(Recruit);

module.exports = {
  // 모집글 생성
  createRecruit: async (recruitData) => {
    const recruit = recruitRepository.create(recruitData);
    return await recruitRepository.save(recruit);
  },

  // 모집글 전체 조회 (user 관계 포함)
  findAllRecruits: async () => {
    return await recruitRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  },

  // 특정 모집글 조회 (user 관계 포함)
  findRecruitById: async (id) => {
    return await recruitRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  },

  // 모집글 마감 처리
  closeRecruit: async (id) => {
    const recruit = await recruitRepository.findOne({
      where: { id },
      relations: ['user'], // 필요 시 포함
    });
    if (!recruit) return null;

    recruit.is_closed = true;
    return await recruitRepository.save(recruit);
  },
};
