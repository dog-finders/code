// public/js/sidebar.js

// localStorage의 사용자 정보 유무로 로그인 상태를 확인합니다.
function isLoggedIn() {
  return !!localStorage.getItem("user");
}

// 로그인 상태에 따라 사이드바와 헤더 메뉴의 UI를 업데이트합니다.
function updateSidebar() {
  const loginMenu   = document.querySelector("#nav-login");
  const mypageLink  = document.querySelector("#nav-mypage");
  const writeLink   = document.querySelector("#nav-write");
  const listLink    = document.querySelector("#nav-list");
  const gatherLink  = document.querySelector("#nav-gather");
  const mailboxLink = document.querySelector("#nav-mailbox");
  const headerMypage = document.querySelector("#header-mypage");
  const headerLogout = document.querySelector("#header-logout");
  const path = window.location.pathname;

  if (isLoggedIn()) {
    // --- 로그인 상태일 때의 UI 처리 ---
    if (loginMenu) {
      loginMenu.style.display = "none";
    }
    if (mypageLink) {
      mypageLink.style.display = "none";
    }

    // 상단 헤더 메뉴를 표시하고 로그아웃 기능을 연결합니다.
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

    // 각 메뉴의 링크를 활성화합니다.
    if (writeLink) writeLink.href = "/post-create";
    if (listLink) listLink.href = "/post-list";
    if (gatherLink) gatherLink.href = "/gather";
    if (mailboxLink) mailboxLink.href = "/mailbox";
    
    // 비로그인 시 막혀있던 링크들의 클릭 이벤트를 초기화합니다.
    const protectedLinks = [writeLink, listLink, gatherLink, mailboxLink];
    protectedLinks.forEach(el => {
      if(el) el.onclick = null;
    });

  } else {
    // --- 비로그인 상태일 때의 UI 처리 ---
    if (loginMenu) {
      loginMenu.textContent = "로그인";
      loginMenu.href = "/login";
      loginMenu.onclick = null;
      loginMenu.style.display = "block";
    }
    if (mypageLink) {
        mypageLink.style.display = "block";
    }
    
    // 상단 헤더 메뉴를 숨깁니다.
    if (headerMypage) headerMypage.style.display = 'none';
    if (headerLogout) headerLogout.style.display = 'none';

    if (path.endsWith("/login") || path.endsWith("/register")) {
      return;
    }

    // 보호된 메뉴 클릭 시 로그인 페이지로 강제 이동시킵니다.
    const protectedLinks = [mypageLink, writeLink, listLink, gatherLink, mailboxLink];
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

// 페이지가 로드되면 사이드바 상태를 업데이트합니다.
document.addEventListener("DOMContentLoaded", updateSidebar);