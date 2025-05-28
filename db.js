// db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // 사용자에 맞게 변경
  password: 'root',    // 비밀번호에 맞게 변경
  database: 'dogdb',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error('MySQL 연결 실패:', err);
  } else {
    console.log('MySQL 연결 성공');
  }
});

module.exports = db;
