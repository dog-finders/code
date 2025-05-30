// backend/domain/group/controller/groupController.js
const groupService = require('../service/groupService');

module.exports = {
  createGroup: async (req, res) => {
    try {
      const { title, content, location, close_at } = req.body;

      if (!title || !content || !location || !close_at) {
        return res.status(400).json({ message: '모든 항목을 입력해 주세요.' });
      }

      const newGroup = await groupService.createGroup({
        title,
        content,
        location,
        close_at: new Date(close_at),
        is_closed: false,
      });

      return res.status(201).json(newGroup);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: '서버 에러' });
    }
  },

  getAllGroups: async (req, res) => {
    try {
      const groups = await groupService.getAllGroups();
      return res.status(200).json(groups);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: '서버 에러' });
    }
  },

  getGroupById: async (req, res) => {
    try {
      const { id } = req.params;
      const group = await groupService.getGroupById(Number(id));

      if (!group) return res.status(404).json({ message: '그룹을 찾을 수 없습니다.' });

      return res.status(200).json(group);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: '서버 에러' });
    }
  },

  closeGroup: async (req, res) => {
    try {
      const { id } = req.params;
      const closed = await groupService.closeGroup(Number(id));

      if (!closed) return res.status(404).json({ message: '그룹을 찾을 수 없습니다.' });

      return res.status(200).json({ message: '모집 마감 처리됨' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: '서버 에러' });
    }
  },
};
