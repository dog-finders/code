const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

const indexRouter = require('./routes/index');
const userRoutes = require('./backend/domain/user/routes/userRoutes');
const petRouters = require('./backend/domain/pet/routes/petRoutes');
const { AppDataSource } = require('./backend/global/config/typeOrmConfig');

const app = express();

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

app.use(function (req, res, next) {
    console.log(req.url);
    next();
});
app.use('/', indexRouter);
app.use('/api/v1/users', userRoutes);

app.use(
    session({
        resave: false,
        saveUninitialized: false,
        secret: 'secret',
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            secure: false,
            httpOnly: true,
        },
    }),
);

module.exports = app;
