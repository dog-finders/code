// code/app.js
const express = require('express');
const path    = require('path');
const cookieParser = require('cookie-parser');
const logger  = require('morgan');

const app = express();

// ── 미들웨어 ──
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ── 정적 파일 서빙 ──
// public/js, public/css, public/html, public/assets 등을 모두 서빙
app.use(express.static(path.join(__dirname, 'public')));

// ── SPA 방식 catch-all ──
// 정적 파일에 매칭되지 않는 모든 요청을 index.html 로 반환
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

module.exports = app;
