const express = require('express');
const router = express.Router();
const controller = require('../controller/meetingController');

// GET /api/meetings - 페이지네이션과 정렬이 적용된 모든 모임 목록 조회
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const [meetings, totalCount] = await controller.findAllMeetings({ page, pageSize });
    const totalPages = Math.ceil(totalCount / pageSize);

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

    // 클라이언트에 페이지네이션 정보를 함께 전달
    res.json({
        meetings: result,
        totalPages,
        currentPage: page
    });

  } catch (err) {
    console.error('모임 목록 조회 에러:', err);
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
      hostId: meeting.hostId,
      hostName: meeting.hostName,
      members: members.map(m => m.memberId),
    });
  } catch (err) {
    console.error('상세 조회 에러:', err);
    res.status(500).json({ message: '서버 에러' });
  }
});

// POST /api/meetings - 새 모임 생성
router.post('/', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const { title, recruitId } = req.body;
    if (!title) {
      return res.status(400).json({ message: '모임 제목이 필요합니다.' });
    }

    const user = await controller.findUserById(userId);
    if (!user || !user.loginId) {
      return res.status(404).json({ message: '사용자 정보를 찾을 수 없습니다.' });
    }
    const userLoginId = user.loginId;

    const newMeeting = await controller.saveMeeting({
      title,
      hostId: userLoginId,
      hostName: userLoginId,
      recruitId: recruitId || null,
    });

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