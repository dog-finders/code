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
exports.findMeetingById = (id) => getRepository(Meeting).findOne({ 
    where: { id },
    relations: ['recruit'] // 연관된 recruit 정보를 함께 불러옵니다.
});
exports.findMeetingsByUserId = async ({ userId, page = 1, pageSize = 10 }) => {
    // 1. 세션의 userId로 사용자의 loginId를 찾습니다.
    const user = await getRepository(User).findOne({ where: { id: userId } });
    if (!user) {
        return [[], 0]; // 사용자를 찾을 수 없으면 빈 목록 반환
    }
    const userLoginId = user.loginId;

    // 2. QueryBuilder를 사용해 Meeting과 MeetingMember 테이블을 조인합니다.
    // 사용자의 loginId와 일치하는 memberId를 가진 모임만 선택합니다.
    return getRepository(Meeting).createQueryBuilder("meeting")
        .innerJoin(
            MeetingMember,
            "member",
            "member.meetingId = meeting.id AND member.memberId = :userLoginId",
            { userLoginId }
        )
        .orderBy("meeting.createdAt", "DESC") // 최신순 정렬
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount(); // 데이터와 전체 개수를 함께 반환
};
