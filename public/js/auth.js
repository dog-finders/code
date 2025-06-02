document.addEventListener('DOMContentLoaded', function () {
    const loginBtn = document.querySelector('.login-btn');
    const logoutBtn = document.querySelector('.logout-btn');

    if (!loginBtn || !logoutBtn) {
        console.error('로그인/로그아웃 버튼을 찾을 수 없습니다.');
        return;
    }

    // 로그인 버튼 클릭 시 로그인 페이지로 이동
    loginBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = '/login';
    });

    // 로그아웃 버튼 클릭 시 로그아웃 처리
    logoutBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        try {
            const response = await fetch('/api/users/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log('로그아웃 성공');
                window.location.href = '/index'; // 홈으로 리다이렉트
            } else {
                console.error('로그아웃 실패');
                alert('로그아웃 처리 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('로그아웃 요청 중 오류:', error);
            alert('로그아웃 처리 중 오류가 발생했습니다.');
        }
    });

    // 인증 상태 확인 함수
    async function checkAuthStatus() {
        try {
            console.log('인증 상태 확인 중...');
            const response = await fetch('/api/users/check-auth', {
                method: 'GET',
                credentials: 'include', // 중요: 쿠키를 포함시킵니다.
                headers: {
                    'Cache-Control': 'no-cache', // 캐시 방지
                },
            });

            console.log('인증 응답 상태:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('인증 데이터:', data);

                // 인증된 상태
                if (data.isLoggedIn && data.userId) {
                    loginBtn.style.display = 'none';
                    logoutBtn.style.display = 'block';
                    loginBtn.parentElement.classList.add('logged-in');
                } else {
                    // 서버는 200을 반환했지만 로그인 상태가 아닌 경우
                    loginBtn.style.display = 'block';
                    logoutBtn.style.display = 'none';
                    loginBtn.parentElement.classList.remove('logged-in');
                }
            } else {
                // 401 등 오류 응답
                console.log('인증되지 않음 (401)');
                loginBtn.style.display = 'block';
                logoutBtn.style.display = 'none';
                loginBtn.parentElement.classList.remove('logged-in');
            }
        } catch (error) {
            console.error('인증 상태 확인 중 오류:', error);
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
            loginBtn.parentElement.classList.remove('logged-in');
        }
    }

    // 페이지 로드 시 인증 상태 확인
    checkAuthStatus();
});
