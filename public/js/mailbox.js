// public/js/mailbox.js

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/attend/mailbox');
        if (!res.ok) throw new Error('요청 목록을 불러오는데 실패했습니다.');

        const requests = await res.json();
        const requestListTbody = document.getElementById('request-list');
        requestListTbody.innerHTML = '';

        if (requests.length === 0) {
            requestListTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">받은 참석 요청이 없습니다.</td></tr>';
            return;
        }

        requests.forEach(req => {
            const tr = document.createElement('tr');
            tr.id = `request-${req.id}`;
            const formattedDate = new Date(req.createdAt).toLocaleString();
            tr.innerHTML = `
              <td><button class="link-button" onclick="showProfile('${req.applicantLoginId}')">${req.applicantLoginId}</button></td>
              <td>'<strong>${req.recruitTitle}</strong>' 게시글에 참석 요청을 보냈습니다.</td>
              <td>${req.message || '(내용 없음)'}</td>
              <td>${formattedDate}</td>
              <td>
                <button class="btn btn-primary btn-sm" onclick="handleAccept(${req.id})">수락</button>
                <button class="btn btn-danger btn-sm" onclick="handleReject(${req.id})">거절</button>
              </td>
            `;
            requestListTbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});

async function handleAccept(attendId) {
    if (!confirm('정말 이 요청을 수락하시겠습니까?')) return;

    try {
        const res = await fetch(`/api/attend/${attendId}/accept`, { method: 'PATCH' });
        const result = await res.json();

        if (res.ok) {
            alert(result.message);
            const row = document.getElementById(`request-${attendId}`);
            if(row) row.remove();
        } else {
            throw new Error(result.message || '요청 수락에 실패했습니다.');
        }
    } catch(error) {
        alert('처리 중 오류가 발생했습니다: ' + error.message);
        console.error(error);
    }
}

async function handleReject(attendId) {
    if (!confirm('정말 이 요청을 거절하시겠습니까?')) return;

    try {
        const res = await fetch(`/api/attend/${attendId}/reject`, { method: 'PATCH' });
        const result = await res.json();

        if (res.ok) {
            alert(result.message);
            const row = document.getElementById(`request-${attendId}`);
            if (row) row.remove();
        } else {
            throw new Error(result.message || '요청 거절에 실패했습니다.');
        }
    } catch (error) {
        alert('처리 중 오류가 발생했습니다: ' + error.message);
        console.error(error);
    }
}