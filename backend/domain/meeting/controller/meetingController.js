const { getRepository } = require('typeorm');
const Meeting = require('../entity/Meeting');
const MeetingMember = require('../entity/MeetingMember');
const User = require('../../user/entity/User');
const Evaluation = require('../../evaluation/entity/Evaluation');

exports.findAllMeetings = ({ page = 1, pageSize = 10 }) => {
    return getRepository(Meeting).findAndCount({
        order: { createdAt: 'DESC' },
        skip: (page - 1) * pageSize,
        take: pageSize,
    });
};

exports.findMeetingById = (id) => getRepository(Meeting).findOne({ 
    where: { id },
    relations: ['recruit']
});

exports.findMembersByMeetingId = (meetingId) => getRepository(MeetingMember).find({ where: { meetingId } });
exports.saveMeeting = (data) => getRepository(Meeting).save(data);
exports.saveMember = (data) => getRepository(MeetingMember).save(data);
exports.deleteMeeting = (id) => getRepository(Meeting).delete(id);
exports.deleteMembers = (meetingId) => getRepository(MeetingMember).delete({ meetingId });

exports.findMeetingsByUserId = async ({ userId, page = 1, pageSize = 10 }) => {
    const user = await getRepository(User).findOne({ where: { id: userId } });
    if (!user) {
        return [[], 0];
    }
    const userLoginId = user.loginId;

    const subQuery = getRepository(Evaluation).createQueryBuilder("evaluation")
        .select("evaluation.meetingId")
        .where("evaluation.evaluatorId = :currentUserId", { currentUserId: userId });

    const queryBuilder = getRepository(Meeting).createQueryBuilder("meeting")
        .innerJoin(
            MeetingMember,
            "member",
            "member.meetingId = meeting.id AND member.memberId = :userLoginId",
            { userLoginId: userLoginId }
        )
        .where("meeting.id NOT IN (" + subQuery.getQuery() + ")")
        .setParameters(subQuery.getParameters())
        .orderBy("meeting.createdAt", "DESC")
        .skip((page - 1) * pageSize)
        .take(pageSize);

    return queryBuilder.getManyAndCount();
};