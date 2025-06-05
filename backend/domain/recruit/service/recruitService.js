// service/recruitService.js

const recruitRepository = require('../repository/recruitRepository');

module.exports = {
  // 모집글 생성
  createRecruit: async (recruitData) => {
    // recruitData에서 user 객체 대신 authorId만 넘겨서 처리
    return await recruitRepository.createRecruit(recruitData);
  },

  // 모집글 전체 조회
  getAllRecruits: async () => {
    return await recruitRepository.findAllRecruits();
  },

  // 특정 모집글 조회
  getRecruitById: async (id) => {
    return await recruitRepository.findRecruitById(id);
  },

  // 모집글 마감 처리
  closeRecruit: async (id) => {
    return await recruitRepository.closeRecruit(id);
  },
};
