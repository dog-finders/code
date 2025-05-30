const recruitRepository = require('../repository/recruitRepository');

class RecruitService {
  async getAllRecruits() {
    return await recruitRepository.find();
  }

  async createRecruit({ user, group, role, status }) {
    const newRecruit = recruitRepository.create({ user, group, role, status });
    return await recruitRepository.save(newRecruit);
  }

  async updateRecruit(id, { role, status }) {
    const recruit = await recruitRepository.findOneBy({ id: parseInt(id) });
    if (!recruit) {
      throw new Error('Recruit not found');
    }

    if (role !== undefined) recruit.role = role;
    if (status !== undefined) recruit.status = status;

    return await recruitRepository.save(recruit);
  }
}

module.exports = new RecruitService();
