module.exports = (req, res, next) => {
    console.log('Session check:', req.session); // 세션 상태 로깅

    if (!req.session || !req.session.userId) {
        console.log('No valid session found'); // 세션이 없을 때 로깅
        return res.status(401).json({
            isLoggedIn: false,
            message: '인증되지 않은 사용자입니다.',
        });
    }

    console.log('Valid session found for user:', req.session.userId); // 유효한 세션일 때 로깅
    next();
};
