// public/js/scripts.js

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

  // 카카오 맵 SDK가 로드된 후에만 실행되도록 보장
  if (window.kakao && kakao.maps) {
    // 예시: map과 userLocation 변수를 미리 정의했다고 가정
    const container = document.getElementById('map');
    const userLocation = new kakao.maps.LatLng(37.514588, 126.724053);
    const map = new kakao.maps.Map(container, {
      center: userLocation,
      level: 3,
    });

    // 기존에 있던 Marker 생성 코드를 initMap 내부로 옮김
    new kakao.maps.Marker({
      map: map,
      position: userLocation,
    });
  }
}

function loadMailbox() {
  // 더미 메일 로드
  console.log('Mailbox loaded');
}

function loadPosts() {
  // 더미 게시글 로드
  console.log('Posts loaded');
}

// 기존 스크립트 영역 (쿠키 기반 로그인/로그아웃 처리)
document.addEventListener('DOMContentLoaded', () => {
  const getCookie = (name) => {
    const match = document.cookie.match(
      new RegExp('(^| )' + name + '=([^;]+)')
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
        location.reload();
      });
    } else {
      authLink.textContent = '로그인';
      authLink.href = 'login';
    }
  }
});
