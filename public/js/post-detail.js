// public/js/post-detail.js

document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const loginId = currentUser?.loginId;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        alert("게시글 ID가 없습니다.");
        window.location.href = '/post-list';
        return;
    }

    fetch(`/api/recruit/${postId}`)
    .then(res => {
        if (!res.ok) throw new Error('게시글을 가져오는데 실패했습니다.');
        return res.json();
    })
    .then(post => {
        if (!post) throw new Error('게시글을 찾을 수 없습니다.');

        document.getElementById('postTitle').textContent = post.title || '제목 없음';
        const writerSpan = document.getElementById('postWriter');
        writerSpan.innerHTML = `<button class="link-button" onclick="showProfile('${post.authorId}')">${post.authorId || '알 수 없음'}</button>`;

        const locSpan = document.getElementById('postLocation');
        if (post.latitude != null && post.longitude != null && window.kakao) {
            const geocoder = new kakao.maps.services.Geocoder();
            geocoder.coord2Address(post.longitude, post.latitude, (result, status) => {
                if (status === kakao.maps.services.Status.OK) {
                    locSpan.textContent = result[0].address.address_name;
                } else {
                    locSpan.textContent = post.location || '주소 변환 실패';
                }
            });
        } else {
            locSpan.textContent = post.location || '위치 정보 없음';
        }

        document.getElementById('postDate').textContent = new Date(post.created_at).toLocaleString();
        document.getElementById('postContent').textContent = post.content || '내용이 없습니다.';

        if (post.latitude != null && post.longitude != null && window.kakao) {
           const mapContainer = document.getElementById('map');
           const map = new kakao.maps.Map(mapContainer, {
               center: new kakao.maps.LatLng(post.latitude, post.longitude),
               level: 4
           });
            new kakao.maps.Marker({
                position: new kakao.maps.LatLng(post.latitude, post.longitude),
                map: map
            });
        }

        // 버튼 표시 로직
        const isAuthor = loginId && post.authorId && loginId === post.authorId.toString();
        const attendBtn = document.getElementById('attendPostBtn');
        const deleteBtn = document.getElementById('deletePostBtn');
        const closeBtn = document.getElementById('closePostBtn');
        const messageSection = document.getElementById('attendMessageSection');

        if (isAuthor) {
            deleteBtn.style.display = 'inline-block';
            closeBtn.style.display = 'inline-block';

            if (post.is_closed) {
                closeBtn.disabled = true;
                closeBtn.textContent = '모집 마감됨';
            }

            closeBtn.onclick = () => handleAction('PATCH', `/api/recruit/${postId}/close`, '모집을 마감하시겠습니까?', '모집이 마감되었습니다.');
            deleteBtn.onclick = () => handleAction('DELETE', `/api/recruit/${postId}`, '정말 이 게시글을 삭제하시겠습니까?', '게시글이 삭제되었습니다.', true);
        } else if (loginId) {
            attendBtn.style.display = 'inline-block';
            messageSection.style.display = 'block';
            attendBtn.onclick = () => {
                const message = document.getElementById('attendMessage').value;
                handleAction(
                    'POST',
                    `/api/attend/recruit/${postId}`,
                    '이 모임에 참석을 요청하시겠습니까?',
                    '',
                    false,
                    { message }
                );
            };
        }
    })
    .catch(err => {
        console.error(err);
        alert(err.message);
        window.location.href = '/post-list';
    });
});

async function handleAction(method, url, confirmMsg, successMsg = '', shouldRedirect = false, body = null) {
    if (confirm(confirmMsg)) {
        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' }
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const res = await fetch(url, options);
            const result = await res.json();

            if (!res.ok) throw new Error(result.message || '요청에 실패했습니다.');

            alert(successMsg || result.message);

            if (shouldRedirect) {
                window.location.href = '/post-list';
            } else if (method !== 'DELETE') {
                window.location.reload();
            }
        } catch (err) {
            alert(err.message);
            console.error(err);
        }
    }
}