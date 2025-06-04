const { EntitySchema } = require('typeorm');
const User = require('../../user/entity/User');

module.exports = new EntitySchema({
  name: 'Recruit',
  tableName: 'recruit',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    title: { type: 'varchar' },
    content: { type: 'text' },
    loginId: { type: 'varchar' },  // FK와 연결할 컬럼
    close_at: { type: 'datetime' },
    is_closed: { type: 'boolean', default: false },
    created_at: { type: 'datetime', createDate: true },
    updated_at: { type: 'datetime', updateDate: true },
  },
});
