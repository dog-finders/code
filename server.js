const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 📁 public 폴더를 정적 파일 경로로 지정
app.use(express.static(path.join(__dirname, 'public')));

// MySQL 연결
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'dogdb',
  port: 3306,
});

db.connect(err => {
  if (err) {
    console.error('MySQL 연결 실패:', err);
  } else {
    console.log('MySQL 연결 성공');
  }
});

// 👉 기본 경로에서 /register.html 생략하고 접근 가능하게 설정
app.get('/', (req, res) => {
  res.redirect('/register');  // "/"로 접속하면 "/register"로 이동
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// 회원가입 API
app.post('/register', (req, res) => {
  const { username, password, name, address, phone, email, birthdate } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ message: '필수 항목이 누락되었습니다.' });
  }

  const checkSql = 'SELECT * FROM users WHERE username = ?';
  db.query(checkSql, [username], (checkErr, results) => {
    if (checkErr) {
      console.error("중복 체크 쿼리 오류:", checkErr);
      return res.status(500).json({ message: '서버 오류' });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: '이미 사용 중인 아이디입니다.' });
    }

    const insertSql = `
      INSERT INTO users (username, password, name, address, phone, email, birthdate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertSql, [username, password, name, address, phone, email, birthdate], (insertErr) => {
      if (insertErr) {
        console.error("회원가입 INSERT 쿼리 오류:", insertErr);
        return res.status(500).json({ message: '회원가입 실패' });
      }

      res.status(200).json({ message: '회원가입 성공' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
