const express = require('express');
const { getRepository, Like } = require('typeorm');
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

    const userRepo = getRepository(User);
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

    const recruitRepo = getRepository(Recruit);
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
    const recruitRepo = getRepository(Recruit);
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

    // ▼▼▼▼▼ [수정] 페이지 계산 로직을 아래와 같이 변경합니다. ▼▼▼▼▼
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    let currentPage = page;
    if (currentPage < 1) {
      currentPage = 1;
    }
    if (currentPage > totalPages) {
      // 검색 결과가 없을 때 totalPages가 0이 아닌 1이 되므로,
      // totalCount가 0일 때 currentPage를 totalPages로 설정하면 안됩니다.
      // 이 경우는 그냥 두거나, 1페이지로 보내는 것이 안전합니다.
      // 하지만 아래 skip 계산에서 (1-1)*pageSize = 0 이 되므로,
      // 현재 로직을 유지해도 괜찮습니다.
      // 더 명확하게 하려면,
      if (totalCount === 0) {
        currentPage = 1;
      } else {
        currentPage = totalPages;
      }
    }
    // ▲▲▲▲▲ [수정] 여기까지 변경합니다. ▲▲▲▲▲


    const recruits = await recruitRepo.find({
      where: whereCondition,
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip: (currentPage - 1) * pageSize, // 이 부분이 음수가 되지 않습니다.
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
    const recruitRepo = getRepository(Recruit);
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

// 모집글 삭제 (작성자만 가능, 모임 및 멤버도 함께 삭제)
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: '로그인이 필요합니다.' });

    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: '유효하지 않은 모집글 ID입니다.' });

    const recruitRepo = getRepository(Recruit);
    const meetingRepo = getRepository(Meeting);
    const memberRepo = getRepository(MeetingMember);

    const recruit = await recruitRepo.findOne({ where: { id }, relations: ['user'] });
    if (!recruit) return res.status(404).json({ message: '해당 모집글을 찾을 수 없습니다.' });

    if (recruit.user?.id !== userId) {
      return res.status(403).json({ message: '삭제 권한이 없습니다. (작성자만 가능)' });
    }

    await recruitRepo.manager.transaction(async (transactionalEntityManager) => {
      const meeting = await transactionalEntityManager.findOne(Meeting, { where: { recruitId: id } });
      if (meeting) {
        await transactionalEntityManager.delete(MeetingMember, { meetingId: meeting.id });
        await transactionalEntityManager.delete(Meeting, meeting.id);
      }
      await transactionalEntityManager.delete(Recruit, id);
    });

    return res.json({ message: '모집글과 연관 모임이 모두 삭제되었습니다.' });
  } catch (err) {
    console.error('모집글 삭제 에러:', err);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 모집 마감 처리 (작성자만 가능, 삭제하지 않고 상태만 변경)
router.patch('/:id/close', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: '로그인이 필요합니다.' });

    const recruitRepo = getRepository(Recruit);

    const id = Number(req.params.id);
    const recruit = await recruitRepo.findOne({ where: { id }, relations: ['user'] });

    if (!recruit) return res.status(404).json({ message: '해당 모집글을 찾을 수 없습니다.' });

    if (recruit.user?.id !== userId) {
      return res.status(403).json({ message: '마감 권한이 없습니다. (작성자만 가능)' });
    }

    recruit.is_closed = true;
    await recruitRepo.save(recruit);

    return res.status(200).json({ message: '모집글이 마감 처리되었습니다.' });
  } catch (err) {
    console.error('모집 마감 처리 에러:', err);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

module.exports = router;