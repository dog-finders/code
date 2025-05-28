const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');

const app = express();
const PORT = 3000;

const { AppDataSource } = require('./backend/global/config/typeOrmConfig');

AppDataSource.initialize()
  .then(async () => {
    console.log('Loaded entities:', AppDataSource.options.entities);
    await AppDataSource.synchronize();
    console.log('Data Source initialized');
  })
  .catch((err) => {
    console.error('Data Source initialization error', err);
  });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
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
    }),
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const indexRouter = require('./routes/index');  // 수정된 경로
const usersRouter = require('./backend/domain/user/routes/userRoutes');
const petRouters = require('./backend/domain/pet/routes/petRoutes');
const registerRouter = require('./register');     // 경로 맞다면 유지

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/pets', petRouters);
app.use('/register', registerRouter);   // '/register' 경로에 연결

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});

module.exports = app;
