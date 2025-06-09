const userService = require('../service/userService');

// 모든 사용자 조회
exports.getAllUsers = (req, res) => {
    res.send('모든 사용자 조회');
};

// 특정 사용자 조회
exports.getUserById = (req, res) => {
    res.send(`사용자 조회: ${req.params.id}`);
};

// 현재 로그인한 사용자 정보 조회
exports.getCurrentUser = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId)
            return res.status(401).json({ message: '로그인이 필요합니다' });

        const user = await userService.findById(userId);
        if (!user)
            return res
                .status(404)
                .json({ message: '사용자를 찾을 수 없습니다' });

        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('getCurrentUser error:', error);
        res.status(500).json({ message: '사용자 조회 실패' });
    }
};

/**
 * 다른 사용자의 프로필 정보(펫 정보 포함)를 조회합니다.
 * 이 함수는 이전에 수정한 부분입니다.
 */
exports.getUserProfile = async (req, res) => {
    try {
        const { loginId } = req.params;
        const profileData = await userService.getUserProfileByLoginId(loginId);
        res.json(profileData);
    } catch (error) {
        console.error('getUserProfile error:', error);
        res.status(404).json({ message: error.message });
    }
};

// 현재 로그인한 사용자 정보 업데이트
exports.updateUser = async (req, res) => {
    try {
        const userId = req.session.userId;
        const updated = await userService.updateUser(userId, req.body);
        res.json(updated);
    } catch (error) {
        console.error('updateUser error:', error);
        res.status(400).json({
            message: '사용자 수정 실패',
            error: error.message,
        });
    }
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

// 로그인
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

// 로그아웃
exports.logout = async (req, res) => {
    try {
        if (req.session) {
            await userService.logout(req.session.id);

            // 세션 삭제
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destruction error:', err);
                    throw err;
                }

                // 쿠키 삭제 (세션 미들웨어 설정에 따라 쿠키 이름이 다를 수 있음)
                res.clearCookie('connect.sid'); // 기본 세션 쿠키 이름
                res.json({
                    success: true,
                    message: '로그아웃 성공',
                });
            });
        } else {
            res.status(400).json({
                success: false,
                message: '유효한 세션이 없습니다.',
            });
        }
    } catch (error) {
        console.error('[logout] Controller Error:', error.message);
        res.status(500).json({
            success: false,
            message: '로그아웃 처리 중 오류가 발생했습니다.',
        });
    }
};