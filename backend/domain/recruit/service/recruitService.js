// service/recruitService.js

const recruitRepository = require('../repository/recruitRepository');

module.exports = {
  createRecruit: async (recruitData) => {
    // recruitData 안에 user 객체가 있다고 가정 (user 엔티티 직접 받음)
    return await recruitRepository.createRecruit(recruitData);
  },

  getAllRecruits: async () => {
    return await recruitRepository.findAllRecruits();
  },

  getRecruitById: async (id) => {
    return await recruitRepository.findRecruitById(id);
  },

  closeRecruit: async (id) => {
    return await recruitRepository.closeRecruit(id);
  },
};
