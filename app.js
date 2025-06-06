require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');
const session = require('express-session');
// getRepository와 LessThan을 typeorm에서 가져옵니다.
const { createConnection, getRepository, LessThan } = require('typeorm');

const app = express();
const PORT = process.env.PORT || 8000;

// --- 라우트 파일 import ---
const userRoute = require('./backend/domain/user/routes/userRoutes');
const recruitRoute = require('./backend/domain/recruit/routes/recruitRoutes');
const petRoutes = require('./backend/domain/pet/routes/petRoutes');
const meetingRoute = require('./backend/domain/meeting/routes/meetingRoutes');
const attendRoutes = require('./backend/domain/attend/routes/attendRoutes');

// --- 스케줄러에서 사용할 엔티티 import ---
const Recruit = require('./backend/domain/recruit/entity/Recruit');
const Meeting = require('./backend/domain/meeting/entity/Meeting');
const MeetingMember = require('./backend/domain/meeting/entity/MeetingMember');


// --- 데이터베이스 연결 옵션 ---
const connectionOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dogdb',
  synchronize: true,
  logging: true, // 스케줄러 동작을 확인하기 위해 로깅을 켜둡니다.
  entities: [
    require('./backend/domain/user/entity/User'),
    require('./backend/domain/pet/entity/Pet'),
    Recruit, // 직접 사용하므로 require 대신 변수를 사용
    Meeting,
    MeetingMember,
    require('./backend/domain/attend/entity/Attend'),
    require('./backend/domain/evaluation/entity/Evaluation'),
  ],
};

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

// --- 정적 파일 라우팅 ---
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// --- HTML 페이지 라우팅 ---
// ... (기존 HTML 라우팅 코드는 그대로 유지)
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
app.get('/gather-detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'gather-detail.html'));
});
app.get('/evaluation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'evaluation.html'));
});


// --- DB 연결 및 API 라우터 연결 ---
createConnection(connectionOptions)
  .then(() => {
    console.log('DB 연결 성공');

    // --- 자동 마감 스케줄러 설정 ---
    const checkAndCloseExpiredRecruits = async () => {
        console.log('[Scheduler] 만료된 모집글 확인 작업을 실행합니다.');
        const recruitRepo = getRepository(Recruit);
        
        try {
            const now = new Date();
            // is_closed가 false이고 close_at이 현재 시간보다 이전인 모든 모집글을 찾습니다.
            const expiredRecruits = await recruitRepo.find({
                where: {
                    is_closed: false,
                    close_at: LessThan(now)
                }
            });

            if (expiredRecruits.length > 0) {
                console.log(`[Scheduler] ${expiredRecruits.length}개의 만료된 모집글을 찾았습니다. 삭제를 시작합니다.`);
                
                for (const recruit of expiredRecruits) {
                    await recruitRepo.manager.transaction(async transactionalEntityManager => {
                        // 연관된 모임 및 멤버를 삭제하고, 마지막으로 모집글을 삭제합니다.
                        const meeting = await transactionalEntityManager.findOne(Meeting, { where: { recruitId: recruit.id } });
                        if (meeting) {
                            await transactionalEntityManager.delete(MeetingMember, { meetingId: meeting.id });
                            await transactionalEntityManager.delete(Meeting, { id: meeting.id });
                        }
                        await transactionalEntityManager.delete(Recruit, { id: recruit.id });
                        console.log(`[Scheduler] 모집글 ID: ${recruit.id}가 자동으로 마감(삭제)되었습니다.`);
                    });
                }
            }
        } catch (error) {
            console.error('[Scheduler] 자동 마감 작업 중 오류가 발생했습니다:', error);
        }
    };
    
    // 1분(60000ms)마다 스케줄러를 실행합니다.
    setInterval(checkAndCloseExpiredRecruits, 60000);
    // 서버 시작 시 즉시 한 번 실행하여 혹시 놓친 글이 없는지 확인합니다.
    checkAndCloseExpiredRecruits();
    

    app.use('/api/users', userRoute);
    app.use('/api/recruit', recruitRoute);
    app.use('/api/pets', petRoutes);
    app.use('/api/meetings', meetingRoute);
    app.use('/api/attend', attendRoutes);
    app.use('/api/evaluations', evaluationRoutes); 

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
