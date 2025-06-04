// backend/domain/recruit/routes/recruitRoutes.js

const express = require('express');
const { Like } = require('typeorm');

// AppDataSource를 한 번만 올바른 상대 경로로 불러옵니다.
// 이 파일이 `code/backend/domain/recruit/routes/recruitRoutes.js`에 있으므로,
// 데이터 소스는 `../../../global/config/typeOrmConfig`를 가리킵니다.
const { AppDataSource } = require('../../../global/config/typeOrmConfig');

// Recruit 엔티티를 가져옵니다.
const Recruit = require('../entity/recruit');

// User 엔티티도 함께 불러옵니다. (작성자 검증 및 관계 매핑에 사용)
const User = require('../../user/entity/User');

const router = express.Router();

// 데이터소스 초기화 함수: initialize()를 한 번만 호출하도록 검사합니다.
async function initDataSource() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
  }
}


// ── 모집글 작성 ──
router.post('/', async (req, res) => {
  try {
    // 1) 데이터소스 초기화
    await initDataSource();

    // 2) 세션에서 사용자 id를 꺼냅니다.
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    // 3) 작성자(User) 검증
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) {
      return res.status(401).json({ message: '유효하지 않은 사용자입니다.' });
    }

    // 4) 요청 바디 필수 항목 검사
    const { title, content, close_at, location } = req.body;
    if (!title || !content || !close_at) {
      return res.status(400).json({ message: '필수 항목이 누락되었습니다.' });
    }

    // 5) 날짜 형식 검증
    const closeAtDate = new Date(close_at);
    if (isNaN(closeAtDate.getTime())) {
      return res.status(400).json({ message: '유효하지 않은 날짜 형식입니다.' });
    }

    // 6) 새 Recruit 엔티티 생성
    const recruitRepo = AppDataSource.getRepository(Recruit);
    const newRecruit = recruitRepo.create({
      title,
      content,
      close_at: closeAtDate,
      is_closed: false,
      location: location || null,
      user, // 작성자(User) 관계 매핑
    });

    // 7) 저장
    const savedRecruit = await recruitRepo.save(newRecruit);

    // 8) 작성자 관계 포함하여 다시 조회
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
    // 1) 데이터소스 초기화
    await initDataSource();

    const recruitRepo = AppDataSource.getRepository(Recruit);
    const search = req.query.search || '';
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    // 2) 검색어 조건
    const whereCondition = search
      ? [
          { title: Like(`%${search}%`) },
          { content: Like(`%${search}%`) },
        ]
      : {};

    // 3) 전체 개수 + 페이지 계산
    const totalCount = await recruitRepo.count({ where: whereCondition });
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentPage =
      page > totalPages ? totalPages : page < 1 ? 1 : page;

    // 4) 실제 데이터 조회 (latest 순 정렬, skip/take 적용, 작성자 관계 포함)
    const recruits = await recruitRepo.find({
      where: whereCondition,
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });

    // 5) 응답 데이터 형태 가공
    const responseData = {
      totalPages,
      currentPage,
      posts: recruits.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        close_at: r.close_at,
        is_closed: r.is_closed,
        author: r.user ? r.user.username : '익명',
        location: r.location || '-',
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
    // 1) 데이터소스 초기화
    await initDataSource();

    const recruitRepo = AppDataSource.getRepository(Recruit);

    // 2) ID 기반으로 한 건 조회 (작성자 관계 포함)
    const recruit = await recruitRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ['user'],
    });

    if (!recruit) {
      return res.status(404).json({ message: '해당 모집글을 찾을 수 없습니다.' });
    }

    // 3) 필요한 필드만 응답
    return res.status(200).json({
      id: recruit.id,
      title: recruit.title,
      content: recruit.content,
      close_at: recruit.close_at,
      is_closed: recruit.is_closed,
      author: recruit.user ? recruit.user.username : '익명',
      location: recruit.location,
      created_at: recruit.created_at,
    });
  } catch (err) {
    console.error('모집글 상세 조회 에러:', err);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});


// ── 모집 마감 처리 ──
router.patch('/:id/close', async (req, res) => {
  try {
    // 1) 데이터소스 초기화
    await initDataSource();

    const recruitRepo = AppDataSource.getRepository(Recruit);

    // 2) ID 기반으로 한 건 조회 (관계 불필요)
    const recruit = await recruitRepo.findOneBy({
      id: Number(req.params.id),
    });

    if (!recruit) {
      return res.status(404).json({ message: '해당 모집글을 찾을 수 없습니다.' });
    }

    // 3) is_closed 필드만 업데이트
    recruit.is_closed = true;
    await recruitRepo.save(recruit);

    return res.status(200).json({ message: '모집 마감 처리됨' });
  } catch (err) {
    console.error('모집 마감 처리 에러:', err);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

module.exports = router;
