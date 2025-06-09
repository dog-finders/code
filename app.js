require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');
const session = require('express-session');

// 라우트 파일 import
const pageRoutes = require('./routes/pageRoutes');
const userRoute = require('./backend/domain/user/routes/userRoutes');
const recruitRoute = require('./backend/domain/recruit/routes/recruitRoutes');
const petRoutes = require('./backend/domain/pet/routes/petRoutes');
const meetingRoute = require('./backend/domain/meeting/routes/meetingRoutes');
const attendRoutes = require('./backend/domain/attend/routes/attendRoutes');
const evaluationRoutes = require('./backend/domain/evaluation/routes/evaluationRoutes');

const app = express();

// 미들웨어 설정
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
            secure: false, // 개발 환경에서는 false, 배포 시에는 true로 변경하는 것이 좋습니다.
            maxAge: 1000 * 60 * 60, // 1시간
        },
    })
);

// 정적 파일 및 페이지 라우팅
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', pageRoutes);

// API 라우팅
app.use('/api/users', userRoute);
app.use('/api/recruit', recruitRoute);
app.use('/api/pets', petRoutes);
app.use('/api/meetings', meetingRoute);
app.use('/api/attend', attendRoutes);
app.use('/api/evaluations', evaluationRoutes);

// 404 에러 처리
app.use((req, res, next) => {
    next(createError(404));
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).send({ error: err.message || 'Something failed!' });
});

// app 객체를 내보내기만 합니다.
module.exports = app;