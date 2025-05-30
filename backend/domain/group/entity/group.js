// backend/domain/group/entity/Group.jsa
const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Group',
  tableName: '`group`',  // 백틱 감싸기 (MySQL 예약어 처리용)
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    location: {
      type: 'varchar',
    },
    title: {
      type: 'varchar',
    },
    content: {
      type: 'text',
    },
    close_at: {
      type: 'datetime',
    },
    is_closed: {
      type: 'boolean',
      default: false,
    },
    created_at: {
      type: 'datetime',
      createDate: true, // 레코드 생성 시 자동 입력됨
    },
  },
});
