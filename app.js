const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./backend/domain/user/routes/userRoutes');
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

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
