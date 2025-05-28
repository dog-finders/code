const express = require('express');
const router = express.Router();
const { createUser, findByLoginId } = require('../service/userService');
const bcrypt = require('bcrypt');

router.post('/signup', async (req, res) => {
    try {
        const user = await createUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ message: '회원가입 실패', error: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { loginId, password } = req.body;
    const user = await findByLoginId(loginId);
    if (!user) return res.status(404).json({ message: '유저 없음' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: '비밀번호 불일치' });

    req.session.userId = user.id;
    res.json({ message: '로그인 성공', userId: user.id });
});

router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ message: '로그아웃 완료' });
    });
});

module.exports = router;
