/*const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('./db');  // 루트에 db.js가 있다면 이렇게 수정

// POST /register
router.post('/', async (req, res) => {  // /register 경로는 app.js에서 이미 설정됨
  const { username, password, name, address, phone, email, birthdate } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '아이디와 비밀번호는 필수입니다.' });
  }

  try {
    const [users] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length > 0) {
      return res.status(409).json({ message: '이미 존재하는 아이디입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (username, password, name, address, phone, email, birthdate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [username, hashedPassword, name, address, phone, email, birthdate];

    await db.promise().query(sql, values);

    res.status(200).json({ message: '회원가입 성공' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 에러 발생' });
  }
});

module.exports = router;*/
