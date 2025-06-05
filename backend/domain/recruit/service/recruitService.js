const recruitRepository = require('../repository/recruitRepository');

module.exports = {
  // 모집글 생성
  createRecruit: async (recruitData) => {
    return await recruitRepository.createRecruit({
      title: recruitData.title,
      content: recruitData.content,
      close_at: recruitData.close_at,
      is_closed: recruitData.is_closed,
      authorId: recruitData.authorId,
      latitude: recruitData.latitude,
      longitude: recruitData.longitude,
      location: recruitData.location || null,
    });
  },

  // 모집글 전체 조회 (검색어, 페이지, 페이지 크기 옵션 전달)
  getAllRecruits: async ({ search = '', page = 1, pageSize = 10 }) => {
    return await recruitRepository.findAllRecruits({ search, page, pageSize });
  },

  // 특정 모집글 조회
  getRecruitById: async (id) => {
    return await recruitRepository.findRecruitById(id);
  },

  // 모집글 마감 처리 (userId 전달 필수)
  closeRecruit: async (id, userId) => {
    return await recruitRepository.closeRecruit(id, userId);
  },

  // 모집글 삭제 (userId 전달 필수)
  deleteRecruit: async (id, userId) => {
    return await recruitRepository.deleteRecruit(id, userId);
  },
};
