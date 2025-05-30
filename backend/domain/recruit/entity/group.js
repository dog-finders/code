const { EntitySchema } = require('typeorm');
//
module.exports = new EntitySchema({
  name: 'group',
  tableName: 'groups',
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
  },
});
