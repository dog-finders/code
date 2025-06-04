// controller/recruitController.js

const recruitService = require('../service/recruitService');
const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const User = require('../../user/entity/User');

module.exports = {
  createRecruit: async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
      }

      const { title, content, close_at, location } = req.body;
      if (!title || !content || !close_at) {
        return res.status(400).json({ message: '모든 항목을 입력해 주세요.' });
      }

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOneBy({ id: userId });
      if (!user) {
        return res.status(401).json({ message: '유효하지 않은 사용자입니다.' });
      }

      // user 객체 대신 authorId만 전달
      const newRecruit = await recruitService.createRecruit({
        title,
        content,
        close_at: new Date(close_at),
        is_closed: false,
        authorId: user.id, // 작성자 정보는 authorId로만 전달
        location,
      });

      return res.status(201).json(newRecruit);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: '서버 에러' });
    }
  },

  getAllRecruits: async (req, res) => {
    try {
      const { search = '', page = 1, pageSize = 10 } = req.query;

      const result = await recruitService.getAllRecruits();

      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: '서버 에러' });
    }
  },

  getRecruitById: async (req, res) => {
    try {
      const { id } = req.params;
      const recruit = await recruitService.getRecruitById(Number(id));

      if (!recruit) {
        return res.status(404).json({ message: '모집글을 찾을 수 없습니다.' });
      }

      return res.status(200).json(recruit);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: '서버 에러' });
    }
  },

  closeRecruit: async (req, res) => {
    try {
      const { id } = req.params;
      const closed = await recruitService.closeRecruit(Number(id));

      if (!closed) {
        return res.status(404).json({ message: '모집글을 찾을 수 없습니다.' });
      }

      return res.status(200).json({ message: '모집 마감 처리됨' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: '서버 에러' });
    }
  },
};
