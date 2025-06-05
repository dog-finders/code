window.addEventListener("DOMContentLoaded", () => {
  // 1. 로그인 여부 확인
  if (!localStorage.getItem("user")) {
    alert("로그인이 필요한 서비스입니다.");
    window.location.href = "/login";
    return;
  }

  const userForm = document.getElementById("user-form");
  const petList = document.getElementById("pet-list");
  const addPetBtn = document.getElementById("add-pet");
  let petsState = [];

  // 2. 사용자 기본 정보 불러오기
  fetch("/api/users/me", { credentials: "include" })
    .then((res) => {
      if (!res.ok) throw new Error("사용자 정보를 불러올 수 없습니다.");
      return res.json();
    })
    .then((user) => {
      document.getElementById("name").value = user.name || "";
      document.getElementById("email").value = user.email || "";
      document.getElementById("phone").value = user.phone || "";
      document.getElementById("birthdate").value = user.birthdate || "";
      document.getElementById("address").value = user.address || "";
      document.getElementById("personality").value = user.personality || "";
    })
    .catch((err) => {
      console.error(err);
      alert("사용자 정보를 불러오는 중 오류가 발생했습니다.");
    });

  // 3. 반려동물 정보 불러오기
  fetch("/api/pets", { credentials: "include" })
    .then((res) => {
      if (!res.ok) throw new Error("반려동물 정보를 불러올 수 없습니다.");
      return res.json();
    })
    .then((pets) => {
      petsState = pets;
      if (pets.length === 0) {
        addPetForm(); // 기본 한 개라도 표시
      } else {
        pets.forEach((pet) => addPetForm(pet));
      }
    })
    .catch((err) => {
      console.error(err);
      addPetForm(); // 반려동물 정보 없거나 오류 시에도 기본 폼 하나 추가
    });

  // 4. 사용자 정보 및 반려동물 정보 저장
  userForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 사용자 데이터 객체 생성 (ENUM에 맞게 value 전달)
    const userData = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      birthdate: document.getElementById("birthdate").value,
      address: document.getElementById("address").value.trim(),
      personality: document.getElementById("personality").value, // select의 value가 ENUM
    };

    try {
      // (1) 사용자 정보 PUT
      const userRes = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      });
      if (!userRes.ok) throw new Error("사용자 정보 저장 실패");

      // (2) 반려동물 정보 수집
      const petDivs = document.querySelectorAll(".pet-form");
      const petsToUpdate = Array.from(petDivs).map((div) => {
        return {
          id: div.dataset.id || null,
          name: div.querySelector(".pet-name").value.trim(),
          species: div.querySelector(".pet-species").value.trim(),
        };
      });

      if (petsToUpdate.length > 0) {
        const petRes = await fetch("/api/pets/bulk", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(petsToUpdate),
        });
        if (!petRes.ok) throw new Error("반려동물 정보 저장 실패");
      }

      alert("정보가 저장되었습니다.");
    } catch (err) {
      console.error(err);
      alert("정보 저장 중 오류가 발생했습니다.");
    }
  });

  // 5. “반려동물 추가” 버튼
  addPetBtn.addEventListener("click", () => addPetForm());

  // --- Helper 함수들 ---
  function addPetForm(pet = {}) {
    const petDiv = document.createElement("div");
    petDiv.className = "pet-form";
    if (pet.id) petDiv.dataset.id = pet.id;

    petDiv.innerHTML = `
      <div class="pet-header">
        <h3>${pet.id ? "반려동물 수정" : "새 반려동물"}</h3>
        <button type="button" class="remove-pet">&times;</button>
      </div>
      <div class="mb-3">
        <label class="form-label">이름</label>
        <input type="text" class="form-control pet-name" value="${pet.name || ""}" required />
      </div>
      <div class="mb-3">
        <label class="form-label">종</label>
        <input type="text" class="form-control pet-species" value="${pet.species || ""}" required />
      </div>
    `;

    petDiv.querySelector(".remove-pet").addEventListener("click", () => {
      petDiv.remove();
    });

    petList.appendChild(petDiv);
  }
});
