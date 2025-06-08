require('reflect-metadata');
const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const Meeting = require('../entity/Meeting');
const MeetingMember = require('../entity/MeetingMember');
const User = require('../../user/entity/User');
const Evaluation = require('../../evaluation/entity/Evaluation');

exports.findUserById = (id) => {                         
  return AppDataSource.getRepository(User).findOne({ where: { id } });
};

exports.findAllMeetings = (opts = { page: 1, pageSize: 10 }) => {
  return AppDataSource.getRepository(Meeting)
    .findAndCount({
      order: { createdAt: 'DESC' },
      skip: (opts.page - 1) * opts.pageSize,
      take: opts.pageSize,
    });
};

exports.findMeetingById = (id) => {
  return AppDataSource.getRepository(Meeting)
    .findOne({ where: { id }, relations: ['recruit'] });
};

// 신규 추가된 함수
exports.findMeetingByRecruitId = (recruitId) => {
    return AppDataSource.getRepository(Meeting)
      .findOne({ where: { recruitId }, relations: ['recruit'] });
};

exports.findMembersByMeetingId = (meetingId) => {
  return AppDataSource.getRepository(MeetingMember)
    .find({ where: { meetingId } });
};

exports.saveMeeting = (data) => {
  return AppDataSource.getRepository(Meeting)
    .save(data);
};

exports.saveMember = (data) => {
  return AppDataSource.getRepository(MeetingMember)
    .save(data);
};

exports.deleteMeeting = (id) => {
  return AppDataSource.getRepository(Meeting)
    .delete(id);
};

exports.deleteMembers = (meetingId) => {
  return AppDataSource.getRepository(MeetingMember)
    .delete({ meetingId });
};

exports.findMeetingsByUserId = async ({ userId, page = 1, pageSize = 10 }) => {
  const user = await AppDataSource.getRepository(User).findOne({ where: { id: userId } });
  if (!user) return [[], 0];

  const userLoginId = user.loginId;

  const evaluatedMeetingsResult = await AppDataSource.getRepository(Evaluation)
    .createQueryBuilder('evaluation')
    .select('DISTINCT evaluation.meetingId', 'meetingId')
    .where('evaluation.evaluatorId = :userId', { userId })
    .getRawMany();
    
  const evaluatedMeetingIds = evaluatedMeetingsResult.map(r => r.meetingId);

  const queryBuilder = AppDataSource.getRepository(Meeting)
    .createQueryBuilder('meeting')
    .innerJoin(
      MeetingMember,
      'member',
      'member.meetingId = meeting.id AND member.memberId = :userLoginId',
      { userLoginId }
    );
  
  if (evaluatedMeetingIds.length > 0) {
    queryBuilder.andWhere('meeting.id NOT IN (:...evaluatedMeetingIds)', { evaluatedMeetingIds });
  }

  return queryBuilder
    .orderBy('meeting.createdAt', 'DESC')
    .skip((page - 1) * pageSize)
    .take(pageSize)
    .getManyAndCount();
};