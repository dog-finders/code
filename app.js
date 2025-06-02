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

// ── TypeORM 설정 ──
const { AppDataSource } = require('./backend/global/config/typeOrmConfig');
const Group = require('./backend/domain/recruit/entity/Group');

// 사용자 API 라우터 import
const userRoute = require('./backend/domain/user/routes/userRoutes');

AppDataSource.initialize()
  .then(async () => {
    console.log('Loaded entities:', AppDataSource.options.entities);
    await AppDataSource.synchronize(); // 개발 시에만 사용
    console.log('Data Source initialized');
  })
  .catch((err) => {
    console.error('Data Source initialization error', err);
  });

// ── 미들웨어 ──
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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

// ── 정적 파일 경로 (CSS, JS, assets, uploads 등) ──
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public'))); // public 내 기타 정적 파일

// ── 페이지 라우팅 (html 확장자 없이 경로로 접속) ──
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'register.html'));
});
app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'settings.html'));
});
app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'map.html'));
});
app.get('/post-create', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'post-create.html'));
});
app.get('/post-list', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'post-list.html'));
});
app.get('/post-detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'post-detail.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});
app.get('/mailbox', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'mailbox.html'));
});
app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'contact.html'));
});

// ── API 라우팅 ──

// 사용자 API 라우팅 (/api/users/*)
app.use('/api/users', userRoute);

// 모집글 등록
app.post('/api/group', async (req, res) => {
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

// 모집글 목록 조회
app.get('/api/group', async (req, res) => {
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
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '목록 조회 실패' });
  }
});

// 모집글 상세 조회
app.get('/api/group/:id', async (req, res) => {
  try {
    const groupRepository = AppDataSource.getRepository(Group);
    const id = parseInt(req.params.id);

    const post = await groupRepository.findOneBy({ id });

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '상세 조회 실패' });
  }
});

// ── 에러 핸들링 ──
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send('에러 발생: ' + err.message);
});

// ── 서버 실행 ──
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});

module.exports = app;
