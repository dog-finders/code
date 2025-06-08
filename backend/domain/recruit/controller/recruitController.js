const recruitService = require('../service/recruitService');
// [삭제] const { getRepository } = require('typeorm');
const { AppDataSource } = require('../../../global/config/typeOrmConfig'); // [수정] AppDataSource를 직접 import
const User = require('../../user/entity/User');

module.exports = {
  createRecruit: async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
      }

      const { title, content, close_at, lat, lng } = req.body;
      if (!title || !content || !close_at || !lat || !lng) {
        return res.status(400).json({ message: '모든 항목(제목, 내용, 마감일, 위도, 경도)을 입력해 주세요.' });
      }

      // [수정] getRepository(User) 대신 AppDataSource.getRepository(User) 사용
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(401).json({ message: '유효하지 않은 사용자입니다.' });
      }

      // recruitService로 넘길 때, authorId와 latitude/longitude를 전달
      const newRecruit = await recruitService.createRecruit({
        title,
        content,
        close_at: new Date(close_at),
        is_closed: false,
        authorId: user.id,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      });

      // 저장 완료 시 ID, 위도, 경도 함께 로그로 출력
      console.log('새 모집글 저장됨 - ID:', newRecruit.id, '위도:', newRecruit.latitude, '경도:', newRecruit.longitude);

      return res.status(201).json(newRecruit);
    } catch (err) {
      console.error('모집글 작성 에러:', err);
      return res.status(500).json({ message: '서버 에러' });
    }
  },

  deleteRecruit: async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const { id } = req.params;
    const deleted = await recruitService.deleteRecruit(Number(id), userId);

    if (!deleted) {
      return res.status(404).json({ message: '삭제할 모집글을 찾을 수 없거나 권한이 없습니다.' });
    }

    return res.status(200).json({ message: '모집글 삭제 완료' });
  } catch (err) {
    console.error('모집글 삭제 에러:', err);
    return res.status(500).json({ message: '서버 에러' });
  }
},

  getAllRecruits: async (req, res) => {
    try {
      const { search = '', page = 1, pageSize = 10 } = req.query;
      const result = await recruitService.getAllRecruits({ search, page: Number(page), pageSize: Number(pageSize) });
      return res.status(200).json(result);
    } catch (err) {
      console.error('모집글 전체 조회 에러:', err);
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
      console.error('모집글 상세 조회 에러:', err);
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
      console.error('모집 마감 처리 에러:', err);
      return res.status(500).json({ message: '서버 에러' });
    }
  },
};