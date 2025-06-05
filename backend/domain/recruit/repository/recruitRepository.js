const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const Recruit = require('../entity/Recruit');

const recruitRepository = AppDataSource.getRepository(Recruit);

module.exports = {
  // 모집글 생성
  createRecruit: async (recruitData) => {
    const { title, content, close_at, is_closed, authorId, latitude, longitude } = recruitData;

    const recruit = recruitRepository.create({
      title,
      content,
      close_at,
      is_closed,
      latitude,
      longitude,
      user: { id: authorId },
    });

    return await recruitRepository.save(recruit);
  },

  // 모집글 전체 조회 (검색, 페이징 포함)
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

  // 특정 모집글 조회
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

  // 모집글 마감 처리 (권한 체크 포함)
  closeRecruit: async (id, userId) => {
    const recruit = await recruitRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!recruit) return null;

    if (recruit.user.id !== userId) {
      return null; // 권한 없음
    }

    recruit.is_closed = true;
    return await recruitRepository.save(recruit);
  },

  // 모집글 삭제 (권한 체크 포함)
  deleteRecruit: async (id, userId) => {
    const recruit = await recruitRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!recruit) return false;

    if (recruit.user.id !== userId) {
      return false; // 권한 없음
    }

    await recruitRepository.delete(id);
    return true;
  },
};
