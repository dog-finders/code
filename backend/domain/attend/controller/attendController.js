const { getRepository } = require('typeorm');
const Attend = require('../entity/Attend');
const Recruit = require('../../recruit/entity/Recruit');
const Meeting = require('../../meeting/entity/Meeting');
const MeetingMember = require('../../meeting/entity/MeetingMember');
const User = require('../../user/entity/User');

// 참석 요청 생성
exports.createAttendRequest = async (req, res) => {
  try {
    const applicantId = req.session.userId;
    const recruitId = parseInt(req.params.recruitId, 10);

    const applicant = await getRepository(User).findOne({ where: { id: applicantId } });
    const recruit = await getRepository(Recruit).findOne({ where: { id: recruitId }, relations: ['user'] });

    if (!applicant || !recruit) {
      return res.status(404).json({ message: '사용자 또는 모집글을 찾을 수 없습니다.' });
    }
    if (applicant.id === recruit.user.id) {
        return res.status(400).json({ message: '자신의 모집글에는 참석 요청을 보낼 수 없습니다.' });
    }
    
    const existingRequest = await getRepository(Attend).findOne({ where: { recruit: { id: recruitId }, applicantId }});
    if (existingRequest) {
        return res.status(409).json({ message: '이미 참석 요청을 보냈습니다.' });
    }

    const newRequest = getRepository(Attend).create({
      recruit: { id: recruitId },
      hostId: recruit.user.id,
      applicantId,
      applicantLoginId: applicant.loginId,
      recruitTitle: recruit.title,
    });

    await getRepository(Attend).save(newRequest);
    res.status(201).json({ message: '참석 요청을 보냈습니다.' });
  } catch (err) {
    console.error('참석 요청 생성 에러:', err);
    res.status(500).json({ message: '서버 에러' });
  }
};

// 메일함 조회
exports.getMailbox = async (req, res) => {
  try {
    const userId = req.session.userId;
    const requests = await getRepository(Attend).find({
      where: { hostId: userId, status: 'PENDING' },
      order: { createdAt: 'DESC' },
    });
    res.json(requests);
  } catch (err) {
    console.error('메일함 조회 에러:', err);
    res.status(500).json({ message: '서버 에러' });
  }
};

// 참석 요청 수락
exports.acceptAttendRequest = async (req, res) => {
    const attendId = parseInt(req.params.attendId, 10);
    const hostId = req.session.userId;

    const attendRepo = getRepository(Attend);
    const request = await attendRepo.findOne({ where: { id: attendId }, relations: ['recruit']});

    if (!request || request.hostId !== hostId) {
        return res.status(403).json({ message: '권한이 없거나 요청을 찾을 수 없습니다.' });
    }
    if (request.status !== 'PENDING') {
        return res.status(400).json({ message: '이미 처리된 요청입니다.' });
    }
    
    try {
        await getRepository(User).manager.transaction(async transactionalEntityManager => {
            // 1. 요청의 상태를 'ACCEPTED'로 변경
            await transactionalEntityManager.update(Attend, attendId, { status: 'ACCEPTED' });

            // 2. 관련 모임 정보 조회
            const meeting = await transactionalEntityManager.findOne(Meeting, { where: { recruitId: request.recruit.id }});
            if (!meeting) throw new Error('연관된 모임을 찾을 수 없습니다.');
            
            // 3. 신청자 정보 조회
            const applicant = await transactionalEntityManager.findOne(User, { where: { id: request.applicantId }});
            if (!applicant) throw new Error('신청자 정보를 찾을 수 없습니다.');

            await transactionalEntityManager.save(MeetingMember, {
                meetingId: meeting.id,
                memberId: applicant.loginId,
            });
        });

        res.json({ message: '요청을 수락했습니다.' });
    } catch(err) {
        console.error('요청 수락 처리 에러:', err);
        res.status(500).json({ message: err.message || '요청 수락 중 서버 에러가 발생했습니다.' });
    }
};

// ⭐️ [추가] 참석 요청 거절
exports.rejectAttendRequest = async (req, res) => {
    const attendId = parseInt(req.params.attendId, 10);
    const hostId = req.session.userId;
    
    const attendRepo = getRepository(Attend);
    const request = await attendRepo.findOne({ where: { id: attendId } });

    if (!request || request.hostId !== hostId) {
        return res.status(403).json({ message: '권한이 없거나 요청을 찾을 수 없습니다.' });
    }
    if (request.status !== 'PENDING') {
        return res.status(400).json({ message: '이미 처리된 요청입니다.' });
    }

    try {
        // 요청의 상태를 'REJECTED'로 변경
        request.status = 'REJECTED';
        await attendRepo.save(request);
        
        res.json({ message: '요청을 거절했습니다.' });
    } catch (err) {
        console.error('요청 거절 처리 에러:', err);
        res.status(500).json({ message: '요청 거절 중 서버 에러가 발생했습니다.' });
    }
};