module.exports = (req, res, next) => {
    if (req?.session.userId) {a
        return next(); // 로그인 되어 있음
    }
    return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
};
