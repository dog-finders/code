// backend/domain/recruit/service/recruitService.js
const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const recruitRepository = require('../repository/recruitRepository');
const userRepository = require('../../user/repository/userRepository');
const Meeting = require('../../meeting/entity/Meeting');
const MeetingMember = require('../../meeting/entity/MeetingMember');

module.exports = {
  // 모집글과 관련 모임을 트랜잭션으로 함께 생성합니다.
  createRecruit: async (recruitData, userId) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    return AppDataSource.transaction(async (manager) => {
      const newRecruit = await manager.withRepository(recruitRepository).create(recruitData, user);

      const meeting = manager.create(Meeting, {
        title: newRecruit.title,
        hostId: user.loginId,
        hostName: user.name,
        recruitId: newRecruit.id,
      });
      const newMeeting = await manager.save(Meeting, meeting);

      const member = manager.create(MeetingMember, {
        meetingId: newMeeting.id,
        memberId: user.loginId,
      });
      await manager.save(MeetingMember, member);

      return newRecruit;
    });
  },

  // 페이지네이션과 검색어로 모집글 목록을 조회합니다.
  getAllRecruits: async ({ search, page, pageSize }) => {
    const [recruits, totalCount] = await recruitRepository.findAll({ search, page, pageSize });

    return {
      posts: recruits.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        close_at: r.close_at,
        is_closed: r.is_closed,
        authorId: r.user ? r.user.loginId : '익명',
        location: r.location || '-',
        latitude: r.latitude,
        longitude: r.longitude,
        created_at: r.created_at,
      })),
      totalPages: Math.ceil(totalCount / pageSize) || 1,
      currentPage: page,
    };
  },

  // ID로 특정 모집글을 조회합니다.
  getRecruitById: async (id) => {
    return recruitRepository.findById(id);
  },

  // '모집 마감' 시 내부적으로 '삭제' 로직을 호출하여 기존과 동일하게 동작하도록 합니다.
  closeRecruit: async (recruitId, userId) => {
    // '모집 마감' 요청이 오면 '삭제' 서비스 함수를 그대로 호출합니다.
    return module.exports.deleteRecruit(recruitId, userId);
  },

  // 모집글 삭제 로직을 단순화합니다.
  deleteRecruit: async (recruitId, userId) => {
    const recruit = await recruitRepository.findById(recruitId);
    if (!recruit) {
      throw new Error('모집글을 찾을 수 없습니다.');
    }
    if (recruit.user.id !== userId) {
      throw new Error('삭제 권한이 없습니다.');
    }

    // recruitRepository를 통해 recruit 데이터만 삭제합니다.
    // Meeting 데이터는 DB의 onDelete: 'CASCADE' 설정에 의해 자동으로 삭제됩니다.
    await recruitRepository.delete(recruitId);
    
    return true; // 성공적으로 실행되었음을 반환
  },
};