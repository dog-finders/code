const express = require('express');
const router = express.Router();
const { getRepository } = require('typeorm');
const Meeting = require('../entity/Meeting');
const MeetingMember = require('../entity/MeetingMember');
const User = require('../../user/entity/User'); // 경로는 상황에 맞게 조정

// GET /api/meetings - 모임 목록 조회
router.get('/', async (req, res) => {
  try {
    const meetingRepo = getRepository(Meeting);
    const memberRepo = getRepository(MeetingMember);

    const meetings = await meetingRepo.find();
    // meetings 배열에 hostName이 저장되어 있다고 가정
    const data = await Promise.all(
      meetings.map(async (m) => {
        const members = await memberRepo.find({ where: { meetingId: m.id } });
        return {
          id: m.id,
          title: m.title,
          hostId: m.hostId,
          hostName: m.hostName || '알수없음',
          members: members.map(mem => mem.memberId)
        };
      })
    );

    res.json(data);
  } catch (err) {
    console.error('모임 목록 조회 에러:', err);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// GET /api/meetings/:id - 특정 모임 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const meetingId = parseInt(req.params.id);
    if (isNaN(meetingId)) return res.status(400).json({ message: '유효하지 않은 모임 ID입니다.' });

    const meetingRepo = getRepository(Meeting);
    const memberRepo = getRepository(MeetingMember);

    const meeting = await meetingRepo.findOne({ where: { id: meetingId } });
    if (!meeting) return res.status(404).json({ message: "모임 없음" });

    const members = await memberRepo.find({ where: { meetingId } });

    res.json({
      id: meeting.id,
      title: meeting.title,
      hostId: meeting.hostId,
      hostName: meeting.hostName || '알수없음',
      members: members.map(m => m.memberId)
    });
  } catch (err) {
    console.error('모임 상세 조회 에러:', err);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// POST /api/meetings - 모임 생성 (글 작성)
router.post('/', async (req, res) => {
  try {
    const meetingRepo = getRepository(Meeting);
    const memberRepo = getRepository(MeetingMember);
    const userRepo = getRepository(User);

    const hostId = req.session?.userId;
    if (!hostId) return res.status(401).json({ message: '로그인이 필요합니다.' });

    const { title } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: "모임 제목이 필요합니다." });
    }

    // hostName(사용자 이름) 가져오기
    const user = await userRepo.findOne({ where: { id: hostId } });
    if (!user) return res.status(401).json({ message: '유효하지 않은 사용자입니다.' });

    const hostName = user.name || '알수없음';

    // 모임 저장 (hostName 포함)
    const meeting = await meetingRepo.save({ title, hostId, hostName });

    // 호스트도 참석자로 등록
    await memberRepo.save({ meetingId: meeting.id, memberId: hostId });

    res.status(201).json({ success: true, meetingId: meeting.id });
  } catch (err) {
    console.error('모임 생성 에러:', err);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

// DELETE /api/meetings/:id - 모임 삭제 (참석자 먼저 삭제 후 모임 삭제)
router.delete('/:id', async (req, res) => {
  try {
    const meetingRepo = getRepository(Meeting);
    const memberRepo = getRepository(MeetingMember);
    const id = parseInt(req.params.id);

    if (isNaN(id)) return res.status(400).json({ message: '유효하지 않은 모임 ID입니다.' });

    // 모임 존재 여부 확인
    const meeting = await meetingRepo.findOne({ where: { id } });
    if (!meeting) return res.status(404).json({ message: '모임을 찾을 수 없습니다.' });

    // 로그인 사용자 체크 (삭제 권한 등 추가 가능)
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: '로그인이 필요합니다.' });

    if (meeting.hostId !== userId) {
      return res.status(403).json({ message: '삭제 권한이 없습니다. (호스트만 가능)' });
    }

    // 1. 참석자(멤버) 데이터 먼저 삭제
    await memberRepo.delete({ meetingId: id });

    // 2. 모임 삭제
    const result = await meetingRepo.delete(id);
    if (result.affected > 0) {
      res.json({ success: true, message: '모임이 삭제되었습니다.' });
    } else {
      res.status(404).json({ message: '모임을 찾을 수 없습니다.' });
    }
  } catch (err) {
    console.error('모임 삭제 에러:', err);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

module.exports = router;
