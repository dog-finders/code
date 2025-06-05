// public/js/login.js

window.addEventListener('load', () => {
  const form = document.getElementById('loginForm');
  const loginIdInput = document.getElementById('loginId');
  const passwordInput = document.getElementById('password');
  const feedback = document.getElementById('login-feedback');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const loginId = loginIdInput.value.trim();
    const password = passwordInput.value.trim();

    // 아이디와 비밀번호 확인
    if (!loginId || !password) {
      feedback.textContent = '아이디와 비밀번호를 모두 입력해주세요.';
      return;
    }

    const loginData = { loginId, password };

    fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          
          // 로그인 성공: 사용자 정보 로컬 스토리지에 저장
          localStorage.setItem('user', JSON.stringify(data.user));
          

          // 로그인 후 마이페이지로 리디렉션
          window.location.href = '/mypage';
        } else {
          const data = await res.json();
          feedback.textContent =
            data.message || '로그인 실패. 아이디 또는 비밀번호를 확인하세요.';
        }
      })
      .catch((err) => {
        console.error('로그인 요청 오류:', err);
        feedback.textContent = '서버와의 연결에 실패했습니다.';
      });
  });
});
