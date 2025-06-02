// public/js/settings.js

window.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('user-form');
    const petList = document.getElementById('pet-list');
    const addPetBtn = document.getElementById('add-pet');
    let petsState = []; // [{ id, name, species }]

    // 1. 사용자 정보 불러오기
    fetch('/api/users/me', { credentials: 'include' })
        .then((res) => res.json())
        .then((user) => {
            document.getElementById('name').value = user.name || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('birthdate').value = user.birthdate || '';
            document.getElementById('address').value = user.address || '';
            document.getElementById('personality').value =
                user.personality || '';
        });

    // 2. 반려동물 정보 불러오기
    fetch('/api/pets', { credentials: 'include' })
        .then((res) => res.json())
        .then((pets) => {
            petsState = pets;
            pets.forEach((pet) => addPetForm(pet));
        });

    // 3. 사용자 정보 저장
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            birthdate: document.getElementById('birthdate').value,
            address: document.getElementById('address').value,
            personality: document.getElementById('personality').value,
        };

        await fetch('/api/users/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        // pet state 저장
        const petsToUpdate = Array.from(
            document.querySelectorAll('.pet-form'),
        ).map((div) => {
            return {
                id: div.dataset.id || null,
                name: div.querySelector('.pet-name').value,
                species: div.querySelector('.pet-species').value,
            };
        });
        if (petsToUpdate.length !== 0) {
            await fetch('/api/pets/bulk', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(petsToUpdate),
            });
        }

        alert('정보가 저장되었습니다.');
    });

    // 4. 반려동물 동적 추가
    addPetBtn.addEventListener('click', () => addPetForm());

    // Helper: 반려동물 폼 생성
    function addPetForm(pet = {}) {
        const petDiv = document.createElement('div');
        petDiv.className = 'pet-form';
        if (pet.id) petDiv.dataset.id = pet.id;

        petDiv.innerHTML = `
      <div class="pet-header">
        <h3>${pet.id ? '반려동물 수정' : '새 반려동물'}</h3>
        <button type="button" class="remove-pet">&times;</button>
      </div>
      <div class="mb-3">
        <label class="form-label">이름</label>
        <input type="text" class="form-control pet-name" value="${pet.name || ''}" required>
      </div>
      <div class="mb-3">
        <label class="form-label">종</label>
        <input type="text" class="form-control pet-species" value="${pet.species || ''}" required>
      </div>
    `;

        // 삭제 버튼 클릭 시 DOM에서만 제거 (서버 반영은 저장 시에 수행)
        petDiv.querySelector('.remove-pet').addEventListener('click', () => {
            petDiv.remove();
        });

        petList.appendChild(petDiv);
    }
});
