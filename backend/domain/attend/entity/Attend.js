const { EntitySchema } = require('typeorm');
const Recruit = require('../../recruit/entity/Recruit');

module.exports = new EntitySchema({
  name: 'Attend',
  tableName: 'attend', // DB에 생성될 테이블 이름
  columns: {
    id: { type: 'int', primary: true, generated: true },
    // 요청 상태: PENDING(대기), ACCEPTED(수락), REJECTED(거절)
    status: {
      type: 'enum',
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
    },
    // 모집글 작성자 (호스트) 의 숫자 ID
    hostId: { type: 'int' },
    // 신청자(applicant)의 숫자 ID
    applicantId: { type: 'int' },
    // 신청자의 로그인 ID (메일함에 표시하기 위함)
    applicantLoginId: { type: 'varchar' },
    // 모집글 제목 (메일함에 표시하기 위함)
    recruitTitle: { type: 'varchar' },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    // 어느 모집글에 대한 요청인지 연결
    recruit: {
      type: 'many-to-one',
      target: 'Recruit',
      joinColumn: { name: 'recruitId' },
      onDelete: 'CASCADE', // 모집글 삭제 시 요청도 함께 삭제
    },
  },
});