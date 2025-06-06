window.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const meetingId = params.get('meetingId');

  if (!meetingId) {
    alert('잘못된 접근입니다.');
    window.location.href = '/gather';
    return;
  }

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  if (!currentUser) {
    alert('로그인이 필요합니다.');
    window.location.href = '/login';
    return;
  }

  try {
    const res = await fetch(`/api/meetings/${meetingId}`);
    if (!res.ok) throw new Error('모임 정보를 불러올 수 없습니다.');
    
    const meeting = await res.json();
    const membersContainer = document.getElementById('membersContainer');
    const otherMembers = meeting.members.filter(m => m !== currentUser.loginId);

    if (otherMembers.length === 0) {
        if (confirm("혼자 참여한 모임입니다. 바로 종료하시겠습니까?")) {
            const deleteRes = await fetch(`/api/meetings/${meetingId}`, {
                method: 'DELETE'
            });
            if (deleteRes.ok) {
                alert("모임이 종료되었습니다.");
                window.location.href = '/gather';
            } else {
                const err = await deleteRes.json();
                throw new Error(err.message || "모임 종료에 실패했습니다.");
            }
        } else {
            window.history.back();
        }
        return;
    }

    otherMembers.forEach(memberId => {
      const card = document.createElement('div');
      card.className = 'evaluation-card';
      card.dataset.memberId = memberId;
      
      card.innerHTML = `
        <h3>멤버: ${memberId}</h3>
        <input type="hidden" name="evaluatedId" value="${memberId}">

        <div class="form-group">
          <label for="punctuality-${memberId}">시간 약속 준수</label>
          <select id="punctuality-${memberId}" name="punctuality" class="form-control" required>
            <option value="" disabled selected>점수 선택</option>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
            <option value="0">0</option>
          </select>
        </div>

        <div class="form-group">
          <label for="sociability-${memberId}">반려동물의 사회성</label>
          <select id="sociability-${memberId}" name="sociability" class="form-control" required>
            <option value="" disabled selected>점수 선택</option>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
            <option value="0">0</option>
          </select>
        </div>

        <div class="form-group">
          <label for="aggressiveness-${memberId}">반려동물의 공격성</label>
          <select id="aggressiveness-${memberId}" name="aggressiveness" class="form-control" required>
            <option value="" disabled selected>점수 선택</option>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
            <option value="0">0</option>
          </select>
        </div>`;
      membersContainer.appendChild(card);
    });

  } catch (error) {
    console.error(error);
    alert(error.message);
  }

  document.getElementById('evaluationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const evaluationCards = document.querySelectorAll('.evaluation-card');
        const evaluations = Array.from(evaluationCards).map(card => {
            const memberId = card.dataset.memberId;
            
            const punctualitySelect = card.querySelector(`select[name="punctuality"]`);
            const sociabilitySelect = card.querySelector(`select[name="sociability"]`);
            const aggressivenessSelect = card.querySelector(`select[name="aggressiveness"]`);
            
            if (!punctualitySelect || punctualitySelect.value === "") {
                throw new Error(`${memberId}님의 '시간 약속 준수' 점수를 선택해주세요.`);
            }
            if (!sociabilitySelect || sociabilitySelect.value === "") {
                throw new Error(`${memberId}님의 '반려동물 사회성' 점수를 선택해주세요.`);
            }
            if (!aggressivenessSelect || aggressivenessSelect.value === "") {
                throw new Error(`${memberId}님의 '반려동물 공격성' 점수를 선택해주세요.`);
            }

            return {
                evaluatedId: memberId,
                punctuality: parseInt(punctualitySelect.value, 10),
                sociability: parseInt(sociabilitySelect.value, 10),
                aggressiveness: parseInt(aggressivenessSelect.value, 10),
            };
        });

        const payload = { meetingId, evaluations };
        const res = await fetch('/api/evaluations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        alert(result.message);
        window.location.href = '/gather';

    } catch (error) {
        alert(error.message);
        console.error(error);
    }
  });
});