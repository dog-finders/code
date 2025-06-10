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

  // 1. 현재 사용자가 이미 '평가자'로서 평가를 제출한 모임 ID 목록을 조회
  const evaluatedMeetingsResult = await AppDataSource.getRepository(Evaluation)
    .createQueryBuilder('evaluation')
    .select('DISTINCT evaluation.meetingId', 'meetingId') // 중복 없이 meetingId만 선택
    .where('evaluation.evaluatorId = :userId', { userId })
    .getRawMany();
    
  const evaluatedMeetingIds = evaluatedMeetingsResult.map(r => r.meetingId);

  // 2. 모임(meeting) 테이블과 모임멤버(member) 테이블을 조인하여,
  //    '나' 자신이 멤버로 있는 모임을 찾음
  const queryBuilder = AppDataSource.getRepository(Meeting)
    .createQueryBuilder('meeting')
    .innerJoin(
      MeetingMember,
      'member',
      'member.meetingId = meeting.id AND member.memberId = :userLoginId',
      { userLoginId }
    );
  
  // 3. 만약 평가한 모임 ID 목록이 있다면, 그 모임들을 결과에서 제외 (NOT IN)
  if (evaluatedMeetingIds.length > 0) {
    queryBuilder.andWhere('meeting.id NOT IN (:...evaluatedMeetingIds)', { evaluatedMeetingIds });
  }

  // 4. 최종적으로 정렬, 페이지네이션을 적용하여 결과 반환
  return queryBuilder
    .orderBy('meeting.createdAt', 'DESC')
    .skip((page - 1) * pageSize)
    .take(pageSize)
    .getManyAndCount();
};