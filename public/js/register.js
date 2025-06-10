window.addEventListener('load', () => {
    const form = document.getElementById('registerForm');
    const loginIdInput = document.getElementById('loginId');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const passwordMismatchMsg = document.getElementById('passwordMismatch');
    const checkUsernameBtn = document.getElementById('checkUsernameBtn');
    const searchAddressBtn = document.getElementById('searchAddressBtn');
    const loginIdFeedback = document.getElementById('loginId-feedback');

    // 예시 아이디 목록 - 실제 구현 시 서버에서 중복 체크 필요
    const takenUsernames = ['admin', 'test', 'user123'];

    // 아이디 중복 확인 버튼 클릭 시
    checkUsernameBtn.addEventListener('click', () => {
        const loginId = loginIdInput.value.trim();
        if (!loginId) {
            loginIdFeedback.textContent = '아이디를 입력해주세요.';
            loginIdFeedback.classList.remove('text-success');
            loginIdFeedback.classList.add('text-danger');
            return;
        }

        if (takenUsernames.includes(loginId.toLowerCase())) {
            loginIdFeedback.textContent = '이미 사용 중인 아이디입니다.';
            loginIdFeedback.classList.remove('text-success');
            loginIdFeedback.classList.add('text-danger');
        } else {
            loginIdFeedback.textContent = '사용 가능한 아이디입니다.';
            loginIdFeedback.classList.remove('text-danger');
            loginIdFeedback.classList.add('text-success');
        }
    });

    // 주소 검색 버튼 클릭 시
    searchAddressBtn.addEventListener('click', () => {
        alert('주소 검색 기능은 추후 연동 필요 (예: 다음 주소 API)');
    });

    // 비밀번호 확인 입력 시 유효성 체크
    confirmInput.addEventListener('input', () => {
        if (confirmInput.value !== passwordInput.value) {
            confirmInput.setCustomValidity('Passwords do not match');
            confirmInput.classList.add('is-invalid');
            passwordMismatchMsg.style.display = 'block';
        } else {
            confirmInput.setCustomValidity('');
            confirmInput.classList.remove('is-invalid');
            passwordMismatchMsg.style.display = 'none';
        }
    });

    // 폼 제출 시
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // 기본 제출 막기

        // 비밀번호 확인 유효성 체크
        if (confirmInput.value !== passwordInput.value) {
            confirmInput.setCustomValidity('Passwords do not match');
            confirmInput.classList.add('is-invalid');
            passwordMismatchMsg.style.display = 'block';
        } else {
            confirmInput.setCustomValidity('');
            confirmInput.classList.remove('is-invalid');
            passwordMismatchMsg.style.display = 'none';
        }

        // HTML5 유효성 검사
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        // 사용자 입력 데이터 수집
        const userData = {
            loginId: loginIdInput.value,
            password: passwordInput.value,
            name: document.getElementById('name').value,
            address: document.getElementById('address').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            birthdate: document.getElementById('birthdate').value,
        };


        console.log('registerForm submit', userData);

        // 서버에 회원가입 요청
        fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
            .then((res) => {
                if (res.ok) {
                    alert('회원가입 성공!');
                    form.reset();
                    form.classList.remove('was-validated');
                    loginIdFeedback.textContent = '';
                } else {
                    return res.json().then(data => {
                        alert(data.message || '회원가입 실패. 다시 시도해주세요.');
                    });
                }
            })
            .catch((err) => {
                console.error('요청 오류:', err);
                alert('서버 연결에 실패했습니다.');
            });
    });
});