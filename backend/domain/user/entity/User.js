const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'user',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
    name: { type: 'varchar', length: 50 },
    loginId: { type: 'varchar', length: 100, unique: true },
    password: { type: 'varchar', length: 200 },
    phone: { type: 'varchar', length: 30 },
    birthdate: { type: 'varchar', length: 10 },
    email: { type: 'varchar', length: 50, unique: true },
    address: { type: 'varchar', nullable: true },
    rating: { type: 'int', nullable: true },
    personality: {
      type: 'enum',
      enum: ['ACTIVE', 'CALM', 'SOCIAL', 'SHY'],
      nullable: true,
    },
  },
  relations: {
    recruits: {
      type: 'one-to-many',
      target: 'Recruit',
      inverseSide: 'user',
    },
  },
});
