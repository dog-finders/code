// public/js/settings.js

document.addEventListener('DOMContentLoaded', function() {
  // 사용자 정보와 반려동물 정보를 저장할 객체
  let currentUser = null;
  let userPets = [];
  
  // 폼 엘리먼트
  const userForm = document.getElementById('user-form');
  const petList = document.getElementById('pet-list');
  const addPetButton = document.getElementById('add-pet');
  
  // 페이지 로드 시 사용자 데이터 가져오기
  async function loadUserData() {
    try {
      // 사용자 정보 가져오기
      const userResponse = await fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!userResponse.ok) throw new Error('사용자 정보를 가져오는데 실패했습니다');
      currentUser = await userResponse.json();
      
      // 사용자 폼에 데이터 채우기
      document.getElementById('name').value = currentUser.name || '';
      document.getElementById('email').value = currentUser.email || '';
      document.getElementById('phone').value = currentUser.phone || '';
      document.getElementById('birthdate').value = formatDateForInput(currentUser.birthdate) || '';
      document.getElementById('address').value = currentUser.address || '';
      document.getElementById('personality').value = currentUser.personality || '';
      
      // 반려동물 정보 가져오기
      const petsResponse = await fetch('/api/pets', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!petsResponse.ok) throw new Error('반려동물 정보를 가져오는데 실패했습니다');
      userPets = await petsResponse.json();
      
      // 반려동물 목록 렌더링
      renderPetList();
      
    } catch (error) {
      console.error('데이터 로드 중 오류:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다: ' + error.message);
    }
  }
  
  // 날짜 포맷 변환 (YYYY-MM-DD)
  function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // 반려동물 목록 렌더링
  function renderPetList() {
    petList.innerHTML = '';
    if (userPets.length === 0) {
      addPetForm(); // 기본 폼 하나 보여주기
      return;
    }
    userPets.forEach((pet, index) => {
      const petForm = createPetForm(pet, index);
      petList.appendChild(petForm);
    });
  }
  
  // 반려동물 폼 생성
  function createPetForm(pet = {}, index) {
    const div = document.createElement('div');
    div.className = 'pet-form';
    div.dataset.index = index;
    
    const petId = pet.id || '';
    div.innerHTML = `
      <div class="pet-header">
        <h3>반려동물 #${index + 1}</h3>
      </div>
      <input type="hidden" name="pet-id-${index}" value="${petId}">
      
      <div class="mb-3">
        <label class="form-label" for="pet-name-${index}">이름</label>
        <input type="text" id="pet-name-${index}" name="pet-name-${index}"
               class="form-control pet-name" value="${pet.name || ''}" required>
      </div>
      
      <div class="mb-3">
        <label class="form-label" for="pet-birth-${index}">생년월일</label>
        <input type="date" id="pet-birth-${index}" name="pet-birth-${index}"
               class="form-control pet-birth" value="${formatDateForInput(pet.birth) || ''}" required>
      </div>
      
      <div class="mb-3">
        <label class="form-label" for="pet-personality-${index}">성격</label>
        <select id="pet-personality-${index}" name="pet-personality-${index}"
                class="form-select pet-personality" required>
          <option value="">선택하세요</option>
          <option value="ACTIVE" ${pet.personality === 'ACTIVE' ? 'selected' : ''}>활발함</option>
          <option value="CALM"   ${pet.personality === 'CALM'   ? 'selected' : ''}>차분함</option>
          <option value="SOCIAL" ${pet.personality === 'SOCIAL'? 'selected' : ''}>사교적</option>
          <option value="SHY"    ${pet.personality === 'SHY'    ? 'selected' : ''}>수줍음</option>
        </select>
      </div>
      
      <div class="mb-3">
        <label class="form-label" for="pet-isVaccinated-${index}">예방접종 여부</label>
        <select id="pet-isVaccinated-${index}" name="pet-isVaccinated-${index}"
                class="form-select pet-isVaccinated" required>
          <option value="">선택하세요</option>
          <option value="true"  ${pet.isVaccinated === true  ? 'selected' : ''}>완료</option>
          <option value="false" ${pet.isVaccinated === false ? 'selected' : ''}>미완료</option>
        </select>
      </div>
      
      <button type="button" class="remove-pet" data-index="${index}">&times;</button>
    `;
    
    // 삭제 버튼 이벤트
    div.querySelector('.remove-pet').addEventListener('click', function() {
      const idx = parseInt(this.dataset.index);
      removePet(idx);
    });
    
    return div;
  }
  
  // 반려동물 추가 버튼 이벤트
  addPetButton.addEventListener('click', function() {
    const newPet = {};
    const newIndex = userPets.length;
    userPets.push(newPet);
    const petForm = createPetForm(newPet, newIndex);
    petList.appendChild(petForm);
  });
  
  // 반려동물 삭제
  async function removePet(index) {
    const pet = userPets[index];
    if (pet.id) {
      try {
        const response = await fetch(`/api/pets/${pet.id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '반려동물 삭제 실패');
        }
      } catch (error) {
        console.error('반려동물 삭제 오류:', error);
        alert('반려동물 삭제 중 오류가 발생했습니다: ' + error.message);
        return;
      }
    }
    userPets.splice(index, 1);
    renderPetList();
  }
  
  // 폼 제출 이벤트
  userForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
      // 사용자 데이터 수집
      const userData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        birthdate: document.getElementById('birthdate').value,
        address: document.getElementById('address').value.trim(),
        personality: document.getElementById('personality').value.trim()
      };
      
      // 사용자 정보 업데이트 호출
      const userRes = await fetch('/api/users/me', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!userRes.ok) {
        const errData = await userRes.json();
        throw new Error(errData.message || '사용자 정보 수정 실패');
      }
      
      // 반려동물 데이터 수집 및 저장
      for (let i = 0; i < userPets.length; i++) {
        const petId = userPets[i].id;
        const petData = {
          name: document.getElementById(`pet-name-${i}`).value.trim(),
          birth: document.getElementById(`pet-birth-${i}`).value,
          personality: document.getElementById(`pet-personality-${i}`).value,
          isVaccinated: document.getElementById(`pet-isVaccinated-${i}`).value === 'true'
        };
        
        if (petId) {
          // 기존 반려동물 업데이트
          const response = await fetch(`/api/pets/${petId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(petData)
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '반려동물 정보 수정 실패');
          }
        } else {
          // 신규 반려동물 등록
          const response = await fetch('/api/pets', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(petData)
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '반려동물 등록 실패');
          }
        }
      }
      
      alert('모든 정보가 성공적으로 저장되었습니다');
      window.location.reload();
      
    } catch (error) {
      console.error('저장 중 오류:', error);
      alert('정보 저장 중 오류가 발생했습니다: ' + error.message);
    }
  });
  
  // 페이지 로드 시 데이터 가져오기
  loadUserData();
});
