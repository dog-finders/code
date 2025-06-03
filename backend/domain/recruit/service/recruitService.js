// backend/domain/recruit/service/recruitService.js
const recruitRepository = require('../repository/recruitRepository');

module.exports = {
  createRecruit: async (recruitData) => {
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
