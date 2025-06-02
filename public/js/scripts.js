document.addEventListener('DOMContentLoaded', () => {
    // 사이드바 토글 예시
    const toggleBtn = document.querySelector('.toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () =>
            document.body.classList.toggle('collapsed'),
        );
    }
    // 페이지별 초기화
    const page = document.body.dataset.page;
    if (page === 'map') initMap();
    if (page === 'mailbox') loadMailbox();
    if (page === 'post-list') loadPosts();
});

function initMap() {
    // TODO: 지도 API 연동
    console.log('Map initialized');
}

new kakao.maps.Marker({
    map: map,
    position: userLocation,
});

function loadMailbox() {
    // 더미 메일 로드
    console.log('Mailbox loaded');
}

function loadPosts() {
    // 더미 게시글 로드
    console.log('Posts loaded');
}

// scripts.js

document.addEventListener('DOMContentLoaded', () => {
    const getCookie = (name) => {
        const match = document.cookie.match(
            new RegExp('(^| )' + name + '=([^;]+)'),
        );
        return match ? match[2] : null;
    };

    const isLoggedIn = getCookie('isLoggedIn') === 'true';

    const authLink = document.querySelector('a[href="login"]');
    if (authLink) {
        if (isLoggedIn) {
            authLink.textContent = '로그아웃';
            authLink.href = '#';
            authLink.addEventListener('click', (e) => {
                e.preventDefault();
                document.cookie = 'isLoggedIn=false; path=/; max-age=0';
                alert('로그아웃되었습니다.');
                location.reload(); // 또는 location.href = '/login';
            });
        } else {
            authLink.textContent = '로그인';
            authLink.href = 'login';
        }
    }
});
