const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Recruit',
  tableName: 'recruit',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    title: { type: 'varchar' },
    content: { type: 'text' },
    close_at: { type: 'datetime' },
    is_closed: { type: 'boolean', default: false },

    // 추가된 컬럼
    latitude: { type: 'double' },
    longitude: { type: 'double' },

    created_at: { type: 'datetime', createDate: true },
    updated_at: { type: 'datetime', updateDate: true },

    // userId 컬럼을 nullable:true로 수정
    userId: { type: 'int', nullable: true },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'userId', referencedColumnName: 'id' },
      eager: true,
      nullable: true,
    },
  },
});
