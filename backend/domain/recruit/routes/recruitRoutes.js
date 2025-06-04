// backend/domain/recruit/routes/recruitRoutes.js
const express = require('express');
const { Like } = require('typeorm');
const router = express.Router();

// 전역 AppDataSource를 가져옵니다
const { AppDataSource } = require('../../../global/config/typeOrmConfig');

// Recruit 파일(엔티티)을 import 합니다. (EntitySchema 방식으로 정의되어 있다면, require('…/entity/recruit'))
const Recruit = require('../entity/recruit');

// 모집글 작성
router.post('/', async (req, res) => {
  try {
    // 세션에서 사용자 id를 꺼냅니다.
    const userId = req.session && req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const { location, title, content, close_at } = req.body;
    if (!location || !title || !content || !close_at) {
      return res.status(400).json({ message: '필수 항목 누락' });
    }

    // AppDataSource가 이미 초기화되어 있다면 바로 Repository를 사용할 수 있습니다.
    const recruitRepo = AppDataSource.getRepository(Recruit);

    const newRecruit = recruitRepo.create({
      location,
      title,
      content,
      close_at: new Date(close_at),
      is_closed: false,
      userId, // 작성자 ID
    });

    await recruitRepo.save(newRecruit);
    res.status(201).json({ message: '모집글 작성 완료', recruit: newRecruit });
  } catch (err) {
    console.error('모집글 저장 에러:', err);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 모집글 목록 조회 (검색어 쿼리 포함)
router.get('/', async (req, res) => {
  try {
    const recruitRepo = AppDataSource.getRepository(Recruit);
    const search = req.query.search || '';

    const recruits = await recruitRepo.find({
      where: search
        ? [
            { title: Like(`%${search}%`) },
            { location: Like(`%${search}%`) },
          ]
        : {},
      order: { created_at: 'DESC' },
    });

    res.status(200).json(recruits);
  } catch (err) {
    console.error('모집글 목록 조회 에러:', err);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 특정 모집글 조회
router.get('/:id', async (req, res) => {
  try {
    const recruitRepo = AppDataSource.getRepository(Recruit);
    const recruit = await recruitRepo.findOneBy({ id: Number(req.params.id) });

    if (!recruit) {
      return res.status(404).json({ message: '모집글을 찾을 수 없습니다.' });
    }
    res.status(200).json(recruit);
  } catch (err) {
    console.error('특정 모집글 조회 에러:', err);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 모집 마감 처리
router.patch('/:id/close', async (req, res) => {
  try {
    const recruitRepo = AppDataSource.getRepository(Recruit);
    const recruit = await recruitRepo.findOneBy({ id: Number(req.params.id) });

    if (!recruit) {
      return res.status(404).json({ message: '모집글을 찾을 수 없습니다.' });
    }

    recruit.is_closed = true;
    await recruitRepo.save(recruit);

    res.status(200).json({ message: '모집 마감 처리됨' });
  } catch (err) {
    console.error('모집 마감 처리 에러:', err);
    res.status(500).json({ message: '서버 에러' });
  }
});

module.exports = router;
