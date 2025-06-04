// 경로: backend/domain/user/controller/userController.js

const { getRepository } = require('typeorm');
const bcrypt = require('bcrypt');
const User = require('../entity/User');

module.exports = {
  // 회원가입 처리
  registerUser: async (req, res, next) => {
    try {
      const { name, loginId, password, email } = req.body;
      if (!name || !loginId || !password || !email) {
        return res.status(400).json({ message: '필수 정보를 모두 입력하세요.' });
      }

      const userRepo = getRepository(User);
      const existing = await userRepo.findOne({ where: { loginId } });
      if (existing) {
        return res.status(409).json({ message: '이미 사용 중인 아이디입니다.' });
      }

      const hashed = await bcrypt.hash(password, 10);
      const newUser = userRepo.create({
        name,
        loginId,
        password: hashed,
        email,
      });
      await userRepo.save(newUser);

      res.status(201).json({ message: '회원가입 성공' });
    } catch (err) {
      console.error('회원가입 에러:', err);
      next(err);
    }
  },

  // 로그인 처리
  login: async (req, res, next) => {
    try {
      console.log('req.body:', req.body);
      const { loginId, password } = req.body;
      if (!loginId || !password) {
        return res.status(400).json({ message: '아이디와 비밀번호를 모두 입력하세요.' });
      }

      const userRepo = getRepository(User);
      const user = await userRepo.findOne({ where: { loginId } });
      if (!user) {
        console.log('로그인 실패: 존재하지 않는 아이디');
        return res.status(401).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        console.log('로그인 실패: 비밀번호 불일치');
        return res.status(401).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
      }

      req.session.userId = user.id;
      console.log('로그인 성공, 세션에 userId 저장:', req.session.userId);
      res.json({ message: '로그인 성공' });
    } catch (err) {
      console.error('로그인 에러:', err);
      next(err);
    }
  },

  // 로그아웃 처리
  logout: (req, res, next) => {
    req.session.destroy(err => {
      if (err) {
        console.error('로그아웃 에러:', err);
        return next(err);
      }
      res.clearCookie('connect.sid');
      res.json({ message: '로그아웃 성공' });
    });
  },

  // 현재 사용자 조회
  getCurrentUser: async (req, res, next) => {
    try {
      const userRepo = getRepository(User);
      const user = await userRepo.findOne({ where: { id: req.session.userId } });
      if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

      const { password, ...data } = user;
      res.json(data);
    } catch (err) {
      console.error('현재 사용자 조회 에러:', err);
      next(err);
    }
  },

  // 사용자 정보 업데이트
  updateUser: async (req, res, next) => {
    try {
      const userRepo = getRepository(User);
      const user = await userRepo.findOne({ where: { id: req.session.userId } });
      if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

      const { name, email, phone, address } = req.body;
      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = phone || user.phone;
      user.address = address || user.address;

      await userRepo.save(user);
      const { password, ...data } = user;
      res.json(data);
    } catch (err) {
      console.error('사용자 업데이트 에러:', err);
      next(err);
    }
  },

  // 전체 사용자 조회
  getAllUsers: async (req, res, next) => {
    try {
      const userRepo = getRepository(User);
      const users = await userRepo.find();
      const sanitized = users.map(u => {
        const { password, ...data } = u;
        return data;
      });
      res.json(sanitized);
    } catch (err) {
      console.error('전체 사용자 조회 에러:', err);
      next(err);
    }
  },

  // 특정 사용자 조회
  getUserById: async (req, res, next) => {
    try {
      const userRepo = getRepository(User);
      const user = await userRepo.findOne({ where: { id: parseInt(req.params.id, 10) } });
      if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

      const { password, ...data } = user;
      res.json(data);
    } catch (err) {
      console.error('특정 사용자 조회 에러:', err);
      next(err);
    }
  },
};
