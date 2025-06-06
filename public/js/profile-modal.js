// public/js/profile-modal.js

/**
 * loginId를 받아 해당 유저의 프로필 정보를 API로 요청하고 모달에 표시합니다.
 * @param {string} loginId - 프로필을 조회할 사용자의 로그인 ID
 */
async function showProfile(loginId) {
    const profileModal = document.getElementById('profileModal');
    const profileDiv = document.getElementById('profileData');

    if (!profileModal || !profileDiv) return;

    profileDiv.innerHTML = '<p>프로필 정보를 불러오는 중...</p>';
    profileModal.style.display = 'block';

    try {
        const response = await fetch(`/api/users/profile/${loginId}`);
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || '프로필 정보를 불러올 수 없습니다.');
        }

        const data = await response.json();
        const { user, pets } = data;

        // 반려동물 정보 HTML 생성
        let petsHtml = '<h4>반려동물 정보</h4>';
        if (pets && pets.length > 0) {
            pets.forEach(pet => {
                petsHtml += `
                    <div class="pet-box">
                        <p><strong>이름:</strong> ${pet.name}</p>
                        <p><strong>생년월일:</strong> ${new Date(pet.birth).toLocaleDateString()}</p>
                        <p><strong>성격:</strong> ${pet.personality || '정보 없음'}</p>
                        <p><strong>접종 여부:</strong> ${pet.isVaccinated ? '완료' : '미완료'}</p>
                    </div>
                `;
            });
        } else {
            petsHtml += '<p>등록된 반려동물이 없습니다.</p>';
        }

        // 최종 프로필 HTML
        profileDiv.innerHTML = `
            <p><strong>아이디:</strong> ${user.loginId}</p>
            <p><strong>이름:</strong> ${user.name}</p>
            <p><strong>성향:</strong> ${user.personality || '정보 없음'}</p>
            <p><strong>평점:</strong> ${user.rating || '평가 없음'}</p>
            <hr>
            ${petsHtml}
        `;

    } catch (error) {
        console.error('프로필 로딩 실패:', error);
        profileDiv.innerHTML = `<p>${error.message}</p>`;
    }
}

/**
 * 프로필 모달을 닫습니다.
 */
function closeProfile() {
    const profileModal = document.getElementById('profileModal');
    if (profileModal) {
        profileModal.style.display = 'none';
    }
}
