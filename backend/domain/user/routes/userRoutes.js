const userController = require('../controller/userController');

// 모든 사용자 조회
router.get('/', userController.getAllUsers);

// 특정 사용자 조회
router.get('/:id', userController.getUserById);

// 회원가입 요청 처리
router.post('/register', userController.registerUser);

module.exports = router;


