const express = require('express');
const { Like } = require('typeorm');
const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const Recruit = require('../entity/Recruit');
const User = require('../../user/entity/User');

const router = express.Router();

// 데이터 소스 초기화 함수
async function initDataSource() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
  }
}

// 모집글 작성
router.post('/', async (req, res) => {
  try {
    await initDataSource();

    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const { title, content, close_at, location } = req.body;
    if (!title || !content || !close_at) {
      return res.status(400).json({ message: '필수 항목이 누락되었습니다.' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) {
      return res.status(401).json({ message: '유효하지 않은 사용자입니다.' });
    }

    const recruitRepo = AppDataSource.getRepository(Recruit);

    const closeAtDate = new Date(close_at);
    if (isNaN(closeAtDate.getTime())) {
      return res.status(400).json({ message: '유효하지 않은 날짜 형식입니다.' });
    }

    // 새 모집글 엔티티 생성
    const newRecruit = recruitRepo.create({
      title,
      content,
      close_at: closeAtDate,
      is_closed: false,
      user, // 작성자 연결
      location: location || null,
    });

    // 저장
    const savedRecruit = await recruitRepo.save(newRecruit);

    // 작성자(user) 관계 포함하여 다시 조회
    const fullRecruit = await recruitRepo.findOne({
      where: { id: savedRecruit.id },
      relations: ['user'],
    });

    res.status(201).json({ message: '모집글 작성 완료', recruit: fullRecruit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 모집글 목록 조회 (검색 + 페이징 + 정렬 + 유저 포함)
router.get('/', async (req, res) => {
  try {
    await initDataSource();

    const recruitRepo = AppDataSource.getRepository(Recruit);
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const whereCondition = search
      ? [
          { title: Like(`%${search}%`) },
          { content: Like(`%${search}%`) },
        ]
      : undefined;

    const totalCount = await recruitRepo.count({ where: whereCondition });
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentPage = page > totalPages ? totalPages : page < 1 ? 1 : page;

    const recruits = await recruitRepo.find({
      where: whereCondition,
      relations: ['user'], // 작성자 정보 포함
      order: { created_at: 'DESC' }, // 최신순 정렬
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });

    const responseData = {
      totalPages,
      currentPage,
      posts: recruits.map(r => ({
        id: r.id,
        title: r.title,
        content: r.content,
        close_at: r.close_at,
        is_closed: r.is_closed,
        author: r.user ? r.user.username : '익명', // 작성자 정보
        location: r.location || '-',
        created_at: r.created_at,
      })),
    };

    res.status(200).json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 모집글 상세 조회
router.get('/:id', async (req, res) => {
  try {
    await initDataSource();

    const recruitRepo = AppDataSource.getRepository(Recruit);
    const recruit = await recruitRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ['user'], // 작성자 정보 포함
    });

    if (!recruit) {
      return res.status(404).json({ message: '해당 모집글을 찾을 수 없습니다.' });
    }

    res.status(200).json({
      id: recruit.id,
      title: recruit.title,
      content: recruit.content,
      close_at: recruit.close_at,
      is_closed: recruit.is_closed,
      author: recruit.user ? recruit.user.username : '익명', // 작성자 정보
      location: recruit.location,
      created_at: recruit.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// 모집 마감 처리
router.patch('/:id/close', async (req, res) => {
  try {
    await initDataSource();

    const recruitRepo = AppDataSource.getRepository(Recruit);
    const recruit = await recruitRepo.findOneBy({ id: Number(req.params.id) });

    if (!recruit) {
      return res.status(404).json({ message: '해당 모집글을 찾을 수 없습니다.' });
    }

    recruit.is_closed = true;
    await recruitRepo.save(recruit);

    res.status(200).json({ message: '모집 마감 처리됨' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

module.exports = router;
