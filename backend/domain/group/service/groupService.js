// backend/domain/group/service/groupService.js
const groupRepository = require('../repository/groupRepository');

module.exports = {
  createGroup: async (groupData) => {
    return await groupRepository.createGroup(groupData);
  },

  getAllGroups: async () => {
    return await groupRepository.findAllGroups();
  },

  getGroupById: async (id) => {
    return await groupRepository.findGroupById(id);
  },

  closeGroup: async (id) => {
    return await groupRepository.closeGroup(id);
  },
};
