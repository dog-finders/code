const express = require('express');
const path = require('path');
const router = express.Router();
const isAuth = require('../backend/domain/auth/middleware/inAuth');

// 인증이 필요한 페이지들
const authRequiredPages = [
    'map',
    'mailbox',
    'settings',
    'post-create',
    'post-detail',
];

// 인증이 필요한 페이지 라우팅
authRequiredPages.forEach((page) => {
    router.get(`/${page}`, isAuth, (req, res) => {
        res.sendFile(
            path.join(__dirname, '..', 'public', 'html', `${page}.html`),
        );
    });
});

// 인증이 필요없는 페이지들
const publicPages = ['index', 'login', 'register', 'post-list', 'contact'];

// 인증이 필요없는 페이지 라우팅
publicPages.forEach((page) => {
    router.get(`/${page}`, (req, res) => {
        res.sendFile(
            path.join(__dirname, '..', 'public', 'html', `${page}.html`),
        );
    });
});

// 루트("/")는 index.html로 리디렉션
router.get('/', (req, res) => {
    res.redirect('/index');
});

module.exports = router;
