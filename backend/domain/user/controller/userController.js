const { createUser, findByLoginId } = require('../service/userService');
const bcrypt = require('bcrypt');

// 모든 사용자 조회
exports.getAllUsers = (req, res) => {
    res.send('모든 사용자 조회');
};

// 특정 사용자 조회
exports.getUserById = (req, res) => {
    res.send(`사용자 조회: ${req.params.id}`);
};

// 회원가입 처리
exports.registerUser = async (req, res) => {
    try {
        const user = await createUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ message: '회원가입 실패', error: err.message });
    }
};

// 로그인a
exports.login = async (req, res) => {
    const { loginId, password } = req.body;
    const user = await findByLoginId(loginId);
    if (!user) return res.status(404).json({ message: '유저 없음' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: '비밀번호 불일치' });

    req.session.userId = user.id;
    res.json({ message: '로그인 성공', userId: user.id });
};

// 로그아웃
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ message: '로그아웃 완료' });
    });
};
