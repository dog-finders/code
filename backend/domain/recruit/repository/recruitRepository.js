// backend/domain/recruit/repository/recruitRepository.js
const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const Recruit = require('../entity/Recruit');
const { Like } = require('typeorm');

// Recruit 엔티티에 대한 Repository
const recruitRepository = AppDataSource.getRepository(Recruit);

module.exports = {
  // 새로운 모집글을 생성하고 저장합니다.
  create: (recruitData, user) => {
    const newRecruit = recruitRepository.create({
      ...recruitData,
      user, // user 객체를 직접 할당
    });
    return recruitRepository.save(newRecruit);
  },

  // 모든 모집글을 페이지네이션과 검색어로 조회합니다.
  findAll: ({ search, page, pageSize }) => {
    const whereCondition = search
      ? [{ title: Like(`%${search}%`) }, { location: Like(`%${search}%`) }]
      : {};

    return recruitRepository.findAndCount({
      where: whereCondition,
      relations: ['user'], // 작성자 정보를 함께 로드
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  },

  // ID로 특정 모집글을 조회합니다.
  findById: (id) => {
    return recruitRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  },

  // 특정 모집글 객체를 저장(수정)합니다.
  save: (recruit) => {
    return recruitRepository.save(recruit);
  },

  // ID로 특정 모집글을 삭제합니다.
  delete: (id) => {
    return recruitRepository.delete(id);
  },
};