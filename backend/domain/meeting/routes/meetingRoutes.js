const express = require('express');
const router = express.Router();
const controller = require('../controller/meetingController');

// GET /api/meetings - 모든 모임 목록 조회
router.get('/', async (req, res) => {
  try {
    const meetings = await controller.findAllMeetings();
    const result = await Promise.all(meetings.map(async (m) => {
      const members = await controller.findMembersByMeetingId(m.id);
      return {
        id: m.id,
        title: m.title,
        hostId: m.hostId, // DB에 저장된 문자열 ID가 반환됨
        hostName: m.hostName,
        members: members.map(mem => mem.memberId),
      };
    }));
    res.json(result);
  } catch (err) {
    console.error('목록 조회 에러:', err);
    res.status(500).json({ message: '서버 에러' });
  }
});

// GET /api/meetings/:id - 특정 모임 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: '유효하지 않은 ID' });

    const meeting = await controller.findMeetingById(id);
    if (!meeting) return res.status(404).json({ message: '모임 없음' });

    const members = await controller.findMembersByMeetingId(id);
    res.json({
      id: meeting.id,
      title: meeting.title,
      hostId: meeting.hostId, // DB에 저장된 문자열 ID가 반환됨
      hostName: meeting.hostName,
      members: members.map(m => m.memberId),
    });
  } catch (err) {
    console.error('상세 조회 에러:', err);
    res.status(500).json({ message: '서버 에러' });
  }
});

// POST /api/meetings - 새 모임 생성 (로직 수정 완료)
router.post('/', async (req, res) => {
  try {
    // 1. 세션에서 사용자 ID (숫자) 가져오기
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    // 2. 요청 body에서 title과 recruitId 추출
    const { title, recruitId } = req.body;
    if (!title) {
      return res.status(400).json({ message: '모임 제목이 필요합니다.' });
    }

    // 3. 사용자 ID로 사용자 정보 조회하여 loginId (문자열) 찾기
    const user = await controller.findUserById(userId);
    if (!user || !user.loginId) {
      return res.status(404).json({ message: '사용자 정보를 찾을 수 없습니다.' });
    }
    const userLoginId = user.loginId; // 'qwer' 와 같은 문자열 ID

    // 4. 모임 저장 (hostId와 hostName에 모두 문자열 loginId 저장)
    const newMeeting = await controller.saveMeeting({
      title,
      hostId: userLoginId,
      hostName: userLoginId, // hostName에도 loginId를 저장하여 일관성 유지
      recruitId: recruitId || null,
    });

    // 5. 모임 생성자(호스트)를 멤버로 자동 추가
    await controller.saveMember({
      meetingId: newMeeting.id,
      memberId: userLoginId,
    });

    res.status(201).json({ success: true, meetingId: newMeeting.id });

  } catch (err) {
    console.error('모임 생성 에러:', err);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// DELETE /api/meetings/:id - 모임 삭제
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: '유효하지 않은 ID' });

    const meeting = await controller.findMeetingById(id);
    if (!meeting) return res.status(404).json({ message: '모임 없음' });

    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: '로그인 필요' });

    const user = await controller.findUserById(userId);
    const loginId = user?.loginId;
    
    // 삭제 권한 확인 (모임의 호스트와 현재 로그인한 사용자의 loginId 비교)
    if (meeting.hostId !== loginId) {
      return res.status(403).json({ message: '삭제 권한 없음' });
    }

    // 연관된 멤버 정보와 모임 삭제
    await controller.deleteMembers(id);
    await controller.deleteMeeting(id);

    res.json({ success: true, message: '삭제 완료' });
  } catch (err) {
    console.error('삭제 에러:', err);
    res.status(500).json({ message: '서버 에러' });
  }
});

module.exports = router;