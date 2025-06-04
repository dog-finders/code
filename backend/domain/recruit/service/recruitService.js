const recruitRepository = require('../repository/recruitRepository');
const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const User = require('../../user/entity/User');

const userRepository = AppDataSource.getRepository(User);

module.exports = {
  createRecruit: async (recruitData) => {
    // recruitData 안에 loginId가 있다고 가정
    const user = await userRepository.findOneBy({ loginId: recruitData.loginId });
    if (!user) throw new Error('User not found');

    // 관계 설정 위해 user 엔티티 추가
    const newRecruitData = {
      ...recruitData,
      user,  // 연관관계 설정
    };

    return await recruitRepository.createRecruit(newRecruitData);
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
