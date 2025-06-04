// backend/domain/recruit/routes/recruitRoutes.js

const express = require('express');
const { Like } = require('typeorm');
const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const Recruit = require('../entity/Recruit');

const router = express.Router();

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

    const loginId = req.session?.user?.loginId; // 세션에서 사용자 정보 가져오기
    if (!loginId) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const { title, content, close_at } = req.body;
    if (!title || !content || !close_at) {
      return res.status(400).json({ message: '필수 항목 누락' });
    }

    const recruitRepo = AppDataSource.getRepository(Recruit);

    const newRecruit = recruitRepo.create({
      title,
      content,
      close_at: new Date(close_at),
      is_closed: false,
      loginId
    });

    await recruitRepo.save(newRecruit);
    res.status(201).json({ message: '모집글 작성 완료', recruit: newRecruit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 모집글 목록 조회
router.get('/', async (req, res) => {
  try {
    await initDataSource();

    const recruitRepo = AppDataSource.getRepository(Recruit);
    const search = req.query.search || '';

    const whereCondition = search
      ? [
          { title: Like(`%${search}%`) },
          { content: Like(`%${search}%`) }
        ]
      : undefined;

    const recruits = await recruitRepo.find({
      where: whereCondition,
      order: { created_at: 'DESC' }
    });

    res.status(200).json(recruits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 모집글 상세 조회
router.get('/:id', async (req, res) => {
  try {
    await initDataSource();

    const recruitRepo = AppDataSource.getRepository(Recruit);
    const recruit = await recruitRepo.findOneBy({ id: Number(req.params.id) });

    if (!recruit) {
      return res.status(404).json({ message: '모집글을 찾을 수 없습니다.' });
    }

    res.status(200).json(recruit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 모집 마감
router.patch('/:id/close', async (req, res) => {
  try {
    await initDataSource();

    const recruitRepo = AppDataSource.getRepository(Recruit);
    const recruit = await recruitRepo.findOneBy({ id: Number(req.params.id) });

    if (!recruit) {
      return res.status(404).json({ message: '모집글을 찾을 수 없습니다.' });
    }

    recruit.is_closed = true;
    await recruitRepo.save(recruit);

    res.status(200).json({ message: '모집 마감 처리됨' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 에러' });
  }
});

module.exports = router;
