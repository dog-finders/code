const { getRepository } = require('typeorm');
const Meeting = require('../entity/Meeting');
const MeetingMember = require('../entity/MeetingMember');
const User = require('../../user/entity/User');

// 모임 목록을 페이지네이션과 함께 조회하도록 수정
exports.findAllMeetings = ({ page = 1, pageSize = 10 }) => {
    return getRepository(Meeting).findAndCount({
        order: { createdAt: 'DESC' }, // 최신순으로 정렬
        skip: (page - 1) * pageSize,
        take: pageSize,
    });
};

exports.findMeetingById = (id) => getRepository(Meeting).findOne({ where: { id } });
exports.findMembersByMeetingId = (meetingId) => getRepository(MeetingMember).find({ where: { meetingId } });
exports.saveMeeting = (data) => getRepository(Meeting).save(data);
exports.saveMember = (data) => getRepository(MeetingMember).save(data);
exports.deleteMeeting = (id) => getRepository(Meeting).delete(id);
exports.deleteMembers = (meetingId) => getRepository(MeetingMember).delete({ meetingId });
exports.findUserById = (id) => getRepository(User).findOne({ where: { id } });
