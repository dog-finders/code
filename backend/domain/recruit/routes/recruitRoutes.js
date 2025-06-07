const express = require('express');
const { Like } = require('typeorm');
const { AppDataSource } = require('../../../global/config/typeOrmConfig'); // 수정: 올바른 상대경로
const Recruit = require('../entity/Recruit');
const User = require('../../user/entity/User');
const Meeting = require('../../meeting/entity/Meeting');
const MeetingMember = require('../../meeting/entity/MeetingMember');

const router = express.Router();

// 모집글 작성
router.post('/', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: '로그인이 필요합니다.' });

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) return res.status(401).json({ message: '유효하지 않은 사용자입니다.' });

    const { title, content, close_at, location, lat, lng } = req.body;
    if (!title || !content || !close_at || !lat || !lng) {
      return res.status(400).json({ message: '필수 항목(제목, 내용, 마감일, 위도, 경도)이 누락되었습니다.' });
    }

    const closeAtDate = new Date(close_at);
    if (isNaN(closeAtDate.getTime())) {
      return res.status(400).json({ message: '유효하지 않은 날짜 형식입니다.' });
    }

    const recruitRepo = AppDataSource.getRepository(Recruit);
    const newRecruit = recruitRepo.create({
      title,
      content,
      close_at: closeAtDate,
      is_closed: false,
      location: location || null,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      user,
    });

    const savedRecruit = await recruitRepo.save(newRecruit);
    const fullRecruit = await recruitRepo.findOne({
      where: { id: savedRecruit.id },
      relations: ['user'],
    });

    return res.status(201).json({ message: '모집글 작성 완료', recruit: fullRecruit });
  } catch (err) {
    console.error('모집글 저장 에러:', err);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 모집글 목록 조회
router.get('/', async (req, res) => {
  try {
    const recruitRepo = AppDataSource.getRepository(Recruit);
    const search = req.query.search || '';
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const whereCondition = search
      ? [
          { title: Like(`%${search}%`) },
          { content: Like(`%${search}%`) },
          { location: Like(`%${search}%`) },
        ]
      : {};

    const totalCount = await recruitRepo.count({ where: whereCondition });
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    let currentPage = page;
    if (currentPage < 1) {
      currentPage = 1;
    }
    if (currentPage > totalPages && totalCount > 0) {
      currentPage = totalPages;
    } else if (currentPage > 1 && totalCount === 0) {
      currentPage = 1;
    }

    const recruits = await recruitRepo.find({
      where: whereCondition,
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });

    return res.status(200).json({
      totalPages,
      currentPage,
      posts: recruits.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        close_at: r.close_at,
        is_closed: r.is_closed,
        authorId: r.user ? r.user.loginId : '익명',
        location: r.location || '-',
        latitude: r.latitude,
        longitude: r.longitude,
        created_at: r.created_at,
      })),
    });

  } catch (err) {
    console.error('모집글 목록 조회 에러:', err);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});


// 모집글 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const recruitRepo = AppDataSource.getRepository(Recruit);
    const recruit = await recruitRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ['user'],
    });

    if (!recruit) return res.status(404).json({ message: '해당 모집글을 찾을 수 없습니다.' });

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
});

// 공통 삭제 로직 함수
const deleteRecruitAndMeeting = async (recruitId, userId) => {
  const recruitRepo = AppDataSource.getRepository(Recruit);
  const recruit = await recruitRepo.findOne({ where: { id: recruitId }, relations: ['user'] });
    if (!recruit) {
        throw { status: 404, message: '해당 모집글을 찾을 수 없습니다.' };
    }
    if (recruit.user?.id !== userId) {
        throw { status: 403, message: '처리 권한이 없습니다. (작성자만 가능)' };
    }

  await recruitRepo.manager.transaction(async em => {
    const meeting = await em.findOne(Meeting, { where: { recruitId }});
    if (meeting) {
      await em.delete(MeetingMember, { meetingId: meeting.id });
      await em.delete(Meeting, { id: meeting.id });
    }
    await em.delete(Recruit, { id: recruitId });
  });
};

// 모집글 삭제 API
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: '로그인이 필요합니다.' });

    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: '유효하지 않은 모집글 ID입니다.' });

    await deleteRecruitAndMeeting(id, userId);

    return res.json({ message: '모집글과 연관 모임이 모두 삭제되었습니다.' });
  } catch (err) {
    console.error('모집글 삭제 에러:', err);
    return res.status(err.status || 500).json({ message: err.message || '서버 에러가 발생했습니다.' });
  }
});

// 모집 마감 API (삭제와 동일하게 동작)
router.patch('/:id/close', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: '로그인이 필요합니다.' });

    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: '유효하지 않은 모집글 ID입니다.' });

    await deleteRecruitAndMeeting(id, userId);

    return res.json({ message: '모집글이 마감(삭제) 처리되었습니다.' });
  } catch (err) {
    console.error('모집 마감 처리 에러:', err);
    return res.status(err.status || 500).json({ message: err.message || '서버 에러가 발생했습니다.' });
  }
});

module.exports = router;
