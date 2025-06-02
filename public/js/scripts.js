document.addEventListener('DOMContentLoaded', ()=>{
  // 사이드바 토글 예시
  const toggleBtn = document.querySelector('.toggle-btn');
  if(toggleBtn){
    toggleBtn.addEventListener('click', ()=> document.body.classList.toggle('collapsed'));
  }
  // 페이지별 초기화
  const page = document.body.dataset.page;
  if(page === 'map') initMap();
  if(page === 'mailbox') loadMailbox();
  if(page === 'post-list') loadPosts();
});

function initMap(){
  // TODO: 지도 API 연동
  console.log('Map initialized');
}

new kakao.maps.Marker({
  map: map,
  position: userLocation
});

function loadMailbox(){
  // 더미 메일 로드
  console.log('Mailbox loaded');
}

function loadPosts(){
  // 더미 게시글 로드
  console.log('Posts loaded');
}

