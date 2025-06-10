// backend/domain/recruit/controller/recruitController.js
const recruitService = require('../service/recruitService');

module.exports = {
  // 모집글 생성 요청을 처리합니다.
  createRecruit: async (req, res) => {
    try {
      const userId = req.session?.userId;
      const { title, content, close_at, location, lat, lng } = req.body;
      if (!title || !content || !close_at || !lat || !lng) {
        return res.status(400).json({ message: '필수 항목이 누락되었습니다.' });
      }

      const recruitData = {
        title,
        content,
        close_at: new Date(close_at),
        location: location || null,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        is_closed: false,
      };

      const newRecruit = await recruitService.createRecruit(recruitData, userId);
      return res.status(201).json({ message: '모집글 작성 완료', recruit: newRecruit });
    } catch (err) {
      console.error('모집글 작성 에러:', err);
      return res.status(500).json({ message: err.message || '서버 에러가 발생했습니다.' });
    }
  },

  // 모든 모집글 조회 요청을 처리합니다.
  getAllRecruits: async (req, res) => {
    try {
      const { search = '', page = 1, pageSize = 10 } = req.query;
      const result = await recruitService.getAllRecruits({
        search,
        page: Number(page),
        pageSize: Number(pageSize),
      });
      return res.status(200).json(result);
    } catch (err) {
      console.error('모집글 목록 조회 에러:', err);
      return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
  },

  // 특정 모집글 조회 요청을 처리합니다.
  getRecruitById: async (req, res) => {
    try {
      const { id } = req.params;
      const recruit = await recruitService.getRecruitById(Number(id));
      if (!recruit) {
        return res.status(404).json({ message: '해당 모집글을 찾을 수 없습니다.' });
      }
      return res.status(200).json({
        id: recruit.id,
        title: recruit.title,
        content: recruit.content,
        close_at: recruit.close_at,
        is_closed: recruit.is_closed,
        authorId: recruit.user ? recruit.user.loginId : '익명',
        location: recruit.location,
        latitude: recruit.latitude,
        longitude: recruit.longitude,
        created_at: recruit.created_at,
      });
    } catch (err) {
      console.error('모집글 상세 조회 에러:', err);
      return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
    }
  },

  // 모집글 마감 요청을 처리합니다.
  closeRecruit: async (req, res) => {
    try {
      const userId = req.session?.userId;
      const recruitId = Number(req.params.id);

      await recruitService.closeRecruit(recruitId, userId);
      return res.status(200).json({ message: '모집글이 마감 처리되었습니다.' });
    } catch (err) {
      console.error('모집 마감 처리 에러:', err);
      const statusCode = err.message.includes('권한') ? 403 : 404;
      return res.status(statusCode).json({ message: err.message });
    }
  },

  // 모집글 삭제 요청을 처리합니다.
  deleteRecruit: async (req, res) => {
    try {
      const userId = req.session?.userId;
      const recruitId = Number(req.params.id);

      await recruitService.deleteRecruit(recruitId, userId);
      return res.status(200).json({ message: '모집글이 삭제되었습니다.' });
    } catch (err) {
      console.error('모집글 삭제 에러:', err);
      const statusCode = err.message.includes('권한') ? 403 : 404;
      return res.status(statusCode).json({ message: err.message });
    }
  },
};