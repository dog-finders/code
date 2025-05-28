const bcrypt = require('bcrypt');
const userService = require('../service/userService');

// 모든 사용자 조회
exports.getAllUsers = (req, res) => {
    const users = userService.getAllUsers();
    res.json(users);
};

// 특정 사용자 조회
exports.getUserById = (req, res) => {
    const user = userService.getUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
};

// 회원가입 처리
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = userService.createUser({
            username,
            email,
            password: hashedPassword
        });
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ message: '회원가입 실패', error: err.message });
    }
};
