const express = require('express');
const router = express.Router();
const controller = require('../controller/meetingController');

// GET /api/meetings
router.get('/', async (req, res) => {
  try {
    const meetings = await controller.findAllMeetings();
    const result = await Promise.all(meetings.map(async (m) => {
      const members = await controller.findMembersByMeetingId(m.id);
      return {
        id: m.id,
        title: m.title,
        hostId: m.hostId,
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

// GET /api/meetings/:id
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
      hostId: meeting.hostId,
      hostName: meeting.hostName,
      members: members.map(m => m.memberId),
    });
  } catch (err) {
    console.error('상세 조회 에러:', err);
    res.status(500).json({ message: '서버 에러' });
  }
});

// POST /api/meetings
router.post('/', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: '로그인 필요' });

  const hostId = req.session?.userId || req.body.hostId;
  // ★ body에서 recruitId도 같이 추출
  const { title, recruitId } = req.body;

    const user = await controller.findUserById(userId);
    if (!user) return res.status(401).json({ message: '사용자 없음' });

    const loginId = user.loginId;
    const meeting = await controller.saveMeeting({
      title,
      hostId: loginId,
      hostName: loginId,
    });

    await controller.saveMember({ meetingId: meeting.id, memberId: loginId });

    res.status(201).json({ success: true, meetingId: meeting.id });
  } catch (err) {
    console.error('모임 생성 에러:', err);
    res.status(500).json({ message: '서버 에러' });
  }

  // ★ hostName(사용자 이름) 가져오기
  const user = await userRepo.findOne({ where: { id: hostId } });
  const hostName = user?.name || '알수없음';

  // ★ 모임 저장 (hostName, recruitId 포함)
  const meeting = await meetingRepo.save({ 
    title, 
    hostId, 
    hostName, 
    recruitId: recruitId || null  // recruitId가 없으면 null 처리
  });
  console.log("[POST /api/meetings] 생성된 meeting:", meeting);

  // 호스트도 참석자로 등록
  await memberRepo.save({ meetingId: meeting.id, memberId: hostId });

  res.json({ success: true, meetingId: meeting.id });
});

// DELETE /api/meetings/:id
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
    if (meeting.hostId !== loginId) {
      return res.status(403).json({ message: '삭제 권한 없음' });
    }

    await controller.deleteMembers(id);
    await controller.deleteMeeting(id);

    res.json({ success: true, message: '삭제 완료' });
  } catch (err) {
    console.error('삭제 에러:', err);
    res.status(500).json({ message: '서버 에러' });
  }
});

module.exports = router; 