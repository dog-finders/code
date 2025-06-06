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
        membersContainer.innerHTML = '<p>평가할 다른 멤버가 없습니다. 모임을 종료합니다.</p>';
        document.querySelector('button[type="submit"]').style.display = 'none';
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
          <label>매너 점수</label>
          <div class="rating">
            <input type="radio" id="star5-${memberId}" name="mannerRating-${memberId}" value="5" required><label for="star5-${memberId}">★</label>
            <input type="radio" id="star4-${memberId}" name="mannerRating-${memberId}" value="4"><label for="star4-${memberId}">★</label>
            <input type="radio" id="star3-${memberId}" name="mannerRating-${memberId}" value="3"><label for="star3-${memberId}">★</label>
            <input type="radio" id="star2-${memberId}" name="mannerRating-${memberId}" value="2"><label for="star2-${memberId}">★</label>
            <input type="radio" id="star1-${memberId}" name="mannerRating-${memberId}" value="1"><label for="star1-${memberId}">★</label>
          </div>
        </div>
        <div class="form-group">
          <label for="comment-${memberId}">한 줄 후기 (선택)</label>
          <textarea id="comment-${memberId}" name="comment" rows="2" class="form-control"></textarea>
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
            const mannerRating = card.querySelector(`input[name="mannerRating-${memberId}"]:checked`);
            
            if (!mannerRating) throw new Error(`${memberId}님의 매너 점수를 선택해주세요.`);

            return {
                evaluatedId: memberId,
                mannerRating: parseInt(mannerRating.value, 10),
                comment: card.querySelector(`textarea[name="comment"]`).value,
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