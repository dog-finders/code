// public/js/mypage.js
document.addEventListener('DOMContentLoaded', () => {
  // 로그인 확인
  if (!localStorage.getItem("user")) {
    alert("로그인이 필요한 서비스입니다.");
    window.location.href = "/login";
    return;
  }

  const userProfileSection = document.getElementById('user-profile-section');
  const petListContainer = document.getElementById('pet-list-container');
  const addNewPetBtn = document.getElementById('add-new-pet-btn');

  let currentUserData = null;

  // 사용자 정보 섹션 렌더링 함수
  const renderUserSection = (isEditing = false) => {
    if (!currentUserData) return;
    let content = '';
    if (isEditing) {
      content = `
                <div class="profile-section">
                    <div class="section-header"><h2>내 정보 수정</h2></div>
                    <div class="info-grid">
                        <div class="info-item"><strong>이름</strong><input type="text" id="user-name-edit" class="form-control" value="${currentUserData.name || ''}"></div>
                        <div class="info-item"><strong>이메일</strong><input type="email" id="user-email-edit" class="form-control" value="${currentUserData.email || ''}"></div>
                        <div class="info-item"><strong>전화번호</strong><input type="tel" id="user-phone-edit" class="form-control" value="${currentUserData.phone || ''}"></div>
                        <div class="info-item"><strong>생년월일</strong><input type="date" id="user-birthdate-edit" class="form-control" value="${currentUserData.birthdate ? new Date(currentUserData.birthdate).toISOString().split('T')[0] : ''}"></div>
                        <div class="info-item"><strong>주소</strong><input type="text" id="user-address-edit" class="form-control" value="${currentUserData.address || ''}"></div>
                        <div class="info-item">
                            <strong>성격</strong>
                            <select id="user-personality-edit" class="form-select">
                                <option value="ACTIVE" ${currentUserData.personality === 'ACTIVE' ? 'selected' : ''}>활동적</option>
                                <option value="CALM" ${currentUserData.personality === 'CALM' ? 'selected' : ''}>차분함</option>
                                <option value="SOCIAL" ${currentUserData.personality === 'SOCIAL' ? 'selected' : ''}>사교적</option>
                                <option value="SHY" ${currentUserData.personality === 'SHY' ? 'selected' : ''}>수줍음</option>
                            </select>
                        </div>
                    </div>
                    <div class="button-group">
                        <button class="btn btn-primary" id="save-user-btn">저장</button>
                        <button class="btn btn-secondary" id="cancel-user-btn">취소</button>
                    </div>
                </div>`;
    } else {
      content = `
                <div class="profile-section">
                    <div class="section-header">
                        <h2>내 정보</h2>
                        <button class="btn btn-secondary" id="edit-user-btn">수정</button>
                    </div>
                    <div class="info-grid">
                        <div class="info-item"><strong>이름</strong><p>${currentUserData.name || '미입력'}</p></div>
                        <div class="info-item"><strong>이메일</strong><p>${currentUserData.email || '미입력'}</p></div>
                        <div class="info-item"><strong>전화번호</strong><p>${currentUserData.phone || '미입력'}</p></div>
                        <div class="info-item"><strong>생년월일</strong><p>${currentUserData.birthdate ? new Date(currentUserData.birthdate).toLocaleDateString() : '미입력'}</p></div>
                        <div class="info-item"><strong>주소</strong><p>${currentUserData.address || '미입력'}</p></div>
                        <div class="info-item"><strong>성격</strong><p>${currentUserData.personality || '미입력'}</p></div>
                    </div>
                </div>`;
    }
    userProfileSection.innerHTML = content;
    attachUserButtonListeners(isEditing);
  };

  const attachUserButtonListeners = (isEditing) => {
    if (isEditing) {
      document.getElementById('save-user-btn').addEventListener('click', saveUserData);
      document.getElementById('cancel-user-btn').addEventListener('click', () => renderUserSection(false));
    } else {
      document.getElementById('edit-user-btn').addEventListener('click', () => renderUserSection(true));
    }
  };

  const saveUserData = async () => {
    const updatedData = {
      name: document.getElementById('user-name-edit').value,
      email: document.getElementById('user-email-edit').value,
      phone: document.getElementById('user-phone-edit').value,
      birthdate: document.getElementById('user-birthdate-edit').value,
      address: document.getElementById('user-address-edit').value,
      personality: document.getElementById('user-personality-edit').value,
    };
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error('사용자 정보 저장에 실패했습니다.');
      currentUserData = { ...currentUserData, ...updatedData };
      renderUserSection(false);
      alert('사용자 정보가 저장되었습니다.');
    } catch (err) {
      alert(err.message);
    }
  };

  const renderPetList = () => {
    petListContainer.innerHTML = '';
    fetch('/api/pets')
    .then(res => res.ok ? res.json() : [])
    .then(pets => {
      if(pets.length > 0) {
        pets.forEach(pet => {
          const petCard = createPetCard(pet);
          petListContainer.appendChild(petCard);
        });
      } else {
        petListContainer.innerHTML = '<p>등록된 반려동물이 없습니다. 위 버튼을 눌러 추가해주세요.</p>';
      }
    });
  };

  const createPetCard = (pet = {}, isNew = false) => {
    const card = document.createElement('div');
    card.className = 'pet-card';
    if (pet.id) card.dataset.id = pet.id;
    const render = (isEditing) => {
      let content = '';
      if (isEditing) {
        content = `
                    <h4>${pet.id ? '반려동물 정보 수정' : '새 반려동물 등록'}</h4>
                    <div class="info-grid">
                        <div class="info-item"><strong>이름</strong><input type="text" class="form-control pet-name" value="${pet.name || ''}" required></div>
                        <div class="info-item"><strong>생년월일</strong><input type="date" class="form-control pet-birth" value="${pet.birth ? new Date(pet.birth).toISOString().split('T')[0] : ''}" required></div>
                        <div class="info-item">
                            <strong>성격</strong>
                            <select class="form-select pet-personality" required>
                                <option value="ACTIVE" ${pet.personality === 'ACTIVE' ? 'selected' : ''}>활동적</option>
                                <option value="CALM" ${pet.personality === 'CALM' ? 'selected' : ''}>차분함</option>
                                <option value="SOCIAL" ${pet.personality === 'SOCIAL' ? 'selected' : ''}>사교적</option>
                                <option value="SHY" ${pet.personality === 'SHY' ? 'selected' : ''}>수줍음</option>
                            </select>
                        </div>
                        <div class="info-item">
                            <strong>접종 여부</strong>
                            <select class="form-select pet-isVaccinated" required>
                                <option value="true" ${pet.isVaccinated === true ? 'selected' : ''}>완료</option>
                                <option value="false" ${pet.isVaccinated === false ? 'selected' : ''}>미완료</option>
                            </select>
                        </div>
                        <div class="info-item">
                            <strong>사진</strong>
                            <input type="file" class="form-control pet-image" accept="image/*" />
                        </div>
                    </div>
                    <div class="button-group">
                        <button class="btn btn-primary save-pet-btn">저장</button>
                        <button class="btn btn-secondary cancel-pet-btn">취소</button>
                    </div>`;
      } else {
        content = `
                    <div class="section-header">
                        <h3>${pet.name}</h3>
                        <div class="button-group">
                            <button class="btn btn-secondary btn-sm edit-pet-btn">수정</button>
                            <button class="btn btn-danger btn-sm remove-pet-btn">삭제</button>
                        </div>
                    </div>
                    <div class="pet-view-info">
                        ${pet.imageUrl ? `<img src="${pet.imageUrl}" alt="${pet.name} 사진" class="pet-preview">` : ''}
                        <div>
                            <div class="info-grid">
                                <div class="info-item"><strong>생년월일</strong><p>${new Date(pet.birth).toLocaleDateString()}</p></div>
                                <div class="info-item"><strong>성격</strong><p>${pet.personality}</p></div>
                                <div class="info-item"><strong>접종 여부</strong><p>${pet.isVaccinated ? '완료' : '미완료'}</p></div>
                            </div>
                        </div>
                    </div>`;
      }
      card.innerHTML = content;
      attachPetButtonListeners(card, pet, isEditing);
    };
    render(isNew);
    return card;
  };

  const attachPetButtonListeners = (card, pet, isEditing) => {
    if (isEditing) {
      card.querySelector('.save-pet-btn').addEventListener('click', () => savePetData(card, pet));
      card.querySelector('.cancel-pet-btn').addEventListener('click', () => {
        if (!pet.id) {
          card.remove();
        } else {
          const viewCard = createPetCard(pet, false);
          card.replaceWith(viewCard);
        }
      });
    } else {
      card.querySelector('.edit-pet-btn').addEventListener('click', () => {
        const editCard = createPetCard(pet, true);
        card.replaceWith(editCard);
      });
      card.querySelector('.remove-pet-btn').addEventListener('click', () => deletePetData(card, pet));
    }
  };

  // --- [핵심 수정] 반려동물 개별 저장/수정 함수 ---
  // public/js/mypage.js 파일에서 이 함수만 교체하세요.

  const savePetData = async (card, pet) => {
    // 1. 폼에서 데이터 수집
    const petData = {
      name: card.querySelector('.pet-name').value,
      birth: card.querySelector('.pet-birth').value,
      personality: card.querySelector('.pet-personality').value,
      isVaccinated: card.querySelector('.pet-isVaccinated').value === 'true',
    };
    const imageFile = card.querySelector('.pet-image')?.files[0];

    console.log("--- 1. savePetData 시작 ---");
    console.log("선택된 이미지 파일:", imageFile);

    try {
      // 2. 텍스트 정보 먼저 저장/수정
      const url = pet.id ? `/api/pets/${pet.id}` : '/api/pets';
      const method = pet.id ? 'PUT' : 'POST';

      console.log(`--- 2. 텍스트 정보 저장 요청 ---`);
      console.log(`URL: ${method} ${url}`);

      const textRes = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(petData)
      });

      const savedPet = await textRes.json();
      if(!textRes.ok) throw new Error(savedPet.message || '반려동물 정보 저장에 실패했습니다.');

      console.log("--- 3. 텍스트 정보 저장 성공 ---");
      console.log("서버로부터 반환된 펫 정보:", savedPet);

      // 3. 이미지가 있으면, 반환된 ID로 이미지 업로드
      if (imageFile) {
        const petId = savedPet.id;

        if (!petId) {
          console.error("저장된 펫 정보에서 ID를 찾을 수 없습니다!");
          throw new Error("이미지 업로드를 위한 Pet ID가 없습니다.");
        }

        console.log(`--- 4. 이미지 업로드 시작 (Pet ID: ${petId}) ---`);
        const formData = new FormData();
        formData.append('petImage', imageFile);

        const imageRes = await fetch(`/api/pets/${petId}/image`, {
          method: 'POST',
          body: formData,
        });

        console.log("--- 5. 이미지 업로드 요청에 대한 서버 응답 ---", imageRes);

        if (!imageRes.ok) {
          const errData = await imageRes.json();
          console.error("이미지 업로드 실패 응답:", errData);
          throw new Error('이미지 업로드에 실패했습니다.');
        }
        console.log("--- 6. 이미지 업로드 성공! ---");
      }

      renderPetList(); // 성공 시 목록 전체 새로고침
      alert('저장되었습니다.');

    } catch(err) {
      console.error("정보 저장 중 최종 에러:", err);
      alert(err.message);
    }
  };

  const deletePetData = async (card, pet) => {
    if (!confirm(`'${pet.name}'의 정보를 정말 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch(`/api/pets/${pet.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제 실패');
      card.remove();
      alert('삭제되었습니다.');
    } catch(err) {
      alert(err.message);
    }
  };

  addNewPetBtn.addEventListener('click', () => {
    const newPetCard = createPetCard({}, true);
    petListContainer.prepend(newPetCard);
  });

  fetch('/api/users/me')
  .then(res => res.ok ? res.json() : Promise.reject('사용자 정보 로딩 실패'))
  .then(user => {
    currentUserData = user;
    renderUserSection();
    renderPetList();
  })
  .catch(err => alert(err.message));
});
