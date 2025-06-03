// backend/domain/recruit/routes/recruitRoutes.js
const express = require('express');
const { DataSource, Like, EntitySchema } = require('typeorm');

// Recruit 엔티티를 EntitySchema 방식으로 직접 선언
const Recruit = new EntitySchema({
  name: 'Recruit',
  tableName: 'recruit',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    title: {
      type: 'varchar',
    },
    content: {
      type: 'text',
    },
    location: {
      type: 'varchar',
    },
    close_at: {
      type: 'datetime',
    },
    is_closed: {
      type: 'boolean',
      default: false,
    },
    created_at: {
      type: 'datetime',
      createDate: true,
    },
    updated_at: {
      type: 'datetime',
      updateDate: true,
    },
  },
});

// DataSource 직접 생성 (환경변수 사용한다고 가정)
const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test',
  synchronize: true,
  logging: false,
  entities: [Recruit],
});

const router = express.Router();

// 데이터소스 초기화 (초기화 안 되면 쿼리 실행 불가)
AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

// 모집글 작성
router.post('/', async (req, res) => {
  try {
    const { location, title, content, close_at } = req.body;

    if (!location || !title || !content || !close_at) {
      return res.status(400).json({ message: '필수 항목 누락' });
    }

    const recruitRepo = AppDataSource.getRepository('Recruit');

    const newRecruit = recruitRepo.create({
      location,
      title,
      content,
      close_at: new Date(close_at),
      is_closed: false,
    });

    await recruitRepo.save(newRecruit);

    res.status(201).json({ message: '모집글 작성 완료', recruit: newRecruit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 모집글 목록 조회 (검색어 쿼리 포함)
router.get('/', async (req, res) => {
  try {
    const recruitRepo = AppDataSource.getRepository('Recruit');
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
    console.error(err);
    res.status(500).json({ message: '서버 에러' });
  }
});

// 특정 모집글 조회
router.get('/:id', async (req, res) => {
  try {
    const recruitRepo = AppDataSource.getRepository('Recruit');
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

// 모집 마감 처리
router.patch('/:id/close', async (req, res) => {
  try {
    const recruitRepo = AppDataSource.getRepository('Recruit');
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
