const express = require('express');
const path = require('path');
const router = express.Router();
const isAuth = require('../backend/domain/auth/middleware/inAuth');

// --- 페이지 경로 설정 ---

// 인증(로그인)이 반드시 필요한 페이지 목록
const authRequiredPages = [
    'map',          // 지도
    'mailbox',      // 메일함
    'settings',     // 마이페이지(수정)
    'post-create',  // 모집글 작성
    'post-detail',  // 모집글 상세
    'gather',       // 모임 목록
    'gather-detail',// 모임 상세
    'evaluation',   // 평가 페이지
    'mypage',       // 마이페이지(뷰)
];

// 인증 없이 접근 가능한 공개 페이지 목록
const publicPages = [
    'index',        // 메인 페이지
    'login',        // 로그인
    'register',     // 회원가입
    'post-list',    // 모집글 목록
];

// --- 라우터 동적 생성 ---

// 인증이 필요한 페이지 라우팅
authRequiredPages.forEach((page) => {
    // isAuth 미들웨어를 통과해야만 페이지를 보여줍니다.
    router.get(`/${page}`, isAuth, (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'public', 'html', `${page}.html`));
    });
});

// 인증이 필요없는 페이지 라우팅
publicPages.forEach((page) => {
    router.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'public', 'html', `${page}.html`));
    });
});

// 루트("/") 경로는 "/index"로 리디렉션
router.get('/', (req, res) => {
    res.redirect('/index');
});

module.exports = router;
