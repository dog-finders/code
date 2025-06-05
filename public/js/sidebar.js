// public/js/sidebar.js

function isLoggedIn() {
  return !!localStorage.getItem("user");
}

function updateSidebar() {
  // 사이드바 내에 id가 다음처럼 붙어 있어야 합니다:
  //   <a id="nav-login">, <a id="nav-mypage">, <a id="nav-write">, <a id="nav-list">, <a id="nav-gather">
  const loginMenu   = document.querySelector("#nav-login");
  const mypageLink  = document.querySelector("#nav-mypage");
  const writeLink   = document.querySelector("#nav-write");
  const listLink    = document.querySelector("#nav-list");
  const gatherLink  = document.querySelector("#nav-gather");

  // 현재 페이지 경로: "/login.html" 등
  const path = window.location.pathname;

  if (isLoggedIn()) {
    // -----------------------------
    // (1) 로그인 상태일 때
    // -----------------------------
    if (loginMenu) {
      loginMenu.textContent = "로그아웃";
      loginMenu.href = "#";
      loginMenu.onclick = () => {
        localStorage.removeItem("user");
        alert("로그아웃 되었습니다.");
        // 로그아웃 후에는 로그인 화면으로
        window.location.href = "/login";
      };
    }
    if (mypageLink) {
      // 로그인 상태면 mypage.html로 이동
      mypageLink.href = "/mypage";
      mypageLink.onclick = null;
    }
    if (writeLink) {
      // 로그인 상태면 post-create.html(게시글 작성)로 이동
      writeLink.href = "/post-create";
      writeLink.onclick = null;
    }
    if (listLink) {
      // 로그인 상태면 post-list.html(게시글 목록)로 이동
      listLink.href = "/post-list";
      listLink.onclick = null;
    }
    if (gatherLink) {
      // 로그인 상태면 모임 페이지가 있을 경우 해당 URL로 설정(예: /gather.html)
      // 현재 예제 폴더에는 gather.html이 없으므로, 필요 시 수정하세요.
      gatherLink.href = "/gather";
      gatherLink.onclick = null;
    }
  } else {
    // -----------------------------
    // (2) 비로그인 상태일 때
    // -----------------------------
    if (loginMenu) {
      loginMenu.textContent = "로그인";
      loginMenu.href = "/login";
      loginMenu.onclick = null;
    }

    // (2-1) 만약 현재 페이지가 로그인 화면( "/login.html" )이라면,
    //        로그인 화면에선 보호 로직(경고+리다이렉트)을 하지 않습니다.
    if (path === "/login") {
      return;
    }

    // (2-2) 로그인 화면이 아닐 때는 보호 메뉴 클릭 시 경고 후 로그인 화면으로 리다이렉트
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
