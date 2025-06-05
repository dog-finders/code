const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const Recruit = require('../entity/Recruit');
const User = require('../../user/entity/User');

const recruitRepository = AppDataSource.getRepository(Recruit);

module.exports = {
  // 모집글 생성
  createRecruit: async (recruitData) => {
    // recruitData에 authorId, latitude, longitude가 있다고 가정
    const { title, content, close_at, is_closed, authorId, latitude, longitude } = recruitData;

    // User 엔티티를 직접 연결하고 싶다면 findOne으로 User 엔티티 로드 후 넘겨도 되지만,
    // 여기서는 authorId로만 참조할 수 있는 형태로 가정합니다.
    const recruit = recruitRepository.create({
      title,
      content,
      close_at,
      is_closed,
      latitude,
      longitude,
      user: { id: authorId }, // ManyToOne 관계로 설정되어 있어야 함 (User 엔티티 참조)
    });

    return await recruitRepository.save(recruit);
  },

  // 모집글 전체 조회 (user 관계 포함)
  findAllRecruits: async ({ search, page, pageSize }) => {
    const whereCondition = search
      ? [
          { title: Like(`%${search}%`) },
          { content: Like(`%${search}%`) },
        ]
      : {};

    const totalCount = await recruitRepository.count({ where: whereCondition });
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentPage = page > totalPages ? totalPages : page < 1 ? 1 : page;

    const recruits = await recruitRepository.find({
      where: whereCondition,
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });

    return {
      totalPages,
      currentPage,
      posts: recruits.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        close_at: r.close_at,
        is_closed: r.is_closed,
        authorId: r.user ? r.user.id : null,
        latitude: r.latitude,
        longitude: r.longitude,
        created_at: r.created_at,
      })),
    };
  },

  // 특정 모집글 조회 (user 관계 포함)
  findRecruitById: async (id) => {
    const recruit = await recruitRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!recruit) return null;

    return {
      id: recruit.id,
      title: recruit.title,
      content: recruit.content,
      close_at: recruit.close_at,
      is_closed: recruit.is_closed,
      authorId: recruit.user ? recruit.user.id : null,
      latitude: recruit.latitude,
      longitude: recruit.longitude,
      created_at: recruit.created_at,
    };
  },

  // 모집글 마감 처리
  closeRecruit: async (id) => {
    const recruit = await recruitRepository.findOne({
      where: { id },
    });
    if (!recruit) return null;

    recruit.is_closed = true;
    return await recruitRepository.save(recruit);
  },
};
