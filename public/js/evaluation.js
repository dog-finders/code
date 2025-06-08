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
        alert('평가할 다른 멤버가 없습니다.');
        window.location.href = '/gather';
        return;
    }

    const createScoreDropdown = (name, memberId) => {
      let options = '';
      for (let i = 0; i <= 5; i++) {
        options += `<option value="${i}">${i}점</option>`;
      }
      return `<select name="${name}-${memberId}" class="form-select" required>${options}</select>`;
    };

    otherMembers.forEach(memberId => {
      const card = document.createElement('div');
      card.className = 'evaluation-card';
      card.dataset.memberId = memberId;
      
      card.innerHTML = `
        <h3>멤버: ${memberId}</h3>
        <div class="form-group">
          <label for="punctuality-${memberId}">시간 약속 준수</label>
          ${createScoreDropdown('punctuality', memberId)}
        </div>
        <div class="form-group">
          <label for="sociability-${memberId}">반려동물의 사회성</label>
          ${createScoreDropdown('sociability', memberId)}
        </div>
        <div class="form-group">
          <label for="aggressiveness-${memberId}">반려동물의 공격성</label>
          ${createScoreDropdown('aggressiveness', memberId)}
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
            const punctuality = card.querySelector(`select[name="punctuality-${memberId}"]`).value;
            const sociability = card.querySelector(`select[name="sociability-${memberId}"]`).value;
            const aggressiveness = card.querySelector(`select[name="aggressiveness-${memberId}"]`).value;
            
            return {
                evaluatedId: memberId,
                punctuality,
                sociability,
                aggressiveness,
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