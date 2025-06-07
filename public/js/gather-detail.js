// public/js/gather-detail.js

document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        alert("로그인이 필요한 서비스입니다.");
        window.location.href = "/login";
        return;
    }
    const currentUser = JSON.parse(userStr);

    const params = new URLSearchParams(window.location.search);
    const meetingId = params.get("id");

    if (!meetingId) {
        alert("잘못된 접근입니다.");
        window.location.href = '/gather';
        return;
    }

    fetch(`/api/meetings/${meetingId}`)
    .then(res => {
        if (!res.ok) throw new Error("모임 정보를 불러오지 못했습니다.");
        return res.json();
    })
    .then(meeting => {
        if (!meeting) throw new Error("모임이 존재하지 않습니다.");

        document.getElementById("meetingTitle").textContent = meeting.title || "제목 없음";

        const hostSpan = document.getElementById("hostId");
        hostSpan.innerHTML = `<button class="link-button" onclick="showProfile('${meeting.hostId}')">${meeting.hostId}</button>`;

        const membersList = document.getElementById("membersList");
        membersList.innerHTML = "";
        (meeting.members || []).forEach(memberId => {
            const li = document.createElement("li");
            li.innerHTML = `<button class="link-button" onclick="showProfile('${memberId}')">${memberId}</button>`;
            membersList.appendChild(li);
        });

        if (meeting.recruit) {
            document.getElementById('detailsSection').style.display = 'block';
            document.getElementById('recruitContent').textContent = meeting.recruit.content || '내용 없음';
            document.getElementById('recruitLocation').textContent = meeting.recruit.location || '위치 정보 없음';

            const lat = parseFloat(meeting.recruit.latitude);
            const lng = parseFloat(meeting.recruit.longitude);// 위도와 경도 값이 문자열로 올 수 있으므로 parseFloat로 변환함
            const mapContainer = document.getElementById('map');
            if (window.kakao && kakao.maps) {
                const map = new kakao.maps.Map(mapContainer, { // 지도 생성
                    center: new kakao.maps.LatLng(lat, lng), //중심 좌표
                    level: 3
                });
                // 비편집용 마커 설정 (draggable: false)
                new kakao.maps.Marker({
                    position: new kakao.maps.LatLng(lat, lng),  // 마커 위치
                    draggable: false 
                }).setMap(map);
            }
        }

        if (currentUser.loginId === meeting.hostId) {
            const hostActions = document.getElementById("hostActions");
            const endButton = document.createElement("button");
            endButton.textContent = "산책 종료 및 평가하기";
            endButton.className = "btn btn-danger";
            endButton.onclick = () => {
                if (confirm('모임을 종료하고 멤버들을 평가하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                    window.location.href = `/evaluation?meetingId=${meetingId}`;
                }
            };
            hostActions.appendChild(endButton);
        }
    })
    .catch(error => {
        console.error(error);
        alert(error.message || "오류가 발생했습니다.");
    });
});
