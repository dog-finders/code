// repository/recruitRepository.js

const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const Recruit = require('../entity/Recruit');
const User = require('../../user/entity/User'); // User 엔티티 추가

const recruitRepository = AppDataSource.getRepository(Recruit);

module.exports = {
  // 모집글 생성
  createRecruit: async (recruitData) => {
    // recruitData에 user 객체가 아니라 authorId가 있다고 가정
    const { title, content, close_at, is_closed, authorId, location } = recruitData;

    const recruit = recruitRepository.create({
      title,
      content,
      close_at,
      is_closed,
      location,
      authorId,  // 이제 작성자 정보는 authorId로만 처리
    });

    return await recruitRepository.save(recruit);
  },

  // 모집글 전체 조회 (user 관계 포함)
  findAllRecruits: async () => {
    return await recruitRepository.find({
      relations: ['user'], // user 정보를 같이 가져옴
      order: { created_at: 'DESC' },
    });
  },

  // 특정 모집글 조회 (user 관계 포함)
  findRecruitById: async (id) => {
    return await recruitRepository.findOne({
      where: { id },
      relations: ['user'], // user 정보를 같이 가져옴
    });
  },

  // 모집글 마감 처리
  closeRecruit: async (id) => {
    const recruit = await recruitRepository.findOne({
      where: { id },
      relations: ['user'], // 필요 시 user 관계 포함
    });
    if (!recruit) return null;

    recruit.is_closed = true;
    return await recruitRepository.save(recruit);
  },
};
