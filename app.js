// app.js
const express    = require('express');
const path       = require('path');
const cookieParser = require('cookie-parser');
const logger     = require('morgan');

const app = express();

// ── 미들웨어 ──
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/css',    express.static(path.join(__dirname, 'public', 'css')));
app.use('/js',     express.static(path.join(__dirname, 'public', 'js')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

app.use('/', express.static(path.join(__dirname, 'public', 'html')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

module.exports = app;
