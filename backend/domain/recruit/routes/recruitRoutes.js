const express = require('express');
const { getRepository, Like } = require('typeorm');
const Recruit = require('../entity/Recruit');
const User = require('../../user/entity/User');

// ★ 추가 import
const Meeting = require('../../meeting/entity/Meeting');
const MeetingMember = require('../../meeting/entity/MeetingMember');

const router = express.Router();

// ── 모집글 작성 ──
router.post('/', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }
    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ message: '유효하지 않은 사용자입니다.' });
    }

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
      user, // 작성자(User) 관계 매핑
    });

    const savedRecruit = await recruitRepo.save(newRecruit);
    const fullRecruit = await recruitRepo.findOne({
      where: { id: savedRecruit.id },
      relations: ['user'],
    });

    return res
      .status(201)
      .json({ message: '모집글 작성 완료', recruit: fullRecruit });
  } catch (err) {
    console.error('모집글 저장 에러:', err);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// ── 모집글 목록 조회 (검색 + 페이징 + 정렬 + 작성자 포함) ──
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
        ]
      : {};

    const totalCount = await recruitRepo.count({ where: whereCondition });
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentPage =
      page > totalPages ? totalPages : page < 1 ? 1 : page;

    const recruits = await recruitRepo.find({
      where: whereCondition,
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });

    const responseData = {
      totalPages,
      currentPage,
      posts: recruits.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        close_at: r.close_at,
        is_closed: r.is_closed,
        authorId: r.user ? r.user.loginId : '익명',  // ★ 여기만 수정!
        location: r.location || '-',
        latitude: r.latitude,
        longitude: r.longitude,
        created_at: r.created_at,
      })),
    };

    return res.status(200).json(responseData);
  } catch (err) {
    console.error('모집글 목록 조회 에러:', err);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// ── 모집글 상세 조회 ──
router.get('/:id', async (req, res) => {
  try {
    const recruitRepo = getRepository(Recruit);
    const recruit = await recruitRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ['user'],
    });

    if (!recruit) {
      return res.status(404).json({ message: '해당 모집글을 찾을 수 없습니다.' });
    }

    return res.status(200).json({
      id: recruit.id,
      title: recruit.title,
      content: recruit.content,
      close_at: recruit.close_at,
      is_closed: recruit.is_closed,
      authorId: recruit.user ? recruit.user.loginId : '익명',  // ★ 상세도 동일하게
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

// ── 모집글 삭제(★연관 모임 및 멤버도 삭제) ──
router.delete('/:id', async (req, res) => {
  try {
    const recruitRepo = getRepository(Recruit);
    const meetingRepo = getRepository(Meeting);
    const memberRepo = getRepository(MeetingMember);

    const id = Number(req.params.id);
    // 👇 여기! PK조회는 findOne(id)
    const recruit = await recruitRepo.findOne(id);

    if (!recruit) {
      return res.status(404).json({ message: '해당 모집글을 찾을 수 없습니다.' });
    }

    // 연관 모임 찾아서 삭제 (recruitId 컬럼 기준)
    // 👇 조건 검색은 findOne({ where: { recruitId: id } })
    const meeting = await meetingRepo.findOne({ where: { recruitId: id } });
    if (meeting) {
      await memberRepo.delete({ meetingId: meeting.id }); // 멤버 먼저
      await meetingRepo.delete(meeting.id);               // 모임 삭제
    }

    await recruitRepo.delete(id); // PK로 삭제
    return res.json({ message: '모집글과 연관 모임이 모두 삭제되었습니다.' });
  } catch (err) {
    console.error('모집글 삭제 에러:', err);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// ── 모집 마감 처리 ──
router.patch('/:id/close', async (req, res) => {
  try {
    const recruitRepo = getRepository(Recruit);
    const recruit = await recruitRepo.findOne({ where: { id: Number(req.params.id) } });

    if (!recruit) {
      return res.status(404).json({ message: '해당 모집글을 찾을 수 없습니다.' });
    }

    recruit.is_closed = true;
    await recruitRepo.save(recruit);

    return res.status(200).json({ message: '모집 마감 처리됨' });
  } catch (err) {
    console.error('모집 마감 처리 에러:', err);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

module.exports = router;
