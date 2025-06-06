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
    
    //기존 rating 필드를 삭제하고, 항목별 평균 점수 필드를 추가합니다.
    // 소수점 계산을 위해 float 타입으로 지정합니다.
    avgPunctuality: { type: 'float', nullable: true, default: null },
    avgSociability: { type: 'float', nullable: true, default: null },
    avgAggressiveness: { type: 'float', nullable: true, default: null },

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