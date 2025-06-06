// public/js/sidebar.js

function isLoggedIn() {
  return !!localStorage.getItem("user");
}

function updateSidebar() {
  // 사이드바 메뉴 요소
  const loginMenu   = document.querySelector("#nav-login");
  const mypageLink  = document.querySelector("#nav-mypage");
  const writeLink   = document.querySelector("#nav-write");
  const listLink    = document.querySelector("#nav-list");
  const gatherLink  = document.querySelector("#nav-gather");

  // 새로 추가된 상단 헤더 메뉴 요소
  const headerMypage = document.querySelector("#header-mypage");
  const headerLogout = document.querySelector("#header-logout");
  
  // 현재 페이지 경로
  const path = window.location.pathname;

  if (isLoggedIn()) {
    // -----------------------------
    // (1) 로그인 상태일 때
    // -----------------------------
    // 사이드바의 로그인과 마이페이지 메뉴를 숨김 처리합니다.
    if (loginMenu) {
      loginMenu.style.display = "none";
    }
    if (mypageLink) {
      mypageLink.style.display = "none";
    }

    // 상단 헤더 메뉴를 표시하고 기능 연결
    if (headerMypage) {
      headerMypage.style.display = 'inline-block';
    }
    if (headerLogout) {
      headerLogout.style.display = 'inline-block';
      headerLogout.onclick = () => {
        localStorage.removeItem("user");
        alert("로그아웃 되었습니다.");
        window.location.href = "/login";
      };
    }

    // 다른 사이드바 링크들은 활성화 상태로 둡니다.
    if (writeLink) writeLink.href = "/post-create";
    if (listLink) listLink.href = "/post-list";
    if (gatherLink) gatherLink.href = "/gather";
    
    const protectedLinks = [writeLink, listLink, gatherLink];
    protectedLinks.forEach(el => {
      if(el) el.onclick = null;
    });

  } else {
    // -----------------------------
    // (2) 비로그인 상태일 때
    // -----------------------------
    // 사이드바 로그인과 마이페이지 메뉴 표시
    if (loginMenu) {
      loginMenu.textContent = "로그인";
      loginMenu.href = "/login";
      loginMenu.onclick = null;
      loginMenu.style.display = "block";
    }
    if (mypageLink) {
        mypageLink.style.display = "block";
    }
    
    // 상단 헤더 메뉴 숨김
    if (headerMypage) headerMypage.style.display = 'none';
    if (headerLogout) headerLogout.style.display = 'none';

    if (path.endsWith("/login") || path.endsWith("/register")) {
      return;
    }

    // 보호된 메뉴 클릭 시 로그인 페이지로 이동
    const protectedLinks = [mypageLink, writeLink, listLink, gatherLink];
    protectedLinks.forEach((el) => {
      if (!el) return;
      el.href = "#";
      el.onclick = (e) => {
        e.preventDefault();
        alert("로그인이 필요한 서비스입니다.");
        window.location.href = "/login";
      };
    });
  }
}

document.addEventListener("DOMContentLoaded", updateSidebar);