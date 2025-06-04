require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');
const session = require('express-session');

const app = express();
const PORT = 8000;

// ✅ TypeORM 연결
const { AppDataSource } = require('./backend/global/config/typeOrmConfig');
const userRoute = require('./backend/domain/user/routes/userRoutes');
const recruitRoute = require('./backend/domain/recruit/routes/recruitRoutes');

console.log('userRoute 타입:', typeof userRoute);       // 함수나 객체라고 찍혀야 함
console.log('recruitRoute 타입:', typeof recruitRoute); // 함수나 객체라고 찍혀야 함

// ✅ 미들웨어
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

// ✅ 정적 파일 경로 (css, js, assets)
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static(path.join(__dirname, 'public', 'html')));

// ✅ 각 HTML 라우트 - ⬅️ 여기서 code 빼고, public부터!
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

// ✅ API 라우터
app.use('/api/users', userRoute);
app.use('/api/recruit', recruitRoute);

// ✅ 404 에러 처리
app.use((req, res, next) => next(createError(404)));
app.use((err, req, res, next) => {
  res.status(err.status || 500).send('에러 발생: ' + err.message);
});

// ✅ DB 연결 후 서버 실행
AppDataSource.initialize()
  .then(() => {
    console.log('Data Source initialized');
    app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
  })
  .catch((err) => console.error('Data Source initialization error', err));

module.exports = app;
