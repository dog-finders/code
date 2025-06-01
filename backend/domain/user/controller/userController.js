const { createUser, findByLoginId, getAllUsers, getUserById } = require('../service/userService');
const bcrypt = require('bcrypt');

// 모든 사용자 조회
exports.getAllUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: '사용자 목록 조회 실패', error: error.message });
    }
};

// 특정 사용자 조회
exports.getUserById = async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: '사용자 조회 실패', error: error.message });
    }
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

// 로그인 처리
exports.login = async (req, res) => {
    const { loginId, password } = req.body;
    try {
        const user = await findByLoginId(loginId);
        if (!user) return res.status(404).json({ message: '유저 없음' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: '비밀번호 불일치' });

        req.session.userId = user.id;
        res.json({ message: '로그인 성공', userId: user.id });
    } catch (error) {
        res.status(500).json({ message: '로그인 실패', error: error.message });
    }
};

// 로그아웃 처리
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ message: '로그아웃 완료' });
    });
};
