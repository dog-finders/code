const express = require('express');
const router = express.Router();
const { getRepository } = require('typeorm');
const Meeting = require('../entity/Meeting');
const MeetingMember = require('../entity/MeetingMember');
const User = require('../../user/entity/User'); // 경로는 상황에 맞게 조정

// GET /api/meetings
router.get('/', async (req, res) => {
  const meetingRepo = getRepository(Meeting);
  const memberRepo = getRepository(MeetingMember);

  const meetings = await meetingRepo.find();
  console.log("[GET /api/meetings] meeting 테이블 데이터:", meetings);

  const data = await Promise.all(
    meetings.map(async (m) => {
      const members = await memberRepo.find({ where: { meetingId: m.id } });
      return {
        id: m.id,
        title: m.title,
        hostId: m.hostId,
        hostName: m.hostName, // ★ hostName 추가
        recruitId: m.recruitId, // ★ recruitId 추가
        members: members.map(mem => mem.memberId)
      };
    })
  );
  res.json(data);
});

// GET /api/meetings/:id
router.get('/:id', async (req, res) => {
  const meetingId = parseInt(req.params.id);
  const meetingRepo = getRepository(Meeting);
  const memberRepo = getRepository(MeetingMember);

  const meeting = await meetingRepo.findOne(meetingId);
  if (!meeting) return res.status(404).json({ message: "모임 없음" });

  const members = await memberRepo.find({ where: { meetingId } });

  res.json({
    id: meeting.id,
    title: meeting.title,
    hostId: meeting.hostId,
    hostName: meeting.hostName, // ★ hostName 추가
    recruitId: meeting.recruitId, // ★ recruitId 추가
    members: members.map(m => m.memberId)
  });
});

// POST /api/meetings → 글 작성(모임 생성)
router.post('/', async (req, res) => {
  const meetingRepo = getRepository(Meeting);
  const memberRepo = getRepository(MeetingMember);
  const userRepo = getRepository(User);

  const hostId = req.session?.userId || req.body.hostId;
  // ★ body에서 recruitId도 같이 추출
  const { title, recruitId } = req.body;

  if (!hostId || !title) {
    return res.status(400).json({ message: "필수 값이 없습니다." });
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

// ── 모임방 삭제 ──
router.delete('/:id', async (req, res) => {
  const meetingRepo = getRepository(Meeting);
  const memberRepo = getRepository(MeetingMember);
  const id = parseInt(req.params.id);

  // 1. 참석자(멤버) 데이터 먼저 삭제
  await memberRepo.delete({ meetingId: id });

  // 2. 모임방 삭제
  const result = await meetingRepo.delete(id);
  if (result.affected > 0) {
    res.json({ success: true, message: '모임이 삭제되었습니다.' });
  } else {
    res.status(404).json({ message: '모임을 찾을 수 없습니다.' });
  }
});

module.exports = router;
