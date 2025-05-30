// backend/domain/group/repository/groupRepository.js
const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const Group = require('../entity/group');

const groupRepository = AppDataSource.getRepository(Group);

module.exports = {
  createGroup: async (groupData) => {
    const group = groupRepository.create(groupData);
    return await groupRepository.save(group);
  },

  findAllGroups: async () => {
    return await groupRepository.find();
  },

  findGroupById: async (id) => {
    return await groupRepository.findOneBy({ id });
  },

  closeGroup: async (id) => {
    const group = await groupRepository.findOneBy({ id });
    if (group) {
      group.is_closed = true;
      return await groupRepository.save(group);
    }
    return null;
  },
};
