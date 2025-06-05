require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');
const session = require('express-session');
const { createConnection } = require('typeorm');

const app = express();
const PORT = process.env.PORT || 8000;

// ── 라우트 파일 import ──
const userRoute = require('./backend/domain/user/routes/userRoutes');
const recruitRoute = require('./backend/domain/recruit/routes/recruitRoutes');
const petRoutes = require('./backend/domain/pet/routes/petRoutes');
const meetingRoute = require('./backend/domain/meeting/routes/meetingRoutes'); // ✅ DB 연동된 meetingRoute import

// ── 데이터베이스 연결 옵션 ──
const connectionOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dogdb',
  synchronize: true,
  logging: true,
  entities: [
    require('./backend/domain/user/entity/User'),
    require('./backend/domain/pet/entity/Pet'),
    require('./backend/domain/recruit/entity/Recruit'),
    require('./backend/domain/meeting/entity/Meeting'),        // ✅ 추가
    require('./backend/domain/meeting/entity/MeetingMember')  // ✅ 추가
  ],
};

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
      maxAge: 1000 * 60 * 60,
    },
  })
);

// ── 정적 파일 라우팅 ──
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// ── HTML 페이지 라우팅 ──
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
app.get('/mypage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'mypage.html'));
});
app.get('/gather', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'gather.html'));
});
app.get('/gather.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'gather.html'));
});

// ── DB 연결 및 API 라우터 연결 ──
createConnection(connectionOptions)
  .then(() => {
    console.log('DB 연결 성공');

    app.use('/api/users', userRoute);
    app.use('/api/recruit', recruitRoute);
    app.use('/api/pets', petRoutes);
    app.use('/api/meetings', meetingRoute); // ✅ meetingRoute 여기만 남기면 돼!

    app.use((req, res, next) => {
      next(createError(404));
    });
    app.use((err, req, res, next) => {
      res.status(err.status || 500).send('에러 발생: ' + err.message);
    });

    app.listen(PORT, () => {
      console.log(`서버 실행 중: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB 연결 에러', err);
  });

module.exports = app;
