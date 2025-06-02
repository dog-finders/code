const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    name: {
      type: 'varchar',
      length: 50,
    },
    loginId: {
      type: 'varchar',
      length: 100,
      unique: true,
      nullable: true, // 필요 시 optional로
    },
    email: {
      type: 'varchar',
      length: 100,
      unique: true,
    },
    password: {
      type: 'varchar',
      length: 255,
    },
    phone: {
      type: 'varchar',
      length: 30,
      nullable: true,
    },
    birthdate: {
      type: 'varchar',
      length: 10,
      nullable: true,
    },
    address: {
      type: 'varchar',
      nullable: true,
    },
    rating: {
      type: 'int',
      nullable: true,
    },
    personality: {
      type: 'enum',
      enum: ['ACTIVE', 'CALM', 'SOCIAL', 'SHY'],
      nullable: true,
    },
    role: {
      type: 'enum',
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
    isActive: {
      type: 'boolean',
      default: true,
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,
    },
  },
});
