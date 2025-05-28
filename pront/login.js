app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).send('오류 발생');

    if (results.length === 0) return res.status(401).send('존재하지 않는 사용자');

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).send('비밀번호가 틀렸습니다');

    // 토큰 발급
    const token = jwt.sign({ id: user.id, username: user.username }, 'SECRET_KEY', { expiresIn: '1h' });
    res.send({ message: '로그인 성공!', token });
  });
});
