require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');
const session = require('express-session');
const { LessThan } = require('typeorm');
const { AppDataSource } = require('./backend/global/config/typeOrmConfig');

// --- 필요한 엔티티 import ---
const Recruit = require('./backend/domain/recruit/entity/Recruit');
const Meeting = require('./backend/domain/meeting/entity/Meeting');
const MeetingMember = require('./backend/domain/meeting/entity/MeetingMember');

const app = express();
const PORT = process.env.PORT || 8000;

// --- 라우트 파일 import ---
const pageRoutes = require('./routes/pageRoutes'); // [수정] 페이지 라우터 추가
const userRoute = require('./backend/domain/user/routes/userRoutes');
const recruitRoute = require('./backend/domain/recruit/routes/recruitRoutes');
const petRoutes = require('./backend/domain/pet/routes/petRoutes');
const meetingRoute = require('./backend/domain/meeting/routes/meetingRoutes');
const attendRoutes = require('./backend/domain/attend/routes/attendRoutes');
const evaluationRoutes = require('./backend/domain/evaluation/routes/evaluationRoutes');

// --- DB 초기화 후 서버 실행 ---
AppDataSource.initialize()
.then(() => {
    console.log("Data Source has been initialized!");

    // --- 미들웨어 ---
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

    // 정적 파일 및 페이지 라우팅
    app.use(express.static(path.join(__dirname, 'public')));
    app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => res.sendStatus(204));//
    app.use('/', pageRoutes);

    // --- API 라우팅 ---
    app.use('/api/users', userRoute);
    app.use('/api/recruit', recruitRoute);
    app.use('/api/pets', petRoutes);
    app.use('/api/meetings', meetingRoute);
    app.use('/api/attend', attendRoutes);
    app.use('/api/evaluations', evaluationRoutes);

    // --- 자동 마감 스케줄러 설정 (기존 로직 유지) ---
    const checkAndCloseExpiredRecruits = async () => {
        console.log('[Scheduler] 만료된 모집글 확인 작업을 실행합니다.');
        const recruitRepo = AppDataSource.getRepository(Recruit);
        try {
            const now = new Date();
            const expiredRecruits = await recruitRepo.find({
                where: { is_closed: false, close_at: LessThan(now) }
            });

            if (expiredRecruits.length > 0) {
                console.log(`[Scheduler] ${expiredRecruits.length}개의 만료된 모집글을 찾았습니다.`);
                for (const recruit of expiredRecruits) {
                    await AppDataSource.manager.transaction(async em => {
                        const meeting = await em.findOne(Meeting, { where: { recruitId: recruit.id } });
                        if (meeting) {
                            await em.delete(MeetingMember, { meetingId: meeting.id });
                            await em.delete(Meeting, { id: meeting.id });
                        }
                        await em.delete(Recruit, { id: recruit.id });
                        console.log(`[Scheduler] 모집글 ID: ${recruit.id}가 자동으로 마감(삭제)되었습니다.`);
                    });
                }
            }
        } catch (error) {
            console.error('[Scheduler] 자동 마감 작업 중 오류가 발생했습니다:', error);
        }
    };
    setInterval(checkAndCloseExpiredRecruits, 60000);
    checkAndCloseExpiredRecruits(); // 서버 시작 시 즉시 1회 실행


    // 404 에러 처리
    app.use((req, res, next) => {
        next(createError(404));
    });

    // 전역 에러 핸들러
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(err.status || 500).send({ error: err.message || 'Something failed!' });
    });


    app.listen(PORT, () => {
        console.log(`서버 실행 중: http://localhost:${PORT}`);
    });
})
.catch((err) => {
    console.error("Error during Data Source initialization", err);
});

module.exports = app;
