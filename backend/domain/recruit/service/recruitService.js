const recruitRepository = require('../repository/recruitRepository');

module.exports = {
  // 모집글 생성
  createRecruit: async (recruitData) => {
    // recruitData에 title, content, close_at, is_closed, authorId, latitude, longitude가 포함되어 있어야 합니다.
    return await recruitRepository.createRecruit({
      title: recruitData.title,
      content: recruitData.content,
      close_at: recruitData.close_at,
      is_closed: recruitData.is_closed,
      authorId: recruitData.authorId,
      latitude: recruitData.latitude,
      longitude: recruitData.longitude,
      // location을 쓰고 있다면 추가:
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

  // 모집글 마감 처리
  closeRecruit: async (id) => {
    return await recruitRepository.closeRecruit(id);
  },
};
