const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Recruit',
  tableName: 'recruit',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    title: {
      type: 'varchar',
    },
    content: {
      type: 'text',
    },
    location: {
      type: 'varchar',
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
      createDate: true,  // 자동 생성일 지정
    },
    updated_at: {
      type: 'datetime',
      updateDate: true,  // 자동 수정일 지정
    },
  },
});
