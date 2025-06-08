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
    const recruitId = params.get("recruitId");
    const meetingIdFromUrl = params.get("id"); // 기존 id 파라미터도 호환성을 위해 유지

    if (!recruitId && !meetingIdFromUrl) {
        alert("잘못된 접근입니다.");
        window.location.href = '/gather';
        return;
    }

    // recruitId가 있으면 새로운 API를, 없으면 기존 API를 호출
    const fetchUrl = recruitId 
        ? `/api/meetings/by-recruit/${recruitId}`
        : `/api/meetings/${meetingIdFromUrl}`;

    fetch(fetchUrl)
    .then(res => {
        if (!res.ok) throw new Error("모임 정보를 불러오지 못했습니다.");
        return res.json();
    })
    .then(meeting => {
        if (!meeting) throw new Error("모임이 존재하지 않습니다.");
        
        const meetingId = meeting.id; // 실제 모임 ID는 응답에서 가져옴

        document.getElementById("meetingTitle").textContent = meeting.title || "제목 없음";

        const hostSpan = document.getElementById("hostId");
        hostSpan.innerHTML = `<button class="link-button" onclick="showProfile('${meeting.hostId}')">${meeting.hostId}</button>`;

        const membersList = document.getElementById("membersList");
        membersList.innerHTML = "";
        const allMembers = meeting.members || [];
        allMembers.forEach(memberId => {
            const li = document.createElement("li");
            li.innerHTML = `<button class="link-button" onclick="showProfile('${memberId}')">${memberId}</button>`;
            membersList.appendChild(li);
        });

        if (meeting.recruit) {
            document.getElementById('detailsSection').style.display = 'block';
            document.getElementById('recruitContent').textContent = meeting.recruit.content || '내용 없음';
            document.getElementById('recruitLocation').textContent = meeting.recruit.location || '위치 정보 없음';

            const lat = parseFloat(meeting.recruit.latitude);
            const lng = parseFloat(meeting.recruit.longitude);
            const mapContainer = document.getElementById('map');
            if (window.kakao && kakao.maps) {
                const map = new kakao.maps.Map(mapContainer, {
                    center: new kakao.maps.LatLng(lat, lng),
                    level: 3
                });
                new kakao.maps.Marker({
                    position: new kakao.maps.LatLng(lat, lng),
                    draggable: false 
                }).setMap(map);
            }
        }

        const actionsContainer = document.getElementById("hostActions");
        const endButton = document.createElement("button");
        endButton.textContent = "산책 종료 및 평가하기";
        endButton.className = "btn btn-danger";
        
        endButton.onclick = async () => {
            if (allMembers.length <= 1) {
                if (confirm('혼자 참여한 모임입니다. 바로 종료하시겠습니까?')) {
                    try {
                        const response = await fetch(`/api/meetings/${meetingId}`, { method: 'DELETE' });
                        if (!response.ok) {
                            const errData = await response.json();
                            throw new Error(errData.message || '모임 삭제에 실패했습니다.');
                        }
                        alert('모임이 종료되었습니다.');
                        window.location.href = '/gather';
                    } catch (error) {
                        alert(error.message);
                    }
                }
            } else {
                window.location.href = `/evaluation?meetingId=${meetingId}`;
            }
        };
        actionsContainer.appendChild(endButton);
    })
    .catch(error => {
        console.error(error);
        alert(error.message || "오류가 발생했습니다.");
    });
});