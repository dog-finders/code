const userService = require('../service/userService');

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
        console.log('registerUser start');
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ message: '회원가입 실패', error: err.message });
    }
};

// 로그인a
exports.login = async (req, res) => {
    try {
        const { loginId, password } = req.body;
        const user = await userService.login(loginId, password);

        // 세션에 사용자 정보 저장
        req.session.userId = user.id;

        res.json({
            message: '로그인 성공',
            user: user,
        });
    } catch (error) {
        console.error('[login] Controller Error:', error.message);
        if (error.message.includes('존재하지 않는 사용자')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('비밀번호가 일치하지 않습니다')) {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({
            message: '로그인 처리 중 오류가 발생했습니다.',
        });
    }
};

exports.logout = async (req, res) => {
    try {
        await userService.logout(req.session.id);
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.json({ message: '로그아웃 성공' });
        });
    } catch (error) {
        console.error('[logout] Controller Error:', error.message);
        res.status(500).json({
            message: '로그아웃 처리 중 오류가 발생했습니다.',
        });
    }
};
