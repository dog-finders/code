require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');
const session = require('express-session');
const { Like } = require('typeorm');

const app = express();
const PORT = 8000;

// TypeORM 설정
const { AppDataSource } = require('./backend/global/config/typeOrmConfig');

// 모집글 엔티티
const Group = require('./backend/domain/recruit/entity/group');

// DB 초기화
AppDataSource.initialize()
  .then(async () => {
    console.log('Loaded entities:', AppDataSource.options.entities);
    await AppDataSource.synchronize();
    console.log('Data Source initialized');
  })
  .catch((err) => {
    console.error('Data Source initialization error', err);
  });

// 미들웨어ㅁ
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 정적 파일 경로
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 세션 설정
app.use(
  session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60, // 1시간
    },
  })
);

// 📌 모집글 작성 페이지
app.get('/post-create', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'post-create.html'));
});

// 📌 모집글 목록 페이지
app.get('/post-list', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'post-list.html'));
});

// 📌 모집글 상세 페이지
app.get('/post-detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'post-detail.html'));
});

// ✅ 모집글 등록 API (POST)
app.post('/api/groups', async (req, res) => {
  try {
    const { title, content, location, close_at } = req.body;

    if (!title || !content || !location || !close_at) {
      return res.status(400).json({ message: '필수 입력값이 누락되었습니다.' });
    }

    const groupRepository = AppDataSource.getRepository(Group);

    const newGroup = groupRepository.create({
      title,
      content,
      location,
      close_at: new Date(close_at),
      is_closed: false,
    });

    await groupRepository.save(newGroup);

    res.status(201).json({ message: '모집글 등록 성공' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 에러' });
  }
});

// ✅ 모집글 목록 조회 API (GET)
app.get('/api/groups', async (req, res) => {
  try {
    const groupRepository = AppDataSource.getRepository(Group);
    const search = req.query.search || '';

    const posts = await groupRepository.find({
      where: search
        ? [
            { title: Like(`%${search}%`) },
            { location: Like(`%${search}%`) },
          ]
        : {},
      // order: { created_at: 'DESC' },
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '목록 조회 실패' });
  }
});

// ✅ 모집글 상세 조회 API (GET)
app.get('/api/groups/:id', async (req, res) => {
  try {
    const groupRepository = AppDataSource.getRepository(Group);
    const id = req.params.id;

    const post = await groupRepository.findOneBy({ id: parseInt(id) });

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '상세 조회 실패' });
  }
});

// 📌 기본 HTML 라우팅
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/setting', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

// 📌 404 처리
app.use((req, res, next) => {
  next(createError(404));
});

// 📌 에러 핸들링
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send('에러 발생: ' + err.message);
});

// 📌 서버 실행
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});

module.exports = app;
