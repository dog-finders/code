window.addEventListener('load', () => {
    const form = document.getElementById('registerForm');
    const loginIdInput = document.getElementById('loginId');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const passwordMismatchMsg = document.getElementById('passwordMismatch');
    const checkUsernameBtn = document.getElementById('checkUsernameBtn');
    const searchAddressBtn = document.getElementById('searchAddressBtn');
    const loginIdFeedback = document.getElementById('loginId-feedback');

    const takenUsernames = ['admin', 'test', 'user123']; // 예시

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

    searchAddressBtn.addEventListener('click', () => {
        alert('주소 검색 기능은 연동 필요 (예: 다음 주소 API)');
    });

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

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (confirmInput.value !== passwordInput.value) {
            confirmInput.setCustomValidity('Passwords do not match');
            confirmInput.classList.add('is-invalid');
            passwordMismatchMsg.style.display = 'block';
        } else {
            confirmInput.setCustomValidity('');
            confirmInput.classList.remove('is-invalid');
            passwordMismatchMsg.style.display = 'none';
        }

        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

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

        fetch('/api/users/signup', {
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
                } else {
                    alert('회원가입 실패. 다시 시도해주세요.');
                }
            })
            .catch((err) => {
                console.error('요청 오류:', err);
                alert('서버 연결에 실패했습니다.');
            });
    });
});
